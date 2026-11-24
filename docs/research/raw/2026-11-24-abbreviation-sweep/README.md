# First-use abbreviation sweep, 2026-11-24

Evidence behind `data/abbreviations.json` and the sweep that `tests/abbreviations.test.ts` enforces.

- `glossary-review.json`: a second model's review of the model-drafted glossary (every term, the `words` list, all per-doc
  overrides, the unknowns). Its corrections were merged into the glossary before the first sweep.
- `insertion-review.tsv`: a third model's line-by-line review of all 4172 insertions of the first sweep (`doc:line`,
  term, class WRONG / GRAMMAR / INVENTED, current expansion, proposed fix). 166 findings. The WRONG and INVENTED ones
  became per-doc overrides or `abbreviations-ok` entries; the GRAMMAR ones that came from checker defects (quotations
  altered, wrapped explanations missed, `SFP+` / `PKCS#7` / `US$` / `HTTP(S)` split) were fixed in `tests/lib/abbrev.ts`
  and the sweep was redone from the pre-sweep docs. GRAMMAR proposals that reorder a noun phrase were not applied: the
  fixer only inserts.
