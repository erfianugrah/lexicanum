#!/usr/bin/env bash
# exit 0 iff no unescaped $ outside code fences in $1 (avoids nested-quoting hell)
awk '/^```/{f=!f;next} !f' "$1" | grep -qP '(?<!\\)\$' && exit 1 || exit 0
