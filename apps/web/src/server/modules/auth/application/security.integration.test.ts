import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDatabase,
  users,
  adminSessions,
  requestRateLimits,
  auditLogs,
  type DatabaseConnection,
} from "@artex/database";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { and, eq, inArray } from "drizzle-orm";
import { fileURLToPath } from "node:url";
import { hashPassword } from "../infrastructure/credentials";
import { login } from "./login";
import { findSession, revokeSession } from "./session";
import { consumeRateLimit } from "@/server/shared/security/rate-limit";
import { updateUser } from "@/server/modules/users/application/manage-users";
import { randomUUID } from "node:crypto";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextRequest } from "next/server";
import { POST as uploadRoute } from "@/app/api/v1/admin/media/route";
import { GET as imageRoute } from "@/app/api/v1/public/media/[id]/route";
import { mediaAssets } from "@artex/database";
import { projects, projectMedia } from "@artex/database";
import { POST as createProjectRoute } from "@/app/api/v1/admin/projects/route";
import {
  GET as getProjectRoute,
  PATCH as updateProjectRoute,
  DELETE as archiveProjectRoute,
} from "@/app/api/v1/admin/projects/[id]/route";
import { GET as privateImageRoute } from "@/app/api/v1/admin/media/[id]/content/route";
import { DrizzleProjectRepository } from "@/server/modules/projects/infrastructure/drizzle-project-repository";
import {
  getSiteContent,
  saveSiteContent,
} from "@/server/modules/site/application/site-content";
import { siteContentSchema } from "@artex/contracts";
import { siteContent } from "@artex/database";
import { beginMfaEnrollment, confirmMfaEnrollment, verifyUserMfa } from "./mfa";
import { generate } from "otplib";
import { POST as createLeadRoute } from "@/app/api/v1/public/leads/route";
import { GET as readyRoute } from "@/app/api/v1/ready/route";
import { leads } from "@artex/database";
import { hashIdentifier } from "../infrastructure/credentials";

const databaseUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!databaseUrl)("PostgreSQL security integration", () => {
  let connection: DatabaseConnection;
  let ownerId: string;
  let mfaSessionToken: string;
  const testRun = randomUUID();
  const email = `${testRun}@test.artex.invalid`;
  const password = "Integration-password-very-long";

  beforeAll(async () => {
    if (!new URL(databaseUrl!).pathname.includes("test"))
      throw new Error(
        "Integration tests require a dedicated database with 'test' in its name.",
      );
    connection = createDatabase(databaseUrl!);
    await migrate(connection.db, {
      migrationsFolder: fileURLToPath(
        new URL("../../../../../../packages/database/drizzle", import.meta.url),
      ),
      migrationsSchema: "public",
      migrationsTable: "__artex_migrations",
    });
    const [owner] = await connection.db
      .insert(users)
      .values({
        email,
        name: "Test owner",
        role: "owner",
        passwordHash: await hashPassword(password),
      })
      .returning({ id: users.id });
    ownerId = owner!.id;
  });

  afterAll(async () => {
    if (connection) {
      await connection.db
        .delete(auditLogs)
        .where(eq(auditLogs.actorUserId, ownerId));
      await connection.db
        .delete(adminSessions)
        .where(eq(adminSessions.userId, ownerId));
      await connection.db.delete(users).where(eq(users.id, ownerId));
      await connection.db.delete(siteContent).where(eq(siteContent.id, "main"));
      await connection.close();
    }
  });

  it("checks migrated readiness and bounds, throttles, and deduplicates inquiries", async () => {
    const originalDatabase = process.env.DATABASE_URL;
    process.env.DATABASE_URL = databaseUrl;
    const key = randomUUID();
    const ip = randomUUID();
    const body = {
      name: "Test client",
      email,
      consent: true,
      message: "Please plan our company launch event.",
      locale: "en",
      company: "Company A",
    };
    const send = (content: string, source = ip) =>
      createLeadRoute(
        new NextRequest("http://localhost/api/v1/public/leads", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "idempotency-key": key,
            "x-forwarded-for": source,
          },
          body: content,
        }),
      );
    const oversizeIp = randomUUID();
    try {
      expect((await readyRoute()).status).toBe(200);
      expect((await send(JSON.stringify(body))).status).toBe(201);
      expect((await send(JSON.stringify(body))).status).toBe(200);
      expect(
        (await send(JSON.stringify({ ...body, company: "Company B" }))).status,
      ).toBe(409);
      expect((await send("{")).status).toBe(400);
      expect((await send("{")).status).toBe(400);
      expect((await send("{")).status).toBe(429);
      expect((await send("x".repeat(32_769), oversizeIp)).status).toBe(413);
    } finally {
      await connection.db.delete(leads).where(eq(leads.idempotencyKey, key));
      await connection.db
        .delete(requestRateLimits)
        .where(
          inArray(requestRateLimits.keyHash, [
            hashIdentifier(ip),
            hashIdentifier(oversizeIp),
          ]),
        );
      if (originalDatabase === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = originalDatabase;
    }
  });

  it("authenticates, stores only a token digest, and revokes sessions", async () => {
    const result = await login(connection.db, {
      email,
      password,
      ip: testRun,
      userAgent: "vitest",
    });
    expect(result.status).toBe("authenticated");
    if (result.status !== "authenticated") throw new Error("Login failed");
    const session = await findSession(connection.db, result.token);
    expect(session?.user.id).toBe(ownerId);
    const [stored] = await connection.db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.id, session!.sessionId));
    expect(stored!.tokenHash).not.toBe(result.token);
    await revokeSession(connection.db, result.token);
    expect(await findSession(connection.db, result.token)).toBeNull();
  });

  it("enforces one shared quota across concurrent database clients", async () => {
    const second = createDatabase(databaseUrl!);
    try {
      const results = await Promise.all(
        Array.from({ length: 10 }, (_, index) =>
          consumeRateLimit(index % 2 ? connection.db : second.db, {
            key: testRun,
            bucket: `integration-${testRun}`,
            limit: 3,
            windowMs: 3_600_000,
          }),
        ),
      );
      expect(results.filter((result) => result.allowed)).toHaveLength(3);
    } finally {
      await second.close();
      await connection.db
        .delete(requestRateLimits)
        .where(eq(requestRateLimits.bucket, `integration-${testRun}`));
    }
  });

  it("revokes sessions when an owner changes a password", async () => {
    const result = await login(connection.db, {
      email,
      password,
      ip: testRun,
      userAgent: "vitest",
    });
    if (result.status !== "authenticated") throw new Error("Login failed");
    await updateUser(
      connection.db,
      ownerId,
      { password: "New-integration-password-long" },
      ownerId,
    );
    expect(await findSession(connection.db, result.token)).toBeNull();
  });

  it("prevents disabling the last active owner", async () => {
    await expect(
      updateUser(connection.db, ownerId, { isActive: false }, ownerId),
    ).rejects.toThrow("LAST_OWNER");
  });

  it("keeps drafts private and rejects stale content updates", async () => {
    const initial = siteContentSchema.parse(
      JSON.parse(
        await readFile(
          new URL(
            "../../../../../../packages/database/seeds/site.json",
            import.meta.url,
          ),
          "utf8",
        ),
      ),
    );
    const saved = await saveSiteContent(
      connection.db,
      { content: initial, version: 0, publish: false },
      ownerId,
    );
    expect(saved?.version).toBe(1);
    expect(await getSiteContent(connection.db, true)).toBeNull();
    expect(
      await saveSiteContent(
        connection.db,
        { content: initial, version: 0, publish: true },
        ownerId,
      ),
    ).toBeNull();
    await saveSiteContent(
      connection.db,
      { content: initial, version: 1, publish: true },
      ownerId,
    );
    expect(await getSiteContent(connection.db, true)).toEqual(initial);
  });

  it("restricts owner sessions until enrollment and prevents authenticator replay", async () => {
    const originalRequired = process.env.REQUIRE_OWNER_MFA;
    const originalKey = process.env.MFA_ENCRYPTION_KEY;
    process.env.REQUIRE_OWNER_MFA = "true";
    process.env.MFA_ENCRYPTION_KEY = "b".repeat(64);
    try {
      const result = await login(connection.db, {
        email,
        password: "New-integration-password-long",
        ip: testRun,
        userAgent: "vitest",
      });
      if (result.status !== "authenticated") throw new Error("Login failed");
      const session = await findSession(connection.db, result.token);
      expect(session?.mfaRequired).toBe(true);
      const setup = await beginMfaEnrollment(connection.db, ownerId);
      expect(setup).not.toBeNull();
      expect(
        await confirmMfaEnrollment(
          connection.db,
          ownerId,
          session!.sessionId,
          "invalid",
        ),
      ).toBe(false);
      const code = await generate({ secret: setup!.secret });
      expect(
        await confirmMfaEnrollment(
          connection.db,
          ownerId,
          session!.sessionId,
          code,
        ),
      ).toBe(true);
      expect(
        (await findSession(connection.db, result.token))?.mfaRequired,
      ).toBe(false);
      mfaSessionToken = result.token;
      const [user] = await connection.db
        .select()
        .from(users)
        .where(eq(users.id, ownerId));
      expect(
        await verifyUserMfa(connection.db, ownerId, user!.mfaSecret!, code),
      ).toBe(false);
      expect(await beginMfaEnrollment(connection.db, ownerId)).toBeNull();
    } finally {
      if (originalRequired === undefined) delete process.env.REQUIRE_OWNER_MFA;
      else process.env.REQUIRE_OWNER_MFA = originalRequired;
      if (originalKey === undefined) delete process.env.MFA_ENCRYPTION_KEY;
      else process.env.MFA_ENCRYPTION_KEY = originalKey;
    }
  });

  it("uploads through the authenticated multipart handler and serves normalized bytes", async () => {
    const originalDatabase = process.env.DATABASE_URL;
    const originalStorage = process.env.MEDIA_STORAGE_PATH;
    const originalPublicBase = process.env.MEDIA_PUBLIC_BASE_URL;
    const scope = path.resolve(process.cwd());
    const directory = await mkdtemp(
      path.join(scope, ".tmp-media-integration-"),
    );
    process.env.DATABASE_URL = databaseUrl;
    process.env.MEDIA_STORAGE_PATH = directory;
    process.env.MEDIA_PUBLIC_BASE_URL =
      "http://localhost:3002/api/v1/public/media";
    let mediaId: string | undefined;
    let projectId: string | undefined;
    try {
      const image = await sharp({
        create: { width: 30, height: 20, channels: 3, background: "red" },
      })
        .png()
        .toBuffer();
      const form = new FormData();
      form.set(
        "file",
        new File([new Uint8Array(image)], "test.png", { type: "image/png" }),
      );
      form.set("altAr", "صورة اختبار");
      form.set("altEn", "Test image");
      const response = await uploadRoute(
        new NextRequest("http://localhost:3002/api/v1/admin/media", {
          method: "POST",
          headers: { authorization: `Bearer ${mfaSessionToken}` },
          body: form,
        }),
      );
      expect(response.status).toBe(201);
      const payload = await response.json();
      mediaId = payload.data.id;
      const privatePublicAttempt = await imageRoute(
        new Request(payload.data.url),
        {
          params: Promise.resolve({ id: mediaId! }),
        },
      );
      expect(privatePublicAttempt.status).toBe(404);
      const published = await privateImageRoute(
        new NextRequest("http://localhost:3002/api/v1/admin/media/content", {
          headers: { authorization: `Bearer ${mfaSessionToken}` },
        }),
        { params: Promise.resolve({ id: mediaId! }) },
      );
      expect(published.status).toBe(200);
      expect(published.headers.get("content-type")).toBe("image/webp");
      const metadata = await sharp(
        new Uint8Array(await published.arrayBuffer()),
      ).metadata();
      expect(metadata.width).toBe(30);
      expect(metadata.height).toBe(20);
      expect(metadata.exif).toBeUndefined();
      const createResponse = await createProjectRoute(
        new NextRequest("http://localhost:3002/api/v1/admin/projects", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${mfaSessionToken}`,
          },
          body: JSON.stringify({
            slug: `integration-${testRun}`,
            clientName: "Integration client",
            sortOrder: 7,
            gallery: [
              {
                url: `https://images.example.com/${testRun}.jpg`,
                altAr: "صورة المعرض",
                altEn: "Gallery image",
              },
            ],
            category: {
              slug: `integration-${testRun}`,
              nameAr: "اختبار",
              nameEn: "Integration",
            },
            ar: {
              title: "اختبار",
              summary: "ملخص",
              description: "وصف الاختبار",
            },
            en: {
              title: "Integration",
              summary: "Summary",
              description: "Integration description",
            },
            cover: {
              url: payload.data.url,
              altAr: "اختبار",
              altEn: "Integration image",
            },
          }),
        }),
      );
      expect(createResponse.status).toBe(201);
      const created = await createResponse.json();
      projectId = created.data.id;
      const [cover] = await connection.db
        .select()
        .from(projectMedia)
        .where(
          and(
            eq(projectMedia.projectId, projectId!),
            eq(projectMedia.role, "cover"),
          ),
        );
      expect(cover!.mediaId).toBe(mediaId);
      const context = { params: Promise.resolve({ id: projectId! }) };
      const auth = { authorization: `Bearer ${mfaSessionToken}` };
      const mutation = (value: unknown) =>
        new NextRequest("http://localhost:3002/api/v1/admin/projects/update", {
          method: "PATCH",
          headers: { ...auth, "content-type": "application/json" },
          body: JSON.stringify(value),
        });
      const changed = await updateProjectRoute(
        mutation({
          version: 1,
          en: {
            title: "Updated integration",
            summary: "Updated summary",
            description: "Updated description",
          },
        }),
        context,
      );
      expect(changed.status).toBe(200);
      const detail = await getProjectRoute(
        new NextRequest("http://localhost:3002/api/v1/admin/projects/detail", {
          headers: auth,
        }),
        context,
      );
      const detailBody = await detail.json();
      expect(detailBody.data.version).toBe(2);
      expect(detailBody.data.sortOrder).toBe(7);
      expect(detailBody.data.status).toBe("draft");
      expect(detailBody.data.gallery).toHaveLength(1);
      expect(detailBody.data.en.title).toBe("Updated integration");
      expect(
        (
          await updateProjectRoute(
            mutation({ version: 2, status: "published" }),
            context,
          )
        ).status,
      ).toBe(200);
      expect(
        (
          await updateProjectRoute(
            mutation({ version: 2, status: "draft" }),
            context,
          )
        ).status,
      ).toBe(409);
      expect(
        (
          await updateProjectRoute(
            mutation({ version: 3, slug: "changed-url" }),
            context,
          )
        ).status,
      ).toBe(409);
      const publicRepository = new DrizzleProjectRepository(connection.db);
      expect(
        (
          await publicRepository.findPublishedBySlug(
            `integration-${testRun}`,
            "en",
          )
        )?.gallery,
      ).toHaveLength(1);
      expect(
        (
          await imageRoute(new Request(payload.data.url), {
            params: Promise.resolve({ id: mediaId! }),
          })
        ).status,
      ).toBe(200);
      expect(
        (
          await archiveProjectRoute(
            new NextRequest(
              "http://localhost:3002/api/v1/admin/projects/archive",
              { method: "DELETE", headers: auth },
            ),
            context,
          )
        ).status,
      ).toBe(204);
      expect(
        await publicRepository.findPublishedBySlug(
          `integration-${testRun}`,
          "en",
        ),
      ).toBeNull();
      expect(
        (
          await imageRoute(new Request(payload.data.url), {
            params: Promise.resolve({ id: mediaId! }),
          })
        ).status,
      ).toBe(404);
    } finally {
      if (projectId) {
        const linked = await connection.db
          .select({ id: projectMedia.mediaId })
          .from(projectMedia)
          .where(eq(projectMedia.projectId, projectId));
        await connection.db.delete(projects).where(eq(projects.id, projectId));
        if (linked.length)
          await connection.db.delete(mediaAssets).where(
            inArray(
              mediaAssets.id,
              linked.map((row) => row.id),
            ),
          );
      }
      if (mediaId)
        await connection.db
          .delete(mediaAssets)
          .where(eq(mediaAssets.id, mediaId));
      if (path.dirname(directory) !== scope)
        throw new Error("Unexpected media test cleanup path");
      await rm(directory, { recursive: true, force: true });
      if (originalDatabase === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = originalDatabase;
      if (originalStorage === undefined) delete process.env.MEDIA_STORAGE_PATH;
      else process.env.MEDIA_STORAGE_PATH = originalStorage;
      if (originalPublicBase === undefined)
        delete process.env.MEDIA_PUBLIC_BASE_URL;
      else process.env.MEDIA_PUBLIC_BASE_URL = originalPublicBase;
    }
  });
});
