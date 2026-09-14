#!/usr/bin/env bash
# set-lab-pin.sh <commit-sha>
# Replace the PINHASH placeholder in docs and test pins with a real supabase-lab
# commit, then verify every resulting URL returns 200.
#
# Why a placeholder exists at all: lexicanum cites supabase-lab by permalink, and
# a citation added before the lab is pushed has no commit to point at. PINHASH is
# letter-only because MDX parses a bare "<" in prose as JSX, so a <NEW>-style
# placeholder breaks the build.
set -euo pipefail
sha="${1:?usage: set-lab-pin.sh <commit-sha>}"
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

mapfile -t files < <(grep -rl 'PINHASH' src tests 2>/dev/null || true)
[ ${#files[@]} -gt 0 ] || { echo "no PINHASH placeholders found - nothing to do"; exit 0; }
printf 'substituting PINHASH -> %s in %d files\n' "$sha" "${#files[@]}"
sed -i "s|PINHASH|$sha|g" "${files[@]}"

echo "verifying every link target..."
mapfile -t urls < <(grep -rhoE "supabase-lab/(tree|blob)/$sha/[^)\"# ]+" src tests | sort -u)
printf '%s\n' "${urls[@]}" | xargs -P 12 -I{} sh -c '
  c=$(curl -s -o /dev/null -w "%{http_code}" "https://github.com/erfianugrah/{}")
  [ "$c" = "200" ] || echo "$c {}"' | sort -u > /tmp/lab-pin-bad.$$
bad=$(wc -l < /tmp/lab-pin-bad.$$)
printf 'checked %d distinct targets, %d non-200\n' "${#urls[@]}" "$bad"
[ "$bad" -eq 0 ] || { cat /tmp/lab-pin-bad.$$; rm -f /tmp/lab-pin-bad.$$; exit 1; }
rm -f /tmp/lab-pin-bad.$$
echo "all targets resolve; now run: bun run build"
