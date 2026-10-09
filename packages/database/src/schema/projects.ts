import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const contentLocaleEnum = pgEnum("content_locale", ["ar", "en"]);
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "published",
  "archived",
]);
export const projectMediaRoleEnum = pgEnum("project_media_role", [
  "cover",
  "gallery",
]);
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "closed",
  "spam",
]);
export const userRoleEnum = pgEnum("user_role", [
  "owner",
  "admin",
  "editor",
  "viewer",
]);

export const siteContent = pgTable("site_content", {
  id: varchar("id", { length: 30 }).primaryKey(),
  draft: jsonb("draft").notNull(),
  published: jsonb("published"),
  version: integer("version").default(1).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const projectCategories = pgTable(
  "project_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("project_categories_slug_unique").on(table.slug),
    check(
      "project_categories_sort_order_nonnegative",
      sql`${table.sortOrder} >= 0`,
    ),
  ],
);

export const projectCategoryTranslations = pgTable(
  "project_category_translations",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => projectCategories.id, { onDelete: "cascade" }),
    locale: contentLocaleEnum("locale").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.categoryId, table.locale] }),
    index("project_category_translations_locale_idx").on(table.locale),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => projectCategories.id, { onDelete: "restrict" }),
    slug: varchar("slug", { length: 180 }).notNull(),
    clientName: varchar("client_name", { length: 200 }).notNull(),
    status: projectStatusEnum("status").default("draft").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    version: integer("version").default(1).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("projects_slug_unique").on(table.slug),
    index("projects_public_listing_idx").on(
      table.status,
      table.sortOrder,
      table.id,
    ),
    check("projects_sort_order_nonnegative", sql`${table.sortOrder} >= 0`),
    check("projects_version_positive", sql`${table.version} > 0`),
  ],
);

export const projectTranslations = pgTable(
  "project_translations",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    locale: contentLocaleEnum("locale").notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    summary: varchar("summary", { length: 500 }).notNull(),
    description: text("description").notNull(),
    seoTitle: varchar("seo_title", { length: 70 }),
    seoDescription: varchar("seo_description", { length: 170 }),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.locale] }),
    index("project_translations_locale_idx").on(table.locale),
  ],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    publicUrl: text("public_url").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    width: integer("width"),
    height: integer("height"),
    altAr: varchar("alt_ar", { length: 300 }).notNull(),
    altEn: varchar("alt_en", { length: 300 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("media_assets_storage_key_unique").on(table.storageKey),
    check(
      "media_assets_width_positive",
      sql`${table.width} is null or ${table.width} > 0`,
    ),
    check(
      "media_assets_height_positive",
      sql`${table.height} is null or ${table.height} > 0`,
    ),
  ],
);

export const projectMedia = pgTable(
  "project_media",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    role: projectMediaRoleEnum("role").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.mediaId] }),
    uniqueIndex("project_media_single_cover_unique")
      .on(table.projectId)
      .where(sql`${table.role} = 'cover'`),
    index("project_media_project_role_idx").on(
      table.projectId,
      table.role,
      table.sortOrder,
    ),
    check("project_media_sort_order_nonnegative", sql`${table.sortOrder} >= 0`),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 40 }),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    company: varchar("company", { length: 200 }).default("").notNull(),
    service: varchar("service", { length: 160 }).default("").notNull(),
    budget: varchar("budget", { length: 120 }).default("").notNull(),
    message: text("message").notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 100 }),
    sourceIpHash: varchar("source_ip_hash", { length: 64 }),
    locale: contentLocaleEnum("locale").notNull(),
    status: leadStatusEnum("status").default("new").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("leads_status_created_at_idx").on(table.status, table.createdAt),
    uniqueIndex("leads_idempotency_key_unique").on(table.idempotencyKey),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 320 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    mfaSecret: text("mfa_secret"),
    mfaPendingSecret: text("mfa_pending_secret"),
    mfaLastEpoch: integer("mfa_last_epoch"),
    role: userRoleEnum("role").default("viewer").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    check(
      "users_failed_attempts_nonnegative",
      sql`${table.failedLoginAttempts} >= 0`,
    ),
  ],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    mfaVerified: boolean("mfa_verified").default(false).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    ipHash: varchar("ip_hash", { length: 64 }),
    userAgent: varchar("user_agent", { length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("admin_sessions_token_hash_unique").on(table.tokenHash),
    index("admin_sessions_user_expires_idx").on(table.userId, table.expiresAt),
  ],
);

export const requestRateLimits = pgTable(
  "request_rate_limits",
  {
    keyHash: varchar("key_hash", { length: 64 }).notNull(),
    bucket: varchar("bucket", { length: 80 }).notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    attempts: integer("attempts").default(1).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.keyHash, table.bucket, table.windowStart] }),
    check("request_rate_limits_attempts_positive", sql`${table.attempts} > 0`),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 200 }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .default({})
      .notNull(),
    ipHash: varchar("ip_hash", { length: 64 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("audit_logs_created_at_idx").on(table.createdAt)],
);
