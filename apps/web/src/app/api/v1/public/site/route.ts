import { createDatabase } from "@artex/database";
import { NextResponse } from "next/server";
import { getSiteContent } from "@/server/modules/site/application/site-content";
import { problemResponse } from "@/server/shared/http/problem-response";

export async function GET() {
  if (!process.env.DATABASE_URL)
    return problemResponse({
      type: "about:blank",
      title: "Service unavailable",
      status: 503,
    });
  const connection = createDatabase(process.env.DATABASE_URL);
  try {
    const content = await getSiteContent(connection.db, true);
    if (!content)
      return problemResponse({
        type: "about:blank",
        title: "Site content not published",
        status: 404,
      });
    return NextResponse.json({ data: content });
  } finally {
    await connection.close();
  }
}
