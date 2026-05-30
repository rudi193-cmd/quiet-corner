// room-wiring.js — shared data wiring for all archetype rooms
// bootRoom(archetype) — archetype key matches cos-data config preferences.archetype

const COMPANION_NAV_LABELS = {
  wren: 'Wren is here',
  patches: 'Patches is here',
  sage: 'Sage is here',
  apex: 'apex :: active',
  archivist: 'The Archivist is here',
};

const COMPANION_NAMES = {
  wren: 'Wren', patches: 'Patches', sage: 'Sage',
  apex: 'Apex', archivist: 'The Archivist',
};

const COMPANION_INITIALS = {
  wren: 'W', patches: 'P', sage: 'S', apex: 'A', archivist: 'Ar',
};

const ROOM_UI = {
  wren: {
    period: 'bn-period', periodNow: 'bn-period--now', periodDot: 'bn-period-dot',
    periodTime: 'bn-period-time', periodInfo: 'bn-period-info',
    companionItems: 'companion-items',
    item: 'bn-wren-item', itemText: 'bn-wren-text', itemAction: 'bn-wren-action', itemEmpty: 'bn-wren-empty',
    basketItem: 'bn-basket-item', basketStatus: 'bn-basket-status', basketEmpty: 'bn-basket-empty',
    companionAvatar: 'companion-avatar', companionNameBlock: 'companion-name-block',
    scheduleEmptyStyle: 'font-size:14px;color:#b89a7a;font-style:italic;padding:0.5rem 0',
    scheduleLinkStyle: 'color:#b5622a',
  },
  default: {
    period: 'period', periodNow: 'period--now', periodDot: 'period-dot',
    periodTime: 'period-time', periodInfo: 'period-info',
    companionItems: 'companion-items',
    item: 'companion-item', itemText: 'companion-text', itemAction: 'companion-action', itemEmpty: 'companion-empty',
    basketItem: 'basket-item', basketStatus: 'basket-status', basketEmpty: 'basket-empty',
    companionAvatar: null, companionNameBlock: 'companion-name-block',
    scheduleEmptyStyle: 'font-size:13px;opacity:0.6;font-style:italic;padding:0.4rem 0',
    scheduleLinkStyle: '',
  },
};

function roomUi(archetype) {
  return ROOM_UI[archetype] || ROOM_UI.default;
}

function greeting() {
  const h = new Date().getHours();
  if (h >= 17) return 'Good evening.';
  if (h >= 12) return 'Good afternoon.';
  return 'Good morning.';
}

function formatDateLong(d) {
  return (d || new Date()).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
}

function pct(current, total) {
  if (!total) return 0;
  return Math.round((current / total) * 100);
}

function esc(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
}

function q(id) { return document.getElementById(id); }

async function bootRoom(expectedArchetype) {
  await cosData.applyOnboardingFromUrl();

  const [config, periods, brief, students, drafts] = await Promise.all([
    cosData.getConfig(),
    cosData.getScheduleToday(),
    cosData.getMorningBrief(),
    cosData.getStudents(),
    cosData.getLessons({ status: 'draft' }),
  ]);

  if (!cosData.isOnboardingComplete(config)) {
    window.location.replace('onboarding.html');
    return;
  }

  const archetype = config.preferences?.archetype || expectedArchetype || 'wren';
  const ui = roomUi(archetype);
  const companionName = COMPANION_NAMES[archetype] || COMPANION_NAMES[expectedArchetype] || 'Companion';
  const ra = config.preferences?.current_readaloud || {};
  const { current, next } = cosData.getCurrentAndNextPeriod(periods);

  const navTeacher = q('nav-teacher');
  if (navTeacher && config.teacher_name && config.teacher_name !== 'Your Name') {
    navTeacher.textContent = `· ${config.teacher_name}`;
  }

  const compLabel = q('companion-label');
  if (compLabel) {
    compLabel.textContent = COMPANION_NAV_LABELS[archetype] || `${companionName} is here`;
  }

  if (ui.companionAvatar) {
    const avatar = q(ui.companionAvatar);
    if (avatar) avatar.textContent = COMPANION_INITIALS[archetype] || companionName.charAt(0);
  }
  const nameBlock = q(ui.companionNameBlock);
  if (nameBlock && nameBlock.id) {
    nameBlock.innerHTML = `${companionName}<small>classroom companion · always local</small>`;
  }

  const navCountdown = q('nav-countdown');
  if (navCountdown) {
    if (current) {
      const remaining = current.end_min - cosData.nowMinutes();
      navCountdown.innerHTML = `${esc(current.label || current.subject || 'Period')} — <strong>${remaining} min left</strong>`;
    } else if (next) {
      const until = cosData.minutesUntil(next);
      navCountdown.innerHTML = `${esc(next.label || next.subject || 'Next period')} begins <strong>${cosData.formatCountdown(until)}</strong>`;
    }
  }

  const quoteZone = q('quote-zone');
  const quoteText = q('quote-text');
  const quoteAttr = q('quote-attr');
  if (quoteText && ra.title) {
    quoteText.textContent = `"${ra.title}"`;
    const parts = [];
    if (ra.author) parts.push(ra.author);
    if (ra.current_page) parts.push(`page ${ra.current_page}`);
    if (next) parts.push(`${next.label || next.subject || 'next period'} at ${next.start_12}`);
    if (quoteAttr) quoteAttr.innerHTML = parts.length ? `— <em>${esc(parts.join(' · '))}</em>` : '';
  } else if (quoteZone && quoteText && !quoteText.textContent.trim()) {
    quoteZone.style.display = 'none';
  }

  const morningGreeting = q('morning-greeting');
  const morningSub = q('morning-sub');
  if (morningGreeting) morningGreeting.textContent = greeting();
  if (morningSub) {
    const sc = students.length;
    let sub = formatDateLong();
    if (sc) sub += `. <em>${sc} student${sc !== 1 ? 's' : ''} on roster.</em>`;
    if (current) sub += ` ${esc(current.label || current.subject || 'Period')} is underway.`;
    else if (next) sub += ` ${esc(next.label || next.subject || 'Next period')} starts ${cosData.formatCountdown(cosData.minutesUntil(next))}.`;
    morningSub.innerHTML = sub;
  }

  const planList = q('plan-list');
  if (planList) {
    if (!periods.length) {
      const linkStyle = ui.scheduleLinkStyle ? ` style="${ui.scheduleLinkStyle}"` : '';
      planList.innerHTML = `<div style="${ui.scheduleEmptyStyle}">No periods set for today. <a href="records.html"${linkStyle}>Open records →</a></div>`;
    } else {
      planList.innerHTML = periods.map(p => {
        const isNow = current && current.id === p.id;
        const cls = isNow ? `${ui.period} ${ui.periodNow}` : ui.period;
        const label = [p.subject, p.label].filter(Boolean).join(' · ') || 'Period';
        const detail = isNow
          ? `${cosData.formatCountdown(cosData.minutesUntil({ start_min: p.end_min }))} remaining`
          : p.lesson ? 'Lesson ready' : '';
        return `<div class="${cls}">
          <div class="${ui.periodDot}"></div>
          <div class="${ui.periodTime}">${esc(p.start_12)} — ${esc(p.end_12)}</div>
          <div class="${ui.periodInfo}">
            <strong>${esc(label)}</strong>
            ${detail ? `<span>${esc(detail)}</span>` : ''}
          </div>
        </div>`;
      }).join('');
    }
  }

  const nextPanel = q('next-up-panel');
  const nextTag = q('next-up-tag');
  const nextH = q('next-up-h');
  const nextP = q('next-up-p');
  if (nextPanel) {
    if (next) {
      if (nextTag) nextTag.textContent = `Next up · ${next.label || next.subject || 'Period'} · ${next.start_12}`;
      if (nextH) nextH.textContent = next.subject || next.label || 'Upcoming period.';
      if (nextP) nextP.textContent = next.lesson?.objective || `Starts ${cosData.formatCountdown(cosData.minutesUntil(next))}.`;
    } else if (current) {
      if (nextTag) nextTag.textContent = 'Now in progress';
      if (nextH) nextH.textContent = current.subject || current.label || 'Current period.';
      if (nextP) nextP.textContent = current.lesson?.objective || '';
    } else {
      nextPanel.style.display = 'none';
    }
  }

  const companionItems = q(ui.companionItems);
  if (companionItems) {
    if (brief.mode === 'structured' && brief.items?.length) {
      companionItems.innerHTML = brief.items.map(item => {
        if (item.type === 'observation') {
          const note = item.note || item.signal || '';
          return `<div class="${ui.item}">
            <div class="${ui.itemText}">"<em>${esc(item.student_name)}</em>${note ? ' — ' + esc(note) : ''}"</div>
          </div>`;
        }
        if (item.type === 'basket') {
          return `<div class="${ui.item}">
            <div class="${ui.itemText}">${esc(item.note)}</div>
            <div class="${ui.itemAction}">Review basket →</div>
          </div>`;
        }
        return '';
      }).join('');
    } else if (brief.text) {
      companionItems.innerHTML = `<div class="${ui.item}"><div class="${ui.itemText}">"${esc(brief.text)}"</div></div>`;
    } else {
      companionItems.innerHTML = `<div class="${ui.itemEmpty}">All quiet. Add observations during the day and ${esc(companionName)} will surface patterns here tomorrow morning.</div>`;
    }
  }

  const rt = config.preferences?.current_readaloud || {};
  const bookTitle = q('book-title');
  const bookAuthor = q('book-author');
  const bookBarFill = q('book-bar-fill');
  const bookPct = q('book-pct');
  if (bookTitle) {
    bookTitle.textContent = rt.title || 'No book set';
    if (bookAuthor) bookAuthor.textContent = rt.author || '';
    if (rt.current_page && bookBarFill && bookPct) {
      const p2 = rt.total_pages ? pct(rt.current_page, rt.total_pages) : 0;
      bookBarFill.style.width = p2 + '%';
      bookPct.textContent = rt.total_pages ? `${p2}% · p. ${rt.current_page} of ${rt.total_pages}` : `Page ${rt.current_page}`;
    } else {
      if (bookBarFill) bookBarFill.style.width = '0%';
      if (bookPct) bookPct.textContent = rt.current_page ? `Page ${rt.current_page}` : '';
    }
  }

  const editBtn = q('reading-edit-btn');
  const form = q('reading-form');
  if (editBtn && form) {
    editBtn.addEventListener('click', () => {
      form.classList.toggle('open');
      if (form.classList.contains('open')) {
        const r = config.preferences?.current_readaloud || {};
        if (q('rf-title')) q('rf-title').value = r.title || '';
        if (q('rf-author')) q('rf-author').value = r.author || '';
        if (q('rf-page')) q('rf-page').value = r.current_page || '';
      }
    });
    const saveBtn = q('rf-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const title = (q('rf-title')?.value || '').trim();
        const author = (q('rf-author')?.value || '').trim();
        const current_page = parseInt(q('rf-page')?.value || '') || 0;
        await cosData.patchConfig({ preferences: { current_readaloud: { title, author, current_page } } });
        if (bookTitle) bookTitle.textContent = title || '—';
        if (bookAuthor) bookAuthor.textContent = author;
        if (bookPct) bookPct.textContent = current_page ? `Page ${current_page}` : '';
        form.classList.remove('open');
      });
    }
  }

  const basketList = q('basket-list');
  if (basketList) {
    if (drafts.length) {
      basketList.innerHTML = drafts.slice(0, 6).map(d => `
        <div class="${ui.basketItem}">
          <div>
            <strong>${esc(d.title || 'Untitled lesson')}</strong>
            <span>${esc(d.subject || '')}${d.scheduled_at ? ` · ${d.scheduled_at}` : ''}</span>
          </div>
          <div class="${ui.basketStatus} open">Draft</div>
        </div>
      `).join('');
    } else {
      basketList.innerHTML = `<div class="${ui.basketEmpty}">Basket is clear.</div>`;
    }
  }

  setInterval(async () => {
    const ps = await cosData.getScheduleToday();
    const { current: c2, next: n2 } = cosData.getCurrentAndNextPeriod(ps);
    const el = q('nav-countdown');
    if (!el) return;
    if (c2) {
      el.innerHTML = `${esc(c2.label || c2.subject || 'Period')} — <strong>${c2.end_min - cosData.nowMinutes()} min left</strong>`;
    } else if (n2) {
      el.innerHTML = `${esc(n2.label || n2.subject || 'Next period')} begins <strong>${cosData.formatCountdown(cosData.minutesUntil(n2))}</strong>`;
    }
  }, 60000);
}
