import { describe, expect, it, vi } from "vitest";
import {
  createAdminProjectSchema,
  updateAdminProjectSchema,
} from "@artex/contracts";
import { createAdminProject } from "./manage-admin-projects";
import type { AdminProjectRepository } from "../domain/admin-project-repository";

describe("administration use-case authorization", () => {
  it("rejects viewer writes before calling persistence", async () => {
    const create = vi.fn<AdminProjectRepository["create"]>();
    const repository: AdminProjectRepository = {
      list: async () => [],
      create,
      get: async () => null,
      update: async () => null,
      archive: async () => false,
    };
    const input = createAdminProjectSchema.parse({
      slug: "test-project",
      clientName: "Test client",
      category: { slug: "test", nameAr: "اختبار", nameEn: "Test" },
      ar: { title: "اختبار", summary: "ملخص", description: "وصف الاختبار" },
      en: {
        title: "Test",
        summary: "Summary",
        description: "Test description",
      },
    });
    await expect(
      createAdminProject(
        repository,
        input,
        {
          id: "actor",
          email: "viewer@example.com",
          name: "Viewer",
          role: "viewer",
        },
        "test",
      ),
    ).rejects.toThrow("FORBIDDEN");
    expect(create).not.toHaveBeenCalled();
  });
});

describe("Arabic-first project input", () => {
  it("fills English, summary and description from the Arabic title", () => {
    const input = createAdminProjectSchema.parse({
      slug: "arabic-only",
      clientName: "عميل",
      category: { slug: "exhibitions", nameAr: "المعارض" },
      ar: { title: "جناح المستقبل" },
      cover: { url: "https://example.com/a.jpg" },
    });
    expect(input.en).toEqual({
      title: "جناح المستقبل",
      summary: "جناح المستقبل",
      description: "جناح المستقبل",
    });
    expect(input.ar.summary).toBe("جناح المستقبل");
    expect(input.category.nameEn).toBe("المعارض");
    expect(input.cover).toMatchObject({
      altAr: "جناح المستقبل",
      altEn: "جناح المستقبل",
    });
  });

  it("keeps provided English copy", () => {
    const input = createAdminProjectSchema.parse({
      slug: "both",
      clientName: "Client",
      category: { slug: "x", nameAr: "س", nameEn: "X" },
      ar: { title: "عنوان", summary: "ملخص عربي" },
      en: { title: "Title" },
    });
    expect(input.en.title).toBe("Title");
    expect(input.en.summary).toBe("Title");
    expect(input.ar.description).toBe("ملخص عربي");
  });

  it("does not invent an English block on partial updates", () => {
    const input = updateAdminProjectSchema.parse({
      version: 2,
      ar: { title: "عنوان جديد" },
    });
    expect(input.en).toBeUndefined();
    expect(input.ar?.summary).toBe("عنوان جديد");
  });
});
