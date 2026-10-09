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

  it("normalizes an inquiry with an optional phone number", () => {
    const lead = createLeadSchema.parse({
      name: "Tarek Mansour",
      email: "tarek@example.com",
      phone: " +20 10 1234 5678 ",
      consent: true,
      message: "Looking for booth production in Cairo.",
    });
    expect(lead.phone).toBe("+20 10 1234 5678");
  });

  it("defaults phone to empty string when omitted", () => {
    const lead = createLeadSchema.parse({
      name: "Sara Ahmed",
      email: "sara@example.com",
      consent: true,
      message: "Inquiry without providing a phone number.",
    });
    expect(lead.phone).toBe("");
  });

  it("rejects an empty or excessively short inquiry", () => {
    expect(
      createLeadSchema.safeParse({ name: "A", message: "short" }).success,
    ).toBe(false);
  });
});
