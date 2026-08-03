#!/usr/bin/env bash
# exit 0 iff no unescaped $ that remark-math could turn into a formula in $1.
#
# Models what remark-math actually sees, which is narrower than "every $ in the file":
#   - YAML frontmatter is not markdown and is not math-processed. Verified 2026-08-03:
#     a doc whose description held "~$10/mo" built with 0 katex spans and og:description
#     carried the raw "$". Escaping there would emit a literal backslash.
#   - Fenced code is exempt, including fences indented inside list items.
#   - Inline `code` spans are exempt. Verified 2026-08-03: `$SUPABASE_ACCESS_TOKEN` in
#     prose rendered as <code>$SUPABASE_ACCESS_TOKEN</code> with 0 katex spans, while
#     a bare "$1500 - 24 = 1476$" in guides/magic-wan-interop does render as math.
# A bare, unescaped $ in prose remains a finding: it pairs with the next one.
awk '
  NR==1 && /^---[[:space:]]*$/ {fm=1; next}
  fm && /^---[[:space:]]*$/     {fm=0; next}
  fm                           {next}
  /^[[:space:]]*```/           {f=!f; next}
  !f                           {gsub(/`[^`]*`/, ""); print}
' "$1" | grep -qP '(?<!\\)\$' && exit 1 || exit 0
