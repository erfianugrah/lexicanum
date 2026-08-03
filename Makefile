

.PHONY: ledgers
ledgers: ## regenerate public ledger status snapshots from the private labs
	bash scripts/gen-ledger-snapshots.sh
