# Quiet Corner — Teacher guide

Five steps for your first session. No account. Your data stays on your machine.

---

## 1. Start the app

From the project folder:

```bash
./serve.sh
```

Open **http://127.0.0.1:8080/onboarding.html** in Chrome, Firefox, or Safari.

---

## 2. Set up your room

- Enter your name.
- Choose a companion / room style (cosmetic only — same tools in every room).
- Add your weekly schedule (optional; you can skip empty periods).

You land in your themed room. Click **Records** in the nav or footer.

---

## 3. Add a student

In **Records** → **Students** → **+ Student**

Name and grade are enough for a pilot. Add pronouns or notes if useful.

---

## 4. Log an observation

**Records** → **Observe** → **+ Observation** (or the top bar button)

1. Pick the student and date.  
2. Check **pathways** (how they showed understanding): spoken, hands-on, written, etc.  
3. Check **Classroom Signals** when a standard phrase fits — same language as the [Classroom Signals guide](assessment-visibility-v1.1/classroom-signals.md).  
4. Write a short note: what you saw, in your words.

Save. The observation appears on Overview and in the student’s history.

---

## 5. Back up your work

**Records** → **Data**

- **Download backup** — saves a `.json` file (all students and observations). Do this weekly or before clearing browser data.  
- **Import backup** — restores from that file on this or another computer (after `./serve.sh` on the new machine).

---

## Principal or parent language

**Records** → **Reports** → pick student and report type → **Generate**

Uses your saved observations. Review before sharing; you remain the authority on what happened in the room.

---

## Tips

- **Observe first, document after** — the tool holds what you already noticed; it does not replace your judgment.  
- **Same browser, same URL** — always `http://127.0.0.1:8080/...` after `./serve.sh`.  
- **Framework background:** [White paper](assessment-visibility-v1.1/white-paper.md) · [Appendix E — teacher tools](assessment-visibility-v1.1/appendix-e.md)

---

*Quiet Corner · Your quiet place for observation.*
