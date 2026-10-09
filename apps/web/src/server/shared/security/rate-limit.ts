import { requestRateLimits, type Database } from "@artex/database";
import { sql } from "drizzle-orm";
import { hashIdentifier } from "@/server/modules/auth/infrastructure/credentials";

export async function consumeRateLimit(
  db: Database,
  input: { key: string; bucket: string; limit: number; windowMs: number },
) {
  const windowStart = new Date(
    Math.floor(Date.now() / input.windowMs) * input.windowMs,
  );
  const [record] = await db
    .insert(requestRateLimits)
    .values({
      keyHash: hashIdentifier(input.key),
      bucket: input.bucket,
      windowStart,
      attempts: 1,
    })
    .onConflictDoUpdate({
      target: [
        requestRateLimits.keyHash,
        requestRateLimits.bucket,
        requestRateLimits.windowStart,
      ],
      set: { attempts: sql`${requestRateLimits.attempts} + 1` },
    })
    .returning({ attempts: requestRateLimits.attempts });
  return {
    allowed: record!.attempts <= input.limit,
    remaining: Math.max(0, input.limit - record!.attempts),
  };
}
