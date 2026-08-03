#!/usr/bin/env bash
# Regenerate the public status snapshots from the private lab ledgers.
# The provenance gate needs only {claim id: status}; notes, evidence paths and
# any account identifiers stay in the private repo. CI has no access to the
# private ledgers, so it verifies against these snapshots instead, and
# verify-docs.sh group 10b fails locally if a snapshot has drifted.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p docs/ledgers
for lab in supabase-org-topology supabase-hand-rolled-sfp; do
  src="$HOME/erfibase/labs/$lab/claims.json"
  [ -f "$src" ] || { echo "  skip $lab (private ledger not present)"; continue; }
  jq -S --arg lab "erfibase:labs/$lab" --arg gen "$(date -u +%F)" '
    { lab: $lab, generated: $gen,
      note: "Public status snapshot of a private lab ledger. Claim ids and statuses only.",
      claims: (.claims | map({(.id): .status}) | add) }' "$src" > "docs/ledgers/$lab.status.json"
  echo "  $lab: $(jq '.claims|length' "docs/ledgers/$lab.status.json") claims"
done
