import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { generate } from "otplib";
import sharp from "sharp";

const base = process.env.SMOKE_API_URL ?? "http://127.0.0.1:3000";
if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
  throw new Error(
    "Run this mutation smoke test against a local disposable database only.",
  );
const email = process.env.SMOKE_EMAIL;
const password = process.env.SMOKE_PASSWORD;
if (!email || !password)
  throw new Error("SMOKE_EMAIL and SMOKE_PASSWORD are required.");
const run = randomUUID();
let token;
let viewerToken;
let projectId;
let viewerId;

async function request(path, options = {}, bearer = token) {
  const response = await fetch(`${base}/api/v1/${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
      ...options.headers,
    },
    signal: AbortSignal.timeout(20_000),
  });
  const body = response.status === 204 ? null : await response.json();
  return { status: response.status, body };
}

try {
  assert.equal((await request("ready", {}, null)).status, 200);
  assert.equal((await request("admin/projects", {}, null)).status, 401);
  const login = await request(
    "auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        code: process.env.SMOKE_MFA_CODE,
      }),
    },
    null,
  );
  assert.equal(login.status, 200);
  token = login.body.data.token;
  if (login.body.data.mfaRequired) {
    assert.equal((await request("admin/projects")).status, 401);
    const setup = await request("auth/mfa", { method: "POST" });
    assert.equal(setup.status, 200);
    const code = await generate({ secret: setup.body.data.secret });
    assert.equal(
      (
        await request("auth/mfa", {
          method: "PUT",
          body: JSON.stringify({ code }),
        })
      ).status,
      200,
    );
  }
  assert.equal((await request("auth/session")).body.data.user.email, email);

  const viewerPassword = `${run}-viewer-password`;
  const viewer = await request("admin/users", {
    method: "POST",
    body: JSON.stringify({
      email: `${run}@smoke.invalid`,
      name: "Smoke viewer",
      password: viewerPassword,
      role: "viewer",
    }),
  });
  assert.equal(viewer.status, 201);
  viewerId = viewer.body.data.id;
  const viewerLogin = await request(
    "auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email: `${run}@smoke.invalid`,
        password: viewerPassword,
      }),
    },
    null,
  );
  assert.equal(viewerLogin.status, 200);
  viewerToken = viewerLogin.body.data.token;
  assert.equal((await request("admin/projects", {}, viewerToken)).status, 200);
  assert.equal(
    (
      await request(
        "admin/projects",
        { method: "POST", body: "{}" },
        viewerToken,
      )
    ).status,
    401,
  );

  const project = await request("admin/projects", {
    method: "POST",
    body: JSON.stringify({
      slug: `smoke-${run}`,
      clientName: "Smoke test client",
      category: { slug: "smoke", nameAr: "اختبار", nameEn: "Smoke test" },
      ar: {
        title: "مشروع اختبار",
        summary: "ملخص الاختبار",
        description: "تفاصيل المشروع للاختبار فقط",
      },
      en: {
        title: "Smoke test project",
        summary: "Integration test summary",
        description: "Integration test project description",
      },
      status: "draft",
      sortOrder: 0,
    }),
  });
  assert.equal(project.status, 201);
  projectId = project.body.data.id;
  assert.equal(
    (await request(`public/projects/smoke-${run}?locale=en`, {}, null)).status,
    404,
  );
  const publish = await request(`admin/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "published", version: 1 }),
  });
  assert.equal(publish.status, 200);
  assert.equal(
    (await request(`public/projects/smoke-${run}?locale=ar`, {}, null)).body
      .data.title,
    "مشروع اختبار",
  );
  assert.equal(
    (
      await request(`admin/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "draft", version: 1 }),
      })
    ).status,
    409,
  );

  const key = randomUUID();
  const leadBody = JSON.stringify({
    name: "Smoke inquiry",
    email: `${run}@inquiry.invalid`,
    consent: true,
    message: "A smoke test inquiry for the disposable database.",
    locale: "en",
  });
  const first = await request(
    "public/leads",
    { method: "POST", headers: { "idempotency-key": key }, body: leadBody },
    null,
  );
  const retry = await request(
    "public/leads",
    { method: "POST", headers: { "idempotency-key": key }, body: leadBody },
    null,
  );
  assert.equal(first.status, 201);
  assert.equal(retry.status, 200);
  assert.equal(first.body.data.id, retry.body.data.id);
  const inbox = await request("admin/leads");
  assert.ok(inbox.body.data.some((lead) => lead.id === first.body.data.id));

  const disabled = await request(`admin/users/${viewerId}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive: false }),
  });
  assert.equal(disabled.status, 200);
  assert.equal((await request("auth/session", {}, viewerToken)).status, 401);
  assert.equal((await request("public/site", {}, null)).status, 200);
  const image = await sharp({
    create: { width: 10, height: 10, channels: 3, background: "red" },
  })
    .png()
    .toBuffer();
  const uploadForm = new FormData();
  uploadForm.set("file", new File([image], "smoke.png", { type: "image/png" }));
  uploadForm.set("altEn", "Smoke image");
  uploadForm.set("altAr", "صورة اختبار");
  const upload = await fetch(`${base}/api/v1/admin/media`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
    body: uploadForm,
  });
  assert.equal(upload.status, 201);
  const uploaded = await upload.json();
  assert.equal(
    (await fetch(`${base}/api/v1/public/media/${uploaded.data.id}`)).status,
    404,
  );
  assert.equal(
    (
      await fetch(`${base}/api/v1/admin/media/${uploaded.data.id}/content`, {
        headers: { authorization: `Bearer ${token}` },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request(`admin/projects/${projectId}`, {
        method: "PATCH",
        body: JSON.stringify({
          version: 2,
          cover: {
            url: uploaded.data.url,
            altEn: "Smoke image",
            altAr: "صورة اختبار",
          },
        }),
      })
    ).status,
    200,
  );
  const publishedImage = await fetch(
    `${base}/api/v1/public/media/${uploaded.data.id}`,
  );
  assert.equal(publishedImage.status, 200);
  assert.match(publishedImage.headers.get("content-type"), /image\/webp/);
  process.stdout.write(
    "API smoke passed: login, MFA, RBAC denial, bilingual publishing, stale writes, lead idempotency, image upload, inbox, and session revocation.\n",
  );
} finally {
  if (projectId && token)
    await request(`admin/projects/${projectId}`, { method: "DELETE" });
  if (viewerToken)
    await request("auth/logout", { method: "POST" }, viewerToken);
  if (token) await request("auth/logout", { method: "POST" });
}
