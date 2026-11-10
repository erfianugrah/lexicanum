#!/usr/bin/env bash
# playwright-tools.sh - the tools the house-rendered job needs that the
# Playwright image lacks (bun, jq, d2), into $HOME/.local/bin. No apt: the
# image has no unzip or jq, and archive.ubuntu.com is the download the job
# avoids (unreachable from the runner for 20+ min on 2026-11-10). Everything
# comes from GitHub releases, like the D2 step in build-and-deploy.
#
# usage: playwright-tools.sh    (versions pinned below; bun matches deploy.yml)
set -euo pipefail

bun_v=1.3.13
jq_v=1.7.1
d2_v=0.7.1

bin="$HOME/.local/bin"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
install -d "$bin"
get() { curl -fsSL --retry 3 --connect-timeout 20 -o "$2" "$1"; }

# bun: the zip, checked against the release's SHASUMS256.txt, unpacked with
# python's zipfile (bun.sh's installer needs unzip).
gh=https://github.com/oven-sh/bun/releases/download/bun-v$bun_v
get "$gh/bun-linux-x64.zip" "$tmp/bun-linux-x64.zip"
get "$gh/SHASUMS256.txt" "$tmp/bun.sums"
(cd "$tmp" && grep -E ' bun-linux-x64\.zip$' bun.sums | sha256sum -c -)
python3 -m zipfile -e "$tmp/bun-linux-x64.zip" "$tmp"
install -m 0755 "$tmp/bun-linux-x64/bun" "$bin/bun"

# jq: install-house.sh reads the release JSON with it.
gh=https://github.com/jqlang/jq/releases/download/jq-$jq_v
get "$gh/jq-linux-amd64" "$tmp/jq-linux-amd64"
get "$gh/sha256sum.txt" "$tmp/jq.sums"
(cd "$tmp" && grep -E ' jq-linux-amd64$' jq.sums | sha256sum -c -)
install -m 0755 "$tmp/jq-linux-amd64" "$bin/jq"

# d2: same pinned tarball as build-and-deploy (the release publishes no
# checksums).
get "https://github.com/terrastruct/d2/releases/download/v$d2_v/d2-v$d2_v-linux-amd64.tar.gz" "$tmp/d2.tgz"
tar --warning=no-unknown-keyword -xzf "$tmp/d2.tgz" -C "$tmp"  # macOS xattr headers
install -m 0755 "$tmp/d2-v$d2_v/bin/d2" "$bin/d2"

if [ -n "${GITHUB_PATH:-}" ]; then echo "$bin" >> "$GITHUB_PATH"; fi
"$bin/bun" --version
"$bin/jq" --version
"$bin/d2" --version
