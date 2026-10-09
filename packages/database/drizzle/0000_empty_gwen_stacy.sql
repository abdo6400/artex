CREATE TYPE "public"."content_locale" AS ENUM('ar', 'en');--> statement-breakpoint
CREATE TYPE "public"."project_media_role" AS ENUM('cover', 'gallery');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" varchar(500) NOT NULL,
	"public_url" text NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"width" integer,
	"height" integer,
	"alt_ar" varchar(300) NOT NULL,
	"alt_en" varchar(300) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_width_positive" CHECK ("media_assets"."width" is null or "media_assets"."width" > 0),
	CONSTRAINT "media_assets_height_positive" CHECK ("media_assets"."height" is null or "media_assets"."height" > 0)
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_categories_sort_order_nonnegative" CHECK ("project_categories"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_category_translations" (
	"category_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"name" varchar(160) NOT NULL,
	CONSTRAINT "project_category_translations_category_id_locale_pk" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "project_media" (
	"project_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"role" "project_media_role" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "project_media_project_id_media_id_pk" PRIMARY KEY("project_id","media_id"),
	CONSTRAINT "project_media_sort_order_nonnegative" CHECK ("project_media"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "project_translations" (
	"project_id" uuid NOT NULL,
	"locale" "content_locale" NOT NULL,
	"title" varchar(240) NOT NULL,
	"summary" varchar(500) NOT NULL,
	"description" text NOT NULL,
	"seo_title" varchar(70),
	"seo_description" varchar(170),
	CONSTRAINT "project_translations_project_id_locale_pk" PRIMARY KEY("project_id","locale")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"slug" varchar(180) NOT NULL,
	"client_name" varchar(200) NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_sort_order_nonnegative" CHECK ("projects"."sort_order" >= 0),
	CONSTRAINT "projects_version_positive" CHECK ("projects"."version" > 0)
);
--> statement-breakpoint
ALTER TABLE "project_category_translations" ADD CONSTRAINT "project_category_translations_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_translations" ADD CONSTRAINT "project_translations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_storage_key_unique" ON "media_assets" USING btree ("storage_key");--> statement-breakpoint
CREATE UNIQUE INDEX "project_categories_slug_unique" ON "project_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "project_category_translations_locale_idx" ON "project_category_translations" USING btree ("locale");--> statement-breakpoint
CREATE INDEX "project_media_project_role_idx" ON "project_media" USING btree ("project_id","role","sort_order");--> statement-breakpoint
CREATE INDEX "project_translations_locale_idx" ON "project_translations" USING btree ("locale");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_unique" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_public_listing_idx" ON "projects" USING btree ("status","sort_order","id");