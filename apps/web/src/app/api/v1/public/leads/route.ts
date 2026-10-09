import { createLeadSchema, uuidSchema } from "@artex/contracts";
import { createDatabase, leads } from "@artex/database";
import { NextResponse, type NextRequest } from "next/server";
import { problemResponse } from "@/server/shared/http/problem-response";
import { getRequestMetadata } from "@/server/shared/http/request-metadata";
import { consumeRateLimit } from "@/server/shared/security/rate-limit";
import { hashIdentifier } from "@/server/modules/auth/infrastructure/credentials";
import { eq } from "drizzle-orm";
import { readBoundedBody } from "@/server/shared/http/bounded-body";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl)
    return problemResponse({
      type: "about:blank",
      title: "Service unavailable",
      status: 503,
      detail: "Database is not configured.",
    });

  const connection = createDatabase(databaseUrl);
  try {
    const { ip } = getRequestMetadata(request);
    const rateLimit = await consumeRateLimit(connection.db, {
      key: ip,
      bucket: "public-lead",
      limit: MAX_ATTEMPTS,
      windowMs: WINDOW_MS,
    });
    if (!rateLimit.allowed)
      return problemResponse({
        type: "about:blank",
        title: "Too many requests",
        status: 429,
        detail: "Please try again in a minute.",
      });

    let body: unknown;
    try {
      const bytes = await readBoundedBody(request, 32_768);
      body = JSON.parse(new TextDecoder().decode(bytes));
    } catch (error) {
      return problemResponse({
        type: "about:blank",
        title: "Invalid submission",
        status:
          error instanceof Error && error.message === "BODY_TOO_LARGE"
            ? 413
            : 400,
      });
    }
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success)
      return problemResponse({
        type: "about:blank",
        title: "Invalid submission",
        status: 400,
        detail: parsed.error.issues[0]?.message,
      });
    if (parsed.data.website)
      return NextResponse.json({ data: { accepted: true } }, { status: 202 });

    const idempotencyKey = request.headers.get("idempotency-key");
    if (!uuidSchema.safeParse(idempotencyKey).success)
      return problemResponse({
        type: "about:blank",
        title: "A valid idempotency key is required",
        status: 400,
      });
    const [lead] = await connection.db
      .insert(leads)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        consentAt: new Date(),
        company: parsed.data.company,
        service: parsed.data.service,
        budget: parsed.data.budget,
        message: parsed.data.message,
        locale: parsed.data.locale,
        idempotencyKey,
        sourceIpHash: hashIdentifier(ip),
      })
      .onConflictDoNothing({ target: leads.idempotencyKey })
      .returning({ id: leads.id });
    if (!lead && idempotencyKey) {
      const [existing] = await connection.db
        .select({
          id: leads.id,
          email: leads.email,
          name: leads.name,
          message: leads.message,
          company: leads.company,
          service: leads.service,
          budget: leads.budget,
          locale: leads.locale,
        })
        .from(leads)
        .where(eq(leads.idempotencyKey, idempotencyKey))
        .limit(1);
      if (
        !existing ||
        existing.email !== parsed.data.email ||
        existing.name !== parsed.data.name ||
        existing.message !== parsed.data.message ||
        existing.company !== (parsed.data.company ?? null) ||
        existing.service !== (parsed.data.service ?? null) ||
        existing.budget !== (parsed.data.budget ?? null) ||
        existing.locale !== parsed.data.locale
      )
        return problemResponse({
          type: "about:blank",
          title: "Idempotency key reused for another inquiry",
          status: 409,
        });
      return NextResponse.json(
        { data: { id: existing!.id, accepted: true } },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { data: { id: lead!.id, accepted: true } },
      { status: 201 },
    );
  } finally {
    await connection.close();
  }
}
