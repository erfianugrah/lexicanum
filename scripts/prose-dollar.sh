#!/usr/bin/env bash
# exit 0 iff no unescaped $ outside code fences AND outside YAML frontmatter in $1.
#
# Frontmatter is skipped deliberately: it is YAML, not markdown, and is not run
# through remark-math. Verified 2026-08-03 by publishing a doc whose description
# contains "~$10/mo" - the built page had 0 katex spans and og:description carried
# the raw "$" correctly. Escaping it there would emit a literal backslash instead.
awk '
  NR==1 && /^---[[:space:]]*$/ {fm=1; next}
  fm && /^---[[:space:]]*$/     {fm=0; next}
  fm                           {next}
  /^[[:space:]]*```/           {f=!f; next}   # indented fences occur inside list items
  !f
' "$1" | grep -qP '(?<!\\)\$' && exit 1 || exit 0
