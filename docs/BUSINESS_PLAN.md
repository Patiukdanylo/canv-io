# Canv.io — Business Plan

*Version 0.1 · working draft. Figures marked “illustrative” are planning assumptions, not forecasts of actual results.*

---

## 1. Executive summary

Canv.io is a web platform that lets students prepare for theory exams by taking **realistic mock exams** inside an interface that mirrors their university's learning-management system (LMS). The core insight: students lose marks on exam day because the **format is unfamiliar**, not because they don't know the content. By letting them rehearse the exact exam experience — question types, navigator, timer, submit, instant graded feedback — and by **regenerating fresh questions every attempt**, Canv.io converts passive revision into high-frequency active recall.

A working, fully offline prototype already exists and proves the full loop (course → mock exam → graded results → review → attempt history). The opportunity is to turn that prototype into a multi-course, multi-account, eventually multi-university platform with a freemium subscription model.

**Ask / goal of this document:** define the product, the business model and a phased path so the idea can be built openly (GitHub) and validated with real students.

## 2. Problem

- Revision material (slides, notes, PDFs) teaches *content* but never *the exam itself*.
- The first time many students see the real question mix and flow is **during the graded exam**.
- Fixed past papers are scarce, get memorised, and don't regenerate.
- Self-testing today is manual, slow, and gives no instant, explained feedback.

**Result:** avoidable lost marks, higher stress, less efficient study time.

## 3. Solution

A focused practice platform:

- **Familiar exam UI** — a clean, LMS-style quiz environment (cover page, question navigator, timer, autosave, submit).
- **Regenerating exams** — each attempt draws a fresh paper from a question bank, so practice never runs out.
- **Mixed question types** — multiple-choice, fill-in-the-blank, matching, and essays — matching real theory exams.
- **Instant, explained grading** — auto-grading for objective types; model answers + self-grading for essays.
- **Progress tracking** — saved attempts, scores, targets (e.g. 80% pass line), and review of any past attempt.
- **Auto-generated, always-fresh courses (the moat)** — students connect their **own** Canvas account; Canv.io pulls *their* course files via Canvas' official API, and an LLM turns them into practice exams that **refresh as the syllabus changes**. Content scales without hand-authoring every bank. (See §12 for the access & IP constraints that keep this legitimate.)

**Positioning statement:** *Practise the exam, not just the notes — and walk in already familiar with it.*

## 4. Market

- **Primary users:** higher-education students sitting theory/closed-book exams (universities, university colleges, professional certifications).
- **Initial beachhead:** the founder's own programme/university (warm users, fast feedback, real exam formats to model).
- **Expansion rings:** other programmes in the same school → other schools → other countries → professional certification prep.
- **Why now:** students already live inside LMS quiz interfaces; AI makes question generation and essay feedback cheap; static-first web apps make the product nearly free to host and instant to ship.

**Market sizing (illustrative, top-down):** higher education has tens of millions of students globally; even a niche of exam-stressed students in a few programmes is a meaningful early market. Bottom-up validation (below) matters more than top-down TAM at this stage.

## 5. Target users & personas

- **“Night-before” Nora** — knows the material roughly, panics about format and timing. Wants a realistic dry run.
- **“Optimiser” Omar** — strong student, wants to push from 70% to 90% by drilling weak topics with analytics.
- **“Resit” Robin** — failed once, needs high-volume repeated practice with explanations.
- **(Later, B2B) Programme coordinator** — wants to offer students official-feeling practice exams aligned to learning objectives.

## 6. Value proposition

| For students | For institutions (later) |
|---|---|
| Rehearse the real exam, unlimited times | Improve pass rates & reduce resits |
| Instant graded feedback + explanations | Offer aligned, low-effort practice |
| Target weak topics, track progress | Insight into where cohorts struggle |
| Less stress, faster, more efficient study | A modern, student-loved study layer |

## 7. Business model & monetisation

**Freemium B2C, with B2B2C later.**

- **Free tier:** a limited number of mock-exam attempts per course / per week, core question types.
- **Pro (subscription):** unlimited attempts, all courses, topic-focused exams, progress analytics, AI essay feedback. *Illustrative pricing:* ~€4.99/month or ~€29/year (student-friendly).
- **Course / programme packs:** one-off or seasonal access to a specific course's exam bank around exam periods.
- **Institutional licences (later):** programmes, student associations or tutoring orgs pay per-seat or flat-rate to offer Canv.io to their students.
- **Possible future:** a **creator marketplace** where vetted contributors (top students, TAs) build question banks and earn a revenue share.

**Unit economics intuition:** the product is static-first with a light backend, so **marginal cost per user is very low** and gross margins are high. The main costs are content creation and (optional) AI grading calls — both controllable and scalable.

## 8. Go-to-market

1. **Seed with one programme.** Launch with the founder's own courses; recruit classmates before exam periods (the moment of peak pain and willingness to try anything that helps).
2. **Word of mouth at the right time.** Exam season is a natural viral window — “this is exactly like the real quiz.”
3. **Student-channel growth.** Student groups, course chats, subreddits/Discords, association partnerships.
4. **Content flywheel.** Each new course bank attracts that course's students; satisfied students request/contribute more courses.
5. **Institutional pilots.** Once pass-rate uplift is anecdotally clear, approach coordinators for official pilots.

## 9. Competition & differentiation

- **Quizlet / Anki / flashcards:** great for memorisation, but *not exam-format rehearsal*.
- **Official LMS quizzes:** authoritative but fixed, sparse, and not designed as a practice gym.
- **Generic test-prep / question banks:** often exam-specific (e.g. standardized tests), not aligned to a particular university course or its exact format.

**Canv.io's edge:** the combination of (1) **format fidelity** to the student's real LMS, (2) **regenerating** exams, and (3) **course-aligned** banks — focused purely on *exam rehearsal*.

## 10. SWOT

- **Strengths:** simple, focused product; working prototype; near-zero hosting cost; strong, timely pain point.
- **Weaknesses:** content creation is the bottleneck; essays are hard to auto-grade well; single-founder bandwidth.
- **Opportunities:** AI-assisted question generation; multi-university expansion; certification prep; B2B licences.
- **Threats:** IP/trademark missteps if it copies a specific LMS/university too closely; incumbents adding practice modes; academic-integrity perceptions if real exam questions are misused.

## 11. Financial plan (illustrative)

*Purely illustrative planning scenario to reason about the model — not a forecast.*

| Phase | Users | Paying % | Indicative monthly revenue | Main costs |
|---|---|---|---|---|
| Pilot (1 programme) | 100–500 | low | ~€0 (free, learning) | hosting ≈ €0, time |
| Beta (a few programmes) | 1k–5k | 3–6% | low €100s | hosting + small AI bill |
| Growth (multi-school) | 10k–50k | 4–8% | low–mid €1,000s | infra, content, support |

**Key drivers:** number of courses live, conversion to Pro, retention across exam cycles, and content cost per course. The static-first architecture keeps the cost base low, so the business becomes viable at modest scale.

## 12. Legal, IP & compliance (important)

This is a serious part of the plan, not a footnote.

- **Original / licensed content only.** Question banks must be original, founder-authored, or contributed under clear terms. **Do not reproduce a university's actual exam questions verbatim** without permission — that risks the institution's IP and academic-integrity policies.
- **Brand independence.** Ship an **original Canv.io brand and UI theme**. The product may feel *LMS-like*, but it must not copy a specific LMS vendor's logo/marks or a named university's branding for a commercial release. *(The current prototype uses placeholder skinning for personal study only and would be re-themed before any public launch.)*
- **Academic-integrity stance.** Position explicitly as **exam preparation**, not as a way to obtain or leak real exam content. This protects users and the brand.
- **Data protection (GDPR / EU).** Likely EU users → GDPR applies. Minimise personal data, get clear consent, allow export/delete, store securely. Early versions keep data in the browser (`localStorage`); a multi-user version adds a backend with proper data-protection design.
- **Terms & disclaimers.** Clear ToS: independent tool, no affiliation/endorsement, practice only, no guarantee of exam outcomes.

### 12.1 Canvas data access (specific to the auto-generation feature)
- **Use the official API, never scraping.** Canvas (Instructure) exposes a REST API; scraping the web UI would breach its Terms. We only call documented endpoints.
- **OAuth2 is mandatory for a multi-user app.** Canvas' API policy forbids collecting users' personal access tokens for a shared application — those are for local development only. Production must use **OAuth2**, which requires a **Developer Key approved by the institution's Canvas administrator** (Thomas More IT). This is a real dependency and a partnership conversation, not just code.
- **Process the student's own materials, for the student.** Each user connects *their* account and we generate practice items from *their* course content for *their* private use. We do **not** redistribute a university's copyrighted materials publicly, and generated questions are **original practice items**, never copies of real exam papers.
- **Consent & revocation.** Connecting Canvas is opt-in, scoped to the minimum read permissions, and revocable; ingested source material is stored only as long as needed to generate and refresh banks.
- **Human review gate.** Auto-generated banks pass a quality/IP review before students see them.

## 13. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Content creation can't keep up | AI-assisted authoring; contributor marketplace; start narrow (few courses, done well) |
| Essay auto-grading is weak | Model-answer self-grading now; AI-assisted rubric grading later, clearly labelled |
| IP / trademark exposure | Original brand + content from day one of any public release (see §12) |
| Low willingness to pay | Generous free tier; charge for *volume + analytics + AI*, sell hardest at exam season |
| Single-founder bandwidth | Keep architecture simple/static-first; automate; recruit contributors |

## 14. Team & roles (current → needed)

- **Now:** founder (product, prototype, content).
- **Soon:** content contributors per course; a part-time developer for the backend; design help for the public theme.
- **Later:** growth/community lead; institutional-partnerships lead.

## 15. Milestones (summary — see ROADMAP.md)

1. **MVP-0 (done):** offline prototype, one course, full take→grade→review loop.
2. **MVP-1:** clean public theme + multiple courses, still static.
3. **Accounts:** student accounts grouped by **study year/programme**, a marketing **home page** (legal + “study faster” message).
4. **Platform:** backend, auth, content authoring tools, analytics, AI essay feedback.
5. **Multi-university:** tenant model + selectable interface skins; institutional pilots.
6. **Marketplace:** contributor-built banks with revenue share.

---

*Next deliverable: GitHub repository to develop this openly (pending repo details + access).*
