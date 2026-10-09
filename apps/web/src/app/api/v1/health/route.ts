import { NextResponse } from "next/server";
import { healthResponseSchema } from "@artex/contracts";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    healthResponseSchema.parse({
      data: {
        service: "artex-api",
        status: "ok",
        timestamp: new Date().toISOString(),
      },
    }),
  );
}
