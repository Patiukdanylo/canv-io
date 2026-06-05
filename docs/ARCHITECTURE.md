# Canv.io — Application & Business Logic

*How the product works today, and how it should be built out. Version 0.1.*

---

## 1. Principles

1. **Static-first.** The core experience runs as plain front-end with no server. Cheap, fast, offline-capable, trivial to host.
2. **Content separated from engine.** The grading/UI engine never needs to change to add a course — content is data.
3. **Composable exams.** An exam is a *recipe* over a question bank, not a hand-written paper.
4. **Privacy by default.** Store as little personal data as possible; keep it local until a real account is needed.

## 2. Current architecture (prototype, MVP-0)

```
app (static)
├── index.html      # entry point, mounts the SPA
├── style.css       # the LMS-style theme (top bar, rail, nav, cards, results)
├── data.js         # CONTENT: BANK (questions) + QUIZZES (exam recipes) + TOPIC_GROUPS
└── app.js          # ENGINE: chrome render, exam builder, take flow, grading, results, history
```

- **No backend.** Everything runs in the browser.
- **Persistence:** attempt history in `localStorage`.
- **Rendering:** a tiny hand-rolled single-page app (views: quizzes list → cover → take → results/review).

This already demonstrates every core mechanic; the platform version generalises it.

## 3. Domain model (target)

Entities the platform revolves around:

```
University ──< Programme ──< Year ──< Course ──< Exam(recipe) ──< Attempt
                                          │
                                          └──< QuestionBank ──< Question
User ──< Enrolment (User↔Programme/Year) ──< Attempt
Theme (interface skin) ── belongs to ── University
```

- **University** — a tenant. Has its own branding/Theme.
- **Programme / Year** — organises courses (e.g. “Applied Computer Science / Year 2”).
- **Course** — owns one or more **QuestionBanks**.
- **Question** — typed item: `mc`, `fill`, `match`, `essay`, with difficulty (`standard` / `challenging` / `essay`), topic tag, points, correct answer(s), explanation, and (for essays) a model answer + keywords.
- **Exam (recipe)** — a *composition rule*: how many of each difficulty/type to draw, optional topic filter, target %, optional time limit.
- **Attempt** — a generated paper + a user's answers + grades + timestamps + score.
- **User / Enrolment** — a student and which programme/year they belong to.
- **Theme** — the selectable interface skin (per university).

## 4. Core business logic (the rules that matter)

These are stable regardless of front-end or backend:

### 4.1 Exam generation
- Given an Exam recipe `{standard:N, challenging:M, essay:K, topics?}`, draw that many **distinct, shuffled** questions from the (optionally topic-filtered) bank.
- Shuffle question order and shuffle option order → the “same” exam is different every attempt.
- **Target = round(80% of total points)** by default (configurable per exam).

### 4.2 Grading
- **Multiple-choice:** exact match → full points, else 0. No negative marking.
- **Fill-in-the-blank:** normalise (lowercase, strip accents/punctuation, collapse spaces) and accept any listed variant, including lenient substring matches → tolerant of typos.
- **Matching:** **partial credit** = (correct pairs / total pairs) × points.
- **Essay:** cannot be reliably auto-graded → show a **model answer** + a keyword-coverage estimate; the student sets an honest self-grade (0–5). *(Future: AI rubric grading, clearly labelled.)*
- **Score** = sum of earned points; **pass** = score ≥ target.

### 4.3 Attempts & history
- Every submitted attempt is stored with its questions, answers, grades, time taken and score.
- **KEPT** = highest-scoring attempt; **LATEST** = most recent.
- Any past attempt can be **reviewed** read-only with correct answers + explanations.

### 4.4 Integrity rules
- Practice-only framing; no real exam content reproduced verbatim.
- Banks are versioned so corrections/improvements are tracked.

## 5. Future technical implementation

### 5.1 Frontend (platform)
- Migrate the hand-rolled SPA to a maintained framework (e.g. a modern component framework) once feature count grows.
- Keep the **theme layer isolated** so universities map to selectable skins.
- Responsive/mobile-first (students revise on phones).

### 5.2 Backend (when multi-user is needed)
- **API service** (e.g. Node + a relational DB such as PostgreSQL) exposing the domain model.
- **Auth** (email/SSO; institutional SSO later) and **multi-tenant** isolation by university.
- **Content service** for authoring and versioning question banks.
- **Grading service** encapsulating §4.2 (so web, mobile and API share identical logic).
- **Analytics service** for per-student and per-cohort weak-topic insights.

### 5.3 Illustrative API surface
```
GET    /universities/{u}/programmes/{p}/years/{y}/courses
GET    /courses/{c}/exams                     # list exam recipes
POST   /exams/{e}/attempts                    # generate a fresh paper → returns attempt
PATCH  /attempts/{a}                           # save answers (autosave)
POST   /attempts/{a}/submit                    # grade + persist → returns results
GET    /attempts/{a}                           # review (read-only)
GET    /me/progress?course={c}                 # scores, weak topics, trends
POST   /courses/{c}/questions                  # authoring (contributor/admin)
```

### 5.4 Content pipeline
- **Authoring UI** for typed questions with validation (answers exist, options well-formed, etc.).
- **AI-assisted generation:** draft questions from a course's learning objectives / notes, then **human review** before publishing (quality gate).
- **Versioning & review workflow** so banks improve over time.

### 5.5 AI features (later, optional, labelled)
- AI **essay feedback** against a rubric (estimate + explanation), always shown as guidance, never as an authoritative grade.
- AI **question drafting** to scale content; human-approved only.
- AI **study suggestions** (“drill these 3 weak topics before your exam”).

### 5.6 Analytics
- Per-student: score trend, weak topics, attempts over time, readiness vs target.
- Per-cohort (institutional): where students struggle most → curriculum insight.

### 5.7 Security & privacy
- Data minimisation; GDPR-compliant consent, export and deletion.
- Tenant isolation; encrypted at rest/in transit; least-privilege access.
- Local-first for anonymous practice; accounts only when the user wants cross-device history.

## 6. Scaling characteristics

- The take-exam path is **read-heavy and cacheable**; generation and grading are cheap, pure functions.
- Static assets via CDN; backend scales horizontally; DB is the main stateful piece.
- Marginal cost per extra student stays low → margins stay high.

## 7. Build order (maps to ROADMAP)

1. Keep static engine; clean theme; add courses as data files.
2. Add accounts + study-year grouping + marketing home page.
3. Introduce backend, auth, authoring, analytics.
4. Multi-tenant universities + selectable skins.
5. Contributor marketplace + AI authoring/grading at scale.

## 8. Backend & automatic course generation (the engine that keeps content fresh)

The differentiator: instead of hand-writing every question bank, Canv.io can
**pull a student's own course materials straight from their university's LMS
(Canvas) and turn them into practice exams automatically**, refreshing as
courses change.

A scaffolded **FastAPI** service lives in [`/backend`](../backend) (Python is
the best fit for Canvas API + PDF/PPTX parsing + LLM generation; Node/Go are
swappable alternatives).

### 8.1 Why Canvas is reachable *without scraping*
Thomas More (and most universities) run **Canvas by Instructure**, which ships
an **official REST API** (`/api/v1/...`). We use that — scraping is unnecessary
and would breach Canvas' Terms. Endpoints we rely on:
`GET /courses`, `/courses/:id/modules`, `/courses/:id/files`, `/courses/:id/pages`.

### 8.2 Access model (and its hard constraint)
- **Multi-user access MUST use OAuth2** — Canvas' API policy forbids collecting
  users' personal access tokens for a shared app (those are dev-only).
- OAuth2 requires a **Developer Key approved by the institution's Canvas admin**
  (Thomas More IT). Until that exists, the realistic path is: a single user
  connects their **own** account (their token, their data) for personal use.
- The legitimate product model: **each student connects their own Canvas**, and
  we generate practice material **from their materials, for their use** — we do
  not redistribute institutional content publicly. (See BUSINESS_PLAN §12.)

### 8.3 The ingestion → generation pipeline
```
Canvas (OAuth2 Bearer token)
   │  canvas_client.py   list_courses / list_files / list_pages / download
   ▼
raw PDF / PPTX / HTML
   │  ingestion.py       extract text per page/slide → TextChunk(+source_ref)
   ▼
clean, chunked text
   │  generator.py       LLM (Anthropic) → questions in schemas.Question shape
   ▼                     + HUMAN REVIEW gate (quality + IP)
CourseBank (schemas.py) ──►  the existing exam engine (public/app) consumes it
```
Generated questions use the **exact JSON shape the static app already reads**
(`BANK` / `QUIZZES` in `public/app/data.js`), so freshly generated content drops
straight into the take-exam flow with zero engine changes.

### 8.4 Service layout (scaffolded)
```
backend/app/
├── main.py                 FastAPI app, CORS, /health
├── config.py               env settings (Canvas keys, LLM key, DB)
├── api/
│   ├── auth.py             Canvas OAuth2 login + callback
│   ├── courses.py          list courses · POST /{id}/sync (bg job) · GET bank
│   └── exams.py            list · draw fresh paper · submit + grade
├── services/
│   ├── canvas_client.py    async REST client w/ pagination
│   ├── ingestion.py        PDF/PPTX/HTML → text chunks
│   └── generator.py        chunks → reviewed question bank (LLM)
└── models/schemas.py       Question · ExamRecipe · Course · CourseBank
```

### 8.5 "Always fresh" updates
- A per-course **sync job** (`POST /courses/{id}/sync`) re-fetches Canvas,
  diffs against the last ingest, regenerates only changed material, and bumps
  the bank version — so students always practise the current syllabus.
- Status is pollable (`IngestStatus`) so the UI can show
  *fetching → parsing → generating → ready*.

### 8.6 Non-negotiable guardrails
- **Human-in-the-loop review** before any generated bank is shown.
- **Never reproduce real exam papers**; generate original practice items only.
- **Per-user, private** generation by default; no public redistribution of a
  university's copyrighted materials.
