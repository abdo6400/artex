import { createDatabase, type DatabaseConnection } from "@artex/database";
import { DrizzleProjectRepository } from "./drizzle-project-repository";

let connection: DatabaseConnection | undefined;

export class DatabaseConfigurationError extends Error {
  constructor() {
    super("DATABASE_URL is not configured.");
    this.name = "DatabaseConfigurationError";
  }
}

export function createProjectRepository() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new DatabaseConfigurationError();

  connection ??= createDatabase(databaseUrl);
  return new DrizzleProjectRepository(connection.db);
}
