import crypto from "crypto";

/**
 * Computes a SHA-256 hash of the sessionId to generate a unique Jitsi room name.
 * This guarantees no personally identifiable information (PII) is exposed in the URL.
 * @param sessionId - The database session Cuid/uuid.
 */
export function getJitsiRoomName(sessionId: string): string {
  return crypto.createHash("sha256").update(sessionId).digest("hex");
}
