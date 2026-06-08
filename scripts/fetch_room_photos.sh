#!/usr/bin/env bash
# Fetch the room/hub background photos into assets/rooms/ so Quiet Corner makes
# zero third-party requests at runtime (privacy-first, fully offline-capable).
#
# Photos are from Unsplash (https://unsplash.com), used under the Unsplash License
# (https://unsplash.com/license) — free to use, including bundled in an app.
# Re-run this script to refresh the local copies.
#
# Usage: ./scripts/fetch_room_photos.sh
set -euo pipefail

cd "$(dirname "$0")/.."
DEST="assets/rooms"
mkdir -p "$DEST"

# archetype-filename  ->  Unsplash photo id
declare -A PHOTOS=(
  [wren-booknook]="photo-1481627834876-b7833e8f5570"
  [patches-catgremlin]="photo-1588345921523-c2dcdb7f1dcd"
  [sage-cottagecore]="photo-1466781783364-36c955e42a7f"
  [apex-stem]="photo-1518770660439-4636190af475"
  [archivist-retro]="photo-1507842217343-583bb7270b66"
)

for name in "${!PHOTOS[@]}"; do
  url="https://images.unsplash.com/${PHOTOS[$name]}?w=1920&q=80"
  echo "→ $name.jpg"
  curl -fsSL --max-time 60 "$url" -o "$DEST/$name.jpg"
done

echo "Done. ${#PHOTOS[@]} photos in $DEST/"
