// Today's Workspace — Layout A: structured grid.
// Wide desktop dashboard: nav, hero, schedule strip across the top, then
// a 2-col split (Next up | Attention) and a 3-card lower row.

function WorkspaceGridArtboard() {
  return (
    <div className="ab ws-a">
      <style>{`
        .ws-a { width: 100%; min-height: 100%; padding: 0; }

        .ws-a-nav {
          height: 56px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; background: var(--bg);
          position: sticky; top: 0; z-index: 5;
        }
        .ws-a-wm { font-size: 14px; font-weight: 700; letter-spacing: 0.14em;
                   text-transform: uppercase; }
        .ws-a-nav-right { display: flex; align-items: center; gap: 1.5rem;
                          font-size: 13px; color: var(--fg-muted); }
        .ws-a-session {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.25rem 0.6rem; border: 1px solid var(--border);
          border-radius: 3px; font-family: var(--font-mono); font-size: 11px;
          letter-spacing: 0.06em; color: var(--fg-muted);
        }
        .ws-a-session .dot { width: 6px; height: 6px; border-radius: 50%;
                             background: var(--accent); }
        .ws-a-tier {
          font-size: 11px; font-family: var(--font-mono); letter-spacing: 0.06em;
          color: var(--fg-muted);
        }
        .ws-a-tier strong { color: var(--accent); font-weight: 600; }

        .ws-a-body { padding: 2.5rem; }

        .ws-a-hero {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 2rem;
        }
        .ws-a-h1 { font-size: 2.4rem; font-weight: 700; letter-spacing: -0.025em;
                   line-height: 1.15; }
        .ws-a-sub { color: var(--fg-muted); font-size: 17px; margin-top: 0.35rem; }
        .ws-a-sub em { color: var(--fg); font-style: italic; }
        .ws-a-quick { display: flex; gap: 0.5rem; }
        .ws-a-quick button {
          font-family: inherit; font-size: 13px; font-weight: 600;
          padding: 0.55rem 1rem; border-radius: 4px; cursor: pointer;
          border: 1px solid var(--border); background: transparent; color: var(--fg);
          transition: border-color 0.15s, color 0.15s;
        }
        .ws-a-quick button:hover { border-color: var(--accent); color: var(--accent); }
        .ws-a-quick .pri { background: var(--accent); color: #fff; border-color: var(--accent); }
        .ws-a-quick .pri:hover { background: var(--accent-hover); }

        /* Schedule strip */
        .ws-a-strip {
          display: grid; grid-template-columns: repeat(9, 1fr);
          gap: 0; margin-bottom: 2rem;
          border: 1px solid var(--border); border-radius: 4px;
          background: var(--bg); overflow: hidden;
        }
        .ws-a-slot {
          padding: 0.85rem 0.9rem;
          border-right: 1px solid var(--border);
          position: relative;
        }
        .ws-a-slot:last-child { border-right: none; }
        .ws-a-slot--now { background: var(--accent-light); }
        .ws-a-slot--break { background: var(--surface-sunken); }
        .ws-a-slot-time { font-family: var(--font-mono); font-size: 11px;
                          color: var(--fg-muted); letter-spacing: 0.04em; }
        .ws-a-slot-name { font-size: 13px; font-weight: 600; color: var(--fg);
                          margin-top: 0.25rem; line-height: 1.3; }
        .ws-a-slot-meta { font-size: 11px; color: var(--fg-muted); margin-top: 0.2rem; }
        .ws-a-slot-tag {
          position: absolute; top: 0.6rem; right: 0.6rem;
          font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
          font-family: var(--font-mono); color: var(--accent);
          text-transform: uppercase;
        }

        /* Main split */
        .ws-a-split {
          display: grid; grid-template-columns: 2fr 1fr;
          gap: 1.5rem; margin-bottom: 1.5rem;
        }

        .ws-a-card {
          border: 1px solid var(--border); border-radius: 4px;
          padding: 1.5rem; background: var(--bg);
        }
        .ws-a-card-head {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 1rem;
        }
        .ws-a-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent);
        }
        .ws-a-card-meta {
          font-size: 12px; color: var(--fg-muted); font-family: var(--font-mono);
        }

        /* Next up big card */
        .ws-a-next-line {
          font-family: var(--font-mono); font-size: 12px; color: var(--fg-muted);
          letter-spacing: 0.04em; margin-bottom: 0.5rem;
        }
        .ws-a-next-h {
          font-size: 1.7rem; font-weight: 700; letter-spacing: -0.015em;
          line-height: 1.2; margin-bottom: 0.5rem;
        }
        .ws-a-next-sub {
          color: var(--fg-muted); font-size: 15px; line-height: 1.55;
          margin-bottom: 1.25rem;
        }
        .ws-a-next-sub em { color: var(--fg); font-style: italic; }
        .ws-a-next-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 0.75rem; margin-bottom: 1.25rem;
          padding-top: 1.25rem; border-top: 1px solid var(--border);
        }
        .ws-a-stat-num { font-size: 1.6rem; font-weight: 700;
                         letter-spacing: -0.02em; color: var(--fg); }
        .ws-a-stat-num small { font-size: 0.6em; color: var(--fg-muted);
                                font-weight: 500; }
        .ws-a-stat-lbl { font-size: 11px; color: var(--fg-muted);
                         letter-spacing: 0.08em; text-transform: uppercase;
                         margin-top: 0.25rem; font-weight: 600; }
        .ws-a-next-mat {
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .ws-a-mat-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.55rem 0.75rem; background: var(--surface-sunken);
          border-radius: 3px; font-size: 13px;
        }
        .ws-a-mat-row .name { color: var(--fg); font-weight: 500; }
        .ws-a-mat-row .meta { color: var(--fg-muted); font-family: var(--font-mono);
                              font-size: 11px; }
        .ws-a-mat-row .meta em { color: var(--accent); font-style: normal;
                                 font-weight: 600; }
        .ws-a-next-cta { margin-top: 1.25rem; padding-top: 1.25rem;
                         border-top: 1px solid var(--border);
                         display: flex; gap: 0.5rem; }
        .ws-a-btn {
          font-family: inherit; font-size: 14px; font-weight: 600;
          padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;
          border: 1px solid transparent;
        }
        .ws-a-btn--pri { background: var(--accent); color: #fff; }
        .ws-a-btn--pri:hover { background: var(--accent-hover); }
        .ws-a-btn--sec { background: transparent; border-color: var(--border);
                         color: var(--fg); }
        .ws-a-btn--sec:hover { border-color: var(--accent); color: var(--accent); }

        /* Attention list */
        .ws-a-att { display: flex; flex-direction: column; gap: 0; }
        .ws-a-att-row {
          display: flex; gap: 0.75rem;
          padding: 0.85rem 0; border-bottom: 1px solid var(--border);
        }
        .ws-a-att-row:first-of-type { padding-top: 0; }
        .ws-a-att-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ws-a-att-marker {
          font-family: var(--font-mono); font-size: 10px; font-weight: 700;
          letter-spacing: 0.06em; padding: 2px 5px; border-radius: 2px;
          height: fit-content; flex-shrink: 0;
        }
        .ws-a-att-marker--warn { background: var(--warn-soft-bg); color: var(--warn-soft-fg); }
        .ws-a-att-marker--info { background: var(--info-soft-bg); color: var(--info-soft-fg); }
        .ws-a-att-marker--neut { background: var(--neutral-soft-bg); color: var(--neutral-soft-fg); }
        .ws-a-att-body strong { display: block; font-size: 14px;
                                font-weight: 600; color: var(--fg);
                                margin-bottom: 0.15rem; }
        .ws-a-att-body span { font-size: 13px; color: var(--fg-muted);
                              line-height: 1.5; }
        .ws-a-att-body em { color: var(--fg); font-style: italic; }
        .ws-a-att-body a { color: var(--accent); font-weight: 600; }

        /* Lower row */
        .ws-a-lower {
          display: grid; grid-template-columns: 1fr 1fr 1fr;
          gap: 1.5rem;
        }

        .ws-a-li { padding: 0.65rem 0; border-bottom: 1px solid var(--border);
                   font-size: 14px; display: flex; justify-content: space-between;
                   align-items: center; gap: 1rem; }
        .ws-a-li:last-child { border-bottom: none; }
        .ws-a-li-text strong { display: block; font-weight: 500; color: var(--fg);
                                line-height: 1.4; }
        .ws-a-li-text span { font-size: 12px; color: var(--fg-muted);
                              font-family: var(--font-mono); letter-spacing: 0.03em; }
        .ws-a-li-pct {
          font-family: var(--font-mono); font-size: 11px;
          color: var(--accent); font-weight: 700; flex-shrink: 0;
        }
        .ws-a-progress {
          height: 2px; background: var(--border); border-radius: 1px;
          margin-top: 4px; overflow: hidden;
        }
        .ws-a-progress > span {
          display: block; height: 100%; background: var(--accent);
        }
      `}</style>

      <div className="ws-a-nav">
        <div className="ws-a-wm">TEACHERS TOOL</div>
        <div className="ws-a-nav-right">
          <span className="ws-a-tier">Tier 2 · <strong>local model ready</strong></span>
          <span className="ws-a-session">
            <span className="dot" /> P1 · 50:00 remaining
          </span>
          <a href="#">Ms. Chen ↗</a>
        </div>
      </div>

      <div className="ws-a-body">
        <div className="ws-a-hero">
          <div>
            <div className="ws-a-h1">Tuesday, October 14.</div>
            <div className="ws-a-sub">
              Period 1 begins in <em>14 minutes</em>. 26 students expected. 3 items want a look.
            </div>
          </div>
          <div className="ws-a-quick">
            <button className="pri">Take attendance</button>
            <button>Start a lesson</button>
            <button>Ask the assistant</button>
          </div>
        </div>

        {/* Schedule strip */}
        <div className="ws-a-strip">
          <div className="ws-a-slot ws-a-slot--now">
            <div className="ws-a-slot-tag">Now</div>
            <div className="ws-a-slot-time">8:15 — 9:05</div>
            <div className="ws-a-slot-name">Math · Fractions on a number line</div>
            <div className="ws-a-slot-meta">P1 · Rm 214</div>
          </div>
          <div className="ws-a-slot">
            <div className="ws-a-slot-time">9:10 — 10:00</div>
            <div className="ws-a-slot-name">Reading · Bridge to Terabithia 4–5</div>
            <div className="ws-a-slot-meta">P2</div>
          </div>
          <div className="ws-a-slot ws-a-slot--break">
            <div className="ws-a-slot-time">10:00 — 10:20</div>
            <div className="ws-a-slot-name">Recess</div>
            <div className="ws-a-slot-meta">—</div>
          </div>
          <div className="ws-a-slot">
            <div className="ws-a-slot-time">10:20 — 11:10</div>
            <div className="ws-a-slot-name">Science · States of matter lab</div>
            <div className="ws-a-slot-meta">P3 · Lab B</div>
          </div>
          <div className="ws-a-slot">
            <div className="ws-a-slot-time">11:15 — 12:05</div>
            <div className="ws-a-slot-name">Social Studies · Civil Rights, Day 2</div>
            <div className="ws-a-slot-meta">P4</div>
          </div>
          <div className="ws-a-slot ws-a-slot--break">
            <div className="ws-a-slot-time">12:10 — 12:55</div>
            <div className="ws-a-slot-name">Lunch + prep</div>
            <div className="ws-a-slot-meta">—</div>
          </div>
          <div className="ws-a-slot">
            <div className="ws-a-slot-time">1:00 — 1:30</div>
            <div className="ws-a-slot-name">Math intervention</div>
            <div className="ws-a-slot-meta">Small group · 6 sts</div>
          </div>
          <div className="ws-a-slot">
            <div className="ws-a-slot-time">1:35 — 2:25</div>
            <div className="ws-a-slot-name">Writing workshop</div>
            <div className="ws-a-slot-meta">P5</div>
          </div>
          <div className="ws-a-slot">
            <div className="ws-a-slot-time">2:30 — 3:15</div>
            <div className="ws-a-slot-name">Silent reading + close</div>
            <div className="ws-a-slot-meta">P6</div>
          </div>
        </div>

        {/* Split */}
        <div className="ws-a-split">
          {/* Next up */}
          <div className="ws-a-card">
            <div className="ws-a-card-head">
              <div className="ws-a-label">Next up · Period 1</div>
              <div className="ws-a-card-meta">// pulled from your unit plan, lesson 14 of 28</div>
            </div>
            <div className="ws-a-next-line">5.NF.A.2 · CCSS Math · 50 min</div>
            <div className="ws-a-next-h">Fractions on a number line.</div>
            <div className="ws-a-next-sub">
              Today: students place mixed numbers (e.g. 2 ⅓, 1 ¾) on a stretched
              number line and compare distances. <em>Yesterday's exit ticket showed
              Jaylen and four others still locating by numerator only</em> — the warm-up
              targets that misconception directly.
            </div>

            <div className="ws-a-next-grid">
              <div>
                <div className="ws-a-stat-num">26<small> / 27</small></div>
                <div className="ws-a-stat-lbl">Expected today</div>
              </div>
              <div>
                <div className="ws-a-stat-num">5<small> flagged</small></div>
                <div className="ws-a-stat-lbl">Misconception watch</div>
              </div>
              <div>
                <div className="ws-a-stat-num">2<small> adapted</small></div>
                <div className="ws-a-stat-lbl">IEP variants ready</div>
              </div>
            </div>

            <div className="ws-a-next-mat">
              <div className="ws-a-mat-row">
                <span className="name">Number-line warm-up · slide deck</span>
                <span className="meta">8 slides · last edited <em>11:02 PM Mon</em></span>
              </div>
              <div className="ws-a-mat-row">
                <span className="name">Exit ticket · 4 problems</span>
                <span className="meta">printable · 1 page</span>
              </div>
              <div className="ws-a-mat-row">
                <span className="name">Mia L. · audio-narrated variant</span>
                <span className="meta"><em>IEP accommodation</em> · 4:12 mp3</span>
              </div>
            </div>

            <div className="ws-a-next-cta">
              <button className="ws-a-btn ws-a-btn--pri">Open lesson</button>
              <button className="ws-a-btn ws-a-btn--sec">Project to board</button>
              <button className="ws-a-btn ws-a-btn--sec">Edit warm-up</button>
            </div>
          </div>

          {/* Attention */}
          <div className="ws-a-card">
            <div className="ws-a-card-head">
              <div className="ws-a-label">Wants a look</div>
              <div className="ws-a-card-meta">3</div>
            </div>
            <div className="ws-a-att">
              <div className="ws-a-att-row">
                <div className="ws-a-att-marker ws-a-att-marker--warn">PARENT</div>
                <div className="ws-a-att-body">
                  <strong>Diego R. · low-stim today</strong>
                  <span>Note from Mrs. Reyes at <em>7:14 AM</em>: rough morning, ask for reduced group work. Quiet alternative ready for P3 lab. <a href="#">Open thread →</a></span>
                </div>
              </div>
              <div className="ws-a-att-row">
                <div className="ws-a-att-marker ws-a-att-marker--info">CATCHUP</div>
                <div className="ws-a-att-body">
                  <strong>Marcus T. · absent yesterday</strong>
                  <span>Missed the number-line intro. Assistant drafted a 12-min catchup deck. <a href="#">Review →</a></span>
                </div>
              </div>
              <div className="ws-a-att-row">
                <div className="ws-a-att-marker ws-a-att-marker--neut">DRAFT</div>
                <div className="ws-a-att-body">
                  <strong>Friday's sub packet</strong>
                  <span>Still in draft. PD off-site Friday afternoon. Needs your signoff by Thursday EOD. <a href="#">Finish →</a></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lower row */}
        <div className="ws-a-lower">
          <div className="ws-a-card">
            <div className="ws-a-card-head">
              <div className="ws-a-label">Drafts in progress</div>
              <div className="ws-a-card-meta">3</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text">
                <strong>Civil Rights · Day 3 lesson</strong>
                <div className="ws-a-progress"><span style={{ width: '47%' }} /></div>
              </div>
              <div className="ws-a-li-pct">47%</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text">
                <strong>Parent email · Jaylen's family</strong>
                <span>fraction misconception · re: yesterday's exit ticket</span>
              </div>
              <div className="ws-a-li-pct">DRAFT</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text">
                <strong>Quiz · States of matter</strong>
                <span>auto-graded last night · awaiting review</span>
              </div>
              <div className="ws-a-li-pct">22 / 27</div>
            </div>
          </div>

          <div className="ws-a-card">
            <div className="ws-a-card-head">
              <div className="ws-a-label">Roster status</div>
              <div className="ws-a-card-meta">27 students</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text"><strong>Attendance</strong><span>not yet taken · P1</span></div>
              <div className="ws-a-li-pct">PENDING</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text"><strong>IEPs active</strong><span>Mia L., Devon H., Jasmin O.</span></div>
              <div className="ws-a-li-pct">3</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text"><strong>ESL · home language</strong><span>Spanish (4), Hindi (1), Vietnamese (1)</span></div>
              <div className="ws-a-li-pct">6</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text"><strong>New this year</strong><span>Marcus T., Priya S.</span></div>
              <div className="ws-a-li-pct">2</div>
            </div>
          </div>

          <div className="ws-a-card">
            <div className="ws-a-card-head">
              <div className="ws-a-label">Recent assistant work</div>
              <div className="ws-a-card-meta">// local, no cloud</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text">
                <strong>Differentiated 4 readings · grade 5 → 3</strong>
                <span>Bridge to Terabithia, Ch 4-5 · for Mia + Priya</span>
              </div>
              <div className="ws-a-li-pct">10:42PM</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text">
                <strong>Rubric draft · writing workshop</strong>
                <span>narrative paragraph · 4-point scale</span>
              </div>
              <div className="ws-a-li-pct">9:31PM</div>
            </div>
            <div className="ws-a-li">
              <div className="ws-a-li-text">
                <strong>Civil Rights Day 3 (running…)</strong>
                <span>5 of 9 agents complete · paused for review</span>
              </div>
              <div className="ws-a-li-pct">RESUME</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.WorkspaceGridArtboard = WorkspaceGridArtboard;
