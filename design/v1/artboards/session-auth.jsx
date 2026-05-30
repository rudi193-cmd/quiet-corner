// Session authorization — the SAFE per-session consent moment, adapted for teachers.
// The teacher opens the app at the start of a period; the assistant asks again,
// explicitly, which student-data tiers it can read. Permissions expire when
// the chosen window ends.

function SessionAuthArtboard() {
  const [duration, setDuration] = React.useState('period');
  const [perms, setPerms] = React.useState({
    roster: true,
    attendance: true,
    standards: true,
    knowledge: true,
    iep: false,
    behavior: false,
    parents: false,
    archive: true,
  });
  const toggle = (k) => setPerms((p) => ({ ...p, [k]: !p[k] }));

  const Row = ({ k, name, desc, required, sensitive }) => (
    <li className="ta-perm">
      <div className="ta-perm-text">
        <strong>
          {name}
          {required && <span className="ta-perm-tag ta-perm-tag--req">REQUIRED</span>}
          {sensitive && <span className="ta-perm-tag ta-perm-tag--sens">SENSITIVE</span>}
        </strong>
        <span>{desc}</span>
      </div>
      <div
        className={`safe-auth-toggle${perms[k] ? ' on' : ''}${required ? ' ta-toggle--locked' : ''}`}
        onClick={() => !required && toggle(k)}
        role="switch"
        aria-checked={perms[k]}
      />
    </li>
  );

  const DurOpt = ({ id, top, bot }) => (
    <button
      className={`ta-dur ${duration === id ? 'ta-dur--on' : ''}`}
      onClick={() => setDuration(id)}>
      <span className="ta-dur-top">{top}</span>
      <span className="ta-dur-bot">{bot}</span>
    </button>
  );

  return (
    <div className="ab" style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        .ta-bg {
          position: absolute; inset: 0;
          background: var(--bg);
          padding: 2rem 3rem; opacity: 0.42;
          pointer-events: none;
        }
        .ta-bg-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding-bottom: 1rem; border-bottom: 1px solid var(--border);
        }
        .ta-bg-wm { font-weight: 700; letter-spacing: 0.14em; font-size: 14px; }
        .ta-bg-chip { font-size: 13px; color: var(--fg-muted); }
        .ta-bg-h { font-size: 2.4rem; font-weight: 700; letter-spacing: -0.02em;
                   margin-top: 3rem; }
        .ta-bg-sub { color: var(--fg-muted); margin-top: 0.5rem; font-size: 17px; }
        .ta-bg-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr;
                      gap: 1rem; margin-top: 2.5rem; }
        .ta-bg-card { padding: 1.25rem; border: 1px solid var(--border);
                      border-radius: 4px; height: 110px; }

        .ta-scrim {
          position: absolute; inset: 0;
          background: rgba(28,28,26,0.18);
        }

        .ta-modal {
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: 640px; background: var(--bg);
          border: 1px solid var(--border); border-radius: 6px;
          padding: 2.25rem;
          box-shadow: 0 20px 60px rgba(28,28,26,0.10);
          font-family: var(--font-sans);
        }
        .ta-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--accent);
          display: flex; align-items: center; gap: 0.5rem;
        }
        .ta-eyebrow .ta-mono { font-family: var(--font-mono); color: var(--fg-muted); font-weight: 400; letter-spacing: 0.02em; }
        .ta-h { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.01em;
                margin: 0.5rem 0 0.75rem; line-height: 1.25; }
        .ta-lede { color: var(--fg-muted); font-size: 15px;
                   line-height: 1.55; margin-bottom: 1.5rem; }
        .ta-lede em { color: var(--fg); font-style: italic; }

        .ta-section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--fg-muted);
          margin-bottom: 0.6rem;
        }

        .ta-dur-row { display: grid; grid-template-columns: 1fr 1fr 1fr;
                      gap: 0.5rem; margin-bottom: 1.5rem; }
        .ta-dur {
          padding: 0.65rem 0.7rem; border: 1px solid var(--border);
          border-radius: 4px; background: transparent; cursor: pointer;
          font-family: inherit; text-align: left;
          transition: border-color 0.15s, background 0.15s;
        }
        .ta-dur:hover { border-color: var(--accent); }
        .ta-dur--on { border-color: var(--accent); background: var(--accent-light); }
        .ta-dur-top { display: block; font-weight: 600; font-size: 14px; color: var(--fg); }
        .ta-dur-bot { display: block; font-size: 12px; color: var(--fg-muted); margin-top: 2px; }

        .ta-perms { list-style: none; margin: 0; padding: 0;
                    border-top: 1px solid var(--border); }
        .ta-perm {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.85rem 0; border-bottom: 1px solid var(--border);
          gap: 1rem;
        }
        .ta-perm-text strong { display: block; color: var(--fg);
                               font-size: 14px; font-weight: 600;
                               display: flex; align-items: center; gap: 0.5rem;
                               flex-wrap: wrap; }
        .ta-perm-text span { color: var(--fg-muted); font-size: 13px;
                             line-height: 1.5; display: block;
                             margin-top: 2px; }
        .ta-perm-tag {
          font-size: 9px; font-weight: 700; letter-spacing: 0.1em;
          padding: 2px 6px; border-radius: 2px; font-family: var(--font-mono);
        }
        .ta-perm-tag--req { background: var(--ok-soft-bg); color: var(--ok-soft-fg); }
        .ta-perm-tag--sens { background: var(--warn-soft-bg); color: var(--warn-soft-fg); }
        .ta-toggle--locked { opacity: 0.5; cursor: not-allowed; }

        .ta-note {
          font-size: 12px; color: var(--fg-muted); line-height: 1.55;
          margin-top: 1.25rem; padding-top: 1.25rem;
          border-top: 1px solid var(--border);
          display: flex; gap: 0.6rem; align-items: flex-start;
        }
        .ta-note .ta-numeral { font-family: var(--font-mono); color: var(--accent);
                               font-weight: 700; flex-shrink: 0; }

        .ta-footer {
          display: flex; gap: 0.75rem; justify-content: space-between;
          align-items: center; margin-top: 1.5rem;
          padding-top: 1.25rem; border-top: 1px solid var(--border);
        }
        .ta-foot-left { font-size: 12px; color: var(--fg-muted); }
        .ta-foot-right { display: flex; gap: 0.5rem; }
        .ta-btn {
          font-family: inherit; cursor: pointer;
          border-radius: 4px; font-weight: 600; font-size: 14px;
          padding: 0.55rem 1.1rem; transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .ta-btn--ghost { background: transparent; color: var(--fg-muted); border: 1px solid transparent; }
        .ta-btn--ghost:hover { color: var(--accent); }
        .ta-btn--sec { background: transparent; color: var(--fg); border: 1px solid var(--border); }
        .ta-btn--sec:hover { border-color: var(--accent); color: var(--accent); }
        .ta-btn--pri { background: var(--accent); color: #fff; border: 1px solid var(--accent); }
        .ta-btn--pri:hover { background: var(--accent-hover); }
      `}</style>

      {/* Dimmed dashboard hinted underneath */}
      <div className="ta-bg" aria-hidden="true">
        <div className="ta-bg-nav">
          <span className="ta-bg-wm">TEACHERS TOOL</span>
          <span className="ta-bg-chip">Ms. Chen · Room 214 · Tue Oct 14</span>
        </div>
        <div className="ta-bg-h">Welcome back.</div>
        <div className="ta-bg-sub">First period begins in 14 minutes.</div>
        <div className="ta-bg-grid">
          <div className="ta-bg-card" /><div className="ta-bg-card" />
          <div className="ta-bg-card" /><div className="ta-bg-card" />
        </div>
      </div>
      <div className="ta-scrim" />

      <div className="ta-modal">
        <div className="ta-eyebrow">
          <span>Session authorization</span>
          <span className="ta-mono">safe :: per-session</span>
        </div>
        <h3 className="ta-h">What can the assistant see this period?</h3>
        <p className="ta-lede">
          You're starting a new session. Approve each data tier separately.
          Anything you decline, the assistant cannot read. <em>Everything you
          approve here expires when this window closes</em> — no rolling consent,
          no carry-over.
        </p>

        <div className="ta-section-label">Window</div>
        <div className="ta-dur-row">
          <DurOpt id="period" top="Period 1" bot="8:15 – 9:05" />
          <DurOpt id="today" top="Today" bot="until 3:15 dismissal" />
          <DurOpt id="session" top="This session only" bot="closes with the tab" />
        </div>

        <div className="ta-section-label">Data tiers</div>
        <ul className="ta-perms">
          <Row k="roster" name="Class roster" required
               desc="Names, photos, grade level. Required for everything else." />
          <Row k="attendance" name="Attendance" desc="Today and the prior 30 days." />
          <Row k="standards" name="Standards alignment"
               desc="District + state framework, this teacher's mapping notes." />
          <Row k="knowledge" name="Knowledge graph"
               desc="Strengths, misconceptions, mastery progression." />
          <Row k="iep" name="IEP & 504 accommodations" sensitive
               desc="Legally protected. Off by default — turn on only if generating IEP-aligned material." />
          <Row k="behavior" name="Behavioral patterns" sensitive
               desc="Participation, classroom-management notes. Off by default." />
          <Row k="parents" name="Parent contact info" sensitive
               desc="Phone, email, preferred language. Off unless drafting parent communication." />
          <Row k="archive" name="Prior-year lesson archive"
               desc="Your own lessons from earlier years. Local only." />
        </ul>

        <div className="ta-note">
          <span className="ta-numeral">II.</span>
          <span>
            All processing is on-device. No tier you approve here is transmitted
            off your machine. Revoke any tier mid-session from the status bar.
          </span>
        </div>

        <div className="ta-footer">
          <div className="ta-foot-left">
            Last session ended <em>3:14 PM yesterday</em> · all permissions cleared
          </div>
          <div className="ta-foot-right">
            <button className="ta-btn ta-btn--ghost">Deny all</button>
            <button className="ta-btn ta-btn--pri">Authorize period</button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SessionAuthArtboard = SessionAuthArtboard;
