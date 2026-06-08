// qc-data.js — Quiet Corner data layer (cos_* legacy prefix)
// USE_API=false: localStorage backend (pilot mode, no server needed)
// USE_API=true:  FastAPI at 127.0.0.1:8432 (production)

const COS_API = 'http://127.0.0.1:8432';
const USE_API = false;

const ARCHETYPE_ROOMS = {
  wren: 'book-nook.html',
  patches: 'cat-gremlin.html',
  sage: 'cottagecore.html',
  apex: 'stem-commander.html',
  archivist: 'retro-academia.html',
};

const cosData = (() => {

  // The 'cos_' key prefix is a stable on-disk contract: existing pilot browsers
  // already hold cos_* data, so the prefix is retained even though the files are
  // renamed (renaming the prefix would orphan that data). Keep it as-is.
  const db = {
    get: k => {
      try {
        return JSON.parse(localStorage.getItem('cos_' + k) || 'null');
      } catch {
        // A single corrupt key must not brick app init.
        return null;
      }
    },
    set: (k, v) => {
      try {
        localStorage.setItem('cos_' + k, JSON.stringify(v));
      } catch (e) {
        const err = new Error(
          e && (e.name === 'QuotaExceededError' || e.code === 22)
            ? "Couldn't save — browser storage is full. Export a backup, then clear old data."
            : "Couldn't save to browser storage. Your change was not stored."
        );
        err.name = 'StorageError';
        throw err;
      }
    },
  };

  // Monotonic numeric ID generator: always increasing integers, so two records
  // created in the same millisecond never collide. Stays numeric to remain
  // compatible with parseInt() + strict === comparisons in records.html.
  let _lastId = 0;
  function genId() {
    _lastId = Math.max(Date.now(), _lastId + 1);
    return _lastId;
  }

  const DEFAULT_CONFIG = {
    tier: 1, model: 'local', gpu: false,
    teacher_name: 'Your Name',
    preferences: {
      archetype: null,
      current_readaloud: { title: '', author: '', current_page: 0, total_pages: 0 }
    },
    session_scope: {
      roster_visible: true, attendance_visible: true,
      standards_visible: true, knowledge_graph_visible: true,
      iep_visible: false, behavior_visible: false,
      parent_contact_visible: false, archive_visible: true
    }
  };

  let _briefCache = null;

  function deepMerge(base, patch) {
    const result = { ...base };
    for (const key of Object.keys(patch)) {
      if (patch[key] !== null && typeof patch[key] === 'object' && !Array.isArray(patch[key])) {
        result[key] = deepMerge(base[key] || {}, patch[key]);
      } else {
        result[key] = patch[key];
      }
    }
    return result;
  }

  function today() { return new Date().toISOString().slice(0, 10); }

  function yesterday() {
    return new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  }

  function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  function nowMinutes() {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }

  function formatTime12(t) {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }

  function obsDate(o) {
    return o.date || (o.observed_at || '').slice(0, 10);
  }

  function normalizeObservation(o) {
    const sid = o.student_id ?? o.studentId;
    return {
      ...o,
      student_id: sid,
      studentId: sid,
      date: obsDate(o),
      observed_at: o.observed_at || o.date || new Date().toISOString(),
      standard: o.standard || '',
      pathways: o.pathways || [],
      signals: o.signals || [],
      notes: o.notes ?? o.note ?? '',
    };
  }

  function observationSummary(o) {
    if (o.notes) return o.notes;
    if (o.signals?.length) return o.signals[0];
    if (o.pathways?.length) return o.pathways.join(', ');
    return o.standard || '';
  }

  function migrateFromAssessmentVisibility() {
    if (db.get('migrated_av')) return;

    const avGet = k => JSON.parse(localStorage.getItem('av_' + k) || 'null');

    const avStudents = avGet('students');
    if (Array.isArray(avStudents) && avStudents.length && !(db.get('students') || []).length) {
      db.set('students', avStudents.map(s => ({ ...s, created_at: s.created_at || new Date().toISOString() })));
    }

    const avObs = avGet('obs');
    if (Array.isArray(avObs) && avObs.length && !(db.get('observations') || []).length) {
      db.set('observations', avObs.map(o => normalizeObservation({
        ...o,
        id: o.id || genId(),
        created_at: o.created_at || new Date().toISOString(),
      })));
    }

    const avSkills = avGet('skills');
    if (Array.isArray(avSkills) && avSkills.length && !(db.get('skills') || []).length) {
      db.set('skills', avSkills);
    }

    const avMeetings = avGet('meetings');
    if (Array.isArray(avMeetings) && avMeetings.length && !(db.get('meetings') || []).length) {
      db.set('meetings', avMeetings);
    }

    db.set('migrated_av', true);
  }

  migrateFromAssessmentVisibility();

  function clearBriefCache() { _briefCache = null; }

  // ── Config ──────────────────────────────────────────────────────

  async function getConfig() {
    if (USE_API) return fetch(COS_API + '/config').then(r => r.json());
    return deepMerge(DEFAULT_CONFIG, db.get('config') || {});
  }

  async function patchConfig(patch) {
    if (USE_API) return fetch(COS_API + '/config', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    }).then(r => r.json());
    const config = await getConfig();
    const updated = deepMerge(config, patch);
    db.set('config', updated);
    return updated;
  }

  function getRoomUrl(archetype) {
    return ARCHETYPE_ROOMS[archetype] || 'book-nook.html';
  }

  // ── Schedule ────────────────────────────────────────────────────

  async function getSchedule() {
    if (USE_API) return fetch(COS_API + '/schedule').then(r => r.json());
    return db.get('schedule') || [];
  }

  async function postSchedule(period) {
    if (USE_API) return fetch(COS_API + '/schedule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(period)
    }).then(r => r.json());
    const schedule = await getSchedule();
    const item = { ...period, id: genId() };
    schedule.push(item);
    db.set('schedule', schedule);
    return item;
  }

  async function deleteSchedulePeriod(id) {
    if (USE_API) return fetch(COS_API + '/schedule/' + id, { method: 'DELETE' });
    const schedule = await getSchedule();
    db.set('schedule', schedule.filter(p => p.id !== id));
  }

  async function getScheduleToday() {
    if (USE_API) return fetch(COS_API + '/schedule/today').then(r => r.json());
    const schedule = await getSchedule();
    const dow = new Date().getDay();
    const dayIndex = dow === 0 ? 6 : dow - 1;
    const lessons = await getLessons();
    const todayPeriods = schedule
      .filter(p => p.day_of_week === dayIndex)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return todayPeriods.map(p => ({
      ...p,
      start_12: formatTime12(p.start_time),
      end_12: formatTime12(p.end_time),
      start_min: timeToMinutes(p.start_time),
      end_min: timeToMinutes(p.end_time),
      lesson: lessons.find(l => l.schedule_id === p.id && l.scheduled_at === today()) || null
    }));
  }

  // ── Students ────────────────────────────────────────────────────

  async function getStudents() {
    if (USE_API) return fetch(COS_API + '/students').then(r => r.json());
    return (db.get('students') || []).filter(s => !s.archived_at);
  }

  async function postStudent(student) {
    if (USE_API) return fetch(COS_API + '/students', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    }).then(r => r.json());
    const all = db.get('students') || [];
    const item = { ...student, id: student.id || genId(), created_at: new Date().toISOString() };
    all.push(item);
    db.set('students', all);
    return item;
  }

  // ── Observations ────────────────────────────────────────────────

  async function getObservations(filter = {}) {
    if (USE_API) {
      const p = new URLSearchParams(filter);
      return fetch(COS_API + '/observations?' + p).then(r => r.json());
    }
    let obs = (db.get('observations') || []).map(normalizeObservation);
    if (filter.student_id != null) {
      obs = obs.filter(o => o.student_id === filter.student_id || o.studentId === filter.student_id);
    }
    if (filter.date) obs = obs.filter(o => obsDate(o) === filter.date);
    return obs.sort((a, b) => (b.observed_at || '').localeCompare(a.observed_at || ''));
  }

  async function postObservation(obs) {
    if (USE_API) return fetch(COS_API + '/observations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obs)
    }).then(r => r.json());
    const all = db.get('observations') || [];
    const item = normalizeObservation({
      ...obs,
      id: genId(),
      created_at: new Date().toISOString(),
      observed_at: obs.observed_at || obs.date || new Date().toISOString(),
    });
    all.unshift(item);
    db.set('observations', all);
    clearBriefCache();
    return item;
  }

  // ── Skills ──────────────────────────────────────────────────────

  async function getSkills(filter = {}) {
    if (USE_API) {
      const p = new URLSearchParams(filter);
      return fetch(COS_API + '/skills?' + p).then(r => r.json());
    }
    let skills = db.get('skills') || [];
    if (filter.student_id != null) {
      skills = skills.filter(s => s.studentId === filter.student_id || s.student_id === filter.student_id);
    }
    return skills;
  }

  async function postSkill(skill) {
    if (USE_API) return fetch(COS_API + '/skills', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skill)
    }).then(r => r.json());
    const all = db.get('skills') || [];
    const item = { ...skill, id: skill.id || genId() };
    all.push(item);
    db.set('skills', all);
    return item;
  }

  // ── Meetings ────────────────────────────────────────────────────

  async function getMeetings() {
    if (USE_API) return fetch(COS_API + '/meetings').then(r => r.json());
    return db.get('meetings') || [];
  }

  async function postMeeting(meeting) {
    if (USE_API) return fetch(COS_API + '/meetings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting)
    }).then(r => r.json());
    const all = db.get('meetings') || [];
    const item = { ...meeting, id: meeting.id || genId() };
    all.push(item);
    db.set('meetings', all);
    return item;
  }

  // ── Lessons ─────────────────────────────────────────────────────

  async function getLessons(filter = {}) {
    if (USE_API) {
      const p = new URLSearchParams(filter);
      return fetch(COS_API + '/lessons?' + p).then(r => r.json());
    }
    let lessons = db.get('lessons') || [];
    if (filter.status) lessons = lessons.filter(l => l.status === filter.status);
    return lessons;
  }

  async function postLesson(lesson) {
    if (USE_API) return fetch(COS_API + '/lessons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lesson)
    }).then(r => r.json());
    const all = db.get('lessons') || [];
    const item = { ...lesson, id: genId(),
      created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    all.push(item);
    db.set('lessons', all);
    clearBriefCache();
    return item;
  }

  // ── Morning Brief ───────────────────────────────────────────────

  async function getMorningBrief() {
    if (_briefCache) return _briefCache;
    if (USE_API) {
      const config = await getConfig();
      const archetype = config.preferences?.archetype || 'wren';
      _briefCache = await fetch(COS_API + '/morning-brief?companion=' + archetype).then(r => r.json());
      return _briefCache;
    }

    const todayStr = today();
    const yesterdayStr = yesterday();
    const [todayObs, yesterdayObs, allStudents, drafts] = await Promise.all([
      getObservations({ date: todayStr }),
      getObservations({ date: yesterdayStr }),
      getStudents(),
      getLessons({ status: 'draft' }),
    ]);

    const seen = new Set();
    const recentObs = [...todayObs, ...yesterdayObs].filter(o => {
      if (seen.has(o.id)) return false;
      seen.add(o.id);
      return true;
    }).slice(0, 5);

    const items = recentObs.map(o => {
      const student = allStudents.find(s => s.id === o.student_id || s.id === o.studentId);
      return {
        type: 'observation',
        student_name: student?.name || 'Unknown',
        signal: o.signals?.[0] || '',
        note: observationSummary(o),
        when: obsDate(o) === todayStr ? 'today' : 'yesterday',
      };
    });

    if (drafts.length) {
      items.push({
        type: 'basket',
        note: `${drafts.length} draft${drafts.length !== 1 ? 's' : ''} waiting for review.`,
      });
    }

    _briefCache = { mode: 'structured', items, generated_at: new Date().toISOString() };
    return _briefCache;
  }

  // ── Helpers ─────────────────────────────────────────────────────

  function isOnboardingComplete(config) {
    return !!(config?.preferences?.archetype);
  }

  /** Apply ?archetype=&teacher= from onboarding redirect (file:// safe handoff). */
  async function applyOnboardingFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const archetype = params.get('archetype');
    if (!archetype) return null;

    const patch = { preferences: { archetype } };
    const teacher = params.get('teacher');
    if (teacher) patch.teacher_name = teacher;

    const updated = await patchConfig(patch);

    if (window.history?.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('archetype');
      url.searchParams.delete('teacher');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    }
    return updated;
  }

  function isFileProtocol() {
    return window.location.protocol === 'file:';
  }

  const BACKUP_KEYS = [
    'config', 'students', 'observations', 'skills', 'meetings', 'schedule', 'lessons', 'migrated_av',
  ];

  // Keys whose stored value is an array of {id, ...} records (merged item-by-item on import).
  const BACKUP_ARRAY_KEYS = ['students', 'observations', 'skills', 'meetings', 'schedule', 'lessons'];

  // On an id conflict during a merge import, whether the backup's version replaces the
  // existing record. true = backup wins (the teacher explicitly chose to import this backup).
  const MERGE_INCOMING_WINS = true;

  /** Snapshot all Quiet Corner classroom data for export (explicit teacher action). */
  function exportBackup() {
    const data = {};
    for (const k of BACKUP_KEYS) {
      const v = db.get(k);
      if (v != null) data[k] = v;
    }
    const backgrounds = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cos-bg-')) backgrounds[key] = localStorage.getItem(key);
    }
    return {
      format: 'quiet-corner-backup',
      version: 1,
      exported_at: new Date().toISOString(),
      data,
      backgrounds: Object.keys(backgrounds).length ? backgrounds : undefined,
    };
  }

  function downloadBackup() {
    const payload = exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiet-corner-backup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return payload;
  }

  /** Union two record arrays by `id`. Items without an id are always appended. */
  function mergeRecords(existing, incoming) {
    const out = [];
    const indexById = new Map();
    for (const item of Array.isArray(existing) ? existing : []) {
      if (item && item.id != null) indexById.set(item.id, out.length);
      out.push(item);
    }
    let added = 0, updated = 0;
    for (const item of incoming) {
      if (item && item.id != null && indexById.has(item.id)) {
        if (MERGE_INCOMING_WINS) out[indexById.get(item.id)] = item;
        updated++;
      } else {
        if (item && item.id != null) indexById.set(item.id, out.length);
        out.push(item);
        added++;
      }
    }
    return { merged: out, added, updated };
  }

  /**
   * Restore from a backup file (explicit teacher action).
   * - merge=false (replace): each category in the file overwrites the local one.
   * - merge=true  (merge):   arrays are combined, matched by id (backup wins on
   *   conflict); config is deep-merged. Existing records keep their place.
   *
   * The whole payload is validated BEFORE anything is written, so a malformed
   * backup is rejected without corrupting existing data.
   */
  async function importBackup(file, { merge = false } = {}) {
    const text = await file.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error('Backup file is not valid JSON.');
    }
    if (payload.format !== 'quiet-corner-backup') {
      throw new Error('Not a Quiet Corner backup file (missing quiet-corner-backup header).');
    }
    const incoming = payload.data || {};
    if (typeof incoming !== 'object' || Array.isArray(incoming)) {
      throw new Error('Backup is malformed: "data" should be an object.');
    }

    // ── Validate every present key before writing anything (atomic) ──
    for (const k of BACKUP_KEYS) {
      if (!(k in incoming)) continue;
      const v = incoming[k];
      if (BACKUP_ARRAY_KEYS.includes(k)) {
        if (!Array.isArray(v)) {
          throw new Error(`Backup is invalid: "${k}" should be a list but is ${typeof v}.`);
        }
      } else if (k === 'config') {
        if (v === null || typeof v !== 'object' || Array.isArray(v)) {
          throw new Error('Backup is invalid: "config" should be an object.');
        }
      } else if (k === 'migrated_av') {
        if (typeof v !== 'boolean') {
          throw new Error('Backup is invalid: "migrated_av" should be true or false.');
        }
      }
    }
    if (payload.backgrounds != null &&
        (typeof payload.backgrounds !== 'object' || Array.isArray(payload.backgrounds))) {
      throw new Error('Backup is invalid: "backgrounds" should be an object.');
    }

    // ── Apply (validation passed) ──
    let added = 0, updated = 0;
    for (const k of BACKUP_KEYS) {
      if (!(k in incoming)) continue;
      if (!merge) {
        db.set(k, incoming[k]);
        continue;
      }
      if (BACKUP_ARRAY_KEYS.includes(k)) {
        const r = mergeRecords(db.get(k), incoming[k]);
        db.set(k, r.merged);
        added += r.added;
        updated += r.updated;
      } else if (k === 'config') {
        db.set('config', deepMerge(db.get('config') || {}, incoming.config));
      } else if (k === 'migrated_av') {
        db.set('migrated_av', !!db.get('migrated_av') || !!incoming.migrated_av);
      } else {
        db.set(k, incoming[k]);
      }
    }
    if (payload.backgrounds && typeof payload.backgrounds === 'object') {
      for (const [key, value] of Object.entries(payload.backgrounds)) {
        if (key.startsWith('cos-bg-') && value) localStorage.setItem(key, value);
      }
    }
    clearBriefCache();
    return { keys: Object.keys(incoming), merge, added, updated };
  }

  function getCurrentAndNextPeriod(periods) {
    const now = nowMinutes();
    let current = null, next = null;
    for (const p of periods) {
      if (now >= p.start_min && now < p.end_min) { current = p; continue; }
      if (now < p.start_min && !next) { next = p; }
    }
    return { current, next };
  }

  function minutesUntil(period) {
    return period.start_min - nowMinutes();
  }

  function formatCountdown(minutes) {
    if (minutes <= 0) return 'now';
    if (minutes === 1) return 'in 1 minute';
    return `in ${minutes} minutes`;
  }

  return {
    ARCHETYPE_ROOMS,
    getConfig, patchConfig, getRoomUrl,
    getSchedule, postSchedule, deleteSchedulePeriod, getScheduleToday,
    getStudents, postStudent,
    getObservations, postObservation,
    getSkills, postSkill,
    getMeetings, postMeeting,
    getLessons, postLesson,
    getMorningBrief, clearBriefCache,
    isOnboardingComplete, applyOnboardingFromUrl, isFileProtocol,
    exportBackup, downloadBackup, importBackup,
    getCurrentAndNextPeriod, minutesUntil, formatCountdown,
    today, yesterday, timeToMinutes, nowMinutes, formatTime12,
  };
})();
