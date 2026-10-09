import { z } from "zod";

const text = z.string().trim().min(1).max(5000);
const items = z
  .array(z.object({ title: text, desc: text }))
  .min(1)
  .max(30);
const mediaUrl = z
  .string()
  .max(2000)
  .refine((value) => {
    if (value === "") return true;
    if (/^\/(?!\/)[a-zA-Z0-9._~%/-]+$/.test(value)) return true;
    return z.url({ protocol: /^https?$/ }).safeParse(value).success;
  }, "Use an HTTP URL, a local media path, or leave it empty");
const imageUrl = z
  .string()
  .max(2000)
  .refine((value) => {
    if (/^\/(?!\/)[a-zA-Z0-9._~%/-]+$/.test(value)) return true;
    return z.url({ protocol: /^https?$/ }).safeParse(value).success;
  }, "Use an HTTP image URL or a local image path");
const socialUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((value) => {
    if (value === "") return true;
    if (/^(mailto:|tel:)/i.test(value)) return true;
    return z.url({ protocol: /^https?$/ }).safeParse(value).success;
  }, "Use an HTTP, email, telephone link, or leave it empty");
export const socialLinkTypeSchema = z.enum([
  "whatsapp",
  "facebook",
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
  "x",
  "behance",
  "website",
  "email",
  "phone",
  "other",
]);
const defaultSocialLinks = [
  {
    type: "whatsapp" as const,
    labelAr: "تواصل عبر واتساب",
    labelEn: "Chat on WhatsApp",
    url: "https://wa.me/201111666635",
  },
  {
    type: "facebook" as const,
    labelAr: "تابعنا على فيسبوك",
    labelEn: "Follow on Facebook",
    url: "https://www.facebook.com/share/1Bszbknj15/?mibextid=wwXIfr",
  },
];
export const hexColorSchema = z
  .string()
  .trim()
  .regex(
    /^#[0-9a-fA-F]{6}$/,
    "Must be a valid 6-character hex color code (e.g. #c9952e)",
  );

export const defaultSiteTheme = {
  primary: "#c9952e",
  brandNavy: "#091c22",
  background: "#f7f3ea",
  accent: "#167b86",
  foreground: "#192c33",
};

export const siteThemeSchema = z.object({
  primary: hexColorSchema.default(defaultSiteTheme.primary),
  brandNavy: hexColorSchema.default(defaultSiteTheme.brandNavy),
  background: hexColorSchema.default(defaultSiteTheme.background),
  accent: hexColorSchema.default(defaultSiteTheme.accent),
  foreground: hexColorSchema.default(defaultSiteTheme.foreground),
});

export type SiteTheme = z.infer<typeof siteThemeSchema>;

export const defaultSiteSettings = {
  logoUrl: "/logo.svg",
  heroImageUrl:
    "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1600&h=900&fit=crop&auto=format",
  theme: defaultSiteTheme,
  clientNames: [
    "Alienware",
    "Dell",
    "Bosch",
    "Schneider Electric",
    "Emaar Misr",
    "SODIC",
    "Wadi Degla",
    "EIPICO",
    "Oriflame",
    "Talabat",
    "Nippon Paint",
    "SC Johnson",
  ],
  phones: ["01111666635", "01007788176"],
  whatsappUrl: "https://wa.me/201111666635",
  facebookUrl: "https://www.facebook.com/share/1Bszbknj15/?mibextid=wwXIfr",
  socialLinks: defaultSocialLinks,
  statistics: [
    { target: 10, suffix: "+", labelAr: "سنوات خبرة", labelEn: "Years Active" },
    {
      target: 200,
      suffix: "+",
      labelAr: "مشروع منجز",
      labelEn: "Projects Done",
    },
    {
      target: 50,
      suffix: "+",
      labelAr: "عميل موثوق",
      labelEn: "Trusted Clients",
    },
  ],
};
export const siteSettingsSchema = z.object({
  logoUrl: imageUrl,
  heroImageUrl: imageUrl,
  theme: siteThemeSchema.default(defaultSiteTheme),
  clientNames: z.array(text).max(100),
  phones: z
    .array(z.string().regex(/^\+?[0-9 ()-]{7,30}$/))
    .min(1)
    .max(10),
  whatsappUrl: z.url().refine((value) => value.startsWith("https://")),
  facebookUrl: z.url().refine((value) => value.startsWith("https://")),
  socialLinks: z
    .array(
      z.object({
        type: socialLinkTypeSchema,
        labelAr: text,
        labelEn: text,
        url: socialUrl,
      }),
    )
    .max(20)
    .default(defaultSocialLinks),
  statistics: z
    .array(
      z.object({
        target: z.int().min(0).max(1_000_000),
        suffix: z.string().max(10),
        labelAr: text,
        labelEn: text,
      }),
    )
    .min(1)
    .max(6),
});
export const siteCopySchema = z.object({
  nav: z.object({
    home: text,
    about: text,
    services: text,
    portfolio: text,
    values: text,
    contact: text,
    cta: text,
    lang: text,
  }),
  hero: z.object({
    tagline: text,
    headline: text,
    sub: text,
    cta1: text,
    cta2: text,
  }),
  about: z.object({
    label: text,
    heading: text,
    who: text,
    what: text,
    vision: text,
    mission: text,
    visionLabel: text,
    missionLabel: text,
  }),
  services: z.object({ label: text, heading: text, items }),
  showreel: z.object({
    label: text,
    heading: text,
    sub: text,
    playLabel: text,
    items: z
      .array(
        z.object({
          title: text,
          desc: text,
          thumbnailUrl: imageUrl,
          videoUrl: mediaUrl,
        }),
      )
      .min(1)
      .max(12),
  }),
  values: z.object({ label: text, heading: text, items }),
  portfolio: z.object({
    label: text,
    heading: text,
    categories: z.array(text).min(1).max(30),
  }),
  clients: z.object({ label: text, heading: text }),
  contact: z.object({
    label: text,
    heading: text,
    address: text,
    contactsHeading: text,
    formHeading: text,
    whatsapp: text,
    facebook: text,
    fields: z.object({
      name: text,
      company: text,
      email: text.default("Email"),
      phone: text.default("Phone Number (Optional)"),
      service: text,
      serviceOptions: z.array(text).min(1).max(50),
      budget: text,
      budgetOptions: z.array(text).min(1).max(50),
      message: text,
      send: text,
    }),
  }),
  footer: z.object({ rights: text, tagline: text }),
});
const defaultShowreelEn = {
  label: "Inside Artex",
  heading: "Watch Ideas Take Shape",
  sub: "A closer look at the craft, precision, and energy behind every Artex production.",
  playLabel: "Open preview",
  items: [
    {
      title: "Exhibition experiences",
      desc: "Immersive spaces designed to make brands impossible to overlook.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop&auto=format",
      videoUrl: "",
    },
    {
      title: "From workshop to venue",
      desc: "Every structure is prepared, finished, and installed with precision.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&h=800&fit=crop&auto=format",
      videoUrl: "",
    },
    {
      title: "Retail environments",
      desc: "Purpose-built displays that turn products into memorable experiences.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&auto=format",
      videoUrl: "",
    },
  ],
};
const defaultShowreelAr = {
  label: "داخل آرتكس",
  heading: "شاهد الأفكار تتحول إلى واقع",
  sub: "نظرة أقرب على الحرفية والدقة والطاقة وراء كل مشروع من آرتكس.",
  playLabel: "فتح العرض",
  items: [
    {
      title: "تجارب المعارض",
      desc: "مساحات غامرة مصممة لتجعل العلامات التجارية محط الأنظار.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop&auto=format",
      videoUrl: "",
    },
    {
      title: "من الورشة إلى الموقع",
      desc: "يتم تجهيز وتشطيب وتركيب كل هيكل بأعلى درجات الدقة.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&h=800&fit=crop&auto=format",
      videoUrl: "",
    },
    {
      title: "بيئات البيع بالتجزئة",
      desc: "منصات عرض مصممة خصيصاً لتحويل المنتجات إلى تجارب لا تُنسى.",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop&auto=format",
      videoUrl: "",
    },
  ],
};
export const siteContentSchema = z.object({
  ar: siteCopySchema.extend({
    showreel: siteCopySchema.shape.showreel.default(defaultShowreelAr),
  }),
  en: siteCopySchema.extend({
    showreel: siteCopySchema.shape.showreel.default(defaultShowreelEn),
  }),
  settings: siteSettingsSchema.default(defaultSiteSettings),
});
export const siteUpdateSchema = z.object({
  content: siteContentSchema,
  version: z.int().nonnegative(),
  publish: z.boolean(),
});
export const siteContentResponseSchema = z.object({ data: siteContentSchema });
export const adminSiteResponseSchema = z.object({
  data: z.object({
    content: siteContentSchema.nullable(),
    version: z.int().nonnegative(),
  }),
});
export type SiteCopy = z.infer<typeof siteCopySchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type SocialLinkType = z.infer<typeof socialLinkTypeSchema>;
