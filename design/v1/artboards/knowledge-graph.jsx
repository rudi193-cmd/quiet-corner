// Knowledge Graph Query — natural language over the local student graph.
// The teacher types a question, the assistant returns a result grounded in
// her actual classroom data, with citations to specific artifacts.

function KnowledgeGraphArtboard() {
  return (
    <div className="ab kg">
      <style>{`
        .kg { width: 100%; min-height: 100%; }

        .kg-nav {
          height: 56px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem;
        }
        .kg-wm { font-size: 14px; font-weight: 700; letter-spacing: 0.14em;
                  text-transform: uppercase; }
        .kg-crumb {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 13px; color: var(--fg-muted);
        }
        .kg-crumb .acc { color: var(--accent); font-weight: 600; }
        .kg-nav-right { display: flex; align-items: center; gap: 1.5rem;
                         font-size: 13px; color: var(--fg-muted); }
        .kg-session {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em;
          color: var(--fg-muted); display: flex; align-items: center; gap: 0.5rem;
        }
        .kg-session .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

        .kg-body { padding: 3rem 3rem 4rem; max-width: 1240px; margin: 0 auto; }

        /* Query bar */
        .kg-q {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem; border: 1px solid var(--border);
          border-radius: 4px; background: var(--bg);
          margin-bottom: 0.5rem;
        }
        .kg-q .prompt { font-family: var(--font-mono); color: var(--accent);
                         font-weight: 700; letter-spacing: 0.06em; }
        .kg-q-text {
          flex: 1; font-size: 18px; color: var(--fg); line-height: 1.4;
          font-weight: 500;
        }
        .kg-q-text em { color: var(--fg-muted); font-style: italic; font-weight: 400; }
        .kg-q-mode {
          display: flex; gap: 0.4rem; font-family: var(--font-mono);
          font-size: 11px; letter-spacing: 0.04em;
        }
        .kg-q-mode span {
          padding: 0.3rem 0.55rem; border: 1px solid var(--border);
          border-radius: 3px; color: var(--fg-muted);
        }
        .kg-q-mode span.on { color: var(--accent); border-color: var(--accent); background: var(--accent-light); }

        .kg-q-foot {
          display: flex; gap: 1.25rem; font-size: 11px;
          color: var(--fg-muted); font-family: var(--font-mono);
          letter-spacing: 0.04em; margin-bottom: 2.5rem;
          padding-bottom: 1.25rem; border-bottom: 1px solid var(--border);
        }
        .kg-q-foot strong { color: var(--accent); font-weight: 600; }
        .kg-q-foot .right { margin-left: auto; }

        /* Answer hero */
        .kg-ans-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 0.5rem;
        }
        .kg-ans {
          font-size: 28px; line-height: 1.35; color: var(--fg);
          font-weight: 500; letter-spacing: -0.01em;
          max-width: 880px; margin-bottom: 0.75rem;
        }
        .kg-ans em { color: var(--accent); font-style: normal;
                      border-bottom: 2px solid var(--accent-light); padding-bottom: 1px; }
        .kg-ans-cite {
          font-size: 13px; color: var(--fg-muted); margin-bottom: 2.5rem;
          font-family: var(--font-mono); letter-spacing: 0.04em;
        }
        .kg-ans-cite span { color: var(--accent); }

        /* Section bar */
        .kg-h {
          display: flex; align-items: baseline; justify-content: space-between;
          padding-bottom: 0.6rem; border-bottom: 1px solid var(--border);
          margin: 2rem 0 1.25rem;
        }
        .kg-h-l {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--fg);
        }
        .kg-h-l small { color: var(--fg-muted); margin-left: 0.5rem; font-weight: 400; }
        .kg-h-r { font-size: 12px; color: var(--fg-muted); display: flex; gap: 1rem; }
        .kg-h-r a { color: var(--fg-muted); }
        .kg-h-r a:hover { color: var(--accent); }

        /* Student rows */
        .kg-row {
          display: grid; grid-template-columns: 220px 1fr 280px;
          gap: 1.5rem; padding: 1.5rem 0;
          border-bottom: 1px solid var(--border);
        }
        .kg-row:last-child { border-bottom: none; }
        .kg-who { display: flex; gap: 1rem; align-items: flex-start; }
        .kg-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          background: var(--surface-sunken);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: var(--accent); font-size: 16px;
          flex-shrink: 0; border: 1px solid var(--border);
          letter-spacing: 0.02em;
        }
        .kg-who-name { font-size: 16px; font-weight: 600; color: var(--fg); }
        .kg-who-meta { font-size: 12px; color: var(--fg-muted);
                        font-family: var(--font-mono); letter-spacing: 0.04em;
                        margin-top: 0.2rem; }
        .kg-who-tags { margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.3rem; }
        .kg-tag {
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
          padding: 2px 6px; border-radius: 2px; font-family: var(--font-mono);
          text-transform: uppercase;
        }
        .kg-tag--warn { background: var(--warn-soft-bg); color: var(--warn-soft-fg); }
        .kg-tag--info { background: var(--info-soft-bg); color: var(--info-soft-fg); }
        .kg-tag--ok { background: var(--ok-soft-bg); color: var(--ok-soft-fg); }
        .kg-tag--neut { background: var(--neutral-soft-bg); color: var(--neutral-soft-fg); }

        .kg-what strong {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent);
          margin-bottom: 0.4rem;
        }
        .kg-what-text {
          font-size: 15px; line-height: 1.6; color: var(--fg);
          margin-bottom: 0.65rem;
        }
        .kg-what-text em { color: var(--fg); font-style: italic; }

        .kg-ev {
          font-size: 12px; color: var(--fg-muted); line-height: 1.55;
          padding: 0.6rem 0.75rem; background: var(--surface-sunken);
          border-radius: 3px; border-left: 2px solid var(--accent);
          font-family: var(--font-mono); letter-spacing: 0.01em;
        }
        .kg-ev strong { color: var(--accent); font-weight: 600; }
        .kg-ev .what-said {
          font-family: var(--font-sans); color: var(--fg);
          font-style: italic; display: block; margin-top: 0.2rem;
        }

        .kg-next strong {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase; color: var(--fg-muted);
          margin-bottom: 0.4rem;
        }
        .kg-next-card {
          padding: 0.85rem 1rem; border: 1px solid var(--border);
          border-radius: 4px; background: var(--accent-light);
        }
        .kg-next-card .head {
          font-size: 13px; font-weight: 600; color: var(--accent);
          margin-bottom: 0.25rem;
        }
        .kg-next-card .body {
          font-size: 13px; color: var(--fg); line-height: 1.5;
        }
        .kg-next-actions { display: flex; gap: 0.4rem; margin-top: 0.75rem; }
        .kg-next-btn {
          font-family: inherit; font-size: 12px; font-weight: 600;
          padding: 0.35rem 0.7rem; border-radius: 3px; cursor: pointer;
          border: 1px solid var(--accent); background: var(--accent); color: #fff;
        }
        .kg-next-btn--sec { background: transparent; color: var(--accent); }

        /* Result summary card */
        .kg-summary {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 0;
          border: 1px solid var(--border); border-radius: 4px;
          margin-bottom: 2.5rem;
        }
        .kg-sum-cell {
          padding: 1.1rem 1.25rem; border-right: 1px solid var(--border);
        }
        .kg-sum-cell:last-child { border-right: none; }
        .kg-sum-num {
          font-size: 2rem; font-weight: 700; color: var(--accent);
          letter-spacing: -0.02em; line-height: 1;
        }
        .kg-sum-num small { font-size: 0.55em; color: var(--fg-muted);
                              font-weight: 500; }
        .kg-sum-lbl {
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--fg-muted); margin-top: 0.4rem;
        }
        .kg-sum-sub { font-size: 12px; color: var(--fg-muted);
                        margin-top: 0.25rem; line-height: 1.4; }
      `}</style>

      <div className="kg-nav">
        <div className="kg-wm">TEACHERS TOOL</div>
        <div className="kg-crumb">
          <span>Assistant</span><span>›</span>
          <span>Knowledge graph</span><span>›</span>
          <span className="acc">Saved query · 14:02</span>
        </div>
        <div className="kg-nav-right">
          <span className="kg-session"><span className="dot" /> P1 · 47:21 remaining</span>
          <a href="#">Ms. Chen ↗</a>
        </div>
      </div>

      <div className="kg-body">

        {/* Query bar */}
        <div className="kg-q">
          <span className="prompt">?</span>
          <div className="kg-q-text">
            who still hasn't demonstrated <em>fraction fluency</em>, and what
            specifically is getting in their way?
          </div>
          <div className="kg-q-mode">
            <span className="on">graph</span>
            <span>archive</span>
            <span>both</span>
          </div>
        </div>
        <div className="kg-q-foot">
          <span>// scoped to <strong>5th period grade · this unit · last 30 days</strong></span>
          <span>↓ 4 students returned</span>
          <span className="right">grounded in <strong>exit tickets ×7</strong> · <strong>warm-up logs ×14</strong> · <strong>your notes ×3</strong></span>
        </div>

        {/* Hero answer */}
        <div className="kg-ans-eyebrow">// answer</div>
        <div className="kg-ans">
          <em>Four students</em> haven't demonstrated number-line fluency, and
          three of the four have the <em>same underlying confusion</em>: they
          read a fraction's <em>numerator</em> as a count of units, not as
          tenths/halves/thirds of one whole.
        </div>
        <div className="kg-ans-cite">
          // confidence <span>0.86</span> · ↳ derived from 7 exit tickets · 14 warm-up logs · last 22 days
        </div>

        {/* Summary strip */}
        <div className="kg-summary">
          <div className="kg-sum-cell">
            <div className="kg-sum-num">4<small> of 27</small></div>
            <div className="kg-sum-lbl">Not yet fluent</div>
            <div className="kg-sum-sub">~15% · down from 9 two weeks ago</div>
          </div>
          <div className="kg-sum-cell">
            <div className="kg-sum-num">3</div>
            <div className="kg-sum-lbl">Same misconception</div>
            <div className="kg-sum-sub">numerator-as-count, not partitioning</div>
          </div>
          <div className="kg-sum-cell">
            <div className="kg-sum-num">1</div>
            <div className="kg-sum-lbl">Different root cause</div>
            <div className="kg-sum-sub">attendance-driven · 4 missed days</div>
          </div>
          <div className="kg-sum-cell">
            <div className="kg-sum-num">+1</div>
            <div className="kg-sum-lbl">Group recommended</div>
            <div className="kg-sum-sub">1:00 PM intervention block today</div>
          </div>
        </div>

        {/* Students */}
        <div className="kg-h">
          <div className="kg-h-l">Returned students <small>· evidence linked · graph last updated 11:02 PM Mon</small></div>
          <div className="kg-h-r">
            <a href="#">↓ Group these students</a>
            <a href="#">↓ Draft an intervention</a>
            <a href="#">↓ Save query</a>
          </div>
        </div>

        {/* Row 1 */}
        <div className="kg-row">
          <div className="kg-who">
            <div className="kg-avatar">JW</div>
            <div>
              <div className="kg-who-name">Jaylen W.</div>
              <div className="kg-who-meta">5.NF · 22% fluent · trend ↘</div>
              <div className="kg-who-tags">
                <span className="kg-tag kg-tag--warn">SAME MISCNXN</span>
                <span className="kg-tag kg-tag--neut">26 days tracked</span>
              </div>
            </div>
          </div>
          <div className="kg-what">
            <strong>What's getting in the way</strong>
            <div className="kg-what-text">
              Reads <em>3/4</em> as "three of four things," not as <em>three of
              the four equal parts that make one whole</em>. On a number line
              with 0 and 1 marked, he places 3/4 by counting 3 tick marks from
              0 — <em>regardless of how many tick marks there are</em>.
            </div>
            <div className="kg-ev">
              <strong>exit-ticket 10/13 · item 2:</strong>
              <span className="what-said">
                "I put it at 3 because the top number is 3. The bottom one
                tells you how many lines."
              </span>
            </div>
          </div>
          <div className="kg-next">
            <strong>Recommended next</strong>
            <div className="kg-next-card">
              <div className="head">Partition before count.</div>
              <div className="body">
                Tape diagram first; bar split into 4 equal parts; shade 3.
                <em> Then</em> map to a number line of the same total length.
              </div>
              <div className="kg-next-actions">
                <button className="kg-next-btn">Add to intervention 1:00</button>
                <button className="kg-next-btn kg-next-btn--sec">Generate</button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="kg-row">
          <div className="kg-who">
            <div className="kg-avatar">SR</div>
            <div>
              <div className="kg-who-name">Sofia R.</div>
              <div className="kg-who-meta">5.NF · 31% fluent · trend →</div>
              <div className="kg-who-tags">
                <span className="kg-tag kg-tag--warn">SAME MISCNXN</span>
                <span className="kg-tag kg-tag--info">ESL · Spanish L1</span>
              </div>
            </div>
          </div>
          <div className="kg-what">
            <strong>What's getting in the way</strong>
            <div className="kg-what-text">
              Same numerator-as-count error as Jaylen, but with an additional
              language overlay — explained "denominator" to a partner as "the
              <em> big number on the bottom</em>" without referring to parts.
              May benefit from L1 vocab anchor.
            </div>
            <div className="kg-ev">
              <strong>warm-up 10/12 · partner audio:</strong>
              <span className="what-said">
                "Ok so this one is 5 because the top is 5… ¿no?"
              </span>
            </div>
          </div>
          <div className="kg-next">
            <strong>Recommended next</strong>
            <div className="kg-next-card">
              <div className="head">Same partition lesson + Spanish vocab card.</div>
              <div className="body">
                "Numerador / denominador" anchors with concrete partitioning
                language: <em>"de cuántas partes iguales"</em>.
              </div>
              <div className="kg-next-actions">
                <button className="kg-next-btn">Add to intervention 1:00</button>
                <button className="kg-next-btn kg-next-btn--sec">Generate</button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="kg-row">
          <div className="kg-who">
            <div className="kg-avatar">EM</div>
            <div>
              <div className="kg-who-name">Emmy P.</div>
              <div className="kg-who-meta">5.NF · 38% fluent · trend ↗</div>
              <div className="kg-who-tags">
                <span className="kg-tag kg-tag--warn">SAME MISCNXN</span>
                <span className="kg-tag kg-tag--ok">improving</span>
              </div>
            </div>
          </div>
          <div className="kg-what">
            <strong>What's getting in the way</strong>
            <div className="kg-what-text">
              Same root error, but improving. Last <em>two</em> exit tickets
              show correct placement when the number line is pre-partitioned
              for her — and incorrect when she has to partition it herself.
              <em> The partitioning</em> is the gap, not the placement.
            </div>
            <div className="kg-ev">
              <strong>longitudinal · last 5 sessions:</strong>
              <span className="what-said">
                pre-partitioned: 4 / 5 correct &nbsp; unpartitioned: 1 / 5 correct
              </span>
            </div>
          </div>
          <div className="kg-next">
            <strong>Recommended next</strong>
            <div className="kg-next-card">
              <div className="head">Skip intervention. Partition drills.</div>
              <div className="body">
                Three short partitioning exercises (no placement). 5 min today,
                5 min Thursday. <em>Don't pull her from main class.</em>
              </div>
              <div className="kg-next-actions">
                <button className="kg-next-btn">Queue drills</button>
                <button className="kg-next-btn kg-next-btn--sec">Generate</button>
              </div>
            </div>
          </div>
        </div>

        {/* Row 4 */}
        <div className="kg-row">
          <div className="kg-who">
            <div className="kg-avatar">MT</div>
            <div>
              <div className="kg-who-name">Marcus T.</div>
              <div className="kg-who-meta">5.NF · n/a · new student</div>
              <div className="kg-who-tags">
                <span className="kg-tag kg-tag--info">DIFFERENT CAUSE</span>
                <span className="kg-tag kg-tag--neut">4 missed days</span>
              </div>
            </div>
          </div>
          <div className="kg-what">
            <strong>What's getting in the way</strong>
            <div className="kg-what-text">
              Not a misconception — an <em>attendance gap</em>. Marcus joined
              in week 3 and missed the intro arc entirely. Confidence is too
              low to assess fluency. Was absent yesterday for the
              number-line intro.
            </div>
            <div className="kg-ev">
              <strong>graph · gaps detected:</strong>
              <span className="what-said">
                missed: equivalence intro (9/24), partitioning practice (10/03,
                10/04), number-line intro (10/13). Net: ~38% of unit.
              </span>
            </div>
          </div>
          <div className="kg-next">
            <strong>Recommended next</strong>
            <div className="kg-next-card">
              <div className="head">Catchup deck before grouping.</div>
              <div className="body">
                Use the 12-min catchup deck already drafted last night, then
                re-assess. Don't put him in the same intervention as Jaylen
                yet — different problem.
              </div>
              <div className="kg-next-actions">
                <button className="kg-next-btn">Open catchup deck</button>
                <button className="kg-next-btn kg-next-btn--sec">Re-query in 3 days</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

window.KnowledgeGraphArtboard = KnowledgeGraphArtboard;
