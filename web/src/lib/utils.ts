/* ============================================================
   Small pure helpers shared across the engine and UI.
   ============================================================ */

/** Return a shuffled copy (Fisher–Yates) — never mutates input. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Normalise free text for tolerant comparison: lowercase, strip
 * accents/punctuation, collapse whitespace. Used by fill-in-the-blank
 * grading and essay keyword matching.
 */
export function norm(s: string | null | undefined): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Up to two uppercase initials from a name, for avatars. */
export function initials(name: string | null | undefined): string {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Zero-padded HH:MM for a Date. */
export function hm(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

/** Human "M minutes, SS Seconds" for the elapsed timer. */
export function fmtElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} minute${m === 1 ? "" : "s"}, ${String(s).padStart(2, "0")} Seconds`;
}
