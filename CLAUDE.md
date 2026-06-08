# Quiet Corner

**Tagline:** Your quiet place for observation.

Standalone tool for K-12 teachers (Montessori pilots first). Runs on any machine. HTML-based, expressive. Internal code prefix `cos_*` (Classroom OS legacy) — rename files when convenient.

The white paper this implements: `assessment-visibility-v1.1` (CC BY 4.0, Sean Campbell / Emerging Rule)

## What this app is

The operational interface to the Assessment Visibility framework. The white paper (section 7.6)
says explicitly: "Educator-facing materials are not ancillary. They are the operational interface
of the framework."

## What it must do

1. **Document expressive pathway observations** — embodied, verbal, reflective, persona/narrative.
   Not just written output. Multiple pathways = more accurate picture of understanding.

2. **Surface the Classroom Signals vocabulary** — shared professional language for teachers
   observing cognition. (e.g. "The student accurately represented the core concept through
   non-written expression.")

3. **Generate administrator-legible language** — E4 (How to Explain This to Your Principal).
   The teacher shouldn't have to translate the framework upward; the tool does it.

4. **Sequence AI after engagement** — UTETY personas are the secondary scaffold.
   They never precede sense-making. They support reflection and articulation after.

5. **Map understanding across pathways** — this is LevelShip's domain.
   Under-seen ≠ under-capable. The map shows what the test missed.

## Design constraints (from the framework)

- No medicalization or diagnostic inference
- No deficit-based language
- No surveillance-oriented transparency
- Teacher judgment is central and irreplaceable — no tool supersedes it
- Platform-agnostic — no product names in the framework itself
- Posole criterion: works for a teacher with 30 students and no prep

## Backup (pilot)

- `cosData.exportBackup()` / `downloadBackup()` / `importBackup(file, {merge})` in `qc-data.js`
- UI: Records → **Data** panel — explicit teacher action only; JSON format `quiet-corner-backup` v1
- Docs: `README.md`, `docs/TEACHER_GUIDE.md`

## What's still open

- Backend: local Willow instance, hosted API, or both?
- Auth model: single-teacher local vs. multi-teacher shared
- Scope for v1: observation docs + signals vocabulary? or full skill mapping too?
- Relationship to LevelShip (Emerging Rule product)

## Source context

- White paper: `docs/assessment-visibility-v1.1/` (canonical copy for this repo)
- Mirror: `~/github/willow-2.0/worktrees/upstream-emerging-rule-community/research/assessment-visibility-v1.1/`
- Related: Emerging-Rule/community lessons, UTETY persona stack, LevelShip
- Companion materials: appendix-a through appendix-e, classroom-signals.md, assessment-visibility-v1.1.json
