import { describe, expect, it } from "vitest";
import type {
  ListPublishedProjectsInput,
  ProjectDetail,
  ProjectRepository,
  ProjectSummary,
} from "../domain/project";
import { ListPublishedProjects } from "./list-published-projects";
import {
  decodeProjectCursor,
  InvalidProjectCursorError,
} from "./project-cursor";

const projects: ProjectSummary[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "first-project",
    clientName: "First Client",
    title: "First Project",
    summary: "First summary",
    category: { slug: "booths", name: "Exhibition Booths" },
    cover: null,
    sortOrder: 10,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "second-project",
    clientName: "Second Client",
    title: "Second Project",
    summary: "Second summary",
    category: { slug: "events", name: "Events" },
    cover: null,
    sortOrder: 20,
  },
];

class InMemoryProjectRepository implements ProjectRepository {
  receivedInput?: ListPublishedProjectsInput;

  async listPublished(input: ListPublishedProjectsInput) {
    this.receivedInput = input;
    return projects.slice(0, input.limit);
  }

  async findPublishedBySlug(): Promise<ProjectDetail | null> {
    return null;
  }
}

describe("ListPublishedProjects", () => {
  it("returns an opaque cursor when another page exists", async () => {
    const repository = new InMemoryProjectRepository();
    const result = await new ListPublishedProjects(repository).execute({
      locale: "en",
      limit: 1,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).not.toHaveProperty("sortOrder");
    expect(result.meta.nextCursor).not.toBeNull();
    expect(decodeProjectCursor(result.meta.nextCursor!)).toEqual({
      sortOrder: 10,
      id: projects[0]!.id,
    });
    expect(repository.receivedInput?.limit).toBe(2);
  });

  it("rejects a malformed cursor before querying the repository", async () => {
    const repository = new InMemoryProjectRepository();

    await expect(
      new ListPublishedProjects(repository).execute({
        locale: "ar",
        limit: 12,
        cursor: "not-a-cursor",
      }),
    ).rejects.toBeInstanceOf(InvalidProjectCursorError);
    expect(repository.receivedInput).toBeUndefined();
  });
});
