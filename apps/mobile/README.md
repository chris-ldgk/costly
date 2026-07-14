# Costly Mobile (Tauri iOS)

Native iOS app wrapping the shared frontend SPA in `apps/frontend`. The WebView loads the same React UI as the web PWA; all data flows over HTTP to the API worker.

## Prerequisites

- macOS with **Xcode** installed
- **Rust** toolchain (`rustup`)
- **Bun** (monorepo package manager)
- **CocoaPods** (`brew install cocoapods`)
- Apple Developer account (for physical device installs)

## Development

From the repo root:

```bash
# Terminal 1 — API
cd apps/api && bun run dev

# Terminal 2 — iOS app (starts frontend dev server automatically)
cd apps/mobile && bun run dev:ios
```

### Physical device

1. Open Xcode → **Window → Devices and Simulators** and connect your iPhone.
2. Run with IP selection so the device can reach the Vite dev server:

```bash
bun run tauri ios dev --force-ip-prompt
```

3. Allow **Local Network** permission on the device when prompted.
4. Configure signing in Xcode (`src-tauri/gen/apple/app.xcodeproj`) with your development team.

### Simulator

```bash
bun run dev:ios
# or target a specific simulator:
bun run tauri ios dev "iPhone 16"
```

### Open in Xcode

```bash
bun run tauri ios dev --open
```

## Build

```bash
cd apps/mobile
bun run build:ios
```

Set `APPLE_DEVELOPMENT_TEAM` or `bundle > iOS > developmentTeam` in `src-tauri/tauri.conf.json` for code signing.

## Configuration

`src-tauri/tauri.conf.json` points at the shared frontend:

| Key | Value |
| --- | --- |
| `devUrl` | `http://localhost:3000` |
| `frontendDist` | `../frontend/dist` |
| `beforeDevCommand` | `cd ../frontend && bun run dev` |
| `beforeBuildCommand` | `cd ../frontend && bun run build` |

API URL is set at frontend build time via `VITE_API_URL` in `apps/frontend/.env`.

## Debugging

- **WebView:** Safari → Develop → [your device] → Costly
- **Native:** Xcode console during `tauri ios dev`

## Related

- [Deployment](../../docs/architecture/deployment.md)
- [HTTP API ADR](../../docs/decisions/2026-07-14-http-api-and-mobile.md)
