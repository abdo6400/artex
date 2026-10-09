import type { NextRequest } from "next/server";

export function getRequestMetadata(request: NextRequest) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return {
    ip: forwarded || request.headers.get("x-real-ip") || "unknown",
    userAgent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
  };
}
