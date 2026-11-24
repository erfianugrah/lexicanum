#!/usr/bin/env bash
# install-house.sh - install a pinned `house` release, sha256-verified
# against the release's checksums.txt.
#
# usage: install-house.sh VERSION   (e.g. 0.1.0, no leading v)
#
# Needs two Actions secrets: HOUSE_RELEASES, the Forgejo API URL of the
# releases collection (.../api/v1/repos/OWNER/REPO/releases), and
# HOUSE_TOKEN, a token with read:repository scope for it. Installs to
# $HOME/.local/bin/house and adds that dir to $GITHUB_PATH when set.
set -euo pipefail

version="${1:?usage: install-house.sh VERSION}"
version="${version#v}"
releases="${HOUSE_RELEASES:?HOUSE_RELEASES not set}"
auth="Authorization: token ${HOUSE_TOKEN:?HOUSE_TOKEN not set}"

case "$(uname -m)" in
  x86_64) arch=amd64 ;;
  aarch64 | arm64) arch=arm64 ;;
  *) echo "install-house: unsupported arch $(uname -m)" >&2; exit 1 ;;
esac
bin="house-linux-$arch"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

curl -fsSL --retry 3 -H "$auth" -o "$tmp/release.json" \
  "${releases%/}/tags/v$version"
asset_url() {
  jq -er --arg n "$1" '.assets[] | select(.name == $n) | .browser_download_url' "$tmp/release.json"
}
curl -fsSL --retry 3 -H "$auth" -o "$tmp/checksums.txt" "$(asset_url checksums.txt)"
curl -fsSL --retry 3 -H "$auth" -o "$tmp/$bin" "$(asset_url "$bin")"

(cd "$tmp" && grep -E "[[:space:]]\*?$bin\$" checksums.txt | sha256sum -c -)

install -d "$HOME/.local/bin"
install -m 0755 "$tmp/$bin" "$HOME/.local/bin/house"
if [ -n "${GITHUB_PATH:-}" ]; then echo "$HOME/.local/bin" >> "$GITHUB_PATH"; fi
"$HOME/.local/bin/house" version
