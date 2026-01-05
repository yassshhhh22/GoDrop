# GoDrop Web Client (Vite + React)

Customer-facing and admin-facing web UI for GoDrop. Built with Vite, React, Tailwind CSS 4, Zustand, and Axios.

## Prerequisites

- Node.js 18+
- Backend API running (default: http://localhost:5000)

## Environment Variables

Create `.env` in this folder:

```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=<public_key_from_Razorpay_dashboard>
VITE_GOOGLE_MAPS_API_KEY=<browser_key_for_maps>
```

## Scripts

- `npm run dev` — start Vite dev server (default http://localhost:5173)
- `npm run build` — production build
- `npm run preview` — preview the built app
- `npm run lint` — run ESLint

## Running Locally

```bash
cd client
npm install
npm run dev
```

The app expects the backend at `VITE_API_URL` and will use that for API + Socket.IO calls. Razorpay checkout uses `VITE_RAZORPAY_KEY_ID`.

## UI & QA Checklist

- [ ] Confirm `.env` keys load (API, Razorpay, Maps) before running builds
- [ ] Responsive checks for header/nav, product grid, cart drawer, checkout
- [ ] Loading + empty states for products, cart, orders
- [ ] Error toasts and form validation copy for auth/checkout/address flows
- [ ] Razorpay flow: success + failure paths verified against backend
- [ ] Socket-driven order status updates render without layout jumps
