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

The CI gate reviews only touched paragraphs, so none of these block a deploy. They are a backlog: fix a doc's flags when editing it, or in a dedicated pass.

## After the fixes (same day)

`scripts/tell-fix.ts` (kimi-k3.1-pro rewriting, guards on facts, word retention, pins and a re-review) ran twice over the flagged docs. Round 1 rewrote 212 paragraphs and refused 24; a reviewer model reading the word diff sent back 31 rewrites for changed meaning, and 3 more removed pinned corrections. Round 2, with a prompt that forbids deleting list intros, provenance, reasons and qualifiers, rewrote 80 and refused 25; the reviewer sent back 14 of 77. Four were finished by hand.

| File | What it is |
|---|---|
| `after-fix-flags.json` | 90 flags in 53 docs from a full re-sweep after both rounds (announce-before-stating 52, aphorism 14, self-grading 10, negative-parallelism 7, other 7) |
| `after-fix-per-doc.tsv` | flag count per doc, highest first |

What is left is mostly the sentences an automatic rewrite could not change without changing meaning (the reverted and refused ones) plus new flags from the model's run-to-run variation. They need rewording by hand, one doc at a time.
