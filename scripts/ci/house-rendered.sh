#!/usr/bin/env bash
# house-rendered.sh - the rendered house gate over a built site (house#18).
#
# usage: scripts/ci/house-rendered.sh [DIST]     (default: dist)
#
# Serves DIST on 127.0.0.1:23161 (the port .house.json "urls" name) and runs:
#   - optical-light, optical-dark, live, type on the .house.json urls
#   - layout on EVERY page of the sitemap, split into HOUSE_SHARDS (default 4)
#     house processes run side by side (one Chromium each)
# then fails unless every one of those steps reported PASS. house itself
# reports SKIP, and exits 0, when a URL is unreachable; this script treats a
# SKIP as a failure, so a server that never came up cannot pass the gate.
# The static steps (tokens, block, frame, icon) are the house-gate job's.
#
# Needs: house on PATH, python3, curl, and Chromium at HOUSE_CHROME (house's
# default is /usr/sbin/chromium). DIST is never written to: the shard
# sitemaps sit beside a symlinked copy of its top level.
set -euo pipefail

dist="$(cd "${1:-dist}" && pwd)"
port=23161
base="http://127.0.0.1:$port"
shards="${HOUSE_SHARDS:-4}"

work="$(mktemp -d)"
srv=""
cleanup() {
  if [ -n "$srv" ]; then kill "$srv" 2>/dev/null || true; fi
  rm -rf "$work"
}
trap cleanup EXIT

# Chromium's default /dev/shm use crashes tabs in a container (docker gives
# 64M); house has no flag for it, so HOUSE_CHROME points at a wrapper.
if [ -n "${HOUSE_CHROME:-}" ]; then
  real="$HOUSE_CHROME"
  cat > "$work/chrome" <<EOF
#!/bin/sh
exec "$real" --disable-dev-shm-usage "\$@"
EOF
  chmod +x "$work/chrome"
  export HOUSE_CHROME="$work/chrome"
fi

# house records each check in \$HOME/.local/state/house/checks.json; parallel
# shards would race on it, and a local run would overwrite the owner's record.
export HOME="$work/home"
mkdir -p "$HOME"

# Serve root: DIST's top level symlinked, plus the shard sitemaps. house
# rebases every <loc> onto the sitemap's own origin, so shards must be served
# from the same origin as the pages.
mkdir "$work/root"
for e in "$dist"/* "$dist"/.[!.]*; do
  [ -e "$e" ] && ln -s "$e" "$work/root/"
done
python3 - "$dist" "$work/root" "$shards" <<'PY'
import glob, os, sys, xml.etree.ElementTree as ET
dist, root, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
locs = []
for f in sorted(glob.glob(os.path.join(dist, "sitemap-*.xml"))):
    if f.endswith("sitemap-index.xml"):
        continue
    locs += [e.text.strip() for e in ET.parse(f).getroot().iter(ns + "loc")]
if not locs:
    sys.exit("house-rendered: no <loc> in %s/sitemap-*.xml" % dist)
for i in range(n):
    part = locs[i::n]
    with open(os.path.join(root, "house-shard-%d.xml" % i), "w") as out:
        out.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="%s">\n' % ns[1:-1])
        out.writelines("<url><loc>%s</loc></url>\n" % l for l in part)
        out.write("</urlset>\n")
print("house-rendered: %d pages in %d shards" % (len(locs), n))
PY

python3 -m http.server "$port" --bind 127.0.0.1 --directory "$work/root" > "$work/serve.log" 2>&1 &
srv=$!
up=""
for _ in $(seq 30); do
  if curl -fs -o /dev/null "$base/sitemap-index.xml"; then up=1; break; fi
  sleep 1
done
if [ -z "$up" ]; then
  echo "house-rendered: server on $base never answered in 30 s" >&2
  cat "$work/serve.log" >&2
  exit 1
fi

static=tokens,block,frame,icon
pids=()
house check . --json --skip "$static,layout" > "$work/pages.json" &
pids+=($!)
for ((i = 0; i < shards; i++)); do
  house check . --json --skip "$static,optical-light,optical-dark,live,type" \
    --sitemap "$base/house-shard-$i.xml" > "$work/shard-$i.json" &
  pids+=($!)
done
for p in "${pids[@]}"; do wait "$p" || true; done  # verdict comes from the JSON below

python3 - "$work" "$shards" <<'PY'
import json, os, sys
work, n = sys.argv[1], int(sys.argv[2])
want = {"pages.json": ["optical-light", "optical-dark", "live", "type"]}
want.update({"shard-%d.json" % i: ["layout"] for i in range(n)})
bad = 0
for f, steps in want.items():
    try:
        got = {s["name"]: s for s in json.load(open(os.path.join(work, f)))}
    except (OSError, ValueError) as e:
        print("FAIL %s: no house report (%s)" % (f, e))
        bad += 1
        continue
    for name in steps:
        s = got.get(name)
        if s is None:
            print("FAIL %s: step %s missing" % (f, name))
            bad += 1
            continue
        print("%-4s %-13s %s" % (s["status"], name, s.get("detail", "")))
        if s["status"] != "PASS":
            bad += 1
        for x in s.get("findings") or []:
            loc = (x.get("url", "") + " " + x.get("selector", "")).strip()
            print("  %s %s %s  %s" % (name, x.get("rule", ""), loc, x.get("message", "")))
sys.exit(1 if bad else 0)
PY
