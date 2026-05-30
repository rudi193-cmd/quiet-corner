// Today's Workspace — Layout B: editorial column.
// Same Tuesday, told as a daily briefing. Vertical timeline on the left;
// narrow prose column on the right. Less dashboard, more morning paper.

function WorkspaceEditorialArtboard() {
  return (
    <div className="ab ws-b">
      <style>{`
        .ws-b { width: 100%; min-height: 100%; }

        .ws-b-nav {
          height: 56px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; background: var(--bg);
        }
        .ws-b-wm { font-size: 14px; font-weight: 700; letter-spacing: 0.14em;
                   text-transform: uppercase; }
        .ws-b-nav-right { display: flex; align-items: center; gap: 1.5rem;
                          font-size: 13px; color: var(--fg-muted); }
        .ws-b-session {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
          color: var(--fg-muted); display: flex; align-items: center; gap: 0.5rem;
        }
        .ws-b-session .dot { width: 6px; height: 6px; border-radius: 50%;
                             background: var(--accent); }

        .ws-b-body {
          display: grid; grid-template-columns: 320px 1fr 280px;
          gap: 3rem; padding: 3rem 3rem 4rem;
          max-width: 1340px; margin: 0 auto;
        }

        /* Timeline */
        .ws-b-timeline { position: relative; padding-left: 1.5rem; }
        .ws-b-timeline::before {
          content: ''; position: absolute; left: 5px; top: 0.7rem; bottom: 0.3rem;
          width: 1px; background: var(--border);
        }
        .ws-b-tl-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 1.5rem; margin-left: -0.5rem;
        }
        .ws-b-event {
          position: relative; padding: 0.85rem 0;
          border-bottom: 1px dashed var(--border);
        }
        .ws-b-event:last-child { border-bottom: none; }
        .ws-b-event::before {
          content: ''; position: absolute; left: -1.25rem; top: 1.1rem;
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--bg); border: 1.5px solid var(--fg-muted);
        }
        .ws-b-event--now::before {
          background: var(--accent); border-color: var(--accent);
          box-shadow: 0 0 0 4px var(--accent-light);
        }
        .ws-b-event--break::before { border-color: var(--border); }
        .ws-b-event--past { opacity: 0.45; }
        .ws-b-event--past::before { background: var(--fg-muted); border-color: var(--fg-muted); }
        .ws-b-ev-time {
          font-family: var(--font-mono); font-size: 11px; color: var(--fg-muted);
          letter-spacing: 0.04em;
        }
        .ws-b-ev-name { font-size: 14px; font-weight: 600; color: var(--fg);
                        margin-top: 0.2rem; line-height: 1.35; }
        .ws-b-event--now .ws-b-ev-name { color: var(--accent); }
        .ws-b-ev-meta { font-size: 12px; color: var(--fg-muted); margin-top: 0.2rem; }
        .ws-b-ev-tag {
          font-family: var(--font-mono); font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em; color: var(--accent); text-transform: uppercase;
          margin-left: 0.5rem;
        }

        /* Center prose column */
        .ws-b-main { max-width: 580px; }
        .ws-b-date {
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--fg-muted);
          padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);
          display: flex; justify-content: space-between;
        }
        .ws-b-h1 {
          font-size: 2.75rem; font-weight: 700; letter-spacing: -0.025em;
          line-height: 1.1; margin: 1.5rem 0 1rem;
        }
        .ws-b-h1 em { color: var(--accent); font-style: italic; }
        .ws-b-lede {
          font-size: 18px; line-height: 1.65; color: var(--fg-muted-soft);
          margin-bottom: 2rem;
        }

        .ws-b-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent);
          margin: 2.5rem 0 0.75rem;
        }
        .ws-b-h2 {
          font-size: 1.35rem; font-weight: 700; letter-spacing: -0.01em;
          margin-bottom: 0.75rem; line-height: 1.25;
        }
        .ws-b-p {
          font-size: 16px; line-height: 1.7; color: var(--fg);
          margin-bottom: 1rem;
        }
        .ws-b-p em { font-style: italic; color: var(--fg); }
        .ws-b-p .muted { color: var(--fg-muted); }

        .ws-b-pull {
          border-left: 3px solid var(--accent);
          padding: 0.25rem 0 0.25rem 1.25rem;
          font-size: 17px; line-height: 1.5; color: var(--fg);
          font-style: italic; margin: 1.25rem 0;
        }
        .ws-b-pull cite {
          display: block; font-style: normal; font-size: 12px;
          color: var(--fg-muted); margin-top: 0.5rem;
          font-family: var(--font-mono); letter-spacing: 0.04em;
        }

        .ws-b-card {
          border: 1px solid var(--border); border-radius: 4px;
          padding: 1.25rem; margin: 1.5rem 0;
          background: var(--accent-light);
        }
        .ws-b-card-h {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 0.5rem;
        }
        .ws-b-card-body { font-size: 14px; line-height: 1.6; color: var(--fg); }
        .ws-b-card-body strong { display: block; margin-bottom: 0.25rem; font-weight: 600; }

        .ws-b-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .ws-b-btn {
          font-family: inherit; font-size: 13px; font-weight: 600;
          padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;
          border: 1px solid transparent;
        }
        .ws-b-btn--pri { background: var(--accent); color: #fff; }
        .ws-b-btn--pri:hover { background: var(--accent-hover); }
        .ws-b-btn--sec { background: transparent; border-color: var(--border); color: var(--fg); }
        .ws-b-btn--sec:hover { border-color: var(--accent); color: var(--accent); }

        /* Right rail */
        .ws-b-rail { font-size: 13px; }
        .ws-b-rail-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--fg-muted);
          padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);
          margin-bottom: 0.85rem;
        }
        .ws-b-rail-item {
          padding: 0.75rem 0; border-bottom: 1px solid var(--border);
        }
        .ws-b-rail-item:last-child { border-bottom: none; }
        .ws-b-rail-item strong {
          display: block; font-size: 13px; font-weight: 600; color: var(--fg);
          margin-bottom: 0.2rem; line-height: 1.4;
        }
        .ws-b-rail-item span { color: var(--fg-muted); font-size: 12px;
                               line-height: 1.5; }
        .ws-b-rail-item em { color: var(--fg); font-style: italic; }
        .ws-b-rail-mono { font-family: var(--font-mono); font-size: 11px;
                          color: var(--fg-muted); letter-spacing: 0.04em; }
        .ws-b-rail-block { margin-bottom: 2.5rem; }
      `}</style>

      <div className="ws-b-nav">
        <div className="ws-b-wm">TEACHERS TOOL</div>
        <div className="ws-b-nav-right">
          <span className="ws-b-session"><span className="dot" /> P1 · 50:00 remaining</span>
          <a href="#">Ms. Chen ↗</a>
        </div>
      </div>

      <div className="ws-b-body">
        {/* Timeline */}
        <aside className="ws-b-timeline">
          <div className="ws-b-tl-label">Today</div>

          <div className="ws-b-event ws-b-event--past">
            <div className="ws-b-ev-time">7:45 — 8:10</div>
            <div className="ws-b-ev-name">Morning prep</div>
          </div>
          <div className="ws-b-event ws-b-event--now">
            <div className="ws-b-ev-time">8:15 — 9:05<span className="ws-b-ev-tag">Now · 14 min</span></div>
            <div className="ws-b-ev-name">P1 · Math</div>
            <div className="ws-b-ev-meta">Fractions on a number line</div>
          </div>
          <div className="ws-b-event">
            <div className="ws-b-ev-time">9:10 — 10:00</div>
            <div className="ws-b-ev-name">P2 · Reading</div>
            <div className="ws-b-ev-meta">Bridge to Terabithia, Ch 4–5</div>
          </div>
          <div className="ws-b-event ws-b-event--break">
            <div className="ws-b-ev-time">10:00 — 10:20</div>
            <div className="ws-b-ev-name">Recess</div>
          </div>
          <div className="ws-b-event">
            <div className="ws-b-ev-time">10:20 — 11:10</div>
            <div className="ws-b-ev-name">P3 · Science</div>
            <div className="ws-b-ev-meta">States of matter — lab</div>
          </div>
          <div className="ws-b-event">
            <div className="ws-b-ev-time">11:15 — 12:05</div>
            <div className="ws-b-ev-name">P4 · Social Studies</div>
            <div className="ws-b-ev-meta">Civil Rights, Day 2</div>
          </div>
          <div className="ws-b-event ws-b-event--break">
            <div className="ws-b-ev-time">12:10 — 12:55</div>
            <div className="ws-b-ev-name">Lunch + prep</div>
          </div>
          <div className="ws-b-event">
            <div className="ws-b-ev-time">1:00 — 1:30</div>
            <div className="ws-b-ev-name">Math intervention</div>
            <div className="ws-b-ev-meta">Small group · 6 students</div>
          </div>
          <div className="ws-b-event">
            <div className="ws-b-ev-time">1:35 — 2:25</div>
            <div className="ws-b-ev-name">P5 · Writing workshop</div>
          </div>
          <div className="ws-b-event">
            <div className="ws-b-ev-time">2:30 — 3:15</div>
            <div className="ws-b-ev-name">P6 · Silent reading + close</div>
          </div>
        </aside>

        {/* Center prose column */}
        <main className="ws-b-main">
          <div className="ws-b-date">
            <span>Tuesday, October 14 · Week 7</span>
            <span>Vol. III · No. 042</span>
          </div>
          <h1 className="ws-b-h1">First period starts in <em>fourteen minutes.</em></h1>
          <p className="ws-b-lede">
            26 of 27 expected. Three items want a look before the bell — one
            from a parent, two from your assistant. Everything else can wait.
          </p>

          <div className="ws-b-eyebrow">First — Period 1</div>
          <h2 className="ws-b-h2">Fractions on a number line.</h2>
          <p className="ws-b-p">
            Lesson 14 of the unit. Students place mixed numbers on a stretched
            number line and compare distances. The exit ticket from yesterday
            showed <em>Jaylen and four others</em> still locating fractions by
            numerator alone — the warm-up targets exactly that misconception.
            Materials are ready: the eight-slide deck, an audio-narrated variant
            for Mia, and a print exit ticket.
          </p>
          <div className="ws-b-actions">
            <button className="ws-b-btn ws-b-btn--pri">Open lesson</button>
            <button className="ws-b-btn ws-b-btn--sec">Project to board</button>
            <button className="ws-b-btn ws-b-btn--sec">Edit warm-up</button>
          </div>

          <div className="ws-b-eyebrow">Wants a look</div>

          <div className="ws-b-card">
            <div className="ws-b-card-h">Parent note · 7:14 AM</div>
            <div className="ws-b-card-body">
              <strong>Diego R. — low-stim today.</strong>
              Mrs. Reyes flagged a rough morning. A quiet alternative is queued
              for the P3 lab so Diego can opt out of group work without singling
              himself out.
            </div>
          </div>

          <p className="ws-b-p">
            Marcus T. was out yesterday and missed the number-line intro. The
            assistant drafted a <em>twelve-minute catchup deck</em> overnight —
            review and assign before Period 1, or hand it to him at recess. The
            sub packet for Friday is still in draft; Thursday EOD is the deadline.
          </p>

          <div className="ws-b-pull">
            "When you skip the warm-up on Mondays, exit-ticket scores drop ~14%
            on Tuesdays. This is the third confirmation."
            <cite>— from your longitudinal memory, 18 mo. window</cite>
          </div>

          <div className="ws-b-eyebrow">Later today</div>
          <p className="ws-b-p">
            <em>Period 3 lab</em> uses dry ice — the safety checker flagged
            ventilation requirements and produced an updated handling sheet
            (signed off). <em>Period 4 Civil Rights, Day 2:</em> uses the
            differentiated reading set you and Aisha worked on Friday.
            <em> Math intervention</em> at 1:00 has Jaylen, Marcus, Sofia,
            Tobias, Lin, and Emmy.
          </p>
        </main>

        {/* Right rail */}
        <aside className="ws-b-rail">
          <div className="ws-b-rail-block">
            <div className="ws-b-rail-label">Drafts</div>
            <div className="ws-b-rail-item">
              <strong>Civil Rights · Day 3</strong>
              <span>47% · resumed last night · 5 of 9 agents complete</span>
            </div>
            <div className="ws-b-rail-item">
              <strong>Parent email · Jaylen's family</strong>
              <span>re: fraction misconception · awaiting your edit</span>
            </div>
            <div className="ws-b-rail-item">
              <strong>States of matter quiz</strong>
              <span><em>auto-graded</em> · 22 of 27 ready to review</span>
            </div>
            <div className="ws-b-rail-item">
              <strong>Friday sub packet</strong>
              <span>PD off-site · needs signoff by Thu EOD</span>
            </div>
          </div>

          <div className="ws-b-rail-block">
            <div className="ws-b-rail-label">Roster</div>
            <div className="ws-b-rail-item">
              <strong>27 enrolled</strong>
              <span>26 expected today · 1 family-trip absence (Theo W.)</span>
            </div>
            <div className="ws-b-rail-item">
              <strong>IEPs active · 3</strong>
              <span>Mia L., Devon H., Jasmin O.</span>
            </div>
            <div className="ws-b-rail-item">
              <strong>ESL · 6</strong>
              <span>Spanish (4), Hindi (1), Vietnamese (1)</span>
            </div>
          </div>

          <div className="ws-b-rail-block">
            <div className="ws-b-rail-label">System</div>
            <div className="ws-b-rail-item">
              <span className="ws-b-rail-mono">tier 2 · gpu local</span>
              <span style={{ display: 'block', marginTop: 4 }}>Full agents available</span>
            </div>
            <div className="ws-b-rail-item">
              <span className="ws-b-rail-mono">storage · 4.2GB / local</span>
              <span style={{ display: 'block', marginTop: 4 }}>3 years of archives</span>
            </div>
            <div className="ws-b-rail-item">
              <span className="ws-b-rail-mono">session · expires 9:05</span>
              <span style={{ display: 'block', marginTop: 4 }}>P1 authorization · re-auth at bell</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

window.WorkspaceEditorialArtboard = WorkspaceEditorialArtboard;
