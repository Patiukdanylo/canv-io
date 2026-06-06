# Canv.io Backend — Build Plan

*Implementation plan for the API beyond the foundation. Version 0.1 · 2026-06.*

This is the **"what to build next and why"** document. The runnable foundation
(containers, Postgres, schema, migrations, seeders, JWT auth, encrypted token
storage) already exists and is verified — see [`README.md`](README.md).

---

## 1. Guiding constraints (decisions already made)

| Constraint | Consequence for the build |
|---|---|
| **Thomas More disables personal Canvas API tokens** (confirmed by owner) | We **cannot** use the personal-token shortcut. Real Canvas access needs an **OAuth2 Developer Key approved by Thomas More IT** — a partnership step, not just code. So Canvas is **deferred**, and the near-term ingestion source is **student file upload**. |
| **Canvas API is official REST, never scrape** | When Canvas does come online, use `/api/v1/...` via OAuth only. |
| **LLM = Anthropic, key provided later** | Build generation behind a provider interface with a **mock generator** as default, so the pipeline works before a key exists. |
| **Per-user, private, copyright-safe** | Process a student's *own* materials for *their* use; generate *original* practice items; never redistribute institutional content or real exam papers. |
| **Frontend is static on GitHub Pages; backend is separate** | The React site/app stays on Pages; the API is hosted separately (see §7). The app talks to it over HTTPS + JWT. |

**Headline pivot:** because tokens are disabled, **upload-first** is the primary
ingestion path. A student drops their slides/PDFs into Canv.io and gets a mock
exam. Canvas OAuth is a later enhancement that automates the same pipeline.

---

## 2. Where we are (foundation — done)

- `docker compose up` → Postgres + API (+ Adminer). Migrations + seed run on boot.
- Schema: `users · canvas_connections · courses · question_banks · questions · exams · attempts · ingest_jobs · source_documents`.
- Auth: `/auth/register|login|me` (JWT, hashed passwords, role guard).
- `/canvas/connect` stores a token **encrypted** (ready for the OAuth path later).

## 3. What's left (phased)

Each phase is independently shippable and testable. Suggested order:

### Phase B1 — DB-backed content & grading (no Canvas, no AI)
Make the core product server-driven, reusing the seeded dataset.
- **Endpoints** (replace current stubs in `app/api/courses.py`, `exams.py`):
  - `GET /courses` (mine + shared) · `GET /courses/{id}`
  - `GET /courses/{id}/exams` · `GET /exams/{id}`
  - `POST /exams/{id}/draw` → compose a fresh paper from the bank (shuffle, by recipe)
  - `POST /attempts` (save answers) · `POST /attempts/{id}/submit` (grade+persist) · `GET /attempts?course=` (history)
- **Grading service** `app/services/grading.py`: port the rules from the
  frontend (`public/app/app.js`): mc exact; fill = normalised tolerant match;
  match = partial credit; essay = model-answer self-grade. One source of truth
  shared by API (and later the app).
- **Acceptance:** seeded AI course → draw → submit → score persists per user;
  `pytest` covers draw/grade.

### Phase B2 — Document upload + ingestion (the upload-first path)
- `POST /courses` (create a course) and `POST /courses/{id}/documents`
  (multipart upload: PDF/PPTX/HTML) → row in `source_documents`.
- Implement `app/services/ingestion.py`:
  - `extract_pdf` (pypdf), `extract_pptx` (python-pptx), `extract_page_html` (bs4)
  - `chunk()` → `TextChunk(text, source_ref, topic_hint)` sized for the LLM.
- **Acceptance:** upload a slide deck → `source_documents.text` populated → chunks returned.

### Phase B3 — AI generation (Anthropic, mockable)
- `app/services/generator.py` behind a small interface:
  - `class GenerationProvider` → `AnthropicProvider` (uses `ANTHROPIC_API_KEY`,
    `settings.generation_model`) and `MockProvider` (deterministic fake questions).
  - Auto-select Mock when no key is set, so the flow runs today.
- `POST /courses/{id}/generate` → background job (`ingest_jobs`): chunks →
  provider → `questions` in `schemas.Question` shape → bank (status `draft`).
- **Acceptance:** with MockProvider, a generate job moves
  `queued→…→ready` and creates a draft bank; swapping in the real key produces
  real questions with no code change.

### Phase B4 — Review / publish + freshness
- `GET /banks/{id}` (draft review), `POST /banks/{id}/publish` (admin/owner gate).
- Re-generate on new uploads; bump `question_banks.version`; only published
  banks are examinable. (Human-in-the-loop quality + IP gate.)

### Phase B5 — Frontend ↔ backend integration
- Add an API client to `public/app`; replace localStorage auth with the JWT
  endpoints; fetch courses/exams, draw papers, submit attempts to the API.
- Keep a **local/offline fallback** (current behaviour) when the API is absent.
- Requires the backend to be hosted (§7) and `FRONTEND_ORIGIN` / CORS set.
- **Acceptance:** log in on the live app with a DB account; attempts stored server-side.

### Phase B6 — Canvas OAuth (partnership-gated, deferred)
Only once Thomas More IT issues a **Developer Key**:
- `app/services/canvas_client.py` (already drafted) for
  `/courses`, `/courses/:id/files|pages`, `download`.
- Implement `/canvas/login` + `/canvas/callback` (code→token), store encrypted.
- `POST /courses/{id}/sync` → reuse B2/B3 pipeline on Canvas-fetched files.
- Respect Canvas **throttling**: per-token leaky bucket (~700 cost units;
  watch `X-Rate-Limit-Remaining`; back off on HTTP 403 "Rate Limit Exceeded");
  paginate `per_page=100` via Link headers (already handled in the client).

---

## 4. Target endpoint map
```
auth     POST /auth/register · POST /auth/login · GET /auth/me        [done]
canvas   POST /canvas/connect [done] · GET /canvas/login|callback     [B6]
courses  GET /courses · GET /courses/{id} · POST /courses             [B1/B2]
         POST /courses/{id}/documents (upload)                        [B2]
         POST /courses/{id}/generate (job) · GET /courses/{id}/bank   [B3]
         POST /courses/{id}/sync (Canvas)                             [B6]
banks    GET /banks/{id} · POST /banks/{id}/publish                   [B4]
exams    GET /courses/{id}/exams · GET /exams/{id} · POST /exams/{id}/draw  [B1]
attempts POST /attempts · POST /attempts/{id}/submit · GET /attempts  [B1]
```

## 5. Grading = single source of truth
Port `gradeFill / gradeMatch / estimateEssay / attemptScore` from
`public/app/app.js` into `app/services/grading.py` and have both the API and
(eventually) the app call the same rules. Prevents drift.

## 6. Testing
- `pytest` + `httpx`/TestClient against a **SQLite** test DB (proven to work).
- Per phase: unit tests for grading/ingestion, API tests for each endpoint,
  a job-state test for generation (with MockProvider).

## 7. Hosting the backend (when B5 needs it)
Static frontend stays on Pages; the API needs a real host:
- **Container host** (Fly.io / Render / Railway) + **managed Postgres**.
- Secrets via the host's env (same vars as `.env`): DB URL, `JWT_SECRET`,
  `CANVAS_TOKEN_ENC_KEY`, `ANTHROPIC_API_KEY`.
- Set `FRONTEND_ORIGIN` to the Pages URL; HTTPS only.
- Decision needed later: which host (cost/region/EU-data).

## 8. Security & compliance (carry through every phase)
- Passwords hashed; JWT signed; Canvas tokens Fernet-encrypted at rest.
- Uploaded materials are the user's own; store only as needed; allow delete (GDPR).
- Generated questions are original; human-review gate before publish.
- `.env` never committed; rotate secrets for production.

## 9. Open decisions / what we need
1. **Canvas OAuth Developer Key** — requires a request to Thomas More IT
   (redirect URI + scopes). Needed for B6; everything else proceeds without it.
2. **Anthropic API key** — for real B3 output (MockProvider works until then).
3. **Backend host choice** — for B5 (Fly/Render/Railway + managed Postgres).
4. **Exact Canvas rate limits** — confirm against live API during B6.

## 10. Milestone checklist
- [ ] B1 DB-backed courses/exams/attempts + grading service + tests
- [ ] B2 Upload + ingestion (PDF/PPTX/HTML → text → chunks)
- [ ] B3 Generation (Mock + Anthropic providers, job tracking)
- [ ] B4 Review/publish + versioned freshness
- [ ] B5 Frontend on JWT + hosted API (offline fallback kept)
- [ ] B6 Canvas OAuth + sync (after Developer Key)
