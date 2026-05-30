# Classroom OS — UI/UX Handoff

**Design system:** SAFE (per-session consent, local-first) + five teacher archetype themes  
**Backend:** FastAPI on `127.0.0.1:8432` · SQLite at `~/.classroom-os/db/main.db` · Ollama local inference  
**Shell:** Electron (Node.js + Chromium)  
**Design files:** see *File Inventory* below

---

## File Inventory

### Core design exploration (design canvas)
| File | Contents |
|---|---|
| `index.html` | Six-artboard SAFE design canvas: session auth, workspace × 2, lesson composer, multi-agent run, live classroom mode, knowledge graph query |
| `Themes.html` | CSS skin comparison: same 6 screens across 4 SAFE-derived themes |
| `v1/` | Frozen snapshot of the full canvas at v1 |

### Classroom OS — teacher archetype rooms
| File | Archetype | Companion |
|---|---|---|
| `Classroom OS.html` | Hub / picker | — |
| `Book Nook.html` | Literary warmth · amber · Georgia | Wren |
| `Cat Gremlin.html` | Controlled chaos · hot pink · system-sans | Patches |
| `Cottagecore.html` | Botanical calm · sage green · Georgia | Sage |
| `STEM Commander.html` | Mission control · dark mode · electric blue | Apex |
| `Retro Academia.html` | Archive aesthetic · parchment · Georgia serif | The Archivist |
| `Book Nook v1.html` | Frozen v1 of Book Nook | Wren |

### Shared assets
| File | Purpose |
|---|---|
| `classroom-os-bg.js` | Background photo drag-and-drop + localStorage persistence (all 5 rooms) |
| `themes.css` | CSS skin variable overrides (Elementary, STEM, STEAM, Humanities — earlier exploration) |
| `safe/colors_and_type.css` | SAFE design system CSS tokens |
| `safe/ui-kit.css` | SAFE component styles |
| `design-canvas.jsx` | Design canvas React component |
| `artboards/` | Six individual artboard JSX components |

---

## Architecture Quick Reference

| Fact | Value |
|---|---|
| API base | `http://127.0.0.1:8432` |
| Streaming | Server-Sent Events (`EventSource`) |
| Auth | Local PIN or OS-level auth. No network accounts. |
| Tier detection | `GET /config` or `GET /ai/status` at startup |
| Student data | Never leaves machine. No background sync. |
| Export | Explicit teacher action only (`POST /export`) |

---

## Per-Screen API Wiring

### Today's Workspace (all archetype rooms)

| Data shown | Endpoint | Tier | Notes |
|---|---|---|---|
| Today's period schedule | `GET /schedule/today` | 1+ | Returns periods + assigned lessons |
| Companion morning notes (prose) | `GET /morning-brief` | 2 | Ollama-generated; cached for session |
| Companion morning notes (structured) | `GET /morning-brief` | 1 | Structured data, no prose; frontend renders as list |
| "Next up" lesson | `GET /schedule/today` → first future period | 1+ | Derived from schedule response |
| "In the basket" / Drafts | `GET /lessons?status=draft` | 1+ | |
| Recent observations (flags) | `GET /observations?date=today` | 1+ | Used for "wants a look" items |
| Tier chip in nav | `GET /ai/status` | 1+ | `{ tier: 1|2|3, model: "...", gpu: bool }` |
| Session scope (data visibility) | `GET /config` → `session_scope` | 1+ | Read on load; gates sensitive fields |

### Session Authorization Dialog (SAFE consent moment)

The dialog fires at the start of each period. "Authorize period" sends:

```
PATCH /config
{
  "session_scope": {
    "roster_visible":          true,
    "attendance_visible":      true,
    "standards_visible":       true,
    "knowledge_graph_visible": true,
    "iep_visible":             false,
    "behavior_visible":        false,
    "parent_contact_visible":  false,
    "archive_visible":         true
  }
}
```

These are the **proposed key names** — pin with backend before wiring.  
Frontend gates all rendering and request construction on these flags.  
API returns all data regardless — filter is frontend-only in Tier 1/2.  
Tier 3 (school server): backend middleware enforcement applies.

### Lesson Composer

| Action | Endpoint | Tier | Notes |
|---|---|---|---|
| Check retrieval readiness | `GET /documents/index/status` | 1+ | Show warning if not indexed |
| Generate lesson (streaming) | `POST /ai/generate` → SSE | 2 | `EventSource` for live trace |
| Retrieval suggestion (Tier 1) | `POST /ai/generate` | 1 | Returns grounded suggestion, no generation |
| Save draft | `POST /lessons` | 1+ | |
| Update existing | `PATCH /lessons/:id` | 1+ | |
| Style memory read | `GET /config` → `teacher.style_memory` | 1+ | Fed into prompt construction |

The terminal sidecar showing "grounded in X files · 4 sources" reflects the retrieval context the backend assembles in step 2 of the generation pipeline. Surface this from the SSE event stream as metadata events before the content stream begins.

### Multi-Agent Workflow Runner

| Action | Endpoint | Tier | Notes |
|---|---|---|---|
| Submit workflow | `POST /agents/run` | 2 only | Returns `{ run_id }` |
| Poll step output | `GET /agents/runs/:id/steps` | 2 only | 1-second poll interval |
| Poll overall status | `GET /agents/runs/:id` | 2 only | `status: pending|running|complete|failed` |
| Tier 1 gate | — | 1 | Show "not available on this hardware" — do not hide silently |

The build log stream maps to the `steps` array in the poll response. Each step has: `agent`, `status`, `output`, `elapsed_ms`. The "handoff" messages between agents are in `output.handoff_note` (proposed — confirm with backend).

### Knowledge Graph Query

| Action | Endpoint | Tier | Notes |
|---|---|---|---|
| Natural language query | `POST /ai/query` | 2 | Full prose response with citations |
| Structured query (Tier 1) | `POST /ai/query` | 1 | Returns matched records, no prose reasoning |
| Student mastery detail | `GET /students/:id/mastery` | 1+ | Per-student evidence cited in results |
| Observation history | `GET /students/:id/observations` | 1+ | "What they said" evidence cards |

### Live Classroom Mode

| Action | Endpoint | Tier | Notes |
|---|---|---|---|
| Load student roster | `GET /students` | 1+ | Read-only during live mode |
| Record Q&A / observation | `POST /observations` | 1+ | Low-latency path; works offline |
| Poll attendance | `GET /observations?signal=attendance&date=today` | 1+ | |
| No AI generation | — | — | All materials pre-generated before class |

The teacher-only overlay (flagged students, pace check) reads from the same `GET /morning-brief` cache loaded at session start. No new API calls during live mode.

### Student Profile / Knowledge Graph

| Action | Endpoint | Tier |
|---|---|---|
| Student detail | `GET /students/:id` | 1+ |
| Mastery graph | `GET /students/:id/mastery` | 1+ |
| Observation history | `GET /students/:id/observations` | 1+ |
| AI query over student | `POST /ai/query` | 2 |
| Show/hide AI query UI | `GET /ai/status` → `tier` | 1+ |

---

## Tier Behavior Matrix

| Feature | Tier 1 | Tier 2 |
|---|---|---|
| Today's schedule | ✓ | ✓ |
| Companion morning notes | Structured list | Ollama prose |
| Lesson generation | Retrieval suggestion only | Full generation + streaming |
| Multi-agent workflows | Not available (show message) | ✓ |
| Knowledge graph query | Structured record match | Full prose reasoning |
| OCR (handwritten work) | Depends on Tesseract install | ✓ |
| Speech-to-text | Depends on Whisper install | ✓ |
| Live classroom mode | ✓ | ✓ |
| Observation recording | ✓ | ✓ |

Surface tier from `GET /ai/status` at startup. Write to UI state. Tier 1 features that don't exist at Tier 2 should explain *why* clearly — not just grey out.

---

## Companion Data Requirements

Each archetype companion (Wren, Patches, Sage, Apex, The Archivist) reads from the same data sources. The voice differs; the data does not.

| Data | Source | Used for |
|---|---|---|
| Prior-day observations | `GET /morning-brief` | Flags (Diego low-stim, parent note) |
| Emerging mastery gaps | `GET /morning-brief` | Intervention signals (Jaylen fraction error) |
| Absent students | `GET /morning-brief` | Catchup notes (Marcus missed intro) |
| Draft lessons/packets | `GET /lessons?status=draft` | "In the basket" / pending items |
| Current read-aloud | `GET /config` → `preferences.current_readaloud` | Reading tracker widget |

On **Tier 2**: `GET /morning-brief` returns Ollama-generated prose. The companion renders it verbatim in her own voice (Wren's italic, Apex's monospace flags, etc.) — the prose generation prompt should include the companion's personality.

On **Tier 1**: `GET /morning-brief` returns structured JSON. The frontend renders each item as a list row. No companion prose. This is a known design gap — needs a Tier 1 companion UI variant.

---

## Classroom Background Photo

All five room files load `classroom-os-bg.js`. This script:

- Reads `localStorage` key `cos-bg-{filename}` on load and restores the background
- Compresses dropped/picked photos to max 1920px JPEG at 85% quality before storing
- Exposes `window.cosPickBackground()` (file picker) and `window.cosResetBackground()` (reset to default)
- Adds `body.cos-drop-active` class during drag — each theme has its own drag indicator style

In production (Electron), consider migrating storage from `localStorage` to a file written via IPC (`~/.classroom-os/config.json` or a dedicated `prefs/` directory) to avoid the ~5MB localStorage ceiling on large photos.

---

## Open Decisions

From the backend architecture doc:

1. **Electron vs. local server + browser tab** — Electron is the stronger end-state. UI assumes Electron.
2. **sqlite-vec vs. ChromaDB** — Tier detection switches automatically. UI shows retrieval readiness from `GET /documents/index/status`.
3. **Standards bundle** — NM CCSS + NM-specific for pilot. Standards list is static JSON bundled with app.
4. **PIN vs. OS auth** — PIN acceptable for v1.
5. **Tier 3 network auth** — deferred.

UI-specific open decisions:

6. **Session scope key names** — the eight keys proposed above (`roster_visible`, `iep_visible`, etc.) need confirmation before wiring the session-auth dialog to `PATCH /config`.
7. **Companion personality in `GET /morning-brief`** — the backend needs to know which archetype the teacher is using so the Ollama prompt includes the right personality. Either pass `?companion=wren` as a query param, or store it in `config.json` as `preferences.archetype`.
8. **Tier 1 companion UI** — no prose at Tier 1. Needs a distinct layout for the companion sidebar that renders structured items without the italic voice. Not designed yet.
9. **Schedule setup flow** — `schedule` table starts empty. Teachers need a first-run flow to enter their period structure before Today's Workspace is useful. Not designed yet.
10. **`current_readaloud` in preferences** — the reading tracker widget reads this from config. Key name and update flow not specified in backend doc.

---

*Designed May 2026. SAFE Design System. Local-first. No cloud.*
