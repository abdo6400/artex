import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspect(filename);
      continue;
    }
    if (!/\.(?:ts|tsx|css)$/.test(entry.name)) continue;
    const source = await readFile(filename, "utf8");
    const imports = source.matchAll(
      /(?:from\s+|import\s*\(|@import\s+)["']([^"']+)["']/g,
    );
    for (const [, specifier] of imports) {
      if (
        specifier.startsWith("@artex/database") &&
        !filename.includes(`${path.sep}src${path.sep}server${path.sep}`) &&
        !filename.includes(
          `${path.sep}src${path.sep}app${path.sep}api${path.sep}`,
        )
      )
        failures.push(`${filename}: browser-facing code imports database`);
      if (specifier.startsWith(".")) {
        const target = path.resolve(path.dirname(filename), specifier);
        const appRoot = path.join(root, "apps", "web") + path.sep;
        const appsRoot = path.join(root, "apps") + path.sep;
        if (target.startsWith(appsRoot) && !target.startsWith(appRoot))
          failures.push(`${filename}: imports another application's source`);
      }
    }
  }
}
await inspect(path.join(root, "apps", "web", "src"));
if (failures.length) {
  process.stderr.write(failures.join("\n") + "\n");
  process.exitCode = 1;
} else process.stdout.write("Application import boundaries passed.\n");
