#!/usr/bin/env bash
# Cache-busting: stamps every reference to style.css and main.js in the site's
# HTML pages with a short fingerprint of that file's contents, e.g.
#   main.js  ->  main.js?v=3f9a2c1b
# When a file changes, its fingerprint changes, so every visitor's browser
# downloads the new copy instead of reusing an old cached one. Running it again
# with no file changes produces no changes (safe to run any time).
set -euo pipefail
cd "$(dirname "$0")/.."

for asset in style.css main.js; do
  [ -f "$asset" ] || continue
  v=$(sha256sum "$asset" | cut -c1-8)
  esc=${asset//./\\.}
  find . -name '*.html' -not -path './.git/*' -print0 |
    xargs -0 sed -i -E "s#((src|href)=\"(\./)?)${esc}(\?v=[A-Za-z0-9]*)?\"#\1${asset}?v=${v}\"#g"
  echo "$asset -> v=$v"
done
