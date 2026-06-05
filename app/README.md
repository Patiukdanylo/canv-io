# Canv.io — Prototype app (MVP-0)

The working, **100% offline** prototype of Canv.io. No backend, no build step, no internet — just static files.

## Run it

Open `index.html` in any modern browser (double-click it, or serve the folder with any static server).

## Files

| File | Role |
|---|---|
| `index.html` | Entry point — mounts the single-page app, loads the three files below. |
| `style.css` | The LMS-style interface theme (top bar, left rail, course nav, question cards, results). |
| `data.js` | **Content** — fully separate from logic: `BANK` (question bank), `QUIZZES` (exam recipes), `TOPIC_GROUPS` (topic tags). Add a course by adding data here. |
| `app.js` | **Engine** — renders the UI, builds a fresh random exam per attempt, runs the take flow (navigator, timer, autosave), grades (MC / fill / matching / essay), shows results, and stores attempt history in `localStorage`. |

## What it demonstrates

- Quizzes list → exam cover (with attempt history) → take (one question at a time, question navigator, live timer) → **auto-graded** results with explanations → review past attempts.
- Several exam recipes drawing from one bank (full / no-essay / quickfire / topic-focused), regenerating fresh questions every attempt.

## Notes

- The interface is a **neutral, brandable placeholder theme** for the prototype. Per the project's IP stance (see root `LICENSE.md` and `docs/BUSINESS_PLAN.md` §12), a public release ships an original Canv.io brand and original/owner-authored question content.
- The example bank shipped here is illustrative (an AI course). New courses are added purely as data.
