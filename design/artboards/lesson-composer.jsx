// Lesson Composer — Paper composer (left + center) with a Terminal sidecar
// (right) showing the model trace. The teacher edits a lesson; the assistant
// streams what it's grounded in. Style-memory chips above influence generation.

function LessonComposerArtboard() {
  return (
    <div className="ab lc">
      <style>{`
        .lc { width: 100%; height: 100%; display: grid;
              grid-template-columns: 280px 1fr 380px; }

        /* ---------- Left rail (Paper) ---------- */
        .lc-left {
          background: var(--bg);
          border-right: 1px solid var(--border);
          padding: 1.5rem 1.25rem;
          overflow: hidden;
        }
        .lc-wm { font-size: 13px; font-weight: 700; letter-spacing: 0.14em;
                 text-transform: uppercase; }
        .lc-wm small { font-weight: 400; color: var(--fg-muted);
                       margin-left: 0.5rem; letter-spacing: 0.04em; }
        .lc-section-label {
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--fg-muted);
          margin: 1.75rem 0 0.6rem;
        }
        .lc-tree { font-size: 13px; }
        .lc-tree-item {
          padding: 0.4rem 0; color: var(--fg-muted); cursor: pointer;
          display: flex; justify-content: space-between; gap: 0.5rem;
          border-bottom: 1px solid transparent;
        }
        .lc-tree-item--on {
          color: var(--accent); font-weight: 600;
          background: var(--accent-light);
          margin: 0 -0.5rem; padding: 0.4rem 0.5rem; border-radius: 3px;
        }
        .lc-tree-item .day { font-family: var(--font-mono); font-size: 11px; }

        .lc-style { font-size: 12px; line-height: 1.55; }
        .lc-chip {
          display: inline-flex; align-items: center; gap: 0.3rem;
          padding: 0.2rem 0.55rem; border: 1px solid var(--border);
          border-radius: 3px; font-size: 11px; color: var(--fg-muted);
          margin: 0 0.25rem 0.35rem 0; background: var(--bg);
          font-family: var(--font-sans);
        }
        .lc-chip-on {
          color: var(--accent); border-color: var(--accent); background: var(--accent-light);
        }
        .lc-chip .x { color: var(--fg-muted); font-family: var(--font-mono); opacity: 0.5; }

        .lc-memo-row {
          padding: 0.55rem 0; border-top: 1px dashed var(--border);
          font-size: 12px; line-height: 1.5;
        }
        .lc-memo-row:first-of-type { border-top: none; }
        .lc-memo-row strong { color: var(--fg); font-weight: 600; }
        .lc-memo-row span { color: var(--fg-muted); display: block; }

        /* ---------- Center composer ---------- */
        .lc-center {
          padding: 1.5rem 2.5rem 2rem; overflow: hidden;
          background: var(--bg);
        }
        .lc-bar {
          display: flex; justify-content: space-between; align-items: center;
          padding-bottom: 1rem; border-bottom: 1px solid var(--border);
          margin-bottom: 1.5rem;
        }
        .lc-bar-left { display: flex; align-items: center; gap: 0.75rem;
                       font-size: 12px; color: var(--fg-muted); }
        .lc-bar-left a:hover { color: var(--accent); }
        .lc-bar-state {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
          color: var(--accent); display: flex; align-items: center; gap: 0.4rem;
        }
        .lc-bar-state .dot { width: 6px; height: 6px; border-radius: 50%;
                              background: var(--accent);
                              animation: lc-pulse 1.4s infinite; }
        @keyframes lc-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .lc-bar-right { display: flex; gap: 0.5rem; }
        .lc-btn {
          font-family: inherit; font-size: 13px; font-weight: 600;
          padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;
          border: 1px solid var(--border); background: transparent; color: var(--fg);
        }
        .lc-btn--pri { background: var(--accent); color: #fff; border-color: var(--accent); }

        .lc-meta-grid {
          display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 0; margin-bottom: 1.5rem;
          border: 1px solid var(--border); border-radius: 4px;
        }
        .lc-meta-cell {
          padding: 0.7rem 0.9rem; border-right: 1px solid var(--border);
        }
        .lc-meta-cell:last-child { border-right: none; }
        .lc-meta-lbl { font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
                       text-transform: uppercase; color: var(--fg-muted); }
        .lc-meta-val { font-size: 14px; color: var(--fg); margin-top: 0.25rem;
                       font-weight: 500; }
        .lc-meta-val .mono { font-family: var(--font-mono); font-size: 12px;
                              color: var(--accent); }

        .lc-doc {
          padding-right: 0.5rem;
        }
        .lc-title {
          font-size: 2.1rem; font-weight: 700; letter-spacing: -0.02em;
          line-height: 1.15; margin-bottom: 0.4rem;
        }
        .lc-sub {
          font-size: 16px; color: var(--fg-muted); line-height: 1.55;
          margin-bottom: 2rem; max-width: 640px;
        }
        .lc-sub em { color: var(--fg); font-style: italic; }

        .lc-h2 {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent);
          margin: 2rem 0 0.5rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .lc-h2 .roman {
          font-family: var(--font-mono); color: var(--fg-muted);
          font-weight: 700; letter-spacing: 0.06em;
        }
        .lc-h3 {
          font-size: 1.05rem; font-weight: 600; margin-bottom: 0.5rem;
          color: var(--fg); line-height: 1.4;
        }
        .lc-p {
          font-size: 15px; line-height: 1.65; color: var(--fg);
          margin-bottom: 0.75rem; max-width: 640px;
        }
        .lc-p em { font-style: italic; color: var(--fg); }
        .lc-p .muted { color: var(--fg-muted); }

        .lc-block {
          padding: 0.85rem 1rem; border-left: 2px solid var(--accent);
          background: var(--accent-light);
          margin: 0.5rem 0 1rem; font-size: 14px; line-height: 1.6;
          border-radius: 0 3px 3px 0;
        }
        .lc-block .lc-block-h {
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 0.3rem;
        }
        .lc-block ol { padding-left: 1.2rem; margin-top: 0.3rem; list-style: decimal; }
        .lc-block ol li { margin: 0.2rem 0; }

        .lc-grid-2 { display: grid; grid-template-columns: 1fr 1fr;
                     gap: 1rem; margin: 0.75rem 0 1rem; }
        .lc-adapt {
          border: 1px solid var(--border); border-radius: 4px;
          padding: 0.85rem 1rem;
        }
        .lc-adapt-h { font-size: 12px; font-weight: 700; color: var(--fg);
                       margin-bottom: 0.4rem;
                       display: flex; justify-content: space-between; }
        .lc-adapt-h .tag { font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
                            font-family: var(--font-mono); padding: 2px 5px;
                            border-radius: 2px; color: var(--accent);
                            background: var(--accent-light); }
        .lc-adapt-body { font-size: 12px; color: var(--fg-muted); line-height: 1.55; }
        .lc-adapt-body em { color: var(--fg); font-style: italic; }

        /* Inline ghost suggestion */
        .lc-ghost {
          color: var(--fg-muted); font-style: italic; opacity: 0.7;
          background: linear-gradient(90deg, var(--accent-light) 0%, transparent 100%);
          padding: 0 2px; border-radius: 2px;
        }
        .lc-ghost::after {
          content: ' · tab to accept'; font-family: var(--font-mono);
          font-size: 10px; color: var(--accent); letter-spacing: 0.06em;
          opacity: 0.8;
        }

        /* ---------- Right sidecar (Terminal) ---------- */
        .lc-right {
          background: var(--term-bg); color: var(--term-fg);
          font-family: var(--font-mono); font-size: 12px;
          display: flex; flex-direction: column;
          border-left: 1px solid var(--term-border);
        }
        .lc-term-bar {
          height: 32px; background: var(--term-panel);
          border-bottom: 1px solid var(--term-border);
          display: flex; align-items: center; padding: 0 0.85rem; gap: 0.75rem;
          color: var(--term-fg-muted); font-size: 11px;
          letter-spacing: 0.04em;
        }
        .lc-term-bar .dots {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--term-err);
          box-shadow: 16px 0 var(--warn), 32px 0 var(--ok);
        }
        .lc-term-title { color: var(--term-fg); margin-left: 2.5rem; }
        .lc-term-right { margin-left: auto; color: var(--term-accent); }

        .lc-term-body { flex: 1; padding: 1rem 1rem 1.25rem;
                        overflow: hidden; line-height: 1.6; }
        .lc-term-h {
          color: var(--term-accent); font-size: 10px; letter-spacing: 0.14em;
          text-transform: uppercase; margin-bottom: 0.6rem;
        }
        .lc-term-h:not(:first-child) { margin-top: 1.4rem; }
        .lc-term-line { color: var(--term-fg-muted); }
        .lc-term-line .ok { color: var(--term-ok); }
        .lc-term-line .acc { color: var(--term-accent); }
        .lc-term-line .fg { color: var(--term-fg); }
        .lc-term-line .key { color: var(--term-fg); }

        .lc-term-prompt {
          background: var(--term-input); border: 1px solid var(--term-border);
          border-radius: 3px; padding: 0.55rem 0.7rem; margin-top: 0.5rem;
          color: var(--term-fg); font-size: 12px;
        }
        .lc-term-prompt::before {
          content: '> '; color: var(--term-accent);
        }
        .lc-term-cursor::after {
          content: '▍'; color: var(--term-accent);
          animation: lc-blink 1s infinite step-end;
        }
        @keyframes lc-blink { 50% { opacity: 0; } }

        .lc-source-row {
          display: flex; justify-content: space-between;
          padding: 0.3rem 0; border-bottom: 1px dashed var(--term-border);
        }
        .lc-source-row:last-child { border-bottom: none; }
        .lc-source-row .left { color: var(--term-fg); }
        .lc-source-row .right { color: var(--term-fg-muted); }
        .lc-source-row .right em { color: var(--term-accent); font-style: normal; }
      `}</style>

      {/* ---------- LEFT RAIL ---------- */}
      <aside className="lc-left">
        <div className="lc-wm">TEACHERS TOOL <small>· composer</small></div>

        <div className="lc-section-label">Science · Unit 2</div>
        <div className="lc-tree">
          <div className="lc-tree-item"><span>D1 · Phase intro</span><span className="day">10/06</span></div>
          <div className="lc-tree-item"><span>D2 · Particle motion</span><span className="day">10/07</span></div>
          <div className="lc-tree-item"><span>D3 · Melting + freezing</span><span className="day">10/09</span></div>
          <div className="lc-tree-item"><span>D4 · Vapor pressure</span><span className="day">10/10</span></div>
          <div className="lc-tree-item lc-tree-item--on"><span>D5 · States lab</span><span className="day">10/14</span></div>
          <div className="lc-tree-item"><span>D6 · Lab writeup</span><span className="day">10/15</span></div>
          <div className="lc-tree-item"><span>D7 · Quiz + close</span><span className="day">10/16</span></div>
        </div>

        <div className="lc-section-label">Style memory <span style={{ float: 'right', textTransform: 'none', letterSpacing: 0, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>17 mo</span></div>
        <div className="lc-style">
          <span className="lc-chip lc-chip-on">3-act structure <span className="x">×</span></span>
          <span className="lc-chip lc-chip-on">CER prompts <span className="x">×</span></span>
          <span className="lc-chip lc-chip-on">no slideware &gt; 8 <span className="x">×</span></span>
          <span className="lc-chip">cold call: random <span className="x">×</span></span>
          <span className="lc-chip">whiteboard demo first <span className="x">×</span></span>
          <span className="lc-chip lc-chip-on">closer: 1-min reflect <span className="x">×</span></span>
          <span className="lc-chip" style={{ borderStyle: 'dashed' }}>+ add memory</span>
        </div>

        <div className="lc-section-label">Constraints today</div>
        <div className="lc-memo-row">
          <strong>Diego R. — low-stim</strong>
          <span>Parent note · 7:14 AM · quiet alt ready</span>
        </div>
        <div className="lc-memo-row">
          <strong>Mia L. — IEP</strong>
          <span>Read-aloud variant required</span>
        </div>
        <div className="lc-memo-row">
          <strong>Lab B · no open flame</strong>
          <span>Safety checker flagged · using dry ice</span>
        </div>
        <div className="lc-memo-row">
          <strong>50 minutes · 27 students</strong>
          <span>3 absences expected</span>
        </div>
      </aside>

      {/* ---------- CENTER ---------- */}
      <main className="lc-center">
        <div className="lc-bar">
          <div className="lc-bar-left">
            <a href="#">Science</a><span>·</span>
            <a href="#">Unit 2 · States of matter</a><span>·</span>
            <span style={{ color: 'var(--fg)' }}>Day 5</span>
            <span className="lc-bar-state" style={{ marginLeft: '1rem' }}>
              <span className="dot" /> assistant adapting · 4 sources
            </span>
          </div>
          <div className="lc-bar-right">
            <button className="lc-btn">Print pack</button>
            <button className="lc-btn">Differentiate</button>
            <button className="lc-btn lc-btn--pri">Save · ⌘S</button>
          </div>
        </div>

        <div className="lc-meta-grid">
          <div className="lc-meta-cell">
            <div className="lc-meta-lbl">Standards</div>
            <div className="lc-meta-val"><span className="mono">5-PS1-1 · 5-PS1-3</span></div>
          </div>
          <div className="lc-meta-cell">
            <div className="lc-meta-lbl">Time</div>
            <div className="lc-meta-val">50 min · P3</div>
          </div>
          <div className="lc-meta-cell">
            <div className="lc-meta-lbl">Reading level</div>
            <div className="lc-meta-val">Gr 5 · 3 variants</div>
          </div>
          <div className="lc-meta-cell">
            <div className="lc-meta-lbl">Status</div>
            <div className="lc-meta-val" style={{ color: 'var(--accent)' }}>Draft 3 · last save 2 min ago</div>
          </div>
        </div>

        <div className="lc-doc">
          <h1 className="lc-title">Can you see a phase change?</h1>
          <p className="lc-sub">
            Students observe dry ice subliming under three different conditions
            and explain — in writing — what particles are doing in each. <em>The
            point is the explanation, not the wow.</em>
          </p>

          <div className="lc-h2"><span className="roman">I.</span> Hook · 5 min</div>
          <h3 className="lc-h3">Three jars, one mystery.</h3>
          <p className="lc-p">
            Place three sealed jars at the front: <em>(a) dry ice + warm water</em>,
            <em> (b) dry ice + room-temp water</em>, <em>(c) dry ice + ice water</em>.
            Don't label them. Ask: "These three look different. <em>Why?</em>"
            Hands down for 90 seconds, then random cold call — three voices, no commentary.
          </p>

          <div className="lc-h2"><span className="roman">II.</span> Investigation · 25 min</div>
          <p className="lc-p">
            Pairs at six stations. Each pair gets a clipboard with the CER frame
            and a thermometer. They cycle through three observation windows
            (4 min each) and record:
          </p>
          <div className="lc-block">
            <div className="lc-block-h">Claim · Evidence · Reasoning</div>
            <ol>
              <li><em>Claim.</em> What's happening to the dry ice?</li>
              <li><em>Evidence.</em> Two specific observations from your station — include the temperature.</li>
              <li><em>Reasoning.</em> Use the <em>particle model</em> from Tuesday to explain. Why does warm water change what you see?</li>
            </ol>
          </div>

          <div className="lc-h2"><span className="roman">III.</span> Adapt &amp; differentiate <span className="lc-bar-state" style={{ marginLeft: 'auto', fontSize: 9 }}><span className="dot" /> auto</span></div>
          <div className="lc-grid-2">
            <div className="lc-adapt">
              <div className="lc-adapt-h">Diego R. · low-stim alt <span className="tag">PARENT NOTE</span></div>
              <div className="lc-adapt-body">
                Skip pair work. Diego observes Station 2 solo with a tablet
                replay of the demo, fills the same CER frame at his desk.
                <em> No cold call.</em>
              </div>
            </div>
            <div className="lc-adapt">
              <div className="lc-adapt-h">Mia L. · audio variant <span className="tag">IEP</span></div>
              <div className="lc-adapt-body">
                4:12 audio narration of the prompt, replayable on her
                Chromebook. Voice-to-text enabled for the Reasoning field.
                <em> Already queued.</em>
              </div>
            </div>
            <div className="lc-adapt">
              <div className="lc-adapt-h">Priya S. · ESL Hindi <span className="tag">L1 HINDI</span></div>
              <div className="lc-adapt-body">
                CER frame in both English and Hindi. Vocabulary card
                ("sublimation", "particle", "phase") with L1 anchors.
              </div>
            </div>
            <div className="lc-adapt">
              <div className="lc-adapt-h">Aisha K. · push <span className="tag">EXTENSION</span></div>
              <div className="lc-adapt-body">
                Adds Station 4 — <em>predict and test</em> what happens if you
                drop the same dry ice in 5% saline. Reasoning section asks for
                a particle-level mechanism.
              </div>
            </div>
          </div>

          <div className="lc-h2"><span className="roman">IV.</span> Close · 5 min</div>
          <p className="lc-p">
            One-minute reflection on the exit ticket: "<em>Which station gave
            you the clearest evidence, and why?</em>"
            <span className="lc-ghost"> Then preview tomorrow: lab writeup.</span>
          </p>
        </div>
      </main>

      {/* ---------- TERMINAL SIDECAR ---------- */}
      <aside className="lc-right">
        <div className="lc-term-bar">
          <span className="dots" />
          <span className="lc-term-title">safe :: assistant :: trace</span>
          <span className="lc-term-right">local · tier 2</span>
        </div>
        <div className="lc-term-body">
          <div className="lc-term-h">// session</div>
          <div className="lc-term-line">period <span className="acc">P1</span> · authorized <span className="ok">✓ roster ✓ standards ✓ knowledge ✓ archive</span></div>
          <div className="lc-term-line">denied   <span className="fg" style={{ color: 'var(--term-err)' }}>✗ behavior ✗ parent-contact</span></div>

          <div className="lc-term-h">// grounded in</div>
          <div className="lc-source-row">
            <span className="left">ngss.5-PS1-1.md</span>
            <span className="right">district · <em>v2024.3</em></span>
          </div>
          <div className="lc-source-row">
            <span className="left">unit2/day5.draft.md</span>
            <span className="right">yours · <em>edited 11:02 PM</em></span>
          </div>
          <div className="lc-source-row">
            <span className="left">archive/2024/states-of-matter/</span>
            <span className="right">prior · <em>17 lessons</em></span>
          </div>
          <div className="lc-source-row">
            <span className="left">cer-framework.kb</span>
            <span className="right">your style · <em>×46 uses</em></span>
          </div>

          <div className="lc-term-h">// agents this run</div>
          <div className="lc-term-line"><span className="ok">[ok]</span>  curriculum.agent       <span className="right">·  1.2s</span></div>
          <div className="lc-term-line"><span className="ok">[ok]</span>  reading-adapter.agent  <span className="right">·  2.4s · 3 variants</span></div>
          <div className="lc-term-line"><span className="ok">[ok]</span>  lab-safety.agent       <span className="right">·  0.8s · <em style={{ color: 'var(--term-accent)', fontStyle: 'normal' }}>1 flag resolved</em></span></div>
          <div className="lc-term-line"><span className="acc">[..]</span>  sped.agent             <span className="right">·  drafting Mia audio</span></div>

          <div className="lc-term-h">// memory write</div>
          <div className="lc-term-line">accepted: <span className="fg">"closer: 1-min reflect"</span></div>
          <div className="lc-term-line">style ↑   <span className="acc">+1 use</span> · now 47 lessons</div>

          <div className="lc-term-h">// ask the assistant</div>
          <div className="lc-term-prompt lc-term-cursor">add a Spanish CER frame</div>
          <div className="lc-term-line" style={{ marginTop: '0.5rem', color: 'var(--term-fg-muted)' }}>
            // <span className="acc">⏎</span> to run · uses <span className="acc">priya.s</span> language profile
          </div>
        </div>
      </aside>
    </div>
  );
}

window.LessonComposerArtboard = LessonComposerArtboard;
