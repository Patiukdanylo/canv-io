/* ============================================================
   Exam composition — turning a recipe into a fresh paper.
   See ARCHITECTURE §4.1. These are pure functions.
   ============================================================ */

import { BANK } from "../data";
import type {
  BankQuestion,
  Difficulty,
  EssayQuestion,
  ExamQuestion,
  Quiz,
} from "../types";
import { shuffle } from "./utils";

/** Default pass mark: 80% of total points. */
export const TARGET_RATIO = 0.8;

const POINTS: Record<Difficulty, number> = {
  standard: 1,
  challenging: 2,
  essay: 5,
};

/** The (optionally topic-filtered) pools a quiz draws from. */
export function poolsFor(qz: Quiz): {
  standard: BankQuestion[];
  challenging: BankQuestion[];
  essay: EssayQuestion[];
} {
  const keep = qz.topics;
  const f = <T extends { topic: string }>(arr: T[]): T[] =>
    keep ? arr.filter((q) => keep.includes(q.topic)) : arr;
  return {
    standard: f(BANK.standard),
    challenging: f(BANK.challenging),
    essay: f(BANK.essay),
  };
}

/** Effective counts (capped by pool size) and total points for a quiz. */
export function composeInfo(qz: Quiz): {
  nS: number;
  nC: number;
  nE: number;
  total: number;
} {
  const pools = poolsFor(qz);
  const c = qz.compose;
  const nS = Math.min(c.standard || 0, pools.standard.length);
  const nC = Math.min(c.challenging || 0, pools.challenging.length);
  const nE = Math.min(c.essay || 0, pools.essay.length);
  const total =
    nS * POINTS.standard + nC * POINTS.challenging + nE * POINTS.essay;
  return { nS, nC, nE, total };
}

/** Total number of questions a quiz draws. */
export function questionCount(qz: Quiz): number {
  const { nS, nC, nE } = composeInfo(qz);
  return nS + nC + nE;
}

/** The pass mark for a quiz. */
export function targetFor(qz: Quiz): number {
  return Math.round(composeInfo(qz).total * TARGET_RATIO);
}

/**
 * Draw a fresh, shuffled paper from the bank for one attempt.
 * Question order and option order are shuffled, so the "same" quiz
 * is different every attempt.
 */
export function buildExam(qz: Quiz): ExamQuestion[] {
  const pools = poolsFor(qz);
  const { nS, nC, nE } = composeInfo(qz);

  const draw = (
    pool: (BankQuestion | EssayQuestion)[],
    n: number,
    diff: Difficulty,
  ): ExamQuestion[] =>
    shuffle(pool)
      .slice(0, n)
      .map(
        (q) =>
          ({
            ...q,
            t: diff === "essay" ? "essay" : (q as BankQuestion).t,
            pts: POINTS[diff],
            diff,
            uid: 0, // assigned below after the final shuffle
          }) as ExamQuestion,
      );

  const chosen = shuffle([
    ...draw(pools.standard, nS, "standard"),
    ...draw(pools.challenging, nC, "challenging"),
    ...draw(pools.essay, nE, "essay"),
  ]);

  chosen.forEach((q, i) => {
    q.uid = i;
    if (q.t === "mc" && q.o) q.opts = shuffle(q.o);
    if (q.t === "match" && q.right) q.rightShuffled = shuffle(q.right);
  });

  return chosen;
}
