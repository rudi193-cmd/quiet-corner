#!/usr/bin/env bash
# Serve Quiet Corner over HTTP so localStorage is shared across pages.
# file:// gives each HTML file a separate origin in most browsers → onboarding loop.
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "Quiet Corner → http://127.0.0.1:${PORT}/onboarding.html"
echo "Records (observations + backup) → http://127.0.0.1:${PORT}/records.html"
echo "Dev mode: Cache-Control no-store (CSS/HTML reload without hard refresh)"
echo "Press Ctrl+C to stop."
exec python3 - "$PORT" <<'PY'
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1])

class DevHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Prevent stale cached HTML (old inline CSS) during development
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        if args and str(args[0]).startswith("GET"):
            path = str(args[0]).split()[1]
            if path.endswith((".css", ".html", ".js")):
                super().log_message(fmt, *args)

with ThreadingHTTPServer(("127.0.0.1", PORT), DevHandler) as httpd:
    httpd.serve_forever()
PY
