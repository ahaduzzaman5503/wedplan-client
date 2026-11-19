import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient, ObjectId } from "mongodb";
import { APIError } from "better-auth/api";

// Reuse one Mongo client while developing (avoids many connections on hot reload)
const globalForMongo = globalThis;
const client =
  globalForMongo._wedplanMongoClient ?? new MongoClient(process.env.MONGODB_URI);
if (process.env.NODE_ENV !== "production") {
  globalForMongo._wedplanMongoClient = client;
}
const db = client.db(process.env.MONGODB_DB);
const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProduction,
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

  plugins: [jwt(), nextCookies()], // nextCookies must stay last
});

