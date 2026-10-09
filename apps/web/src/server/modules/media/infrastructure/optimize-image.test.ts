import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { optimizeImage } from "./optimize-image";

describe("uploaded image normalization", () => {
  it("resizes decoded images and outputs metadata-free WebP", async () => {
    const source = await sharp({
      create: { width: 3000, height: 1500, channels: 3, background: "red" },
    })
      .png()
      .toBuffer();
    const output = await optimizeImage(new Uint8Array(source));
    expect(output.width).toBe(2400);
    expect(output.height).toBe(1200);
    const metadata = await sharp(output.bytes).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.exif).toBeUndefined();
  });
  it("rejects SVG and bytes that are not a decodable image", async () => {
    await expect(
      optimizeImage(new TextEncoder().encode("not an image")),
    ).rejects.toThrow();
    await expect(
      optimizeImage(
        new TextEncoder().encode(
          '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" /></svg>',
        ),
      ),
    ).rejects.toThrow();
  });
});
