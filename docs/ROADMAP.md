# From Observation Instrument to Teacher's Tool — Roadmap & Gap Analysis

**Status:** Internal working doc. Candid backlog, not a promise.
**Last updated:** 2026-06-08
**Audience:** maintainers / future contributors.

---

## Thesis

Quiet Corner today is a strong observation **instrument**. It is not yet a
**teacher's tool**.

The difference is whether it survives a real school day. An instrument captures
a clean signal in ideal conditions. A tool gets fat-fingered, dropped, shared,
and used one-handed on a phone while thirty kids do thirty things — and keeps
working. Everything below is really one project: crossing that line, without
betraying what already makes the instrument good (the Assessment Visibility
framework grounding, expressive pathways + Classroom Signals, E4 admin-legible
language, and a genuinely private, local-first posture).

We measure every proposed feature against the framework's own constraints
(`CLAUDE.md` → *Design constraints*): no medicalization, no deficit language, no
surveillance-oriented transparency, teacher judgment is central, platform-
agnostic, and the **Posole criterion** — *works for a teacher with 30 students
and no prep.* If a feature can't pass Posole, it isn't done.

---

## What's already good (protect this)

- **Framework-encoded observation.** Expressive pathways + Classroom Signals
  vocabulary is genuinely differentiated; near-zero competitors encode a theory
  of *assessment visibility*.
- **E4 report generation** (`records.html` → reports panel) translates
  observations into principal/ESSA/Yazzie-Martinez language. Rare and valuable.
- **Private by construction.** After the local-image work, the app makes zero
  third-party requests at runtime and holds no data off-device. Most
  competitors are cloud-by-default with minors' data on third-party servers.
- **Hardened data layer.** Typed `StorageError` on write failure, collision-
  proof ids, atomic + validated backup import with true item-level merge.

---

## The gaps, in three tiers

### Tier 1 — *It has to not fight the teacher* (makes it functional)

These are the table-stakes that currently block daily use.

1. **Records are append-only — no edit or delete.**
   `qc-data.js` exposes `post*` / `get*` but no update or delete for students,
   observations, skills, or meetings (only `deleteSchedulePeriod` exists; the
   `students.archived_at` field is read by `getStudents()` but nothing ever
   *sets* it). A mistyped observation is permanent. Every comparable tool has
   full CRUD.
   *Work:* add `patch*` / `delete*` (or soft-delete via `archived_at`) to the
   data layer + edit affordances in `records.html`. Backup format already
   tolerates this — ids are stable.

2. **No evidence capture (photo / audio / video).**
   Observation is typed text only. In Montessori tooling especially, the
   observation often *is* a photo of the child's work or a short audio note.
   *Work:* `<input type="file" capture>` → compress (reuse the pattern in
   `classroom-os-bg.js`) → store as a data URL or, better, IndexedDB blob
   (localStorage will not hold many photos — see Tier 2 storage note).
   *Posole check:* must be one tap from the observation form.

3. **No per-student profile / timeline.**
   You can list observations globally, but there is no "everything about this
   child over time" view — which is the screen teachers actually live in.
   *Work:* a student detail view aggregating observations, skills, pathway
   coverage, and meetings; pure read-side, no schema change.

4. **No search / filter across observations.**
   Find-by-student exists in code paths but there's no UI to search notes,
   filter by pathway/signal/standard/date. Grows from #3.

5. **Output is screen-only — no print / PDF.**
   Reports render via `textContent`; the E4 language can't actually be handed
   to a principal as a document. (The "printable" labels in the room mockups
   are decorative.)
   *Work:* a print stylesheet + `window.print()` is the 80/20; PDF export later.

### Tier 2 — *It has to survive a school* (trust & scale)

6. **No accounts / auth.** Data lives in one browser profile with no lock. On a
   shared classroom machine, every child's record is an open book to whoever
   sits down. This is the most serious **trust** gap for a tool holding minors'
   records. Even local-only, schools need *some* gate.

7. **Single device, no sync, no co-teacher / admin roles.** The FastAPI backend
   is designed (`docs/backend-architecture.md`) but stubbed off
   (`USE_API=false`). No multi-teacher classrooms, no admin visibility, no
   recovery beyond manual JSON backup.

8. **Storage ceiling.** localStorage is ~5–10 MB and synchronous. It's fine for
   text records; it will not survive photo/audio evidence (Tier 1 #2). Migrating
   the persistence layer to IndexedDB is the unlock for evidence + scale.
   `qc-data.js`'s `db` abstraction is the single seam to do this behind.

9. **No written privacy / compliance posture.** A FERPA/COPPA-aware data-handling
   note (what's stored, where, who can see it, how to delete) is required before
   any school adoption — and is cheap to write now while the answer is simply
   "nothing leaves the device."

10. **Not installable / not resilient offline by policy.** No PWA manifest or
    service worker. Now that assets are local this is low-hanging fruit:
    installable app icon, guaranteed offline caching, feels native on a tablet.

11. **Not responsive.** No `@media` queries anywhere; the rooms are fixed desktop
    grids. Teachers observe *walking around* with a phone or tablet. Until this
    works one-handed on a small screen, it fails Posole in the field.

### Tier 3 — *The reason it exists* (differentiators)

12. **The LevelShip pathway map is aspirational.** `CLAUDE.md` names "map
    understanding across pathways … under-seen ≠ under-capable" as LevelShip's
    domain, but there is no visualization in the app. This is the single most
    distinctive thing we could build — a per-student/per-class map of which
    pathways have been *seen*, surfacing what the test missed. Depends on
    Tier 1 #3/#4 data plumbing.

13. **The after-engagement AI scaffold (UTETY) isn't wired.** The companion
    "morning brief" is structured, not generated; the "drafts awaiting your
    edit" / "parent letter drafted" in the rooms are mockups. The framework is
    explicit that AI is the *secondary* scaffold and must *never precede
    sense-making* — so this is deliberately last, and must stay opt-in and
    post-observation. The `USE_API` path + Ollama/local-inference plan in
    `backend-architecture.md` is the intended home.

14. **E4 → polished artifact.** Pair Tier 1 #5 with the existing report
    generator so the admin-legible language exports as a clean, branded
    one-pager. High perceived value, modest effort.

### Everyday connective tissue (smaller, still expected)

- **Roster CSV import** — onboarding a class of 30 by hand fails Posole.
- **Attendance** — only a `session_scope` flag today; no feature.
- **Bulk / multi-student observation** — one note, several kids.
- **Undo** on destructive actions (pairs with edit/delete).
- **Accessibility** — add ARIA landmarks/labels (form labels exist; structure
  doesn't).

---

## The architecture fork (still open — do not pick yet)

Almost everything in Tier 2 hangs off one decision that `CLAUDE.md` still lists
as open. Laying out the three honest paths:

### Option A — Local-first, hardened
Stay single-device, no-account *by design.* Invest in IndexedDB, rock-solid
backup/restore, file-based "sneakernet" sync (export → import on another
machine), and a PWA.
- **Pros:** maximal privacy story; no servers, no compliance surface; cheapest;
  most faithful to the current posture.
- **Cons:** no real collaboration; "sync" is manual; a lost, un-backed-up device
  is a lost classroom.
- **Best if:** the pilot stays small and privacy is the headline feature.

### Option B — Optional self-hosted backend
Default to local; let a school *turn on* the designed Willow/FastAPI backend for
multi-teacher, sync, and admin. The `USE_API` seam already exists for exactly
this.
- **Pros:** keeps the privacy default; adds scale and collaboration only when a
  school opts in and controls the server; preserves "platform-agnostic."
- **Cons:** two code paths to maintain and test; someone has to run the server;
  the local↔server data-merge story is real work.
- **Best if:** we want growth without becoming a data custodian.

### Option C — Cloud, multi-teacher
Commit to accounts + hosted sync as the primary path.
- **Pros:** closest to competitor expectations; effortless multi-device; enables
  parent sharing and district reporting.
- **Cons:** biggest lift; we become the custodian of minors' data — full
  FERPA/COPPA/security burden; directly tensions the "no surveillance" and
  privacy-first constraints. Would need a very deliberate trust design.
- **Best if:** the goal is a district-scale product, eyes open to the burden.

**Recommendation for discussion:** B is the path that scales without abandoning
the framework's privacy stance — local-first default, opt-in server, single
`USE_API` seam. But this is a product decision, not an engineering one; flagged
here, not decided.

---

## Non-goals / guardrails (things we should *not* build)

The framework bans more than it asks for. Explicit non-goals so a well-meaning
feature doesn't erode the thesis:

- **No deficit dashboards.** No red/green "struggling student" leaderboards, no
  ranking. Under-seen ≠ under-capable; the map shows coverage, not deficiency.
- **No surveillance analytics.** No engagement scoring, no time-on-task
  tracking, no behavior heatmaps. (Note the decorative "attendance gap · 38%
  unit missed" line in the STEM room mockup — that framing is *off-thesis* and
  should not become real.)
- **No diagnostic / medicalized inference.** The tool documents what a teacher
  saw; it does not label, screen, or predict.
- **AI never precedes sense-making.** Any generation is post-observation,
  opt-in, and clearly the *secondary* scaffold.
- **No teacher-superseding automation.** Teacher judgment is the evidentiary
  basis; the tool drafts and surfaces, the teacher decides.

---

## Suggested sequencing (rough)

1. **Edit/delete + undo** (Tier 1 #1) — unblocks honest daily use; small.
2. **Per-student timeline + search/filter** (Tier 1 #3/#4) — the screen teachers
   live in; read-side only.
3. **Print/PDF for reports + E4 one-pager** (Tier 1 #5 / Tier 3 #14) — high value,
   modest effort, no architecture dependency.
4. **IndexedDB migration behind `db`** (Tier 2 #8) — the unlock for everything
   heavy; do before evidence capture.
5. **Evidence capture** (Tier 1 #2) — lands on top of #4.
6. **PWA + responsive pass** (Tier 2 #10/#11) — makes it real in the field.
7. **Auth/lock + privacy posture doc** (Tier 2 #6/#9) — required before wider
   adoption.
8. **Decide the architecture fork**, then build the LevelShip map (Tier 3 #12)
   and, last and opt-in, the AI scaffold (Tier 3 #13).

Steps 1–3 make it *honest*; 4–6 make it *usable in the room*; 7–8 make it
*adoptable by a school*.
