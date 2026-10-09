import { z } from "zod";
export * from "./site";

export const localeSchema = z.enum(["ar", "en"]);
export const uuidSchema = z.uuid();

export const problemDetailsSchema = z.object({
  type: z.string(),
  title: z.string(),
  status: z.int().min(400).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  requestId: z.string().optional(),
});

export const projectMediaSchema = z.object({
  url: z.url(),
  alt: z.string().min(1),
  width: z.int().positive().nullable(),
  height: z.int().positive().nullable(),
});

export const publicProjectSummarySchema = z.object({
  id: uuidSchema,
  slug: z.string().min(1),
  clientName: z.string().min(1),
  title: z.string().min(1),
  summary: z.string(),
  category: z.object({
    slug: z.string().min(1),
    name: z.string().min(1),
  }),
  cover: projectMediaSchema.nullable(),
});

export const publicProjectDetailSchema = publicProjectSummarySchema.extend({
  description: z.string(),
  seo: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
  }),
  gallery: z.array(projectMediaSchema),
});

export const projectListQuerySchema = z.object({
  locale: localeSchema.default("ar"),
  category: z.string().min(1).max(160).optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const publicProjectListResponseSchema = z.object({
  data: z.array(publicProjectSummarySchema),
  meta: z.object({ nextCursor: z.string().nullable() }),
});

export const publicProjectDetailResponseSchema = z.object({
  data: publicProjectDetailSchema,
});

export const healthResponseSchema = z.object({
  data: z.object({
    service: z.literal("artex-api"),
    status: z.literal("ok"),
    timestamp: z.iso.datetime(),
  }),
});

export const createLeadSchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.email().trim().toLowerCase().max(320),
  consent: z.literal(true),
  company: z.string().trim().max(200).default(""),
  service: z.string().trim().max(160).default(""),
  budget: z.string().trim().max(120).default(""),
  message: z.string().trim().min(10).max(5000),
  locale: localeSchema.default("ar"),
  website: z.string().max(0).optional(),
});

export const leadSchema = createLeadSchema
  .omit({ website: true, consent: true })
  .extend({
    email: z.email().nullable(),
    id: uuidSchema,
    status: z.enum(["new", "contacted", "closed", "spam"]),
    createdAt: z.iso.datetime(),
  });

export const createLeadResponseSchema = z.object({
  data: z.object({ id: uuidSchema, accepted: z.literal(true) }),
});

export const leadListResponseSchema = z.object({ data: z.array(leadSchema) });

const translatedProjectFieldsSchema = z.object({
  title: z.string().trim().min(2).max(240),
  summary: z.string().trim().min(2).max(500),
  description: z.string().trim().min(2).max(20_000),
});

type LooseLang = { title?: unknown; summary?: unknown; description?: unknown };
const clean = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Fill a language block: empty fields fall back to the same language's title, then to the primary language. */
function fillLanguage(target: LooseLang | undefined, primary?: LooseLang) {
  const title = clean(target?.title) ?? clean(primary?.title);
  const summary =
    clean(target?.summary) ??
    (clean(target?.title) ? undefined : clean(primary?.summary)) ??
    title;
  const description =
    clean(target?.description) ??
    (clean(target?.title) ? undefined : clean(primary?.description)) ??
    clean(target?.summary) ??
    summary;
  return { ...target, title, summary, description };
}

/**
 * Arabic-first normalisation. Arabic is the primary language: English and the
 * summary/description fields are optional and fall back to Arabic/title.
 */
function normalizeProjectInput(input: unknown, partial: boolean): unknown {
  if (!isRecord(input)) return input;
  const output: Record<string, unknown> = { ...input };
  const ar = isRecord(input.ar) ? (input.ar as LooseLang) : undefined;
  const en = isRecord(input.en) ? (input.en as LooseLang) : undefined;
  if (ar) output.ar = fillLanguage(ar, en);
  if (en || (!partial && ar)) output.en = fillLanguage(en, ar);
  if (!ar && en && !partial) output.ar = fillLanguage(undefined, en);
  if (isRecord(input.category)) {
    const category = input.category;
    output.category = {
      ...category,
      nameEn: clean(category.nameEn) ?? clean(category.nameAr),
      nameAr: clean(category.nameAr) ?? clean(category.nameEn),
    };
  }
  const projectTitle = isRecord(output.ar)
    ? clean(output.ar.title)
    : isRecord(output.en)
      ? clean(output.en.title)
      : undefined;
  const fillAlt = (image: unknown) => {
    if (!isRecord(image)) return image;
    const altAr = clean(image.altAr) ?? clean(image.altEn) ?? projectTitle;
    const altEn = clean(image.altEn) ?? clean(image.altAr) ?? projectTitle;
    return { ...image, altAr, altEn };
  };
  if (isRecord(input.cover)) output.cover = fillAlt(input.cover);
  if (Array.isArray(input.gallery)) output.gallery = input.gallery.map(fillAlt);
  return output;
}

const adminProjectBaseSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(180),
  clientName: z.string().trim().min(2).max(200),
  category: z.object({
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(160),
    nameAr: z.string().trim().min(1).max(160),
    nameEn: z.string().trim().min(1).max(160),
  }),
  ar: translatedProjectFieldsSchema,
  en: translatedProjectFieldsSchema,
  cover: z
    .object({
      url: z.url(),
      altAr: z.string().min(1).max(300),
      altEn: z.string().min(1).max(300),
    })
    .optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  gallery: z
    .array(
      z.object({
        url: z.url(),
        altAr: z.string().min(1).max(300),
        altEn: z.string().min(1).max(300),
      }),
    )
    .max(50)
    .default([]),
  sortOrder: z.int().min(0).default(0),
});

export const createAdminProjectSchema = z.preprocess(
  (input) => normalizeProjectInput(input, false),
  adminProjectBaseSchema,
);

const updateAdminProjectBaseSchema = adminProjectBaseSchema.partial().extend({
  version: z.int().positive(),
  cover: adminProjectBaseSchema.shape.cover.unwrap().nullable().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sortOrder: z.int().min(0).optional(),
  gallery: adminProjectBaseSchema.shape.gallery.removeDefault().optional(),
});
export const updateAdminProjectSchema = z.preprocess(
  (input) => normalizeProjectInput(input, true),
  updateAdminProjectBaseSchema,
);
export const adminProjectDetailResponseSchema = z.object({
  data: adminProjectBaseSchema.extend({
    id: uuidSchema,
    version: z.int().positive(),
  }),
});

export const userRoleSchema = z.enum(["owner", "admin", "editor", "viewer"]);

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase().max(320),
  password: z.string().min(12).max(200),
  code: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
});

export const authenticatedUserSchema = z.object({
  id: uuidSchema,
  email: z.email(),
  name: z.string().min(1),
  role: userRoleSchema,
});

export const loginResponseSchema = z.object({
  data: z.object({
    token: z.string().min(32),
    expiresAt: z.iso.datetime(),
    user: authenticatedUserSchema,
    mfaRequired: z.boolean(),
  }),
});

export const sessionResponseSchema = z.object({
  data: z.object({
    user: authenticatedUserSchema,
    expiresAt: z.iso.datetime(),
    mfaRequired: z.boolean(),
    mfaEnabled: z.boolean(),
  }),
});

export const mfaCodeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });
export const mediaUploadFieldsSchema = z.object({
  altAr: z.string().trim().min(1).max(300),
  altEn: z.string().trim().min(1).max(300),
});
export const mediaUploadResponseSchema = z.object({
  data: z.object({
    id: uuidSchema,
    url: z.url(),
    width: z.int().positive(),
    height: z.int().positive(),
  }),
});
export const mfaSetupResponseSchema = z.object({
  data: z.object({ secret: z.string(), uri: z.string() }),
});

export const createUserSchema = z.object({
  email: z.email().trim().toLowerCase().max(320),
  name: z.string().trim().min(2).max(160),
  password: z.string().min(12).max(200),
  role: userRoleSchema,
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(160).optional(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(12).max(200).optional(),
});

export const userListResponseSchema = z.object({
  data: z.array(
    authenticatedUserSchema.extend({
      isActive: z.boolean(),
      lastLoginAt: z.iso.datetime().nullable(),
    }),
  ),
});
export const adminProjectListResponseSchema = z.object({
  data: z.array(
    z.object({
      id: uuidSchema,
      slug: z.string(),
      clientName: z.string(),
      title: z.string().nullable(),
      status: z.enum(["draft", "published", "archived"]),
      version: z.int().positive(),
      updatedAt: z.iso.datetime(),
    }),
  ),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type Locale = z.infer<typeof localeSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
export type PublicProjectSummary = z.infer<typeof publicProjectSummarySchema>;
export type PublicProjectDetail = z.infer<typeof publicProjectDetailSchema>;
export type PublicProjectListResponse = z.infer<
  typeof publicProjectListResponseSchema
>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type CreateAdminProjectInput = z.infer<typeof createAdminProjectSchema>;
export type UpdateAdminProjectInput = z.infer<typeof updateAdminProjectSchema>;
export type AdminProjectDetail = z.infer<
  typeof adminProjectDetailResponseSchema
>["data"];
export type Lead = z.infer<typeof leadSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
