#!/usr/bin/env bash
# Regenerate the public status snapshots from the private lab ledgers.
# The provenance gate needs only {claim id: status}; notes, evidence paths and
# any account identifiers stay in the private repo. CI has no access to the
# private ledgers, so it verifies against these snapshots instead, and
# verify-docs.sh group 10b fails locally if a snapshot has drifted.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p docs/ledgers
: "${LAB_ROOT:=$(head -1 "$HOME/.config/lexicanum/lab-root" 2>/dev/null || true)}"
[ -n "$LAB_ROOT" ] || { echo "LAB_ROOT unset (and ~/.config/lexicanum/lab-root absent)" >&2; exit 2; }

for lab in supabase-org-topology supabase-hand-rolled-sfp; do
  src="$LAB_ROOT/$lab/claims.json"
  [ -f "$src" ] || { echo "  skip $lab (private ledger not present)"; continue; }
  jq -S --arg lab "$lab" --arg gen "$(date -u +%F)" '
    { lab: $lab, generated: $gen,
      note: "Public status snapshot of a lab ledger held in a separate private repo. Claim ids and statuses only - no notes, evidence paths, or identifiers.",
      claims: (.claims | map({(.id): .status}) | add) }' "$src" > "docs/ledgers/$lab.status.json"
  echo "  $lab: $(jq '.claims|length' "docs/ledgers/$lab.status.json") claims"
done
