import "server-only";

import crypto from "crypto";

/**
 * Masking for `platform_apikeys.apikey`, byte-for-byte compatible with
 * gtwy-node.
 *
 * `platform_apikeys` stores the key encrypted, so masking it means decrypting
 * it first: gtwy-node's `platformApiKey.controller.js#listPlatformApiKeys` is
 * `maskApiKey(await decrypt(doc.apikey))`. Masking the stored ciphertext would
 * print the ends of a hex blob instead of the ends of the key.
 *
 * Mirrors `gtwy-node/src/services/utils/helper.utils.js`:
 *   - `decrypt`  (lines 14-33)
 *   - `maskApiKey` (line 34)
 *
 * Two deliberate divergences, both to keep plaintext out of the response and a
 * missing secret out of the error path — see `maskStoredKey`.
 *
 * Nothing here ever returns, logs or throws key material.
 */

/**
 * What the column shows when the stored key cannot be turned into a real mask.
 *
 * gtwy-node yields the literal `<undecryptable>` in the same situation. We use
 * a fixed mask of the same shape as a real one (3 + 9 + 4 characters) so the
 * column degrades quietly instead of printing an internal token.
 */
export const PLACEHOLDER_MASK = "****************";

/**
 * gtwy-node's key derivation: sha512 of the secret, hex, truncated.
 * `Encreaption_key` -> 32 chars, `Secret_IV` -> 16. Spelling and case are
 * gtwy-node's; they are reused verbatim so one set of values copies across.
 */
function derive(secret: string, length: number): Buffer {
  return Buffer.from(crypto.createHash("sha512").update(secret).digest("hex").substring(0, length), "utf8");
}

/**
 * gtwy-node `Helper.decrypt`. Note it does *not* read `ALGORITHM` — that
 * variable is read by `encrypt` only, and we never encrypt. `decrypt`
 * hard-codes aes-256-cbc and retries aes-256-cfb when that throws, so keys
 * written by either cipher read back.
 *
 * Throws on failure, exactly like the original. Callers must not let it out.
 */
export function decrypt(encryptedHex: string, key: Buffer, iv: Buffer): string {
  const bytes = Buffer.from(encryptedHex, "hex");
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    return Buffer.concat([decipher.update(bytes), decipher.final()]).toString("utf8");
  } catch {
    const decipher = crypto.createDecipheriv("aes-256-cfb", key, iv);
    return Buffer.concat([decipher.update(bytes), decipher.final()]).toString("utf8");
  }
}

/**
 * gtwy-node `Helper.maskApiKey`, reproduced exactly: first three characters,
 * nine asterisks, last four. Keys of six characters or fewer come back
 * unmasked there; `maskStoredKey` is what stops that reaching a response.
 */
export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length > 6) return key.slice(0, 3) + "*".repeat(9) + key.slice(-4);
  return key;
}

/** Logged at most once per process, so a missing secret is not a log flood. */
let degradeLogged = false;

function degrade(reason: string): string {
  if (!degradeLogged) {
    degradeLogged = true;
    // Reason only. No service, no ciphertext, no key material.
    console.warn(`[platform-keys] key masking degraded to placeholder: ${reason}`);
  }
  return PLACEHOLDER_MASK;
}

/** Test seam — resets the once-only log guard. */
export function resetDegradeLogForTest(): void {
  degradeLogged = false;
}

/**
 * The only function a route should call: stored ciphertext in, a safe mask out.
 *
 * Never throws and never returns plaintext. It degrades to
 * {@link PLACEHOLDER_MASK} when
 *   - `Secret_IV` / `Encreaption_key` are absent (they are deployment config,
 *     not part of gtwy-node's checked-in `.env`),
 *   - decryption fails under both ciphers, or
 *   - the plaintext is short enough that gtwy-node's `maskApiKey` would hand
 *     it back verbatim.
 *
 * The last case is the one divergence from gtwy-node's output, and it is
 * deliberate: a six-character key must not appear in an API response.
 */
export function maskStoredKey(stored: unknown): string {
  if (typeof stored !== "string" || stored === "") return "";

  const secretIv = process.env.Secret_IV;
  const encryptionKey = process.env.Encreaption_key;
  if (!secretIv || !encryptionKey) return degrade("Secret_IV / Encreaption_key not configured");

  let plaintext: string;
  try {
    plaintext = decrypt(stored, derive(encryptionKey, 32), derive(secretIv, 16));
  } catch {
    return degrade("decryption failed");
  }

  if (!plaintext) return degrade("decryption produced an empty key");
  if (plaintext.length <= 6) return degrade("plaintext too short to mask");

  return maskApiKey(plaintext);
}
