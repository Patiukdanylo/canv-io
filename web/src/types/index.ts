/* ============================================================
   Domain types — shared across data, engine and UI.
   The shorthand keys (t, q, o, a, e, accept, …) mirror the
   question-bank JSON shape so content stays compact and the
   backend can emit the exact same structure (see ARCHITECTURE §8.3).
   ============================================================ */

/** Question type discriminator. */
export type QType = "mc" | "fill" | "match" | "essay";

/** Difficulty / pool a question is drawn from. */
export type Difficulty = "standard" | "challenging" | "essay";

/** User role. */
export type Role = "student" | "admin";

/* ---------- bank questions (content shape) ---------- */

interface BaseQuestion {
  /** Topic tag, used by topic-filtered exam recipes. */
  topic: string;
  /** The question prompt. */
  q: string;
  /** Optional explanation, shown on the results screen. */
  e?: string;
  /** Optional monospaced code block shown with the question. */
  code?: string;
}

/** Single-answer multiple choice. */
export interface MCQuestion extends BaseQuestion {
  t: "mc";
  /** Options. */
  o: string[];
  /** The correct option (exact match). */
  a: string;
}

/** Fill-in-the-blank. */
export interface FillQuestion extends BaseQuestion {
  t: "fill";
  /** Accepted answers (normalised, lenient substring match). */
  accept: string[];
}

/** Matching: pair each left item with the correct right item. */
export interface MatchQuestion extends BaseQuestion {
  t: "match";
  left: string[];
  right: string[];
  /** Map of left -> correct right. */
  correct: Record<string, string>;
}

/** Essay — self-graded against a model answer + keyword coverage. */
export interface EssayQuestion extends BaseQuestion {
  /** Essays in the bank omit `t`; the engine adds it when drawing. */
  t?: "essay";
  keywords: string[];
  model: string;
}

/** Any question stored in the standard / challenging pools. */
export type BankQuestion = MCQuestion | FillQuestion | MatchQuestion;

/** The full question bank for a course. */
export interface Bank {
  standard: BankQuestion[];
  challenging: BankQuestion[];
  essay: EssayQuestion[];
}

/* ---------- exam recipes ---------- */

/** How many of each difficulty an attempt draws. */
export interface Compose {
  standard?: number;
  challenging?: number;
  essay?: number;
}

/** An exam recipe — a composition rule over the bank. */
export interface Quiz {
  id: string;
  title: string;
  compose: Compose;
  /** Optional topic filter. */
  topics?: string[];
  blurb?: string;
}

/** Named groups of topic tags used by focused exams. */
export type TopicGroups = Record<string, string[]>;

/* ---------- course ---------- */

export interface Course {
  id: string;
  name: string;
  term: string;
  desc: string;
  live?: boolean;
}

/* ---------- runtime: a drawn exam question ---------- */

/**
 * A question as drawn into a live attempt. Carries the original
 * content fields plus draw-time metadata (points, shuffled options).
 * Responses are tracked separately (see {@link Response}) to keep
 * drawn questions immutable.
 */
export interface ExamQuestion {
  t: QType;
  topic: string;
  q: string;
  e?: string;
  code?: string;
  // mc
  o?: string[];
  a?: string;
  // fill
  accept?: string[];
  // match
  left?: string[];
  right?: string[];
  correct?: Record<string, string>;
  // essay
  keywords?: string[];
  model?: string;
  // draw-time metadata
  pts: number;
  diff: Difficulty;
  /** Stable id within this attempt. */
  uid: number;
  /** Shuffled options (mc). */
  opts?: string[];
  /** Shuffled right column (match). */
  rightShuffled?: string[];
}

/* ---------- runtime: responses & grading ---------- */

/** A student's response to one question. */
export interface Response {
  /** mc / fill / essay text answer. */
  resp?: string;
  /** match: left -> chosen right. */
  matchResp?: Record<string, string>;
  /** essay self-grade (0–5). */
  selfScore?: number | null;
}

export type Responses = Record<number, Response>;

/** Grading outcome for one question. */
export interface Grade {
  /** Points earned (for essays this tracks the keyword estimate). */
  earned: number;
  /** Essay keyword-coverage estimate (0–5). */
  estimate?: number;
}

export type Grades = Record<number, Grade>;

/* ---------- persisted attempt ---------- */

/** A stored attempt — a self-contained snapshot for review. */
export interface Attempt {
  when: string;
  minutes: number;
  score: number;
  questions: ExamQuestion[];
  responses: Responses;
  grades: Grades;
}

/** All attempts for a user, keyed by quiz id. */
export type AttemptHistory = Record<string, Attempt[]>;

/* ---------- auth ---------- */

export interface User {
  name: string;
  email: string;
  /** Prototype-only plaintext password (client-side demo auth). */
  pass: string;
  role: Role;
}
