import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient, ObjectId } from "mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { attachDatabasePool } from "@vercel/functions";

// Reuse ONE Mongo client per server instance, in every environment.
// Never call client.close() anywhere in the app.
const globalForMongo = globalThis;

if (!globalForMongo._wedplanMongoClient) {
  const mongoClient = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
  });

  // Log the real reason when the connection has trouble.
  // These lines appear in Vercel's Runtime Logs and start with "[mongo]".
  mongoClient.on("serverHeartbeatFailed", (event) => {
    console.error("[mongo] heartbeat failed:", event?.failure?.message);
  });
  mongoClient.on("topologyClosed", () => {
    console.error("[mongo] topology closed for the auth client");
  });

  attachDatabasePool(mongoClient); // lets Vercel manage the pool when the function suspends and resumes
  globalForMongo._wedplanMongoClient = mongoClient;
}

const client = globalForMongo._wedplanMongoClient;
const db = client.db(process.env.MONGODB_DB);

// Secure cookies only when the site really runs on https
const isHttps = (process.env.BETTER_AUTH_URL || "").startsWith("https://");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  advanced: {
    useSecureCookies: isHttps,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      path: "/",
    },
  },

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  user: {
    additionalFields: {
      // Chosen at sign up: only "vendor" or "customer" (enforced by the hook below)
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: true,
      },
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      // Users can never send these themselves
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      subscriptionPlan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
      // Edited through our own Express endpoint (PATCH /api/profile)
      phone: {
        type: "string",
        required: false,
        input: false,
      },
      address: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  // Profile updates go through Express (PATCH /api/profile) with a field whitelist.
  // This turns off the built-in endpoint so nobody can change their own role.
  disabledPaths: ["/update-user"],

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Security: public sign up can NEVER create an admin.
          const role = user.role === "vendor" ? "vendor" : "customer";
          return { data: { ...user, role } };
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          // Blocked users cannot start a new session (sign in)
          if (ObjectId.isValid(session.userId)) {
            const user = await db
              .collection("user")
              .findOne({ _id: new ObjectId(session.userId) });
            if (user?.isBlocked) {
              throw new APIError("FORBIDDEN", {
                message: "Your account has been blocked. Please contact support.",
              });
            }
          }
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Server-side password rules for sign up
      if (ctx.path !== "/sign-up/email") return;

      const password = ctx.body?.password;
      if (typeof password !== "string" || password.length < 6) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must be at least 6 characters",
        });
      }
      if (!/[A-Z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must contain at least one uppercase letter",
        });
      }
      if (!/[a-z]/.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must contain at least one lowercase letter",
        });
      }
    }),
  },

  plugins: [jwt(), nextCookies()], // nextCookies must stay last
});



