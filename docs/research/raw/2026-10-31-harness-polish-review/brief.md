# Brief: pi harness series polish

Worktree: ~/<worktree> (branch agent/<card>-harness-polish).
Work ONLY inside that worktree, and ONLY on the files assigned to you in your task prompt.
Other writers are editing other pages in the SAME worktree at the same time - never touch
a file outside your assignment (not the hub pi-harness-journey.mdx, not tests/pins.test.ts,
not shared CSS/components). If a fix needs a shared file, describe it in your final message.

## Goal

The series pages were drafted by agents and read like it. The user wants them reworked on
four axes: presentation, diagrams, AI slop, and Erfi's voice. This is an edit pass on
existing pages, NOT a rewrite from scratch and NOT new content. Keep every verified fact,
anchor/heading slug that other pages link to (rg the corpus for `/reference/<slug>#` before
renaming any heading), footnotes, and frontmatter keys.

## Read first (mandatory)

1. ~/.<local path> - the standing writer rules (hostnames, IPs,
   paths, verification, no commits). All of it applies, EXCEPT the build step (see Verify).
2. The worktree's AGENTS.md - house style, citations, dot-fence boilerplate, AI-tell gate.
3. ~/.<local path> - read it whole: "Kill the corpo tells",
   "Structural AI tells", "Importance-announcing - long-form docs", "Voice characteristics",
   "British English", "Common mistakes".
4. Style exemplars, read end to end before editing: src/content/docs/reference/cloudflare-supabase-architecture.mdx
   and src/content/docs/guides/10gbe-link-tuning.mdx. Match their density, plain declarative
   sentences, measured-vs-asserted labelling. Recent agent-written pages are NOT a style source.

## What to fix

AI slop (kill on sight, every instance):
- Negative parallelism ("not X, it's Y", "No X, no Y. Just Z."), mystery-tease ("hides a",
  "the catch", "the secret"), participle tails that restate ("..., making it ..."),
  rhythm triplets assembled for cadence, significance inflation ("pivotal", "underscores",
  "robust", "seamless", "leverage", "delve"), importance-announcing ("this matters because",
  "the key point", "crucially"), metaphor incoherence and pet words ("toolkit", "the move",
  "buys you", "quietly", "and that matters").
- Decorative bold. Bold only a term at its definition or a literal identifier. Bold-led
  paragraphs ("**Guards (2026-05).** ...") become headings or plain sentences.
- Moralising closers and generalised "lessons" that restate the section. A section ends on
  its last fact.
- Unsupported comparative claims ("X changes behaviour more than Y") with no measurement:
  delete or scope them to what was observed.
- Hedge-stacks and filler intros ("This page describes...", "In this section we...").
  Lead with the thing.
- Tell test: replace the nouns with placeholders; if the sentence still reads correct, it is a
  template - delete it.

Erfi voice: direct, first-person-plural is NOT used - these docs are impersonal and declarative.
Short sentences, concrete nouns, numbers with their source, British -ise spelling, ASCII
punctuation, `->` for arrows, no em/en dashes. Dry, no salesmanship, no "we're excited".

Presentation:
- Walls of inline filenames or comma lists of 6+ items -> a table (name | what it does) or a
  bulleted list. Long paragraphs (> ~6 lines rendered) -> split at the natural seam.
- Heading hierarchy sane (no skipped levels, sentence case, no heading that is a full sentence).
- TL;DR / summary bullets: one line each, no bold, no nested clauses.
- Duplicated content within a page (same list twice, same fact restated in TL;DR + body +
  lesson) -> keep it once where it belongs.
- Asides (`<Aside>`) only for genuine caveats; not for restating the paragraph above.
- Tables need a header row that names units.

Diagrams:
- Review every existing ```dot / ```mermaid fence: is it correct against the prose and the
  source repo, readable (not a 20-node hairball, labels short, sensible rankdir), and does it
  add something the prose does not? Fix, simplify, or delete accordingly.
- Add a diagram where the page describes a flow, pipeline, decision path, or architecture
  only in prose and a picture would make it faster to grasp. At most 1-2 new diagrams per page.
  Corpus convention is `dot` (graphviz) fences with the house boilerplate from AGENTS.md
  (bgcolor="transparent", Helvetica fonts, no colours). Copy the boilerplate from an existing
  page, e.g. src/content/docs/reference/pi-harness-journey.mdx.
- Validate every dot fence you touch: extract it to a temp file under /tmp and run
  `dot -Tsvg /tmp/x.dot > /dev/null`. Note the house boilerplate escapes `$` as `\$` in labels.

Facts:
- Do not add new numbers, dates, counts or claims unless you verify them in the source this
  turn (the harness source is ~/dotfiles, read-only; .pi/agent/extensions, .pi/agent/skills,
  .claude/, docs/plans, docs/research, git log). Cite file:line in your final message.
- While editing, if a claim looks wrong or internally inconsistent (contradicts another
  section of the same page, or the source), check it in ~/dotfiles. Fix verified errors;
  list unverifiable ones in your final message instead of guessing.
- Counts as of a date stay labelled with that date; do not silently refresh them.

## Verify (instead of `bun run build`)

Other writers share this worktree, so do NOT run `bun run build` (concurrent builds collide on
dist/). Run instead, in the worktree:
- `bun test 2>&1 | tail -20` - doc tests without the build (AI-tell gate, dot boilerplate,
  links, math-risk). Failures in files that are not yours: ignore and mention.
- `dot -Tsvg` on every diagram you touched.
The parent runs the full build after all writers finish.

## Final message (required)

Per file: a short list of what changed (presentation / diagrams / slop / voice / facts), every
fact you corrected with the source file:line, every claim you flagged as unverifiable, the
diagrams added/changed/removed, and the `bun test` tail.
Do NOT commit, stage, or push. Do NOT dispatch further subagents - do the edits yourself.
Your final message must report finished edits, not a plan.
