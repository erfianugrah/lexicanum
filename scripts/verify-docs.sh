#!/usr/bin/env bash
# Regression checks for the sbshift e2e guides: doc mechanics + built HTML.
# Ported from the 2026-07-30 ad-hoc verification harness (lessons:
# ~/.local/share/harness/HARNESS-NOTES.md). Needs dist/ - run `bun run build`
# first (CI runs this after the build step).
#
# Usage: bash scripts/verify-docs.sh [--check-links]
#   --check-links   also curl every external URL the guides cite (network;
#                   kept out of gating CI on purpose - flaky by nature)
# Env:
#   BANNED_IDENTIFIERS       space-separated strings that must not appear in src/
#                            (org ids, throwaway project refs). Unset = loud SKIP,
#                            never a vacuous PASS.
#   BANNED_IDENTIFIERS_FILE  path to a newline-separated list, read instead of the
#                            env var. Preferred: these values should not end up in
#                            shell history, CI logs, or a commit. Default if present:
#                            ~/.config/lexicanum/banned-identifiers
set -u
shopt -s lastpipe 2>/dev/null || true
cd "$(dirname "$0")/.." || exit 2

CHECK_LINKS=0
[ "${1:-}" = "--check-links" ] && CHECK_LINKS=1

: "${BANNED_IDENTIFIERS_FILE:=$HOME/.config/lexicanum/banned-identifiers}"
if [ -z "${BANNED_IDENTIFIERS:-}" ] && [ -r "$BANNED_IDENTIFIERS_FILE" ]; then
  BANNED_IDENTIFIERS=$(grep -vE '^\s*(#|$)' "$BANNED_IDENTIFIERS_FILE" | tr '\n' ' ')
  export BANNED_IDENTIFIERS
fi

UG=src/content/docs/guides/supabase-postgres-major-upgrade-e2e.mdx
RG=src/content/docs/guides/supabase-region-migration-e2e.mdx
UH=dist/guides/supabase-postgres-major-upgrade-e2e/index.html
RH=dist/guides/supabase-region-migration-e2e/index.html

# Fail loudly on a missing tool. A check that silently no-ops is worse than a
# vacuous PASS: CI reported "no sidecars yet" and "no drafts in repo" for two
# rg-dependent checks because the runner has no rg, and both statements were false.
for t in jq grep awk sed find python3; do
  command -v "$t" >/dev/null || { echo "FATAL: required tool '$t' not found" >&2; exit 2; }
done

pass=0; fail=0; skip=0
chk() { local d="$1"; shift; if "$@" >/dev/null 2>&1; then printf 'PASS  %s\n' "$d"; pass=$((pass+1)); else printf 'FAIL  %s\n' "$d"; fail=$((fail+1)); fi; }
skp() { printf 'SKIP  %s\n' "$1"; skip=$((skip+1)); }
# negative grep helpers as functions so chk can call them without sh -c nesting
no_pcre()  { ! grep -qP "$1" "$2"; }   # file must NOT match pcre $1
no_fixed() { ! grep -qF "$1" "$2"; }   # file must NOT contain fixed string $1
no_fixed_r() { ! grep -rqF "$1" "$2"; } # tree $2 must NOT contain fixed string $1
one_references_h2() { test "$(grep -o '<h2[^>]*>References' "$1" | wc -l)" -eq 1; }
footnote_defs_eq() { test "$(grep -o 'id="user-content-fn-[a-z0-9-]*"' "$1" | sort -u | wc -l)" -eq "$2"; }
# every footnote DEFINED in the source renders as a definition in the HTML.
# Derived from the source rather than hardcoded so adding a citation does not
# require bumping a magic number here (the old failure mode: dbf6752 added
# [^sb-connect] and CI failed on the next commit).
footnote_defs_match_src() {
  local html="$1" doc="$2" n
  n=$(grep -cE '^\[\^[a-z0-9-]+\]:' "$doc")
  # AGENTS.md: guides carry inline links and add footnotes only when reference-heavy,
  # so zero definitions is legitimate. It is only a failure if the HTML invents some.
  if [ "$n" -eq 0 ]; then footnote_defs_eq "$html" 0; else footnote_defs_eq "$html" "$n"; fi
}
footnotes_balanced() { # every used [^slug] defined AND every defined slug cited
  local doc="$1" s used defined
  used=$(grep -v '^\[\^[a-z0-9-]*\]:' "$doc" | grep -o '\[\^[a-z0-9-]*\]' | sort -u | tr -d '[]^')
  defined=$(grep -o '^\[\^[a-z0-9-]*\]:' "$doc" | sed 's/\[\^//;s/\]://' | sort -u)
  for s in $used; do grep -q "^\[\^$s\]:" "$doc" || return 1; done
  for s in $defined; do grep -v '^\[\^' "$doc" | grep -q "\[\^$s\]" || return 1; done
}

echo "=== 1. Source doc mechanics (both guides) ==="
for DOC in "$UG" "$RG"; do
  n=$(basename "$DOC" .mdx)
  chk "$n: doc exists"        test -f "$DOC"
  chk "$n: no smart punctuation (em/en-dash, smart quotes, ellipsis)" \
      no_pcre '[\x{2013}\x{2014}\x{2018}\x{2019}\x{201C}\x{201D}\x{2026}]' "$DOC"
  chk "$n: footnotes balanced (used<=defined, defined=>cited)" footnotes_balanced "$DOC"
  chk "$n: no unescaped \$ in prose" bash scripts/prose-dollar.sh "$DOC"
done

echo "=== 2. Guide-specific source claims ==="
chk "upgrade: manual fallback has schema_migrations caveat" grep -q 'SELECT-only' "$UG"
chk "upgrade: second-pass pointer present"                  grep -q 'second pass the same day' "$UG"
chk "upgrade: step 7 storage/functions transfer note"       grep -q 'transfer separately here' "$UG"
chk "region: stale contradiction removed"                   no_fixed 'the dashboard listing looks complete either way' "$RG"
chk "region: storage two-failure-modes gotcha"              grep -q 'fails two different ways' "$RG"
chk "region: 400 Bucket not found verification row"         grep -q '400 .Bucket not found. = visibility not restored' "$RG"
chk "region: cron.job does-not-carry row"                   grep -q 'schedules do not carry' "$RG"
chk "region: buckets do-not-arrive row"                     grep -q 'bucket metadata does not arrive at all' "$RG"
chk "region: config-sync apply row (max_rows=777)"          grep -q 'max_rows=777' "$RG"
chk "region: bootstrap idempotency gotcha"                  grep -q 're-plans the schema' "$RG"
chk "region: three-ways matrix section"                     grep -q '## Every task, three ways' "$RG"

echo "=== 3. Built HTML (run bun run build first) ==="
for HTML in "$UH" "$RH"; do
  n=$(basename "$(dirname "$HTML")")
  chk "$n: built html exists"            test -f "$HTML"
  chk "$n: no literal [^ left"           no_fixed '[^' "$HTML"
  chk "$n: zero katex spans"             no_fixed 'class="katex' "$HTML"
  chk "$n: exactly one References h2"    one_references_h2 "$HTML"
  chk "$n: three-ways matrix anchor"     grep -q 'id="every-task-three-ways"' "$HTML"
done
chk "upgrade html: renders every source footnote definition" footnote_defs_match_src "$UH" "$UG"
chk "region html: renders every source footnote definition"  footnote_defs_match_src "$RH" "$RG"
chk "upgrade html: path-b anchor"          grep -q 'id="path-b-cut-over-to-a-new-pg-17-project-with-sbshift"' "$UH"
chk "upgrade html: lab subsection anchor"  grep -q 'id="optional-rehearse-pg_upgrade-itself-in-docker-sbshift-upgrade-lab"' "$UH"
chk "upgrade html: matrix has 3 method columns" \
    sh -c "grep -q 'Manual checklist' '$UH' && grep -q 'UI / API' '$UH' && grep -q 'sbshift' '$UH'"
chk "upgrade html: measured table has id=301" grep -q '301' "$UH"
chk "upgrade html: sbshift repo linked"    grep -q 'https://github.com/erfianugrah/sbshift' "$UH"
chk "region html: measured-run anchor"     grep -q 'id="measured-run-2026-07-30"' "$RH"

echo "=== 4. Cross-links resolve both ways ==="
for a in measured-run-2026-07-30 path-b-cut-over-to-a-new-pg-17-project-with-sbshift \
         what-carries-over-and-what-does-not storage-metadata-copies-bytes-do-not \
         every-task-three-ways; do
  chk "upgrade html has #$a (linked from region guide)" grep -q "id=\"$a\"" "$UH"
done
chk "region html has #measured-run-2026-07-30 (linked from upgrade guide)" \
    grep -q 'id="measured-run-2026-07-30"' "$RH"
chk "upgrade html links to region guide" grep -q 'supabase-region-migration-e2e' "$UH"
chk "region html links to upgrade guide" grep -q 'supabase-postgres-major-upgrade-e2e' "$RH"

echo "=== 5. Identifier hygiene ==="
if [ -n "${BANNED_IDENTIFIERS:-}" ]; then
  for id in $BANNED_IDENTIFIERS; do
    chk "banned identifier not in src/: ${id:0:6}..." no_fixed_r "$id" src/
  done
else
  skp "identifier hygiene (set BANNED_IDENTIFIERS to enable)"
fi

if [ "$CHECK_LINKS" = 1 ]; then
  echo "=== 6. External links resolve (opt-in) ==="
  for u in https://github.com/erfianugrah/sbshift \
           https://supabase.com/docs/guides/platform/ipv4-address \
           https://supabase.com/docs/guides/platform/clone-project \
           https://supabase.com/docs/guides/platform/regions \
           https://supabase.com/docs/guides/auth/redirect-urls \
           https://supabase.com/docs/guides/platform/custom-domains; do
    chk "200: $u" sh -c "curl -so /dev/null -w '%{http_code}' '$u' | grep -q 200"
  done
fi

# ---------------------------------------------------------------- new doc set
CG=src/content/docs/guides/supabase-org-consolidation.mdx
SG=src/content/docs/guides/supabase-shared-tenancy-and-promotion.mdx
MR=src/content/docs/reference/supabase-multitenant-platform.mdx
CH=dist/guides/supabase-org-consolidation/index.html
SH=dist/guides/supabase-shared-tenancy-and-promotion/index.html
MH=dist/reference/supabase-multitenant-platform/index.html

has_section() { grep -qE "^#{2,3} .*$2" "$1"; }
dot_fences_ok() { # every dot fence transparent; no per-element colors
  local f="$1"
  awk '/^```dot/{d=1;n++;t=0;next} /^```$/{if(d){if(!t){bad=1}};d=0;next}
       d&&/bgcolor="transparent"/{t=1}
       d&&/(fontcolor|fillcolor)=|color="#|style=filled/{bad=1}
       END{exit (bad?1:0)}' "$f"
}
# Body of the doc with YAML frontmatter stripped and newlines collapsed.
# Stripping frontmatter is load-bearing: must_appear values are DECLARED in the
# frontmatter, so grepping the whole file matches every row against its own
# declaration and the text half of the gate silently passes for everything.
doc_body() {
  awk 'NR==1 && /^---[[:space:]]*$/ {fm=1; next} fm && /^---[[:space:]]*$/ {fm=0; next} !fm' "$1" \
    | tr '\n' ' ' | tr -s ' '
}

evidence_provenance() { # $1 = mdx carrying an `evidence:` frontmatter block
  local mdx="$1" rows lab labdir id st appear want body
  rows=$(python3 scripts/evidence-rows.py "$mdx") || return 1
  lab=$(printf '%s\n' "$rows" | sed -n 's/^lab\t//p' | head -1)
  [ -n "$lab" ] || { echo "  no evidence.lab in frontmatter" >&2; return 1; }
  # Two sources, in priority order. The private lab ledger is authoritative and
  # present on a dev machine; CI only has the vendored public status snapshot
  # (claim ids + statuses, nothing identifying). Group 10b asserts the snapshot
  # still matches the ledger whenever both exist, so CI cannot pass on stale data.
  labdir="$HOME/${lab%%:*}/${lab#*:}"
  ledger="$labdir/claims.json"
  snap="docs/ledgers/$(basename "${lab#*:}").status.json"
  if   [ -f "$ledger" ]; then src=ledger
  elif [ -f "$snap" ];   then src=snap
  else echo "  no ledger at $labdir and no snapshot at $snap" >&2; return 1; fi
  body=$(doc_body "$mdx")
  while IFS=$'\t' read -r id want appear; do
    [ "$id" = "lab" ] && continue
    # a row may deliberately cite a refuted or untested claim. That has to be
    # declared per-row via `expect`, so it cannot happen by accident.
    if [ "$src" = ledger ]; then
      st=$(jq -r --arg i "$id" '.claims[]|select(.id==$i)|.status' "$ledger")
    else
      st=$(jq -r --arg i "$id" '.claims[$i] // empty' "$snap")
    fi
    [ "$st" = "$want" ] || { echo "  $id status=${st:-MISSING} expected=$want" >&2; return 1; }
    # whitespace-normalized: published prose wraps, so the phrase may span lines
    printf '%s' "$body" | grep -qF "$appear" \
      || { echo "  $id: '$appear' absent from doc body" >&2; return 1; }
  done <<< "$rows"
}

echo "=== 7. New doc set: source mechanics ==="
for DOC in "$CG" "$SG" "$MR"; do
  n=$(basename "$DOC" .mdx)
  if [ ! -f "$DOC" ]; then skp "$n: not written yet"; continue; fi
  chk "$n: no smart punctuation" no_pcre '[\x{2013}\x{2014}\x{2018}\x{2019}\x{201C}\x{201D}\x{2026}]' "$DOC"
  chk "$n: footnotes balanced both ways" footnotes_balanced "$DOC"
  chk "$n: no unescaped \$ in prose" bash scripts/prose-dollar.sh "$DOC"
  chk "$n: dot fences transparent + uncolored" dot_fences_ok "$DOC"
  case "$DOC" in
    "$MR") for s in "TL;DR|Decision" "Verified" "design-only"; do
             chk "$n: reference section /$s/" has_section "$DOC" "$s"; done ;;
    *)     for s in "Verification" "Gotchas"; do
             chk "$n: guide section /$s/" has_section "$DOC" "$s"; done ;;
  esac
done

echo "=== 8. New doc set: built HTML ==="
for HTML in "$CH" "$SH" "$MH"; do
  n=$(basename "$(dirname "$HTML")")
  if [ ! -f "$HTML" ]; then skp "$n: not built yet"; continue; fi
  chk "$n: no literal [^ left"        no_fixed '[^' "$HTML"
  chk "$n: zero katex spans"          no_fixed 'class="katex' "$HTML"
done
[ -f "$CH" ] && chk "consolidation html: renders every source footnote def" footnote_defs_match_src "$CH" "$CG"
[ -f "$SH" ] && chk "shared-tenancy html: renders every source footnote def" footnote_defs_match_src "$SH" "$SG"
[ -f "$MH" ] && chk "multitenant html: renders every source footnote def"    footnote_defs_match_src "$MH" "$MR"

echo "=== 9. New doc set: cross-links ==="
declare -A XLINK=(
  ["$CH"]="supabase-multitenant-platform supabase-region-migration-e2e"
  ["$SH"]="supabase-multitenant-platform"
  ["$MH"]="supabase-shared-tenancy-and-promotion supabase-org-consolidation"
  ["$RH"]="supabase-org-consolidation"
)
for src in "${!XLINK[@]}"; do
  [ -f "$src" ] || { skp "xlink from $(basename "$(dirname "$src")") (not built)"; continue; }
  for tgt in ${XLINK[$src]}; do
    # a link to a doc that is not written yet is pending work, not a regression
    if [ ! -d "dist/guides/$tgt" ] && [ ! -d "dist/reference/$tgt" ]; then
      skp "$(basename "$(dirname "$src")") -> $tgt (target not built yet)"; continue
    fi
    chk "$(basename "$(dirname "$src")") -> $tgt" grep -q "$tgt" "$src"
  done
done

echo "=== 10. Evidence provenance (claims trace to a green ledger row) ==="
found_ev=0
for DOC in $(grep -rl '^evidence:' src/content/docs/ 2>/dev/null | sort); do
  found_ev=1
  chk "$(basename "$DOC" .mdx): every claim traces to its ledger row" evidence_provenance "$DOC"
done
if [ "$found_ev" = 0 ]; then
  printf 'FAIL  no doc declares an evidence block - the provenance gate is not running\n'
  fail=$((fail+1))
fi

echo "=== 10b. Vendored ledger snapshots match the private ledgers (local only) ==="
snap_checked=0
for snap in docs/ledgers/*.status.json; do
  [ -f "$snap" ] || continue
  lab=$(jq -r '.lab' "$snap"); ledger="$HOME/${lab%%:*}/${lab#*:}/claims.json"
  if [ ! -f "$ledger" ]; then
    skp "$(basename "$snap"): private ledger not present (CI) - snapshot used as-is"
    continue
  fi
  snap_checked=1
  if diff -q <(jq -S '.claims' "$snap") \
             <(jq -S '[.claims[]|{(.id):.status}]|add' "$ledger") >/dev/null; then
    printf 'PASS  %s matches its private ledger\n' "$(basename "$snap")"; pass=$((pass+1))
  else
    printf 'FAIL  %s is STALE - regenerate with make ledgers\n' "$(basename "$snap")"; fail=$((fail+1))
  fi
done

echo "=== 10a. Every internal link resolves to a built page ==="
broken=0; checked=0
for doc in src/content/docs/guides/*.mdx src/content/docs/reference/*.mdx; do
  grep -q '^draft: true' "$doc" && continue
  for href in $(grep -oE '\]\(/(guides|reference)/[a-z0-9-]+/' "$doc" | sed 's|^](||;s|/$||' | sort -u); do
    checked=$((checked+1))
    if [ ! -f "dist${href}/index.html" ]; then
      printf 'FAIL  %s links to %s which is not built\n' "$(basename "$doc" .mdx)" "$href"
      fail=$((fail+1)); broken=$((broken+1))
    fi
  done
done
if [ "$broken" -eq 0 ]; then
  printf 'PASS  all %d internal links resolve to built pages\n' "$checked"; pass=$((pass+1))
fi

echo "=== 11a. No published doc links to a draft doc ==="
drafts=$(grep -rl '^draft: true' src/content/docs/ 2>/dev/null | sed 's|.*/||;s|\.mdx$||')
if [ -z "$drafts" ]; then
  skp "draft-link check (no drafts in repo)"
else
  for d in $drafts; do
    # a published page must not reference a draft page's URL
    if find dist -name index.html -exec grep -ql -- "/$d" {} + 2>/dev/null | grep -q .; then
      printf 'FAIL  a published page links to draft doc: %s\n' "$d"; fail=$((fail+1))
    else
      printf 'PASS  no published page links to draft doc: %s\n' "$d"; pass=$((pass+1))
    fi
  done
fi

echo "=== 11. Identifier hygiene is MANDATORY for this doc set ==="
if [ -z "${BANNED_IDENTIFIERS:-}" ]; then
  if [ -f "$CG" ] || [ -f "$SG" ]; then
    printf 'FAIL  BANNED_IDENTIFIERS unset - MANDATORY once the tenancy docs exist\n'; fail=$((fail+1))
  else
    skp "BANNED_IDENTIFIERS unset (becomes a hard FAIL once the tenancy docs land)"
  fi
else
  printf 'PASS  BANNED_IDENTIFIERS is set (%s entries)\n' "$(echo $BANNED_IDENTIFIERS | wc -w)"; pass=$((pass+1))
fi

echo
echo "================  $pass passed, $fail failed, $skip skipped  ================"
exit $((fail > 0))
