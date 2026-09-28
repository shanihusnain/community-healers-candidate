# Community Healers — Candidate Mobile App

Expo SDK 57 app for **candidate** certification registration only.

## Flow

1. Auth — login / signup + OTP  
2. Personal information  
3. Document upload (photo + CNIC)  
4. Payment (QR + bank reference)  
5. Schedule training (date + city)

Uses the same Nest backend APIs as the web portal (`community-healers`).

## Setup

```bash
npm install
cp .env.example .env   # or edit .env
npx expo start
```

Set `EXPO_PUBLIC_API_URL` to your backend (default: https://app.worldwidebusinessesnetwork.com).

For native modules (image picker, cookies), use a development build:

```bash
npx expo run:ios
# or
npx expo run:android
```

## Structure

- `src/app/` — Expo Router (thin re-exports)
- `src/screens/` — screen UI
- `src/services/` — API clients (auth, candidate, reference)
- `src/provider/` — AuthProvider + route guards
- `src/hooks/queries/` — React Query hooks
