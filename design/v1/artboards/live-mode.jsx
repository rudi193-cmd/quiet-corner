// Live Classroom Mode — what the projector shows. Big Courier, restrained.
// One step in focus. Pacing timer. A poll mid-class. Random student selector.
// A small teacher-only overlay sits in the corner — visible to her, not the
// class — surfacing the things only she should see.

function LiveModeArtboard() {
  return (
    <div className="ab term lm">
      <style>{`
        .lm { width: 100%; height: 100%;
              padding: 0; position: relative; overflow: hidden;
              display: flex; flex-direction: column;
              font-size: 14px; }

        /* Top status bar */
        .lm-top {
          height: 56px; background: var(--term-panel);
          border-bottom: 1px solid var(--term-border);
          display: flex; align-items: center;
          padding: 0 2rem; gap: 1.5rem;
          color: var(--term-fg-muted); font-size: 14px; letter-spacing: 0.06em;
          flex-shrink: 0;
        }
        .lm-top .dots {
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--term-err);
          box-shadow: 18px 0 var(--warn), 36px 0 var(--ok);
        }
        .lm-top .title {
          color: var(--term-accent); font-weight: 700; letter-spacing: 0.12em;
          margin-left: 3rem;
        }
        .lm-top .breadcrumb { color: var(--term-fg); }
        .lm-top .right { margin-left: auto; display: flex; gap: 2rem; align-items: center; }
        .lm-top .right span strong { color: var(--term-fg); font-weight: 400; }
        .lm-top .pip {
          width: 10px; height: 10px; border-radius: 50%; background: var(--term-ok);
          animation: lm-pulse 1.6s infinite;
        }
        @keyframes lm-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6); }
          70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
        }

        /* Stage */
        .lm-stage {
          flex: 1; padding: 3rem 4rem 2rem;
          display: grid; grid-template-columns: 1.4fr 1fr;
          gap: 3rem;
          overflow: hidden;
        }

        /* Left: current step + timer */
        .lm-step-top {
          display: flex; align-items: baseline; gap: 1.5rem;
          color: var(--term-fg-muted); font-size: 18px;
          letter-spacing: 0.08em; margin-bottom: 1rem;
        }
        .lm-step-top .num { color: var(--term-accent); font-weight: 700;
                             font-size: 22px; letter-spacing: 0.04em; }
        .lm-step-top .of { font-size: 14px; }

        .lm-task {
          font-size: 88px; line-height: 1.02; color: var(--term-fg);
          font-weight: 700; letter-spacing: -0.01em; margin-bottom: 2rem;
        }
        .lm-task .acc { color: var(--term-accent); }
        .lm-task em { font-style: normal; color: var(--term-accent); }

        .lm-sub {
          font-size: 22px; line-height: 1.5; color: var(--term-fg-muted);
          max-width: 720px; margin-bottom: 3rem;
        }
        .lm-sub strong { color: var(--term-fg); font-weight: 400; }

        /* Timer */
        .lm-timer {
          display: flex; align-items: baseline; gap: 1.5rem;
          margin-bottom: 1rem;
        }
        .lm-timer-num {
          font-size: 140px; font-weight: 400;
          letter-spacing: -0.04em; line-height: 0.95;
          color: var(--term-accent);
          font-variant-numeric: tabular-nums;
        }
        .lm-timer-of {
          color: var(--term-fg-muted); font-size: 22px; letter-spacing: 0.08em;
        }
        .lm-timer-of strong { color: var(--term-fg); font-weight: 400; }
        .lm-timer-bar {
          height: 8px; background: var(--term-input);
          border-radius: 2px; overflow: hidden;
          margin-bottom: 0.5rem;
        }
        .lm-timer-bar > span {
          display: block; height: 100%; background: var(--term-accent);
          width: 38%;
        }
        .lm-timer-marks {
          display: flex; justify-content: space-between;
          font-size: 12px; color: var(--term-fg-muted);
          letter-spacing: 0.08em;
        }

        /* Right column: poll + selector */
        .lm-right { display: flex; flex-direction: column; gap: 2rem; }

        .lm-card {
          background: var(--term-panel); border: 1px solid var(--term-border);
          padding: 2rem; border-radius: 4px;
        }
        .lm-card-h {
          font-size: 16px; letter-spacing: 0.14em; color: var(--term-accent);
          margin-bottom: 1.25rem;
          display: flex; justify-content: space-between; align-items: baseline;
        }
        .lm-card-h .meta { color: var(--term-fg-muted); font-size: 12px;
                            letter-spacing: 0.04em; font-weight: 400; }

        /* Live poll */
        .lm-poll-q {
          font-size: 26px; color: var(--term-fg); line-height: 1.3;
          font-weight: 400; margin-bottom: 1.25rem;
        }
        .lm-poll-q em { color: var(--term-accent); font-style: normal; }
        .lm-poll-row {
          display: grid; grid-template-columns: 1.5rem 1fr auto;
          gap: 0.85rem; align-items: center; padding: 0.5rem 0;
          font-size: 18px;
        }
        .lm-poll-letter { color: var(--term-accent); font-weight: 700; }
        .lm-poll-label { color: var(--term-fg); }
        .lm-poll-track {
          grid-column: 2 / 3; height: 12px; background: var(--term-input);
          border-radius: 1px; overflow: hidden; margin-top: 0.2rem;
        }
        .lm-poll-track > span {
          display: block; height: 100%; background: var(--term-accent);
        }
        .lm-poll-track.dim > span { background: var(--term-fg-muted); }
        .lm-poll-pct {
          font-family: var(--font-mono); font-size: 16px;
          color: var(--term-fg); min-width: 40px; text-align: right;
        }
        .lm-poll-pct.dim { color: var(--term-fg-muted); }
        .lm-poll-foot {
          margin-top: 0.85rem; padding-top: 0.85rem;
          border-top: 1px dashed var(--term-border);
          font-size: 14px; color: var(--term-fg-muted);
          display: flex; justify-content: space-between;
        }
        .lm-poll-foot strong { color: var(--term-fg); font-weight: 400; }

        /* Cold call card */
        .lm-pick-h { color: var(--term-fg-muted); font-size: 14px;
                      letter-spacing: 0.08em; margin-bottom: 0.5rem; }
        .lm-pick-name {
          font-size: 64px; color: var(--term-fg); font-weight: 700;
          letter-spacing: -0.02em; line-height: 1;
        }
        .lm-pick-name .acc { color: var(--term-accent); }
        .lm-pick-sub { color: var(--term-fg-muted); margin-top: 0.5rem; font-size: 14px; }
        .lm-pick-pool {
          margin-top: 1rem; padding-top: 0.85rem;
          border-top: 1px dashed var(--term-border);
          color: var(--term-fg-muted); font-size: 13px; letter-spacing: 0.04em;
          line-height: 1.5;
        }
        .lm-pick-pool span { color: var(--term-fg); }

        /* Bottom Q&A queue */
        .lm-bottom {
          height: 80px; background: var(--term-panel);
          border-top: 1px solid var(--term-border);
          display: flex; align-items: center;
          padding: 0 2rem; gap: 1.5rem;
          flex-shrink: 0;
          color: var(--term-fg-muted); font-size: 14px;
          overflow: hidden;
        }
        .lm-bottom-label {
          color: var(--term-accent); letter-spacing: 0.16em; font-size: 12px;
          padding-right: 1rem; border-right: 1px solid var(--term-border);
          min-width: 110px;
        }
        .lm-q-pill {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.4rem 0.8rem; background: var(--term-input);
          border-radius: 2px; font-size: 14px; color: var(--term-fg);
          flex-shrink: 0;
        }
        .lm-q-pill .who { color: var(--term-accent); }
        .lm-q-pill.note { background: transparent; color: var(--term-fg-muted); }
        .lm-bottom .right { margin-left: auto; color: var(--term-fg-muted);
                             font-size: 12px; letter-spacing: 0.08em; }

        /* Teacher-only overlay */
        .lm-teacher-eye {
          position: absolute; right: 24px; bottom: 100px;
          width: 320px; padding: 1rem 1.1rem;
          background: rgba(13,13,13,0.85);
          border: 1px solid var(--warn); border-radius: 4px;
          font-size: 12px; line-height: 1.5;
          color: var(--term-fg); z-index: 10;
        }
        .lm-eye-h {
          font-size: 9px; font-weight: 700; letter-spacing: 0.18em;
          color: var(--warn); text-transform: uppercase; margin-bottom: 0.5rem;
          display: flex; justify-content: space-between;
        }
        .lm-eye-h span:last-child { color: var(--term-fg-muted); font-weight: 400; letter-spacing: 0.06em; }
        .lm-eye-row {
          padding: 0.4rem 0;
          border-bottom: 1px dashed var(--term-border);
        }
        .lm-eye-row:last-child { border-bottom: none; padding-bottom: 0; }
        .lm-eye-row strong { color: var(--term-accent); font-weight: 400;
                              letter-spacing: 0.04em; display: block; font-size: 11px; }
        .lm-eye-row span { color: var(--term-fg-muted); font-size: 11px; }
      `}</style>

      <div className="lm-top">
        <span className="dots" />
        <span className="title">LIVE · P3 SCIENCE</span>
        <span className="breadcrumb">states of matter :: day 5 :: lab</span>
        <div className="right">
          <span><span className="pip" style={{ display: 'inline-block', marginRight: '0.6rem', verticalAlign: 'middle' }} />26 / 27 present</span>
          <span><strong>10:32</strong> · 38 of 50 min</span>
          <span>Mrs Chen ↗</span>
        </div>
      </div>

      <div className="lm-stage">
        {/* Left: task + timer */}
        <div className="lm-stage-left">
          <div className="lm-step-top">
            <span className="num">02</span>
            <span className="of">of 04 · investigation</span>
          </div>

          <div className="lm-task">
            Rotate to <em>Station&nbsp;3</em>.<br/>
            Write your <em>Evidence</em>.
          </div>

          <div className="lm-sub">
            Two specific observations from this station — include the
            <strong> temperature</strong>. <strong>Four minutes.</strong> The
            timer ends with one chime; <strong>do not stop writing</strong> until
            it does.
          </div>

          {/* Timer */}
          <div className="lm-timer">
            <div className="lm-timer-num">02:28</div>
            <div className="lm-timer-of">/ 04:00 <strong>· step</strong></div>
          </div>
          <div className="lm-timer-bar"><span /></div>
          <div className="lm-timer-marks">
            <span>start</span><span>chime in 2:28</span><span>rotate</span>
          </div>
        </div>

        {/* Right column */}
        <div className="lm-right">
          {/* Live poll */}
          <div className="lm-card">
            <div className="lm-card-h">
              <span>// poll · 14 voted</span>
              <span className="meta">closes with the chime</span>
            </div>
            <div className="lm-poll-q">
              At Station 1 (warm water), the dry ice <em>vanishes faster</em> because…
            </div>

            <div className="lm-poll-row">
              <span className="lm-poll-letter">A</span>
              <span className="lm-poll-label">the water melts it</span>
              <span className="lm-poll-pct dim">21%</span>
              <div className="lm-poll-track dim" style={{ marginLeft: '2.35rem' }}><span style={{ width: '21%' }} /></div>
            </div>
            <div className="lm-poll-row">
              <span className="lm-poll-letter">B</span>
              <span className="lm-poll-label">warm particles move faster</span>
              <span className="lm-poll-pct">64%</span>
              <div className="lm-poll-track" style={{ marginLeft: '2.35rem' }}><span style={{ width: '64%' }} /></div>
            </div>
            <div className="lm-poll-row">
              <span className="lm-poll-letter">C</span>
              <span className="lm-poll-label">water is heavier than ice</span>
              <span className="lm-poll-pct dim">14%</span>
              <div className="lm-poll-track dim" style={{ marginLeft: '2.35rem' }}><span style={{ width: '14%' }} /></div>
            </div>

            <div className="lm-poll-foot">
              <span>// don't reveal until 0:00</span>
              <span><strong>14</strong> of 26 voted</span>
            </div>
          </div>

          {/* Cold call */}
          <div className="lm-card">
            <div className="lm-card-h">
              <span>// next voice</span>
              <span className="meta">weighted · least-recently-called</span>
            </div>
            <div className="lm-pick-h">// random selector</div>
            <div className="lm-pick-name"><span className="acc">&gt;</span> Tobias K.</div>
            <div className="lm-pick-sub">last called <strong style={{ color: 'var(--term-fg)', fontWeight: 400 }}>9 days ago</strong> · spoke 2× this unit</div>
            <div className="lm-pick-pool">
              <strong>pool: </strong>
              Aisha &nbsp; Devon &nbsp; <span>Tobias</span> &nbsp; Sofia &nbsp; Emmy &nbsp; Lin &nbsp;
              <strong style={{ color: 'var(--term-fg-muted)' }}>excluded:</strong> Diego (low-stim), Mia (audio)
            </div>
          </div>
        </div>
      </div>

      {/* Q&A queue */}
      <div className="lm-bottom">
        <div className="lm-bottom-label">Q&amp;A QUEUE · 3</div>
        <div className="lm-q-pill"><span className="who">Aisha:</span> "Does salt water count?"</div>
        <div className="lm-q-pill"><span className="who">Jaylen:</span> "What if I can't see steam?"</div>
        <div className="lm-q-pill"><span className="who">Marcus:</span> "Re-explain CER plz"</div>
        <div className="lm-q-pill note">// answer at the rotate</div>
        <div className="right">SHOW QUEUE TO CLASS · F3</div>
      </div>

      {/* Teacher-only overlay (not visible to the class) */}
      <div className="lm-teacher-eye">
        <div className="lm-eye-h">
          <span>// teacher view · class-hidden</span>
          <span>F2 to toggle</span>
        </div>
        <div className="lm-eye-row">
          <strong>Diego R. — at Station 2, focused</strong>
          <span>Solo variant active. No call. Last vital 0:42 ago.</span>
        </div>
        <div className="lm-eye-row">
          <strong>Mia L. — audio in headphones</strong>
          <span>On Evidence step. Voice-to-text active.</span>
        </div>
        <div className="lm-eye-row">
          <strong>Pace check</strong>
          <span>You're <strong style={{ color: 'var(--term-accent)', fontWeight: 400 }}>2:10 ahead</strong>. Skip transition or add a stretch.</span>
        </div>
      </div>
    </div>
  );
}

window.LiveModeArtboard = LiveModeArtboard;
