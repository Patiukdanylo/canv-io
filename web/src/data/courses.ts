import type { Course } from "../types";

/**
 * Courses shown on the home screen. The prototype ships one live
 * course (AI); new courses are added purely as data.
 */
export const COURSES: Course[] = [
  {
    id: "ai",
    name: "Artificial Intelligence",
    term: "AJ 2025 · Semester 2",
    desc: "Machine learning, deep learning, graph search & more. Mock exams drawn from a live question bank.",
    live: true,
  },
];
