/**
 * classroom-os-bg.js
 * Lets teachers set their own classroom photo as the room background.
 * Drag any image onto the page, or click the nav button.
 * Compressed + stored in localStorage per room. Survives refresh.
 */
(function () {
  'use strict';

  // Unique key per room (based on filename)
  const KEY = 'cos-bg-' + location.pathname.split('/').pop().replace(/[^a-zA-Z0-9]/g, '-');

  /* ── Restore saved background on load ── */
  const saved = localStorage.getItem(KEY);
  if (saved) document.body.style.backgroundImage = 'url(' + saved + ')';

  /* ── Compress + store ── */
  function applyPhoto(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const img = new Image();
    const blobUrl = URL.createObjectURL(file);
    img.onload = function () {
      const MAX = 1920;
      const scale = Math.min(1, MAX / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      document.body.style.backgroundImage = 'url(' + dataUrl + ')';
      try { localStorage.setItem(KEY, dataUrl); }
      catch (e) { console.warn('Classroom OS: background too large to persist — showing this session only.'); }
      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;
  }

  /* ── File picker ── */
  const picker = document.createElement('input');
  picker.type   = 'file';
  picker.accept = 'image/*';
  picker.style.display = 'none';
  picker.onchange = function () { if (picker.files[0]) applyPhoto(picker.files[0]); };
  document.body.appendChild(picker);

  /* Public API */
  window.cosPickBackground  = function () { picker.click(); };
  window.cosResetBackground = function () {
    document.body.style.backgroundImage = '';
    localStorage.removeItem(KEY);
  };

  /* ── Drag and drop ── */
  let hideTimer;

  document.addEventListener('dragenter', function (e) {
    if ([...e.dataTransfer.types].includes('Files')) {
      e.preventDefault();
      clearTimeout(hideTimer);
      document.body.classList.add('cos-drop-active');
    }
  });

  document.addEventListener('dragover', function (e) {
    if ([...e.dataTransfer.types].includes('Files')) {
      e.preventDefault();
      clearTimeout(hideTimer);
      document.body.classList.add('cos-drop-active');
    }
  });

  document.addEventListener('dragleave', function () {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      document.body.classList.remove('cos-drop-active');
    }, 80);
  });

  document.addEventListener('drop', function (e) {
    e.preventDefault();
    document.body.classList.remove('cos-drop-active');
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) applyPhoto(file);
  });
})();
