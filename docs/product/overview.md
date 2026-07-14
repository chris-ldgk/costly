# Costly — Product Overview

Costly is a private, mobile-first PWA for two people to track shared purchases and settle up.

## Users

Exactly two pre-configured users (typically a couple). Accounts are created from the `ALLOWED_USERS` environment variable — there is no public registration.

## Core flows

### Sign in

1. User opens Costly (browser or installed PWA).
2. Enters their email on `/login`.
3. Receives a 6-digit sign-in code by email (logged to API console in development).
4. Enters the code on `/login` → authenticated session → redirected to the dashboard.

### Log a purchase

1. User taps **Add purchase** on the dashboard.
2. Enters: name, amount (EUR), partner's share (%), and purchase date.
3. Purchase is saved and linked to the logged-in user as the payer.

### View balance and purchases

The dashboard shows:

- **Net balance** — who owes whom how much, based on unsettled purchases only.
- **Purchase list** — all purchases with settled/unsettled status.
- **Settle all** — marks every open purchase as settled at the current moment.

## UX principles

- Mobile-first: single-column layout, touch-friendly targets, card-based lists.
- Installable as a PWA on iOS and Android home screens.
- No offline mode in MVP — live data requires network access.

## Out of scope (MVP)

- Public REST API for purchase data.
- User registration or password login.
- More than two users.
- Categories, receipts, or recurring expenses.
- Offline caching of purchase data.

## Related docs

- [Purchase domain rules](../domain/purchases.md)
- [Auth domain rules](../domain/auth.md)
- [Auth & API access ADR](../decisions/2026-07-13-auth-and-api-access.md)
