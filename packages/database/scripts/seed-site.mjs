import { readFile } from "node:fs/promises";
import postgres from "postgres";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const content = JSON.parse(
  await readFile(new URL("../seeds/site.json", import.meta.url), "utf8"),
);
const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  await sql`insert into site_content (id, draft, published, version) values ('main', ${sql.json(content)}, ${sql.json(content)}, 1) on conflict (id) do nothing`;
  process.stdout.write(
    "Initial bilingual site content seeded without overwriting existing content.\n",
  );
} finally {
  await sql.end();
}
