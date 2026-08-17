# Northline Roofing & Exteriors Estimator

A full-stack, config-driven estimator built for Northline Roofing & Exteriors as part of the Wantace SDE Intern Take-Home Task.

## Features
- **Public Estimator:** A multi-step form dynamically generated from the backend configuration. Calculates estimated project costs safely on the server.
- **Admin Dashboard:** A protected panel to view captured leads and configure the estimator's rates, labels, and question visibility. 

## Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Shadcn UI
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB

## Prerequisites
- Node.js (v18+)
- MongoDB (local instance running on `mongodb://localhost:27017` or a remote URI)

## Local Setup

### 1. Backend Setup
Navigate into the `server` directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (optional defaults are already fallback if omitted):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wantace-roofing
ADMIN_USERNAME=admin
ADMIN_PASSWORD=roofing2026!
```

Start the backend server:
```bash
npm start
# or 
node src/index.js
```
*(The server will automatically seed the initial configuration and existing leads into your database on startup).*

### 2. Frontend Setup
In a new terminal window, navigate to the `client` directory:
```bash
cd client
npm install
```

Start the Vite development server:
```bash
npm run dev
```

## Usage & Testing
- **Public Estimator:** Access the estimator at `http://localhost:5173`.
- **Admin Panel:** Access the owner panel at `http://localhost:5173/admin` or `http://localhost:5173/login`.
- **Admin Credentials:**
  - Username: `admin`
  - Password: `roofing2026!`

The frontend uses standard Axios intercepts to manage basic authentication using localStorage. Changes in the Admin configuration tab will be instantly reflected on the Public Estimator.
