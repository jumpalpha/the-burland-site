#!/usr/bin/env bash
# Compress a NotebookLM Audio Overview into a small mono MP3 for the site.
#   scripts/compress-episode.sh ~/Downloads/overview.m4a 1
# writes basecamp/audio/ep01.mp3 and prints its length for data.js.
set -euo pipefail
cd "$(dirname "$0")/.."
in="$1"; n=$(printf "%02d" "$2")
out="basecamp/audio/ep${n}.mp3"
mkdir -p basecamp/audio
ffmpeg -hide_banner -loglevel error -y -i "$in" -ac 1 -ar 44100 -b:a 64k -map_metadata -1 \
  -metadata title="Burland Basecamp, Episode $2" -metadata artist="The Burland" "$out"
secs=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
printf '%s  %s  length: "%d min"\n' "$out" "$(du -h "$out" | cut -f1)" "$(( (${secs%.*} + 30) / 60 ))"
