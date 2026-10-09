import { z } from "zod";
import type { ProjectCursor } from "../domain/project";

const cursorPayloadSchema = z.object({
  sortOrder: z.int().nonnegative(),
  id: z.uuid(),
});

export class InvalidProjectCursorError extends Error {
  constructor() {
    super("The project cursor is invalid.");
    this.name = "InvalidProjectCursorError";
  }
}

export function encodeProjectCursor(cursor: ProjectCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeProjectCursor(value: string): ProjectCursor {
  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    return cursorPayloadSchema.parse(decoded);
  } catch {
    throw new InvalidProjectCursorError();
  }
}
