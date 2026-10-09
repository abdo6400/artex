CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'closed', 'spam');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"company" varchar(200) DEFAULT '' NOT NULL,
	"service" varchar(160) DEFAULT '' NOT NULL,
	"budget" varchar(120) DEFAULT '' NOT NULL,
	"message" text NOT NULL,
	"locale" "content_locale" NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "leads_status_created_at_idx" ON "leads" USING btree ("status","created_at");