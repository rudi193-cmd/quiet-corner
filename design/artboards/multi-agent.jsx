// Multi-Agent Run — full Terminal surface. The teacher asked: "Build a
// 5-day Civil Rights unit for 5th grade." Ten agents run in parallel/sequence.
// This is the build view: watch it run, intervene, inspect each artifact.

function MultiAgentArtboard() {
  return (
    <div className="ab term ma">
      <style>{`
        .ma { width: 100%; height: 100%; display: flex; flex-direction: column;
              font-size: 12px; line-height: 1.55; }

        .ma-bar {
          height: 32px; background: var(--term-panel);
          border-bottom: 1px solid var(--term-border);
          display: flex; align-items: center; padding: 0 0.9rem; gap: 0.9rem;
          color: var(--term-fg-muted); font-size: 11px; letter-spacing: 0.04em;
          flex-shrink: 0;
        }
        .ma-bar .dots {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--term-err);
          box-shadow: 16px 0 var(--warn), 32px 0 var(--ok);
        }
        .ma-bar .title { color: var(--term-fg); margin-left: 2.5rem; }
        .ma-bar .right { margin-left: auto; display: flex; gap: 1rem; color: var(--term-fg-muted); }
        .ma-bar .right strong { color: var(--term-accent); font-weight: 400; }

        /* Brief / request header */
        .ma-brief {
          padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--term-border);
          background: var(--term-bg); flex-shrink: 0;
        }
        .ma-brief-row { display: flex; gap: 2rem; align-items: baseline; }
        .ma-brief-lbl { color: var(--term-accent); font-size: 10px;
                         letter-spacing: 0.14em; text-transform: uppercase;
                         min-width: 80px; }
        .ma-brief-val { color: var(--term-fg); font-size: 13px; line-height: 1.6;
                         flex: 1; }
        .ma-brief-val em { color: var(--term-accent); font-style: normal; }
        .ma-brief-row + .ma-brief-row { margin-top: 0.4rem; }

        .ma-progress-row {
          display: flex; align-items: center; gap: 1.25rem;
          margin-top: 1rem; padding-top: 1rem;
          border-top: 1px dashed var(--term-border);
          font-size: 11px;
        }
        .ma-progress-bar {
          flex: 1; height: 6px; background: var(--term-input);
          border-radius: 1px; overflow: hidden; position: relative;
        }
        .ma-progress-fill {
          position: absolute; left: 0; top: 0; height: 100%;
          background: var(--term-accent); width: 64%;
          box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
        }
        .ma-progress-meta { color: var(--term-fg-muted); display: flex; gap: 1rem; }
        .ma-progress-meta strong { color: var(--term-accent); font-weight: 400; }

        /* Body: 3 columns */
        .ma-body { flex: 1; display: grid;
                   grid-template-columns: 280px 1fr 320px;
                   overflow: hidden; }

        /* Agent roster */
        .ma-roster {
          border-right: 1px solid var(--term-border);
          padding: 1.25rem 1rem; overflow: hidden;
          background: var(--term-bg);
        }
        .ma-roster-h {
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--term-accent); margin-bottom: 0.85rem;
          display: flex; justify-content: space-between;
        }
        .ma-roster-h span { color: var(--term-fg-muted); letter-spacing: 0.04em; text-transform: none; }
        .ma-agent {
          display: grid; grid-template-columns: 12px 1fr auto;
          gap: 0.55rem; padding: 0.45rem 0; align-items: baseline;
          border-bottom: 1px dashed var(--term-border);
        }
        .ma-agent:last-of-type { border-bottom: none; }
        .ma-agent .st { font-family: var(--font-mono); font-size: 11px;
                         color: var(--term-fg-muted); }
        .ma-agent .st.ok { color: var(--term-ok); }
        .ma-agent .st.run { color: var(--term-accent); animation: ma-blink 1s infinite step-end; }
        .ma-agent .st.q { color: var(--term-fg-muted); }
        .ma-agent .st.warn { color: var(--warn); }
        .ma-agent .name { color: var(--term-fg); font-size: 12px; line-height: 1.4; }
        .ma-agent .name small { display: block; color: var(--term-fg-muted);
                                  font-size: 10px; margin-top: 1px; }
        .ma-agent .time { font-family: var(--font-mono); color: var(--term-fg-muted);
                           font-size: 10px; align-self: center; }
        .ma-agent.run .name { color: var(--term-accent); }

        @keyframes ma-blink { 50% { opacity: 0.35; } }

        /* Center: stream */
        .ma-stream {
          border-right: 1px solid var(--term-border);
          padding: 1rem 1.25rem; overflow: hidden;
          background: var(--term-bg);
        }
        .ma-stream-h {
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--term-accent); margin-bottom: 0.85rem;
          display: flex; justify-content: space-between;
        }
        .ma-stream-h .switch { color: var(--term-fg-muted); font-size: 10px;
                                 letter-spacing: 0.04em; text-transform: none; }
        .ma-stream-h .switch span { color: var(--term-fg); }

        .ma-line { font-size: 12px; padding: 1px 0; }
        .ma-line .ts { color: var(--term-fg-muted); margin-right: 0.6rem; }
        .ma-line .src { color: var(--term-accent); margin-right: 0.6rem; }
        .ma-line .lvl { margin-right: 0.4rem; }
        .ma-line .lvl.ok { color: var(--term-ok); }
        .ma-line .lvl.info { color: var(--info-soft-fg); color: #60a5fa; }
        .ma-line .lvl.warn { color: var(--warn); }
        .ma-line .lvl.run { color: var(--term-accent); }
        .ma-line .lvl.note { color: var(--term-fg-muted); }
        .ma-line .msg { color: var(--term-fg); }
        .ma-line .msg em { color: var(--term-accent); font-style: normal; }
        .ma-line .msg .dim { color: var(--term-fg-muted); }
        .ma-line.comment { color: var(--term-fg-muted); padding: 0.5rem 0 0.25rem; }
        .ma-line.comment .ts { visibility: hidden; }

        .ma-bullet { padding: 1px 0 1px 4.5rem; color: var(--term-fg); font-size: 11.5px; }
        .ma-bullet .acc { color: var(--term-accent); }
        .ma-bullet::before { content: '↳ '; color: var(--term-fg-muted); margin-left: -1rem; }

        .ma-handoff {
          margin: 0.5rem 0; padding: 0.5rem 0.8rem;
          border: 1px dashed var(--term-border); background: var(--term-panel);
          font-size: 11px; color: var(--term-fg-muted); border-radius: 2px;
        }
        .ma-handoff strong { color: var(--term-accent); font-weight: 400;
                              letter-spacing: 0.06em; }

        .ma-cursor {
          color: var(--term-accent); padding: 0.5rem 0;
        }
        .ma-cursor::after {
          content: '▍'; animation: ma-blink 1s infinite step-end;
        }

        /* Right: outputs */
        .ma-out {
          padding: 1rem 1rem; overflow: hidden;
          background: var(--term-bg);
        }
        .ma-out-h {
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--term-accent); margin-bottom: 0.85rem;
          display: flex; justify-content: space-between;
        }
        .ma-out-h span { color: var(--term-fg-muted); letter-spacing: 0.04em; text-transform: none; }
        .ma-out-dir {
          color: var(--term-fg-muted); padding: 0.35rem 0;
          font-size: 11px; letter-spacing: 0.04em;
        }
        .ma-out-file {
          padding: 0.25rem 0 0.25rem 1rem;
          display: flex; justify-content: space-between;
          color: var(--term-fg); border-bottom: 1px dashed var(--term-border);
        }
        .ma-out-file:last-child { border-bottom: none; }
        .ma-out-file .meta { color: var(--term-fg-muted); font-size: 10px; }
        .ma-out-file .meta .new { color: var(--term-ok); }
        .ma-out-file .meta .draft { color: var(--term-accent); }
        .ma-out-file .meta .pending { color: var(--term-fg-muted); }
        .ma-out-file.queued { opacity: 0.5; }
        .ma-out-file.queued .name::before { content: '· '; color: var(--term-fg-muted); }

        .ma-pause {
          margin-top: 1rem; padding: 0.75rem 0.85rem;
          background: var(--term-panel); border: 1px solid var(--warn);
          color: var(--term-fg); font-size: 11px;
        }
        .ma-pause strong { color: var(--warn); display: block; margin-bottom: 0.25rem;
                            letter-spacing: 0.08em; text-transform: uppercase;
                            font-size: 10px; font-weight: 400; }
        .ma-pause em { color: var(--term-accent); font-style: normal; }
        .ma-pause .row { display: flex; gap: 0.5rem; margin-top: 0.55rem; }
        .ma-pause button {
          flex: 1; background: var(--term-input); border: 1px solid var(--term-border);
          color: var(--term-fg); font-family: inherit; font-size: 10px;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 0.35rem 0.5rem; cursor: pointer; border-radius: 2px;
        }
        .ma-pause button.acc {
          background: var(--term-accent); color: #000; border-color: var(--term-accent);
          font-weight: 700;
        }

        .ma-cmd {
          padding: 0.5rem 0.7rem; background: var(--term-input);
          border: 1px solid var(--term-border); border-radius: 2px;
          margin-top: 0.5rem;
        }
        .ma-cmd::before { content: '> '; color: var(--term-accent); }
      `}</style>

      <div className="ma-bar">
        <span className="dots" />
        <span className="title">safe :: agents :: build · civil-rights-5d</span>
        <span className="right">
          <span>session <strong>P1 · 47:21</strong></span>
          <span>tier 2 · gpu local</span>
          <span>4.2GB · local-only</span>
        </span>
      </div>

      <div className="ma-brief">
        <div className="ma-brief-row">
          <span className="ma-brief-lbl">// request</span>
          <span className="ma-brief-val">
            "Build a <em>5-day Civil Rights</em> unit for 5th grade. Lead with
            the Birmingham Children's Crusade. Include differentiated reading,
            a debate scaffold for day 4, and a parent-comm template explaining
            the unit. Constraints: <em>no graphic imagery</em>, audio variant
            for Mia, Hindi vocab anchor for Priya."
          </span>
        </div>
        <div className="ma-brief-row">
          <span className="ma-brief-lbl">// dispatched</span>
          <span className="ma-brief-val">
            <em>10 agents</em> · 6 done · 2 running · 1 paused for review · 1 queued
          </span>
        </div>

        <div className="ma-progress-row">
          <div className="ma-progress-bar"><div className="ma-progress-fill" /></div>
          <div className="ma-progress-meta">
            <span><strong>64%</strong></span>
            <span>elapsed <strong>04:12</strong></span>
            <span>est. remaining <strong>02:30</strong></span>
            <span>tokens <strong>184k</strong> local</span>
          </div>
        </div>
      </div>

      <div className="ma-body">
        {/* Roster */}
        <div className="ma-roster">
          <div className="ma-roster-h">Agents <span>10 dispatched</span></div>

          <div className="ma-agent"><span className="st ok">●</span>
            <div className="name">curriculum<small>unit + day sequencing</small></div>
            <span className="time">0.9s</span></div>

          <div className="ma-agent"><span className="st ok">●</span>
            <div className="name">historical-accuracy<small>fact-check + sourcing</small></div>
            <span className="time">2.1s</span></div>

          <div className="ma-agent"><span className="st ok">●</span>
            <div className="name">reading-adapter<small>grade 3 / 5 / 7</small></div>
            <span className="time">3.4s</span></div>

          <div className="ma-agent"><span className="st ok">●</span>
            <div className="name">classroom-activity<small>warm-ups, exits</small></div>
            <span className="time">1.7s</span></div>

          <div className="ma-agent"><span className="st ok">●</span>
            <div className="name">sped<small>Mia · audio + accom.</small></div>
            <span className="time">2.0s</span></div>

          <div className="ma-agent"><span className="st ok">●</span>
            <div className="name">esl-anchor<small>Priya · Hindi vocab</small></div>
            <span className="time">1.5s</span></div>

          <div className="ma-agent run"><span className="st run">▶</span>
            <div className="name">assessment<small>rubric + day 5 quiz</small></div>
            <span className="time">running</span></div>

          <div className="ma-agent run"><span className="st run">▶</span>
            <div className="name">debate-moderator<small>day 4 scaffolds</small></div>
            <span className="time">running</span></div>

          <div className="ma-agent"><span className="st warn">‼</span>
            <div className="name">parent-comm<small>paused · needs review</small></div>
            <span className="time">paused</span></div>

          <div className="ma-agent"><span className="st q">○</span>
            <div className="name">behavioral-support<small>queued</small></div>
            <span className="time">queued</span></div>
        </div>

        {/* Stream */}
        <div className="ma-stream">
          <div className="ma-stream-h">
            <span>Stream</span>
            <span className="switch">view: <span>all · curriculum · agent-name</span></span>
          </div>

          <div className="ma-line comment"><span className="ts">         </span># T+00:00 dispatched</div>

          <div className="ma-line"><span className="ts">04:12:08</span><span className="src">[curriculum]</span><span className="lvl ok">ok</span><span className="msg">5-day arc decided · Birmingham anchor day 1 · march to Voting Rights Act day 5</span></div>
          <div className="ma-bullet">D1 <span className="acc">Children's Crusade</span> · D2 march mechanics · D3 the law · D4 voices in conflict · D5 today's echoes</div>

          <div className="ma-line"><span className="ts">04:12:14</span><span className="src">[historical-accuracy]</span><span className="lvl ok">ok</span><span className="msg">sourced from <em>your archive</em> + district textbook + 4 primary docs</span></div>
          <div className="ma-bullet">flagged 1 candidate quote (<span className="acc">contested attribution</span>) · removed</div>

          <div className="ma-line"><span className="ts">04:12:31</span><span className="src">[reading-adapter]</span><span className="lvl ok">ok</span><span className="msg">3 reading levels per day · grade 3, 5, 7</span></div>
          <div className="ma-bullet">D1 set assigned: Mia → <span className="acc">L3</span>, Priya → <span className="acc">L3+anchor</span>, Aisha → <span className="acc">L7</span></div>

          <div className="ma-line"><span className="ts">04:12:55</span><span className="src">[classroom-activity]</span><span className="lvl ok">ok</span><span className="msg">warm-ups + exits for all 5 days · your style memory applied</span></div>
          <div className="ma-bullet">CER frames day 1,2,5 · timeline build day 2 · gallery walk day 3</div>

          <div className="ma-line"><span className="ts">04:13:18</span><span className="src">[sped]</span><span className="lvl ok">ok</span><span className="msg">Mia: 4 audio narrations (D1–D4) · voice-to-text on responses</span></div>

          <div className="ma-line"><span className="ts">04:13:21</span><span className="src">[esl-anchor]</span><span className="lvl ok">ok</span><span className="msg">Priya: Hindi vocab card · 18 terms · L1 anchors verified</span></div>

          <div className="ma-line comment"><span className="ts">         </span># T+01:14 mid-run intervention</div>

          <div className="ma-handoff">
            <strong>// handoff</strong> &nbsp; curriculum → debate-moderator &nbsp;·&nbsp; "day 4 needs a scaffold that holds 5th graders accountable to a position they didn't pick. use the affinity protocol from your archive 2024/affinity.md."
          </div>

          <div className="ma-line"><span className="ts">04:14:02</span><span className="src">[debate-moderator]</span><span className="lvl run">..</span><span className="msg">drafting affinity protocol · 4 roles · "<em>position you'd defend, position you'd resist, position you don't yet have words for</em>"</span></div>

          <div className="ma-line"><span className="ts">04:14:40</span><span className="src">[assessment]</span><span className="lvl run">..</span><span className="msg">day 5 quiz · 6 items · <span className="dim">currently writing item 4 of 6</span></span></div>

          <div className="ma-line"><span className="ts">04:15:12</span><span className="src">[parent-comm]</span><span className="lvl warn">!</span><span className="msg">draft ready · <em>pausing for your review</em> — civil rights units have triggered family questions in your district. recommended.</span></div>

          <div className="ma-line comment"><span className="ts">         </span># waiting on you</div>

          <div className="ma-cursor">teachers-tool ::</div>
        </div>

        {/* Outputs */}
        <div className="ma-out">
          <div className="ma-out-h">Outputs <span>12 files</span></div>

          <div className="ma-out-dir">~/units/civil-rights-5d/</div>

          <div className="ma-out-file">
            <span className="name">UNIT.md</span>
            <span className="meta"><span className="new">new</span> · 4.2kb</span>
          </div>
          <div className="ma-out-file">
            <span className="name">d1-childrens-crusade.md</span>
            <span className="meta"><span className="new">new</span> · 8.1kb</span>
          </div>
          <div className="ma-out-file">
            <span className="name">d2-march-mechanics.md</span>
            <span className="meta"><span className="new">new</span> · 6.7kb</span>
          </div>
          <div className="ma-out-file">
            <span className="name">d3-the-law.md</span>
            <span className="meta"><span className="new">new</span> · 7.3kb</span>
          </div>
          <div className="ma-out-file">
            <span className="name">d4-voices.md</span>
            <span className="meta"><span className="draft">draft</span> · 3.8kb</span>
          </div>
          <div className="ma-out-file queued">
            <span className="name">d5-echoes.md</span>
            <span className="meta"><span className="pending">queued</span></span>
          </div>

          <div className="ma-out-dir" style={{ marginTop: '0.6rem' }}>./adapted/</div>
          <div className="ma-out-file">
            <span className="name">d1.L3.md  d1.L7.md</span>
            <span className="meta"><span className="new">new</span></span>
          </div>
          <div className="ma-out-file">
            <span className="name">mia.audio/  4 mp3</span>
            <span className="meta"><span className="new">new</span> · 11.2mb</span>
          </div>
          <div className="ma-out-file">
            <span className="name">priya.hindi-vocab.pdf</span>
            <span className="meta"><span className="new">new</span></span>
          </div>

          <div className="ma-out-dir" style={{ marginTop: '0.6rem' }}>./assess/</div>
          <div className="ma-out-file queued">
            <span className="name">rubric.4pt.md</span>
            <span className="meta"><span className="pending">writing</span></span>
          </div>
          <div className="ma-out-file queued">
            <span className="name">d5-quiz.md</span>
            <span className="meta"><span className="draft">4 of 6</span></span>
          </div>

          <div className="ma-out-dir" style={{ marginTop: '0.6rem' }}>./family/</div>
          <div className="ma-out-file">
            <span className="name">parent-letter.draft.md</span>
            <span className="meta"><span className="draft">paused</span></span>
          </div>

          <div className="ma-pause">
            <strong>// human-in-the-loop</strong>
            Parent letter for Civil Rights units paused for your read.
            District flag: <em>topic-sensitive comms</em>. 2 min review.
            <div className="row">
              <button>Skip</button>
              <button className="acc">Review &amp; resume</button>
            </div>
          </div>

          <div className="ma-cmd">
            ./inspect d4-voices.md
          </div>
        </div>
      </div>
    </div>
  );
}

window.MultiAgentArtboard = MultiAgentArtboard;
