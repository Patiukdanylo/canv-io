/* ============================================================
   Grading — the rules that matter (ARCHITECTURE §4.2).
   Pure functions over a question + the student's response.
   ============================================================ */

import type {
  ExamQuestion,
  Grade,
  Grades,
  Response,
  Responses,
} from "../types";
import { norm } from "./utils";

/** Has this question been answered at all? */
export function isAnswered(q: ExamQuestion, r: Response | undefined): boolean {
  if (!r) return false;
  if (q.t === "mc" || q.t === "fill") return r.resp !== undefined && r.resp !== "";
  if (q.t === "essay") return !!r.resp && r.resp.trim().length > 0;
  if (q.t === "match")
    return (q.left || []).every((l) => !!r.matchResp?.[l]);
  return false;
}

/** Fill-in-the-blank: normalise + lenient substring match. */
function gradeFill(q: ExamQuestion, r: Response): number {
  const u = norm(r.resp);
  if (!u) return 0;
  return (q.accept || []).some((a) => {
    const an = norm(a);
    return u === an || u.includes(an) || (an.includes(u) && u.length >= 3);
  })
    ? q.pts
    : 0;
}

/** Matching: partial credit = (correct pairs / total) × points. */
function gradeMatch(q: ExamQuestion, r: Response): number {
  const left = q.left || [];
  if (!left.length) return 0;
  let ok = 0;
  left.forEach((l) => {
    if (r.matchResp?.[l] === q.correct?.[l]) ok++;
  });
  return Math.round((ok / left.length) * q.pts * 100) / 100;
}

/** Essay: keyword-coverage estimate on a 0–5 scale. */
export function estimateEssay(q: ExamQuestion, r: Response): number {
  if (!r.resp) return 0;
  const t = norm(r.resp);
  const kw = q.keywords || [];
  if (!kw.length) return 0;
  let hits = 0;
  kw.forEach((k) => {
    if (t.includes(norm(k))) hits++;
  });
  return Math.max(0, Math.min(5, Math.round((hits / kw.length) * 6)));
}

/** Grade a single question. Essays seed `earned` from the estimate. */
export function gradeQuestion(q: ExamQuestion, r: Response | undefined): Grade {
  const res = r || {};
  switch (q.t) {
    case "mc":
      return { earned: res.resp === q.a ? q.pts : 0 };
    case "fill":
      return { earned: gradeFill(q, res) };
    case "match":
      return { earned: gradeMatch(q, res) };
    case "essay": {
      const estimate = estimateEssay(q, res);
      return { earned: estimate, estimate };
    }
    default:
      return { earned: 0 };
  }
}

/** Grade an entire paper. */
export function gradeAll(
  questions: ExamQuestion[],
  responses: Responses,
): Grades {
  const grades: Grades = {};
  questions.forEach((q) => {
    grades[q.uid] = gradeQuestion(q, responses[q.uid]);
  });
  return grades;
}

/**
 * Total earned score. Essays count the student's self-grade if set,
 * otherwise the keyword estimate.
 */
export function attemptScore(
  questions: ExamQuestion[],
  responses: Responses,
  grades: Grades,
): number {
  return questions.reduce((sum, q) => {
    if (q.t === "essay") {
      const self = responses[q.uid]?.selfScore;
      return sum + (self ?? grades[q.uid]?.estimate ?? 0);
    }
    return sum + (grades[q.uid]?.earned ?? 0);
  }, 0);
}
