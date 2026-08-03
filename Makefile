.DEFAULT_GOAL := help
.PHONY: help build verify verify-links ledgers

help: ## list targets
	@grep -hE '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) \
	  | awk -F':.*?## ' '{printf "  %-14s %s\n", $$1, $$2}'

build: ## bun run build
	bun run build

verify: ## doc mechanics + built HTML checks (needs a build first)
	bash scripts/verify-docs.sh

verify-links: ## as verify, plus curl every cited external URL (network)
	bash scripts/verify-docs.sh --check-links

ledgers: ## regenerate public ledger status snapshots from the private labs
	bash scripts/gen-ledger-snapshots.sh
