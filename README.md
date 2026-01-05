# GoDrop Monorepo

A quick-commerce stack with a mobile app (Expo), web client (Vite + React), and backend API (Node.js + Express + MongoDB + Redis).

## Packages

- **Backend API**: [server](server) — Express, MongoDB, Redis, Razorpay, Cloudinary, WebSockets
- **Web Client**: [client](client) — React + Vite storefront and admin-facing UI
- **Mobile App**: [app](app) — Expo/React Native consumer app

## Prerequisites

- Node.js 18+ and npm
- MongoDB and Redis instances
- Optional: Cloudinary (media), Razorpay (payments), SMS provider (Fast2SMS/Twilio)

## Quick Start

1. **Backend**

- Copy [server/.env.example](server/.env.example) to `server/.env` and fill values (Mongo, Redis, JWT secrets, Razorpay, Cloudinary, SMS, CORS URLs).
- `cd server && npm install`
- `npm run dev` (defaults: API on `http://localhost:5000`, health at `/health`).

2. **Web Client**

- `cd client && npm install`
- Create `client/.env` with at least:
  - `VITE_API_URL=http://localhost:5000/api`
- `npm run dev` (defaults: `http://localhost:5173`).

3. **Mobile App (Expo)**

- `cd app && npm install`
- Create `app/.env` (or add to `app.config.js`) with:
  - `EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000/api`
- `npx expo start` (choose device/emulator; ensure the API URL uses your LAN IP for devices).

## Common Scripts

- Backend: `npm run dev` (dev server), `npm test`, `npm run lint`
- Web: `npm run dev`, `npm run build`, `npm run preview`
- Mobile: `npx expo start`, `npm run ios`, `npm run android` (requires native tooling)

## Documentation

- API and backend details: [server/README.md](server/README.md)
- Web client notes: [client/README.md](client/README.md)
- Mobile app notes: [app/README.md](app/README.md)

## Checklists

- **Web (client)**

  - [ ] Verify VITE_API_URL / Razorpay / Maps keys loaded from `.env`
  - [ ] Polish UI spacing/typography; align product cards, modals, and tables
  - [ ] Responsive QA for header/nav, cart drawer, checkout flows
  - [ ] Loading/empty states for product lists, cart, and orders
  - [ ] Error handling toasts and form validation copy
  - [ ] Razorpay payment happy-path and failure-path test against backend
  - [ ] Socket updates (order status) render without breaking navigation

- **Mobile (app)**
  - [ ] Confirm EXPO_PUBLIC_API_URL uses LAN IP and loads in release & dev builds
  - [ ] OTP auth flow success/failure copy and retry limits
  - [ ] Cart add/update/remove UX and price totals
  - [ ] Order placement + tracking screens render live status updates
  - [ ] Payment flow integration against backend (Razorpay) on device/emulator
  - [ ] Empty/loading states for products, cart, orders; offline error surface
  - [ ] Device testing: Android + iOS layout, touch targets, keyboard handling
