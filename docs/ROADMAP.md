# Canv.io — Roadmap

*Phased plan from working prototype to multi-university platform. Version 0.1.*

Each phase is shippable on its own and de-risks the next.

---

## Phase 0 — Prototype (DONE)
- Offline, static HTML/CSS/JS app.
- One course (AI), full loop: quizzes list → cover → take (navigator + timer + autosave) → auto-graded results with explanations → review.
- Multiple exam recipes (full / no-essay / quickfire / topic-focused).
- Attempt history in `localStorage`.

## Phase 1 — Clean product, multiple courses (static)
- Re-theme with an **original Canv.io brand** (drop placeholder LMS skinning).
- Add several courses purely as **data files** (proves the content-as-data model).
- Polish UI fidelity and make it **mobile-friendly**.
- Add per-exam **optional timer** and basic per-topic score breakdown.

## Phase 2 — Accounts, years & home page
- Lightweight **student accounts**, grouped by **study year / programme** (each sees only relevant courses).
- Public **home / landing page**: clear messaging — *practise legally with your own mock exams and prepare for your exam faster.*
- Save progress to the account (still light backend or hosted storage).

## Phase 3 — Platform backend
- Backend API + database for the domain model (universities → programmes → years → courses → exams → attempts).
- **Auth** and secure, GDPR-compliant data handling.
- **Content authoring tools** with validation + versioning.
- **Progress analytics** (weak topics, readiness vs target, trends).

## Phase 4 — AI assistance (labelled, optional)
- AI-assisted **question drafting** from learning objectives (human-reviewed before publishing).
- AI **essay feedback** against a rubric (guidance, not an authoritative grade).
- AI **study suggestions** (“drill these topics before your exam”).

## Phase 5 — Multi-university
- **Multi-tenant** model: each university is a tenant with its own courses and **selectable interface skin**.
- Institutional **pilots** and per-seat / flat-rate licences.

## Phase 6 — Contributor marketplace
- Vetted contributors (top students, TAs) build question banks and earn a **revenue share**.
- Review/quality pipeline to keep banks accurate and exam-aligned.

---

### Guiding rule
Every phase is measured against the single promise: **does it help the student be more ready for their real exam?** If not, it waits.
