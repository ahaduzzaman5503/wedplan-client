# WedPlan Client

WedPlan is a full-stack wedding planning platform that connects customers with wedding vendors. Customers can browse and search services, view service details, and submit booking requests. Vendors can publish services, manage booking requests, maintain profiles, and subscribe to Premium plans. Administrators manage users, services, and payment transactions.

This repository contains the Next.js client application.

## Live Website : https://wedplan-clientt.vercel.app/

Live deployment: **https://wedplan-clientt.vercel.app/**

## Repositories

- **Client repository:** https://github.com/ahaduzzaman5503/wedplan-client
- **Server repository:** https://github.com/ahaduzzaman5503/wedplan-server

## Important Features

- Better Auth credential and Google authentication
- Customer, Vendor, and Admin role-based dashboards
- Secure refresh-aware private routes
- Responsive navigation and profile dropdown
- Dynamic wedding service browsing
- Service search by name
- Category and location filtering
- Ascending and descending price sorting
- Loading, empty, error, 404, and image-upload states
- Multiple-image service details
- Customer booking form and booking cancellation
- Vendor service creation, editing, availability, deletion, and booking management
- Stripe Premium subscription flow
- Payment success and cancellation pages
- Profile management and ImgBB image uploads
- Toast notifications instead of browser alerts
- Responsive ShadCN UI components
- Framer Motion homepage animations

## Technology Stack

- Next.js
- JavaScript
- React
- Better Auth
- MongoDB Adapter
- Tailwind CSS
- ShadCN UI
- Base UI
- Framer Motion / Motion
- Lucide React
- Stripe Checkout integration through the server
- ImgBB image hosting
- Sonner toast notifications

## Client Routes

### Public routes

- `/` - Home
- `/services` - Browse services
- `/services/[id]` - Service details
- `/sign-in` - Sign in
- `/sign-up` - Create an account

### Role-protected routes

- `/dashboard/customer`
- `/dashboard/customer/bookings`
- `/dashboard/customer/profile`
- `/dashboard/vendor`
- `/dashboard/vendor/services`
- `/dashboard/vendor/add-service`
- `/dashboard/vendor/bookings`
- `/dashboard/vendor/subscription`
- `/dashboard/vendor/profile`
- `/dashboard/admin`
- `/dashboard/admin/users`
- `/dashboard/admin/services`
- `/dashboard/admin/transactions`
- `/dashboard/admin/profile`
- `/payment/success`
- `/payment/cancel`

## Installation

### Prerequisites

- Node.js 20 or newer
- npm
- A running MongoDB database
- A WedPlan server deployment or local server
- Google OAuth credentials
- An ImgBB API key

### Steps

1. Clone the client repository:

```bash
git clone https://github.com/ahaduzzaman5503/wedplan-client.git
cd wedplan-client
```

2. Install dependencies:

```bash
npm install
```

3. Copy or create `.env.local` in the project root.

4. Configure the environment variables described below.

## Environment Variables

Create a `.env.local` file with:

```env
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=your_database_name

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

IMGBB_API_KEY=your_imgbb_api_key

NEXT_PUBLIC_API_URL=http://localhost:5000
```

Variable descriptions:

- `BETTER_AUTH_SECRET`: Secret used to secure Better Auth sessions.
- `BETTER_AUTH_URL`: Public URL of the Next.js application.
- `MONGODB_URI`: MongoDB connection string used by Better Auth.
- `MONGODB_DB`: MongoDB database name used by Better Auth.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
- `IMGBB_API_KEY`: ImgBB API key used by the image upload API route.
- `NEXT_PUBLIC_API_URL`: Public base URL of the Express server.

Never commit `.env.local` or real credentials to GitHub.

## Running Locally

Start the Express server first:

```bash
npm start
```

Then run the Next.js client:

```bash
npm run dev
```

Open `http://localhost:3000`.

For a production-style local build:

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start the Next.js development server
- `npm run build` - Create a production build
- `npm start` - Start the production Next.js server
- `npm run lint` - Run ESLint

## Production Notes

- Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_API_URL` to the deployed HTTPS URLs.
- Set Google OAuth authorized origins and callback URLs to the deployed domain.
- Configure the server `CLIENT_URL` with the deployed client URL.
- Keep MongoDB, Google OAuth, Better Auth, Stripe, and ImgBB credentials in environment variables.
- Do not commit `.env`, `.env.local`, or any other secret environment files.
- Verify private routes after a browser refresh.
- Test both payment success and cancellation flows against the deployed server and Stripe webhook endpoint.
