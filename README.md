# Quiet Corner

**Your quiet place for observation.**

A local-first browser app for K–12 teachers (Montessori pilots first). Document what you already see — expressive pathways, Classroom Signals, language for parent and principal conversations — without sending student data to the cloud.

Implements [Assessment Visibility v1.1](docs/assessment-visibility-v1.1/) (CC BY 4.0).

---

## Quick start

**Requirements:** Python 3 (for the local server only).

```bash
cd quiet-corner
./serve.sh
```

Open in your browser:

**http://127.0.0.1:8080/onboarding.html**

Complete onboarding, then use **Records** for students and observations.

> **Important:** Do not open HTML files by double-clicking (`file://`). Browsers isolate storage per file and onboarding will loop. Always use `./serve.sh`.

---

## Where to work

| Page | Purpose |
|------|---------|
| [onboarding.html](onboarding.html) | First run: name, archetype, schedule |
| [records.html](records.html) | **Main app** — students, observations, signals, reports, backup |
| [classroom-os.html](classroom-os.html) | Hub — pick a themed room (same data everywhere) |
| [landing.html](landing.html) | About the framework |

The themed rooms (Book Nook, Cottagecore, etc.) share one data layer. **Records** is where observation work happens.

---

## Your data

- Stored in **this browser only** (`localStorage`, keys prefixed `cos_`).
- Survives refresh while you keep using the same URL (`http://127.0.0.1:8080/...`).
- **Backup:** Records → **Data** → *Download backup* (JSON file). Copy that file to USB, email yourself, or another machine.
- **Restore:** Records → **Data** → *Import backup* (choose merge or replace — see [Teacher guide](docs/TEACHER_GUIDE.md)).

Clearing site data in browser settings deletes your classroom records.

---

## Docs

- [Teacher guide](docs/TEACHER_GUIDE.md) — first session in five steps  
- [Framework index](docs/README.md) — white paper and Classroom Signals  
- [CLAUDE.md](CLAUDE.md) — product intent for agents and developers  

---

## License

Assessment Visibility materials: CC BY 4.0. App code: see repository owner.
