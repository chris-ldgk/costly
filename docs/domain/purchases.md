# Purchases & Settlements

## Entities

### Purchase

| Field | Type | Rule |
| --- | --- | --- |
| `name` | text | Required, non-empty |
| `amountCents` | integer | Required, > 0. Stored in EUR cents (e.g. €12.50 → 1250) |
| `partnerSharePercent` | integer | Required, 0–100. The **partner's share** of the cost |
| `purchasedAt` | timestamp | Required. When the purchase was made |
| `createdByUserId` | FK → user | Required. The user who logged (and paid for) the purchase |
| `settlementId` | FK → settlement, nullable | `null` = unsettled |

### Settlement

| Field | Type | Rule |
| --- | --- | --- |
| `settledAt` | timestamp | Set to the moment "Settle all" is clicked |
| `settledByUserId` | FK → user | The user who triggered settlement |

## Split rule

When user **A** logs a purchase, they are assumed to have **paid the full amount**.

`partnerSharePercent` is **B's share** (the partner's share). Therefore:

```
partnerOwesLogger = amountCents × (partnerSharePercent / 100)
```

Example: A logs €100 with partner share 40% → B owes A €40.

When user **B** logs a purchase with partner share 30%, A owes B €30 (30% of B's purchase).

## Balance calculation

Only **unsettled** purchases (`settlementId IS NULL`) contribute to the open balance.

For each unsettled purchase:

- If creator is user A: net balance increases by `partnerOwesLogger` (B owes A more).
- If creator is user B: net balance decreases by `partnerOwesLogger` (A owes B more).

Display as: positive net → partner owes logger; zero → "All settled".

## Settlement

"Settle all" creates one `settlements` row and sets `settlementId` on every purchase where it is currently `null`.

After settlement:

- Open balance resets to €0.00.
- Previously settled purchases remain linked to their settlement for history.
- New purchases accrue fresh debt.

Settlement is irreversible in MVP (no undo).

## Edit

Either user may edit a purchase's `name`, `amountCents`, `partnerSharePercent`, and `purchasedAt`.

- `createdByUserId` and `settlementId` cannot be changed through edit.
- Editing an **open** purchase recalculates the current balance.
- Editing a **settled** purchase updates the historical record only; it does not change the open balance.

## Display

- Amounts shown in EUR with two decimal places (`de-DE` locale).
- Dates shown in the user's local timezone.
