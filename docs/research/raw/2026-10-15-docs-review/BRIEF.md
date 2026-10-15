# Docs review brief (2026-10-15)

Shared instructions for every review worker. Repo: `/home/erfi/lexicanum`
(Astro + Starlight docs site, MDX under `src/content/docs/{guides,reference}`).

## Read first (once)

1. `AGENTS.md` - the authoring contract: doc types (guide = Diataxis how-to,
   reference = explanation-led architecture/decision doc), skeletons, citations,
   house style, the lab-backed-page rules.
2. `~/.pi/agent/skills/erfi-voice/SKILL.md` - section "Structural AI tells"
   (line ~89) and "Importance-announcing" right after it, including the `rg`
   sweep command there.
3. `tests/lib/mdx.ts` - `LLM_MARKERS` (line ~339, already gated by the build)
   and `REJECTED_MARKERS` (line ~502: patterns the author's own writing uses;
   do NOT flag these).

## Four review axes, per doc

A. Diataxis / skeleton. Right folder for its content (task sequence -> guide;
   "how does X work / which do I pick" -> reference)? Skeleton sections from
   AGENTS.md present? Guide: lede with prerequisites, steps, Verification,
   Gotchas and Lessons Learned, File Reference. Reference: lede, TL;DR, early
   which-to-pick table, closing decision guide. Measured docs: provenance note +
   evidence table with "How it was checked". Lab-backed: `## Modules` table and
   "What to do about it" practices table. Guide/reference pairs link each other
   with a named relationship. Every `dot` decision diagram has a text fallback
   directly under it.
B. AI slop. Negative parallelism, mystery-tease, present-participle tails that
   grade or restate, decorative bold, rhythm triplets, significance inflation and
   slop words, metaphor incoherence, importance-announcing, colon-headline
   stamps, self-rating ("the big win", "the trap"), ad-copy fragments.
C. Erfi voice / house style. Plain and subtractive; a number instead of an
   adjective; British -ise in prose (product/API terms exempt: organization,
   authorize, Authorization, Vectorize); sentence-case headings; ASCII
   punctuation; no ` -- ` in prose; literal `$` in prose escaped as `\$`; one
   name for one thing (no config/configuration rotation in one doc).
D. Accuracy smells. Internal contradictions within the doc, a number quoted
   two different ways, stale "currently/as of" claims with no date, claims the
   doc's own evidence table does not support.

## Fix policy

- Apply B and C fixes (and heading sentence-case) in place when confident.
  Sentence-level, minimal edits. Rewrite the offending sentence, not the
  paragraph.
- NEVER remove or change a number, backticked identifier, URL, footnote slug,
  or heading text beyond casing. `prose-lint --before HEAD` (below) checks this.
- Old (pre-2026-07) docs: fix only sentences you already touch for B; do not
  bulk-rewrite American -ize spelling across a whole doc.
- Do not touch content inside `<Aside type="caution" title="Historical ...">`
  or "Superseded"/"Out of date" asides, code fences, frontmatter (except a
  slop word in `description:`), or footnote definitions.
- A-axis structural gaps are REPORTED, not fixed (you cannot source new
  sections). One exception: a missing text fallback under a dot diagram may be
  added, derived strictly from the diagram's own node/edge labels.
- D findings are REPORTED only.
- When unsure whether something is a tell or the author's voice, report it,
  do not edit it.

## Verify your own files (only yours)

```bash
cd /home/erfi/lexicanum
prose-lint --config .prose-lint.json --before HEAD --no-max <your edited files>
prose-lint --config .prose-lint.json --no-max --no-counters --baseline .prose-terms-baseline.json <your edited files>
bun test tests/docs.test.ts tests/pins.test.ts
```

`prose-lint` also prints a per-file slop score; use it for triage, not as the
verdict. If a check fails because of your edit, fix or revert it
(`git checkout -- <that file>` restores ONLY your own file). Other workers edit
other files in this same checkout at the same time: never run `git stash`,
`git reset`, `git checkout .`, `git commit`, `bun run build`, or edit any file
outside your batch.

## Report

Write to the report path your prompt names. Format:

```
# Batch N review
## Summary
- top 5 recurring issues across the batch, each with a count
- files edited: N; findings left for the author: M
## <path>
Type: guide|reference - folder correct? yes/no (why)
Skeleton gaps: ...
Fixed: N edits. Up to 5 examples as `line L: "before" -> "after"`
Unfixed (author judgment): `line L: [axis] finding -> suggested fix`
```

Keep each doc's section short. No praise, no restating the doc.
