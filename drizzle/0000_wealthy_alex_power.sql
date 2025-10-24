CREATE TABLE "exchange_rate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"currency" varchar NOT NULL,
	"rate" varchar NOT NULL,
	"multiplier" integer NOT NULL,
	"created_at" date NOT NULL
);
