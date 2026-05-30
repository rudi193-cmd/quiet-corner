@markdownai v1.0

# Backend Architecture — Local-First Classroom OS

This document defines the backend architecture for the local-first classroom operating system. It covers the tech stack, data model, storage layout, API surface, AI runtime, and auth gates. It is intended as the handoff document for UI wiring decisions.

---

## Guiding Constraints

- Everything runs on the teacher's machine. No external servers, no cloud sync by default.
- Must function with no internet connection.
- Tier 1 hardware: school-issued laptop, no GPU, 4–8 GB RAM. The app must be useful at this tier.
- Tier 2 hardware: consumer GPU or high-spec personal machine. Full AI capabilities unlock here.
- Tier 3: school server, shared model access — same app, different deployment config.
- Student data never leaves the machine unless the teacher explicitly exports it.

---

## Tech Stack

### Runtime
- **Application shell:** Electron (bundles Node.js + Chromium, ships as a single desktop installer)
- **Frontend:** HTML/CSS/JS — no framework requirement, or lightweight (Alpine.js, Preact)
- **Backend process:** Python (FastAPI) running as a child process, accessed over localhost
- **IPC:** HTTP over localhost (127.0.0.1), not exposed to network

### Databases
- **Primary structured data:** SQLite (via `better-sqlite3` from Node, or `sqlite3` from Python)
  - All relational data: students, lessons, assessments, observations, agent runs
  - Single file at `~/.classroom-os/db/main.db`
- **Vector store:** `sqlite-vec` extension on the same SQLite DB (Tier 1) or ChromaDB (Tier 2)
  - Embeddings for retrieval: standards, textbook chunks, teacher documents, past lessons
  - Avoids a separate process on low-spec machines

### AI Runtime
- **Tier 1 (no GPU):** Retrieval-only. Embeddings via `nomic-embed-text` (Ollama, CPU-friendly). No generation model required for core function.
- **Tier 2 (GPU):** Ollama managing local models. Default generation model: `mistral:7b` for fast tasks, `llama3.1:8b` for longer generation. Model selection is configurable.
- **Agent orchestration:** Python, sequential by default, parallel via `asyncio` for multi-agent workflows
- **Embedding model:** `nomic-embed-text` via Ollama (runs on CPU, adequate for Tier 1)

### OCR and Speech
- **Handwriting OCR:** Tesseract (local, no network)
- **Speech-to-text:** Whisper via `faster-whisper` (CPU-compatible, runs locally)
- Both are optional dependencies — app degrades gracefully if not installed

### Export
- **JSON/CSV:** Native Python
- **Markdown:** Native
- **PDF:** `weasyprint` (Python, CSS-based, no headless browser required)

---

## Directory Layout

```
~/.classroom-os/
  db/
    main.db              # SQLite — all structured data + vectors
  models/                # Ollama model cache (symlink or config pointer)
  documents/             # Teacher-uploaded files: textbooks, standards PDFs, handouts
  exports/               # Generated exports (JSON, CSV, PDF, Markdown)
  media/
    uploads/             # Handwritten work scans, audio recordings
    ocr_cache/           # Processed OCR results keyed by file hash
  agent_runs/            # Serialized multi-agent workflow outputs
  config.json            # App config: hardware tier, model selection, preferences
```

---

## Data Model

### `teachers`
Single-teacher app for now. One row. Stores display name, preferences JSON, style memory JSON.

| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT | |
| preferences | JSON | lesson format defaults, classroom constraints |
| style_memory | JSON | accumulated generation style context |
| created_at | TIMESTAMP | |

### `students`
| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| name | TEXT | |
| grade_level | TEXT | |
| reading_level | TEXT | |
| iep | BOOLEAN | has IEP on file |
| ell | BOOLEAN | English language learner |
| notes | TEXT | freeform |
| metadata | JSON | learning style, behavioral context, any structured fields |
| created_at | TIMESTAMP | |
| archived_at | TIMESTAMP | nullable — soft delete |

### `student_mastery`
One row per student per topic/standard.

| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| student_id | INTEGER FK | |
| standard_id | TEXT | e.g. "CCSS.MATH.4.NF.A.1" |
| status | TEXT | not_started / emerging / developing / mastered |
| last_assessed | TIMESTAMP | |
| evidence | JSON | array of assessment_id references |

### `observations`
Classroom signal records. The core intake form.

| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| student_id | INTEGER FK | nullable — can be class-level |
| signal | TEXT | vocabulary term from Classroom Signals list |
| note | TEXT | freeform teacher note |
| context | TEXT | subject, activity, time of day |
| observed_at | TIMESTAMP | |
| created_at | TIMESTAMP | |

### `lessons`
| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| title | TEXT | |
| subject | TEXT | |
| grade_level | TEXT | |
| standards | JSON | array of standard IDs |
| body | TEXT | lesson plan content (Markdown) |
| differentiation | JSON | keyed by reading level or IEP |
| source | TEXT | human / ai_generated / ai_adapted |
| agent_run_id | INTEGER FK | nullable — if generated by agent workflow |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### `assessments`
| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| lesson_id | INTEGER FK | nullable |
| title | TEXT | |
| rubric | JSON | criteria, levels, point values |
| body | TEXT | assessment content |
| created_at | TIMESTAMP | |

### `submissions`
Student work submitted against an assessment.

| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| assessment_id | INTEGER FK | |
| student_id | INTEGER FK | |
| content | TEXT | transcribed or typed |
| media_path | TEXT | path to scan/audio file if applicable |
| score | REAL | nullable until graded |
| feedback | TEXT | generated or written feedback |
| explanation | TEXT | why answer is wrong, if applicable |
| graded_at | TIMESTAMP | |

### `documents`
Teacher-uploaded reference materials fed into the retrieval layer.

| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| filename | TEXT | |
| path | TEXT | path under `~/.classroom-os/documents/` |
| type | TEXT | standard / textbook / handout / policy / other |
| chunk_count | INTEGER | number of embedded chunks |
| indexed_at | TIMESTAMP | nullable — null until embedded |

### `embeddings`
Stored via `sqlite-vec`. One row per chunk.

| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| source_type | TEXT | document / lesson / standard / observation |
| source_id | INTEGER | FK to relevant table |
| chunk_text | TEXT | |
| embedding | BLOB | vector (sqlite-vec format) |

### `schedule`
The teacher's daily and weekly period structure. Required by Today's Workspace.

| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| day_of_week | INTEGER | 0=Monday … 4=Friday |
| period | INTEGER | ordering within day |
| label | TEXT | e.g. "1st Period", "Math Block" |
| subject | TEXT | |
| start_time | TEXT | HH:MM, 24h |
| end_time | TEXT | HH:MM, 24h |
| student_group | TEXT | nullable — class section name |

`lessons` gains one additional column:

| column | type | notes |
|--------|------|-------|
| scheduled_at | DATE | nullable — date this lesson is assigned to |
| schedule_id | INTEGER FK | nullable — period it belongs to |

This allows Today's Workspace to query: `SELECT * FROM lessons WHERE scheduled_at = today ORDER BY schedule.start_time`.

### `agent_runs`
Records of multi-agent workflow executions.

| column | type | notes |
|--------|------|-------|
| id | INTEGER PK | |
| workflow | TEXT | name of workflow (e.g. "unit_builder") |
| input | JSON | user request and parameters |
| steps | JSON | array of agent steps with outputs |
| status | TEXT | pending / running / complete / failed |
| created_at | TIMESTAMP | |
| completed_at | TIMESTAMP | |

---

## API Surface

All endpoints served by the local FastAPI process on `127.0.0.1:8432`. The Electron shell communicates exclusively over this interface.

### Students
```
GET    /students                    list all active students
GET    /students/:id                student detail + mastery summary
POST   /students                    create student
PATCH  /students/:id                update student
DELETE /students/:id                archive (soft delete)
GET    /students/:id/mastery        mastery graph for student
GET    /students/:id/observations   observation history
```

### Observations
```
GET    /observations                list (filterable by student, date, signal)
POST   /observations                record new observation
DELETE /observations/:id            delete
```

### Lessons
```
GET    /lessons                     list lessons
GET    /lessons/:id                 lesson detail
POST   /lessons                     create (human-authored)
PATCH  /lessons/:id                 update
POST   /lessons/generate            AI generation request → returns lesson draft
```

### Assessments
```
GET    /assessments                 list
POST   /assessments                 create
POST   /assessments/generate        AI generation from lesson or topic
GET    /assessments/:id/submissions list submissions
POST   /assessments/:id/grade       trigger grading pass on all submissions
```

### AI
```
POST   /ai/query                    natural-language query over student graph or documents
POST   /ai/generate                 general generation (lesson, rubric, email, etc.)
GET    /ai/status                   Ollama availability, active model, tier detection
```

### Agents
```
POST   /agents/run                  submit multi-agent workflow
GET    /agents/runs/:id             poll workflow status
GET    /agents/runs/:id/steps       step-by-step output
```

### Documents
```
GET    /documents                   list uploaded documents
POST   /documents/upload            ingest file into retrieval layer
DELETE /documents/:id               remove and purge embeddings
GET    /documents/index/status      embedding progress
```

### Export
```
POST   /export                      generate export (format, scope as params)
GET    /exports                     list generated exports
```

### Schedule
```
GET    /schedule                    full schedule (all periods, all days)
POST   /schedule                    create period
PATCH  /schedule/:id                update period
DELETE /schedule/:id                remove period
GET    /schedule/today              today's periods with assigned lessons
```

### Morning Brief
```
GET    /morning-brief               pre-computed summary for companion sidebar
```
Computed at app open. Backend runs:
1. `SELECT * FROM observations WHERE observed_at >= yesterday AND student_id IS NOT NULL` — flags from prior day
2. `SELECT * FROM student_mastery WHERE status = 'emerging' AND last_assessed >= last_7_days` — recent gaps
3. On Tier 2: passes results to Ollama with a fixed summarization prompt → returns 3–5 natural-language notes
4. On Tier 1: returns structured data only — the companion renders it as a list without prose generation

Result is cached in memory for the session. Refreshed if the teacher explicitly requests it. This is what Wren reads before her morning notes.

### Config
```
GET    /config                      current config (hardware tier, model, preferences)
PATCH  /config                      update config
```

---

## AI Runtime Detail

### Tier Detection
At startup, the backend probes:
1. Ollama availability (`/api/tags`)
2. GPU presence via `nvidia-smi` or Metal availability on macOS
3. Available RAM

Result written to `config.json` as `tier: 1 | 2 | 3`. UI reflects capabilities accordingly.

### Generation Pipeline
1. Request arrives at `/ai/generate` or `/ai/query`
2. Backend retrieves relevant context from vector store (top-k chunks by cosine similarity)
3. Constructs prompt: system role + teacher style memory + retrieved context + user request
4. Dispatches to Ollama (Tier 2) or returns retrieval-only result (Tier 1)
5. Streams response back to frontend via Server-Sent Events

### Multi-Agent Orchestration
Agent workflows are defined as Python async functions. Each agent:
- Receives the shared workflow context
- Calls the generation pipeline with a scoped prompt
- Returns structured output (JSON)
- Passes output to the next agent or aggregator

Agents run sequentially by default. Parallelism enabled for independent agents (e.g., standards alignment and reading-level adaptation can run simultaneously).

---

## Auth and Data Tiers

No user accounts. Single-teacher, single-machine.

**Session gate:** The app requires a local PIN or OS-level auth on first open per session. This is configurable — can be disabled for home machines, required for school-shared machines.

**Data tier access:**

| Tier | What is accessible |
|------|--------------------|
| Unauthenticated | Nothing — app does not render |
| Authenticated (PIN or OS auth) | All local data |
| Export | Explicit teacher action required for every export — no background sync |
| Tier 3 (school server) | Teacher authenticates to the local server; student data stays scoped to that teacher's namespace |

There is no network auth layer in Tier 1 or Tier 2. The localhost API is not network-exposed. Tier 3 adds a local network auth layer (simple token, no cloud identity provider).

### Per-Period Data Scope (Consent Toggles)

The design includes per-period toggles: IEPs on/off, behavioral data on/off, etc. These are implemented as a **frontend preference layer** in v1 — they gate what the frontend requests, not what the API enforces.

Concretely:
- `GET /config` returns a `session_scope` object: `{ iep_visible: true, behavior_visible: false, ... }`
- The frontend reads this before rendering sensitive fields and before constructing queries
- The API returns all data it has access to — the scope filter lives in the frontend request logic

This is correct for a single-teacher local app where there is no adversary between the frontend and the API. Backend middleware enforcement is the path for Tier 3 (shared school server) where multiple teachers share one instance.

`PATCH /config` with `session_scope` updates the toggles. They persist across sessions unless the teacher resets them.

---

## What the UI Needs to Know Per Screen

### Observation Form
- `GET /students` — populate student selector
- `POST /observations` — submit
- No AI dependency. Works fully offline at Tier 1.

### Student Profile
- `GET /students/:id` — detail
- `GET /students/:id/mastery` — mastery graph
- `GET /students/:id/observations` — history
- `GET /ai/status` — show/hide AI query interface based on tier

### Lesson Builder
- `GET /documents/index/status` — show retrieval readiness
- `POST /ai/generate` — generation (Tier 2) or retrieval suggestion (Tier 1)
- `POST /lessons` — save draft
- Standards list is static JSON bundled with the app (no network fetch needed)

### Assessment + Grading
- `GET /assessments/:id/submissions` — submission list
- `POST /assessments/:id/grade` — trigger grading pass
- OCR availability surfaced from `/config`
- Speech availability surfaced from `/config`

### Multi-Agent Workflow Runner
- `POST /agents/run` — submit
- `GET /agents/runs/:id` — poll (SSE or polling at 1s)
- Tier 2 only. Tier 1 receives a clear "not available on this hardware" message.

### Live Classroom Mode
- Poll data from `/students` (read-only during live mode)
- Observation recording via `POST /observations` (low-latency path)
- No AI generation in live mode — retrieval and pre-generated materials only

---

## Config Shape

`config.json` carries all teacher preferences and session state. Relevant keys:

```json
{
  "tier": 1,
  "model": "mistral:7b",
  "gpu": false,
  "preferences": {
    "archetype": "wren",
    "current_readaloud": {
      "title": "",
      "author": "",
      "current_page": 0
    }
  },
  "session_scope": {
    "roster_visible": true,
    "attendance_visible": true,
    "standards_visible": true,
    "knowledge_graph_visible": true,
    "iep_visible": false,
    "behavior_visible": false,
    "parent_contact_visible": false,
    "archive_visible": true
  }
}
```

**`preferences.archetype`** — set during onboarding, determines which companion voice the `/morning-brief` Ollama prompt uses. Values: `wren`, `patches`, `sage`, `apex`, `archivist`.

**`preferences.current_readaloud`** — updated inline from the workspace reading tracker widget via `PATCH /config`. Frontend writes the full object on any field change.

**`session_scope`** — updated by the per-period SAFE consent dialog via `PATCH /config`. Frontend gates all rendering and request construction on these flags. API does not enforce them in Tier 1/2.

---

## Onboarding Flow

First-run detected when `schedule` table is empty and `preferences.archetype` is unset.

Two-step screen before workspace loads:

1. **Pick your room** — teacher selects archetype (Wren / Patches / Sage / Apex / The Archivist). Writes `preferences.archetype` to config.
2. **Set your schedule** — teacher enters period structure (label, subject, start/end time per period). Writes to `schedule` table via `POST /schedule`.

After both steps complete, workspace loads normally. Onboarding does not repeat unless explicitly triggered from settings.

---

## Tier 1 Companion Behavior

When `tier === 1`, `GET /morning-brief` returns structured JSON, not prose. The companion sidebar renders in **offline mode**:

- Companion avatar/header remains visible (archetype identity preserved)
- Items render as labeled cards: signal type + student name + brief note
- One-line status beneath the companion header: *"Running in offline mode — notes shown as summaries"*
- No generated prose. No companion voice text.

Tier 2 upgrade path: when `GET /ai/status` detects Ollama available, the companion sidebar transitions to prose automatically on next session open.

---

## Open Decisions

Resolved 2026-05-27. No remaining open decisions before wiring begins.

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Electron vs. browser tab | Electron |
| 2 | sqlite-vec vs. ChromaDB | sqlite-vec (Tier 1), ChromaDB (Tier 2) via tier detection |
| 3 | Standards bundle | NM CCSS + NM-specific for pilot |
| 4 | PIN vs. OS auth | PIN for v1 |
| 5 | Tier 3 network auth | Deferred |
| 6 | Session scope key names | Confirmed as proposed (8 keys above) |
| 7 | Companion personality source | `preferences.archetype` in config.json |
| 8 | Tier 1 companion UI | Companion present, muted, offline mode label |
| 9 | Schedule setup flow | Dedicated onboarding screen (archetype → schedule → workspace) |
| 10 | `current_readaloud` shape | `{ title, author, current_page }`, inline widget, `PATCH /config` |
