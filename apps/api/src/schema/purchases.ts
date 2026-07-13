import { generateDbId } from "../utils/id";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const settlements = pgTable("settlements", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateDbId("settlement")),
  settledAt: timestamp("settled_at").notNull().defaultNow(),
  settledByUserId: text("settled_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const purchases = pgTable("purchases", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => generateDbId("purchase")),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  partnerSharePercent: integer("partner_share_percent").notNull(),
  purchasedAt: timestamp("purchased_at").notNull(),
  createdByUserId: text("created_by_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  settlementId: text("settlement_id").references(() => settlements.id, {
    onDelete: "restrict",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
