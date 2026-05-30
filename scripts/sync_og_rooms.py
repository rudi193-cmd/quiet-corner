#!/usr/bin/env python3
"""Sync archetype room HTML from OG Teachers Tool zip into wired kebab-case files."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OG = Path("/tmp/teachers-og")

HREF_MAP = {
    "Book Nook.html": "book-nook.html",
    "Book Nook v1.html": "book-nook.html",
    "Cat Gremlin.html": "cat-gremlin.html",
    "Cottagecore.html": "cottagecore.html",
    "STEM Commander.html": "stem-commander.html",
    "Retro Academia.html": "retro-academia.html",
    "Classroom OS.html": "classroom-os.html",
}

ROOMS = [
    ("Book Nook.html", "book-nook.html", "wren"),
    ("Cat Gremlin.html", "cat-gremlin.html", "patches"),
    ("Cottagecore.html", "cottagecore.html", "sage"),
    ("STEM Commander.html", "stem-commander.html", "apex"),
    ("Retro Academia.html", "retro-academia.html", "archivist"),
]

COMPANION_LABEL = {
    "wren": "Wren is here",
    "patches": "Patches is here",
    "sage": "Sage is here",
    "apex": "apex :: active",
    "archivist": "The Archivist is here",
}


def rewrite_hrefs(html: str) -> str:
    for old, new in HREF_MAP.items():
        html = html.replace(f'href="{old}"', f'href="{new}"')
        html = html.replace(f"href='{old}'", f"href='{new}'")
    return html


def inject_head(html: str) -> str:
    if "cos-data.js" not in html:
        html = html.replace(
            "<head>",
            '<head>\n<script src="cos-data.js"></script>',
            1,
        )
    return html


def personalize_nav(html: str, archetype: str) -> str:
    label = COMPANION_LABEL[archetype]
    if 'class="bn-nav-room"' in html:
        html = html.replace(
            '<span class="bn-nav-room">',
            '<span class="bn-nav-room" id="nav-teacher">',
            1,
        )
    html = html.replace(
        f"<span>{label}</span>",
        f'<span id="companion-label">{label}</span>',
        1,
    )
    return html


def inject_theme_hub_link(html: str, active: str) -> str:
    hub = '<a href="classroom-os.html">Hub</a>\n  '
    if "classroom-os.html" not in html:
        html = html.replace("<nav class=\"theme-nav\">\n  ", f"<nav class=\"theme-nav\">\n  {hub}", 1)
    # Fix active class on current room
    html = re.sub(r' class="active"', "", html)
    html = html.replace(f'href="{active}"', f'href="{active}" class="active"', 1)
    return html


def inject_boot(html: str, archetype: str) -> str:
    boot = (
        f'\n<script src="room-wiring.js"></script>\n'
        f"<script>bootRoom('{archetype}');</script>\n"
    )
    if "room-wiring.js" not in html:
        html = html.replace(
            '<script src="classroom-os-bg.js"></script>',
            boot + '<script src="classroom-os-bg.js"></script>',
            1,
        )
    return html


def sync_room(src: str, dest: str, archetype: str) -> None:
    html = (OG / src).read_text(encoding="utf-8")
    html = rewrite_hrefs(html)
    html = inject_head(html)
    html = personalize_nav(html, archetype)
    html = inject_theme_hub_link(html, dest)
    html = inject_boot(html, archetype)
    (ROOT / dest).write_text(html, encoding="utf-8")
    print(f"wrote {dest}")


def sync_hub() -> None:
    html = (OG / "Classroom OS.html").read_text(encoding="utf-8")
    html = rewrite_hrefs(html)
    html = inject_head(html)
    cards = [
        ("hub-card--booknook", "wren", "book-nook.html"),
        ("hub-card--catgremlin", "patches", "cat-gremlin.html"),
        ("hub-card--cottagecore", "sage", "cottagecore.html"),
        ("hub-card--stem", "apex", "stem-commander.html"),
        ("hub-card--retro", "archivist", "retro-academia.html"),
    ]
    for cls, arch, href in cards:
        html = html.replace(
            f'<a href="{href}" class="hub-card {cls}">',
            f'<a href="{href}" class="hub-card {cls}" data-archetype="{arch}">',
            1,
        )
    html = html.replace(
        '<div class="hub-footer">',
        '<div class="hub-footer"><a href="records.html" style="color:rgba(200,170,120,0.65);margin-right:1.5rem">Records</a>',
        1,
    )
    gate = """
<script>
(async () => {
  await cosData.applyOnboardingFromUrl();
  const config = await cosData.getConfig();
  if (!cosData.isOnboardingComplete(config)) {
    window.location.replace('onboarding.html');
    return;
  }
  const name = config.teacher_name;
  if (name && name !== 'Your Name') {
    document.querySelector('.hub-eyebrow').textContent = 'Classroom OS · ' + name;
  }
  document.querySelectorAll('[data-archetype]').forEach(card => {
    card.addEventListener('click', () => {
      const arch = card.dataset.archetype;
      if (arch) cosData.patchConfig({ preferences: { archetype: arch } });
    });
  });
})();
</script>
"""
    html = html.replace("</body>", gate + "\n</body>")
    (ROOT / "classroom-os.html").write_text(html, encoding="utf-8")
    print("wrote classroom-os.html")


def main() -> None:
    if not OG.is_dir():
        raise SystemExit(f"Extract OG zip to {OG} first")
    for src, dest, arch in ROOMS:
        sync_room(src, dest, arch)
    sync_hub()


if __name__ == "__main__":
    main()
