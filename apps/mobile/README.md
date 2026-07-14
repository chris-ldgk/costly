# @costly/mobile

Native iOS app for **Costly** — Expo Router UI with HTTP API access via `@costly/api-client`.

## Purpose

- Mirrors the web PWA screens: login, balance, purchases list, create/edit purchase.
- Auth via Better Auth Expo (`@better-auth/expo`) with email OTP and `expo-secure-store`.
- Purchase data via typed Hono RPC client (`@costly/api-client`) against `/api/v1/*`.

## Stack

| Concern | Technology |
| --- | --- |
| Framework | Expo SDK 57, Expo Router |
| Data | TanStack Query, `@costly/api-client` |
| Auth | better-auth + `@better-auth/expo` (+ peers: `expo-secure-store`, `expo-network`, `expo-web-browser`, `expo-linking`) |
| Styling | React Native StyleSheet (web-like tokens in `src/theme.ts`) |

## Layout

```
app/
  _layout.tsx           # QueryClientProvider, auth redirect
  login.tsx             # Email OTP sign-in
  (tabs)/
    index.tsx           # Balance
    purchases/          # List, create, edit
src/
  lib/
    auth-client.ts      # Better Auth Expo client
    api-client.ts       # Authenticated Hono client
    purchases.ts        # API helpers
  components/           # UI primitives
  utils/                # format, balance text
```

## Scripts

```bash
bun run dev      # expo start (alias: start)
bun run ios      # Open iOS simulator
bun run typecheck
bun run lint
```

## Environment

Copy `.env.example` → `.env`:

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | API worker URL (same as web `VITE_API_URL`, e.g. `http://localhost:8787`) |

The API worker must be running (`cd apps/api && bun run dev:scheduled`) for auth and data.

## Deep linking

App scheme: `costly://` — registered in API `trustedOrigins` for Better Auth Expo.

## Releases (iOS)

Production iOS builds run on **EAS Build** (Expo cloud), orchestrated by GitHub Actions. Signed IPAs are attached to GitHub Releases; the TestFlight workflow also submits to App Store Connect.

| Workflow | Trigger | Result |
| --- | --- | --- |
| [`.github/workflows/ios-testflight.yml`](../../.github/workflows/ios-testflight.yml) | Push tag `mobile-v*` or manual dispatch | EAS build → GitHub Release → TestFlight |
| [`.github/workflows/ios-release.yml`](../../.github/workflows/ios-release.yml) | Manual dispatch only | EAS build → GitHub Release (no TestFlight) |

### Tag a release (TestFlight + GitHub Release)

```bash
git tag mobile-v1.0.0
git push origin mobile-v1.0.0
```

### Manual release without TestFlight

GitHub → **Actions → iOS release → Run workflow** — enter the version (e.g. `1.0.0`).

### One-time setup

1. **Apple Developer Program** membership and App Store Connect app for bundle ID `de.kolbgrafik.costly`
2. **App Store Connect API key** (App Manager role) for TestFlight submission
3. **Expo account** — link the project and upload signing credentials:

```bash
cd apps/mobile
bunx eas init          # writes projectId to app.json
bunx eas credentials   # iOS distribution cert + App Store provisioning profile (stored in EAS)
```

4. Fill in [`eas.json`](./eas.json) `submit.production.ios.ascAppId` and `appleTeamId` after creating the App Store Connect app
5. (Recommended) `bunx eas build:version:set` to sync remote build numbers if you have prior uploads

### GitHub secrets

| Secret | Workflows | Purpose |
| --- | --- | --- |
| `EXPO_TOKEN` | Both | [Expo access token](https://docs.expo.dev/accounts/programmatic-access/) |
| `ASC_API_KEY_BASE64` | TestFlight | Base64-encoded `.p8` App Store Connect API key |
| `ASC_API_KEY_ID` | TestFlight | API key ID |
| `ASC_ISSUER_ID` | TestFlight | API key issuer UUID |
| `APPLE_TEAM_ID` | TestFlight | Apple Developer Team ID |
| `APPLE_TEAM_TYPE` | TestFlight | `COMPANY_OR_ORGANIZATION` or `INDIVIDUAL` |

Signing certificates and provisioning profiles live in **EAS remote credentials** — not in GitHub secrets.

### Local EAS commands

```bash
bun run build:ios    # eas build --platform ios --profile production
bun run submit:ios   # eas submit --platform ios --profile production
```

Production builds bake `EXPO_PUBLIC_API_URL=https://costly-api.stizzle.workers.dev` via the `production` profile in `eas.json`.

## Related

- [HTTP API + mobile ADR](../../docs/decisions/2026-07-14-http-api-and-mobile.md)
- [`@costly/api-client` README](../../packages/api-client/README.md)
