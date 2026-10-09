import sharp from "sharp";
import { InvalidImageError } from "../domain/invalid-image-error";

export async function optimizeImage(bytes: Uint8Array) {
  try {
    return await normalizeImage(bytes);
  } catch {
    throw new InvalidImageError();
  }
}

async function normalizeImage(bytes: Uint8Array) {
  const signature = Buffer.from(bytes.subarray(0, 12));
  const jpeg =
    signature[0] === 0xff && signature[1] === 0xd8 && signature[2] === 0xff;
  const png = signature
    .subarray(0, 8)
    .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const webp =
    signature.toString("ascii", 0, 4) === "RIFF" &&
    signature.toString("ascii", 8, 12) === "WEBP";
  if (!jpeg && !png && !webp) throw new InvalidImageError();
  const image = sharp(bytes, {
    limitInputPixels: 40_000_000,
    failOn: "warning",
  });
  const metadata = await image.metadata();
  if (
    !["jpeg", "png", "webp"].includes(metadata.format ?? "") ||
    (metadata.pages ?? 1) !== 1
  )
    throw new Error("Unsupported image format");
  const { data, info } = await image
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true });
  return {
    bytes: new Uint8Array(data),
    width: info.width,
    height: info.height,
  };
}
