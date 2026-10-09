import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const apiUrl =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3000";
  try {
    const response = await fetch(`${apiUrl}/api/v1/public/leads`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": request.headers.get("x-forwarded-for") ?? "",
        "idempotency-key": request.headers.get("idempotency-key") ?? "",
      },
      body: await request.text(),
      cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { title: "Service unavailable", status: 503 },
      { status: 503 },
    );
  }
}
