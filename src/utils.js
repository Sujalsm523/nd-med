// ─── Pure utility helpers ──────────────────────────────────────────────────

/**
 * Generate a short random order ID like "ORD-A1B2C3".
 */
export function genOrderId() {
  return "ORD-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

/**
 * Current time formatted for the Indian locale (HH:MM:SS).
 */
export function timestamp() {
  return new Date().toLocaleTimeString("en-IN", {
    hour:   "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Build a customer message object.
 * @param {string} text
 */
export function makeCustomerMessage(text) {
  return { from: "customer", text, time: timestamp(), id: Date.now() + Math.random() };
}

/**
 * Build a bot (automated system) message object.
 * @param {string} text
 */
export function makeBotMessage(text) {
  return { from: "bot", text, time: timestamp(), id: Date.now() + Math.random() };
}

/**
 * Build a worker message object.
 * @param {string} text
 */
export function makeWorkerMessage(text) {
  return { from: "worker", text, time: timestamp(), id: Date.now() + Math.random() };
}

/**
 * Normalise free-text gender input to one of "Male" | "Female" | "Other".
 * Returns null if the input is unrecognised.
 * @param {string} input
 * @returns {"Male"|"Female"|"Other"|null}
 */
export function normalizeGender(input) {
  const v = input.trim().toLowerCase();
  if (v === "1" || v === "male"   || v === "m") return "Male";
  if (v === "2" || v === "female" || v === "f") return "Female";
  if (v === "3" || v === "other"  || v === "o") return "Other";
  return null;
}

/**
 * Truncate a string to maxLen chars and append "…" if it was shortened.
 * Used to keep log entries readable.
 * @param {string} str
 * @param {number} maxLen
 */
export function truncate(str, maxLen = 28) {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}
