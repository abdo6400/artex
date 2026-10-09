import { describe, expect, it } from "vitest";
import { createLeadSchema } from "@artex/contracts";

describe("createLeadSchema", () => {
  it("normalizes a valid bilingual-site lead", () => {
    const lead = createLeadSchema.parse({
      name: "  Noor Ali  ",
      email: "noor@example.com",
      consent: true,
      company: "Artex Client",
      service: "Events",
      budget: "100k+",
      message: "We need a launch event in Cairo.",
      locale: "en",
    });
    expect(lead.name).toBe("Noor Ali");
    expect(lead.locale).toBe("en");
  });

  it("rejects an empty or excessively short inquiry", () => {
    expect(
      createLeadSchema.safeParse({ name: "A", message: "short" }).success,
    ).toBe(false);
  });
});
