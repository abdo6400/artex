ALTER TABLE "leads" ADD COLUMN "email" varchar(320);--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "consent_at" timestamp with time zone;