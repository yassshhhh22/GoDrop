# GoDrop Mobile App (Expo / React Native)

Consumer mobile app for GoDrop with OTP auth, cart, ordering, payments, and live tracking.

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo`)
- iOS simulator (Xcode) or Android emulator (Android Studio), or a physical device with Expo Go
- Backend API reachable from the device (use your LAN IP)

## Environment

Create `.env` (or set in `app.config.js`):

```
EXPO_PUBLIC_API_URL=http://<your-local-ip>:5000/api
```

For real devices, **use the LAN IP**, not localhost.

## Running

```bash
cd app
npm install
npx expo start
```

Select your target (Expo Go, emulator, or simulator). The app reads `EXPO_PUBLIC_API_URL` for all API calls and token refresh.

## Useful Scripts

- `npm run start` / `npx expo start` — start Metro bundler
- `npm run android` — run on Android emulator/device
- `npm run ios` — run on iOS simulator (macOS)

## Notes

- Auth tokens are stored in AsyncStorage; 401s trigger refresh flow automatically.
- Payments and notifications rely on backend integrations (Razorpay/Fast2SMS). Ensure the backend env vars are set when testing flows.

## QA Checklist

- [ ] `.env` uses LAN API URL; verify in both dev and release builds
- [ ] OTP auth: success + failure messages, retry timing
- [ ] Cart: add/update/remove, price totals reflect API responses
- [ ] Order placement and tracking screens display live status updates
- [ ] Payment flow (Razorpay) works on device/emulator; failure path handled
- [ ] Empty/loading states for products, cart, orders; show offline/errors clearly
- [ ] Device coverage: Android & iOS layouts, touch targets, keyboard avoidance
