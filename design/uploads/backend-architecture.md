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

## Open Decisions

These are not made here — flagged for resolution before wiring begins.

1. **Electron vs. local server + browser tab** — Electron ships as a proper desktop app; local server is simpler to build but requires the teacher to open a browser. Electron is the stronger end-state.
2. **sqlite-vec vs. ChromaDB** — sqlite-vec keeps everything in one file (simpler for Tier 1); ChromaDB is more capable but a separate process. Tier detection can switch between them.
3. **Standards bundle** — which state standards are included in the initial install? NM CCSS + NM-specific are the pilot target.
4. **PIN vs. OS auth** — OS-level keychain auth is more secure but more complex to implement. PIN is acceptable for v1.
5. **Tier 3 network auth** — deferred until school server deployment is in scope.
