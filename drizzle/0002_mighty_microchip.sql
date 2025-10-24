ALTER TABLE "exchange_rate" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "exchange_rate" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "exchange_rate" ADD COLUMN "updated_at" timestamp;