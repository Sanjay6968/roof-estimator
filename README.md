# Northline Roofing & Exteriors - Instant Roof Estimator

A dynamic, full-stack lead generation and estimation tool built for Northline Roofing. This monorepo contains a React frontend (Vite) and an Express/MongoDB backend.

## Features

- **Dynamic Estimator Flow:** A multi-step form built dynamically from the database configuration.
- **Real-Time Pricing Engine:** Calculates a low/high estimate range based on square footage, material rates, pitch difficulty, stories, tear-off rates, waste factor, and permit fees.
- **Display-Only Currency Conversion:** Homeowners can view estimates in their preferred currency (USD, EUR, GBP, INR) without altering the core USD business logic.
- **Strict Version-Locking:** The estimate calculates strictly against the configuration version active when the homeowner started the form, preventing mid-session schema crashes if an admin deletes an option.
- **Owner Dashboard (Admin Panel):** A secure portal where business owners can:
  - Toggle questions on/off and edit dynamic material pricing/multipliers on the fly.
  - View all captured leads in a real-time auto-polling table.
- **Security through Obscurity + Obfuscation:** The public API strips pricing multipliers so competitors cannot reverse-engineer the rates from the browser network tab.

## Architecture

- **Frontend:** React, Vite, Tailwind CSS v4, Lucide Icons, Shadcn UI Components.
- **Backend:** Node.js, Express, Mongoose (MongoDB).
- **Authentication:** Lightweight encoded Basic Auth for the Owner Panel.

## Setup Instructions

### Backend Setup
1. `cd server`
2. `npm install`
3. Create a `.env` file in the `server` directory and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://<your-username>:<your-password>@cluster0.g8jz9xm.mongodb.net/wantace-roofing?retryWrites=true&w=majority
   ```
4. Run `npm start` (or `npm run dev` for nodemon). The server runs on port 5000.
5. *Note: If the database is completely empty, the backend will automatically seed the initial configuration schema and a historical lead upon starting.*

### Frontend Setup
1. `cd client`
2. `npm install`
3. Make sure `client/src/services/api.js` points to your running backend (`http://localhost:5000/api` for local dev).
4. Run `npm run dev`. The Vite server runs on port 5173.

## Live Deployment Links

- **Frontend (Estimator):** [https://roof-estimator-lovat.vercel.app](https://roof-estimator-lovat.vercel.app)
- **Frontend (Admin Panel):** [https://roof-estimator-lovat.vercel.app/admin](https://roof-estimator-lovat.vercel.app/admin) (Credentials: `admin` / `roofing2026!`)
- **Backend API:** [https://roof-estimator-97aw.onrender.com](https://roof-estimator-97aw.onrender.com)

## Documentation

For full details on the architectural tradeoffs, calculations, and AI pair-programming logs, please see:
- [`DECISIONS.md`](./DECISIONS.md) - Product decisions, assumptions, and formulas.
- [`AI_LOG.md`](./AI_LOG.md) - Record of AI syntax mistakes/hallucinations and how they were caught.
