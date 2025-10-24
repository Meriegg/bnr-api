import { date, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const exchangeRate = pgTable("exchange_rate", {
  id: uuid("id").primaryKey().defaultRandom(),

  year: integer('year').notNull(),
  date: date('date').notNull(),
  currency: varchar('currency').notNull(),

  // decimal.js
  rate: varchar('rate').notNull(),
  multiplier: integer('multiplier').notNull(),

  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at'),
});
