# @costly/components

Shared UI component library for the monorepo. Components are **generated and synced from [Subframe](https://subframe.com)** — do not hand-author files in `ui/components/`. Customizations belong in wrapper `index.tsx` files.

## Purpose

- Provides design-system primitives (Button, TextField, Dialog, charts, layouts, etc.) consumed by the frontend.
- Keeps UI consistent across apps without duplicating component code.
- Exports a Tailwind config preset that the frontend extends.

## Stack

| Concern | Technology |
| --- | --- |
| Components | [Subframe](https://subframe.com) (`@subframe/core`, `@subframe/cli`) |
| Framework | React 19 |
| Styling | Tailwind CSS v3 |
| Language | TypeScript |

## Layout

```
ui/
├── index.ts           # Barrel exports
├── components/        # One folder per component (Button/, TextField/, …)
├── layouts/           # DefaultPageLayout, DialogLayout, DrawerLayout
└── tailwind.config.js # Preset consumed by apps/frontend
```

## Usage

```typescript
import { Button, TextField, DefaultPageLayout } from "@costly/components";
```

Sync components from Subframe:

```bash
bun run sync
```

Use `// @subframe/sync-disable` in wrapper files to protect customizations from being overwritten.

## Scripts

```bash
bun run sync        # Sync components from Subframe
bun run typecheck   # Type-check
bun run lint        # Lint
```
