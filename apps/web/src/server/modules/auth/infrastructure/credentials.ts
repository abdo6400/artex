import {
  createHash,
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";
const KEY_LENGTH = 64;
const COST = 131_072;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

function deriveKey(
  password: string,
  salt: Buffer,
  length: number,
  options: { N: number; r: number; p: number },
) {
  return new Promise<Buffer>((resolve, reject) => {
    nodeScrypt(
      password,
      salt,
      length,
      { ...options, maxmem: 256 * 1024 * 1024 },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = await deriveKey(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
  });
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, cost, blockSize, parallelization, saltValue, hashValue] =
    encoded.split("$");
  if (
    algorithm !== "scrypt" ||
    !cost ||
    !blockSize ||
    !parallelization ||
    !saltValue ||
    !hashValue
  )
    return false;
  const expected = Buffer.from(hashValue, "base64");
  if (
    expected.length !== KEY_LENGTH ||
    Buffer.from(saltValue, "base64").length !== 16 ||
    ![16_384, COST].includes(Number(cost)) ||
    Number(blockSize) !== BLOCK_SIZE ||
    Number(parallelization) !== PARALLELIZATION
  )
    return false;
  const derived = await deriveKey(
    password,
    Buffer.from(saltValue, "base64"),
    expected.length,
    {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallelization),
    },
  );
  return (
    expected.length === derived.length && timingSafeEqual(expected, derived)
  );
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashIdentifier(value: string) {
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.RATE_LIMIT_SALT || process.env.RATE_LIMIT_SALT.length < 32)
  )
    throw new Error(
      "RATE_LIMIT_SALT must contain at least 32 characters in production",
    );
  return createHash("sha256")
    .update(`${process.env.RATE_LIMIT_SALT ?? "local-development"}:${value}`)
    .digest("hex");
}
