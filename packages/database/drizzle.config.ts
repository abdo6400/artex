import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://artex:artex@localhost:5432/artex",
  },
  migrations: {
    schema: "public",
    table: "__artex_migrations",
  },
  strict: true,
  verbose: true,
});
