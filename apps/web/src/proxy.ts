import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@artex/i18n";
import { contentSecurityPolicy } from "@artex/config/security";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split("/")[1];
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    (firstSegment && isLocale(firstSegment))
  ) {
    const nonce = Buffer.from(
      crypto.getRandomValues(new Uint8Array(32)),
    ).toString("base64");
    const policy = contentSecurityPolicy(
      nonce,
      process.env.NODE_ENV !== "production",
    );
    const headers = new Headers(request.headers);
    headers.set("content-security-policy", policy);
    headers.set("x-nonce", nonce);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set("content-security-policy", policy);
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
