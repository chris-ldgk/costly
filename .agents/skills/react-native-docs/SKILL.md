---
name: react-native-docs
description: Search Expo and React Native documentation for mobile app setup, Expo Router, NativeWind, and Better Auth Expo integration. Use when working in apps/mobile.
---

When the user asks about Expo, React Native, or mobile implementation, use current documentation instead of training data.

## Context7 (preferred)

| Source | Context7 library ID |
| --- | --- |
| Expo | `/expo/expo` |
| React Native | `/facebook/react-native` |
| Better Auth (Expo) | `/better-auth/better-auth` |

Call `query-docs` with the user's full question (e.g. "Expo Router tabs auth gate redirect login").

## Direct fallback

```bash
curl -s https://docs.expo.dev/llms.txt
curl -sH "Accept: text/markdown" https://www.better-auth.com/docs/integrations/expo
curl -sH "Accept: text/markdown" https://docs.expo.dev/router/introduction/
```

Docs: https://docs.expo.dev/

## Repo conventions

- App: `apps/mobile` — Expo Router file-based routing
- Auth: `@better-auth/expo` client plugin + `expo-secure-store`; scheme `costly`
- Data: `@costly/api-client` with cookie injection via `authClient.getCookie()`
- Styling: NativeWind (Tailwind-like); mirror web UX from `apps/frontend/src/routes/`
- Env: `EXPO_PUBLIC_API_URL` → API worker URL
