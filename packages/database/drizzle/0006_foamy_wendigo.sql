ALTER TABLE "admin_sessions" ADD COLUMN "mfa_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_pending_secret" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "mfa_last_epoch" integer;