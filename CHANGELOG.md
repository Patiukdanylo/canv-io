# Changelog

All notable changes to Canv.io are documented here.

## [0.1.0] — 2026-06-05
### Added
- Project dossier: `README.md`, `docs/BUSINESS_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `LICENSE.md`.
- Working offline prototype (MVP-0) under `app/`: quizzes list → exam cover with attempt history → take flow (question navigator, live timer, autosave) → auto-graded results with explanations → review past attempts.
- Multiple exam recipes drawing from a single question bank (full / no-essay / quickfire / topic-focused), regenerating fresh questions every attempt.
- Auto-grading for multiple-choice, fill-in-the-blank (typo-tolerant) and matching (partial credit); model-answer self-grading for essays.
- Attempt history persisted in `localStorage`.
- Neutral, brandable Canv.io placeholder theme for the prototype.
