# AI prose tell sweep, 2026-11-18

`scripts/tell-review.ts` over every doc in `src/content/docs` (guides, reference, index: 198 files), one process per doc, 6 in parallel, google/gemini-4-argon through OpenRouter, temperature 0. Base commit `3602d1a` plus the uncommitted tell-review files.

| File | What it is |
|---|---|
| `run1-loose-prompt-flags.json` | 491 flags in 159 docs from the first prompt, before the house exemptions (lede, navigation, measured-vs-asserted labels, technical contrasts, fact-stating topic sentences) were added |
| `flags.json` | 280 flags in 109 docs from the committed prompt; 89 docs clean, 0 API failures |
| `flags-per-doc.tsv` | flag count per doc for `flags.json`, highest first |
| `status.txt` | exit code per doc (0 clean, 1 flags) |

Kinds in `flags.json`: announce-before-stating 190, self-grading 32, aphorism 23, negative-parallelism 15, fragment-punch 6, vouching 5, self-narration 3, metaphor 3, participle-tail 2, significance-inflation 1.

Precision: a hand read of 30 random flags from `flags.json` found about 25 real tells. Wrong or borderline ones included "PKCE replaces a shared secret you know with a proof key you generate per login" (a fact, flagged as aphorism) and "The same thing in list form:" (the intro to a diagram's required text fallback).

The CI gate reviews only touched paragraphs, so none of these block a deploy. They are a backlog: fix a doc's flags when editing it, or in a dedicated pass (lexicanum#110).
