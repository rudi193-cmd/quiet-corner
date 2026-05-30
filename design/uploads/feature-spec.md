@markdownai v1.0

# Local-First Classroom Operating System — Feature Specification

This document describes the feature set for a fully local, offline-capable classroom operating system for teachers. It does not specify implementation order, UI layout, or visual style.

---

## System Principles

- All data stored locally on the teacher's machine
- No student data transmitted to external servers
- No subscription or cloud account required
- Functions during internet outages
- Teacher retains full ownership of all lesson archives, student records, and AI outputs
- All AI outputs are editable
- Everything is exportable

---

## 1. Classroom Workspace

The central hub from which a teacher manages their full day.

- Today's schedule with lesson and transition tracking
- Lesson plan management (create, edit, archive, retrieve)
- Student roster and group management
- Attendance recording
- Assignment creation and tracking
- Announcement drafting

---

## 2. AI Lesson Engine

Generates and adapts instructional materials locally.

**Generation capabilities:**
- Differentiated lesson plans
- Multiple reading level variants of the same content
- Quizzes and assessments
- Rubrics
- Standards-aligned objectives
- IEP accommodation suggestions
- Multilingual translations
- Discussion prompts
- Substitute teacher packets
- Printable worksheets
- Socratic questioning chains
- Project-based learning scaffolds

**Teacher style memory:**
- Stores the teacher's preferred formats, tone, pacing, and classroom constraints locally
- Applies remembered preferences to future generation requests without re-specifying them each time
- Examples: preferred grade-level inquiry format, humor conventions from prior units, activity restrictions by day, accessibility adjustments

---

## 3. Local Student Knowledge Graph

Persistent local profiles for each student, built from ongoing classroom data.

**Data tracked per student:**
- Academic strengths and weaknesses
- Known misconceptions
- Participation patterns
- Reading level
- Preferred learning modalities
- Special education or intervention history
- Behavioral patterns relevant to learning
- Mastery progression by topic

**AI query interface:**
- Natural-language queries over the graph (e.g., "Who still hasn't demonstrated fraction fluency?", "Which students need lower-stimulation tasks today?")
- Generates targeted tasks, groupings, or interventions based on current graph state

---

## 4. Assessment and Feedback System

**Grading inputs:**
- Handwritten work via OCR
- Rubric-based grading
- Speech feedback recording
- Inline annotation of student work
- Standards mapping per assessment item

**Analysis:**
- Local embedding-based similarity for originality checking (no external service)
- Growth tracking over time per student and per standard
- Explanation generation: produces a specific explanation of why an answer is incorrect, not just a score

---

## 5. Live Classroom Mode

Tools active during instruction.

- Projector or display output mode
- Instant poll generation and display
- Classroom discussion tracking
- Pacing timers with transition prompts
- Live Q&A queue management
- Random student selector
- Group formation optimization based on student knowledge graph

---

## 6. Multi-Agent Workflows

Specialized agents that can collaborate on complex teacher requests.

**Agent types:**
- Curriculum Agent — unit and lesson sequencing
- Assessment Agent — quiz, rubric, and feedback generation
- Behavioral Support Agent — classroom management suggestions
- Special Education Agent — IEP alignment, accommodation application
- Parent Communication Agent — drafts emails and progress updates
- Classroom Activity Designer — generates activities and materials
- Reading-Level Adapter — rewrites content at target reading levels
- Science Lab Safety Checker — reviews lab procedures for safety issues
- Debate Moderator — structures discussion and argumentation scaffolds
- Historical Accuracy Reviewer — flags anachronisms or factual errors in lesson content

**Collaboration model:**
- A single high-level teacher request (e.g., "Build a 5-day Civil Rights unit") dispatches multiple agents in sequence or parallel
- Agents produce: standards alignment, assessments, ESL adaptations, slides, worksheets, parent communication, extension activities, timing estimates, and classroom management notes
- All outputs are local

---

## 7. Retrieval Layer

A local vector database the AI reasons over, containing the teacher's actual working context.

**Contents:**
- District and state academic standards
- Adopted textbooks and course materials
- Teacher-authored documents
- Past lesson plans
- Student-facing PDFs and handouts
- Classroom policies

The AI generates responses grounded in these materials rather than generic training data alone.

---

## 8. Hardware Tiers

**Tier 1 — No GPU (school-issued or low-spec laptop):**
- Lightweight AI assistance
- Retrieval-based responses
- Grading support
- Simple text generation

**Tier 2 — Consumer GPU or high-spec personal machine:**
- Full lesson generation
- Multimodal inputs (handwriting OCR, speech)
- Advanced multi-agent workflows

**Tier 3 — School server:**
- Single on-premises server shared across classrooms
- Shared model access for all teachers in the building
- District-wide resource libraries
- Collaborative lesson sharing within the school
- Private, no external cloud dependency

---

## 9. Longitudinal Memory

The system accumulates classroom intelligence across school years.

**What it learns over time:**
- Which lesson formats consistently underperform
- Which examples and analogies produce demonstrated understanding
- Which pacing patterns work for this teacher's student population
- Which students historically struggle early in a topic (early intervention signal)
- Recurring classroom dynamics and how they were resolved

**Result:** After multiple years of use, the AI's suggestions are grounded in this teacher's actual history, not generic best-practice defaults.

---

## 10. Export and Interoperability

- Full export of all data: lessons, student records, assessments, AI interaction history
- No vendor lock-in: exported formats are open (JSON, Markdown, CSV, PDF)
- Teacher can selectively export reporter-additions vs. full dataset
- AI outputs are always editable before use or storage
- Option for deterministic (non-AI) workflows for tasks where consistency matters more than generation
