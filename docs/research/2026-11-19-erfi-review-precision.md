# erfi-review vs tell-review on 30 hand-labelled paragraphs (lexicanum#96)

Date: 2026-11-19. Labels: agent hand-read of the blind sheet
(`2026-11-19-erfi-review-labels.md`), written before looking at either model's
output. Gemini (tell-review) flags come from the full-corpus sweep in
`~/.local/state/agent-work/lex-tells/flags2.json` (local only); erfi-review 2026-11-19 run
on the sheet itself. P09's Gemini flag refers to a paragraph that was edited
after the sweep and is excluded.

## Agent labels

Three of thirty paragraphs have a real tell:

- **P05** - aphorism + negative parallelism: "Coverage is a property of
  vantage points, not of rule count".
- **P11** - aphorism/punchy fragment: "The session state lies."
- **P15** - announce-before-stating: "This page covers what ..., which ...,
  how ..., and how ...".

The other 27 are factual prose. Several carry a bold lead-in or a colon
list-intro; those are house-shape choices, not tells by themselves.

## All flags side by side

| P | Agent label | erfi-review | Gemini tell-review |
|---|---|---|---|
| P01 | fine | - | announce-before-stating (instruction, not a tell) |
| P02 | fine | - | - |
| P03 | fine | - | self-narration (deploy order is content) |
| P04 | fine | - | - |
| P05 | aphorism + negative parallelism | negative parallelism (TP) | aphorism (TP) |
| P06 | fine | - | - |
| P07 | fine | significance inflation ("fundamental limitation", borderline) | self-grading ("worth understanding", borderline) |
| P08 | fine | - | - |
| P09 | fine | - | (stale line, excluded) |
| P10 | fine | - | - |
| P11 | aphorism | - (miss) | aphorism (TP) |
| P12 | fine | - | - |
| P13 | fine | - | self-grading (a recommendation, not a tell) |
| P14 | fine | - | - |
| P15 | announce-before-stating | - (miss) | self-narration (TP) |
| P16 | fine | - | - |
| P17 | fine | rating your own points ("architecture wins", defensible) | self-grading (same, defensible) |
| P18 | fine | - | - |
| P19 | fine | - | self-narration (documented-vs-measured is the point) |
| P20 | fine | - | - |
| P21 | fine | - | announce-before-stating (colon list-intro) |
| P22 | fine | - | - |
| P23 | fine | mystery-tease ("the one that bears on", defensible) | - |
| P24 | fine | - | - |
| P25 | fine | - | self-grading (history, borderline) |
| P26 | fine | - | - |
| P27 | fine | - | announce-before-stating (framing, not a tell) |
| P28 | fine | - | - |
| P29 | fine | - | self-grading ("the ones you want", borderline) |
| P30 | fine | present-participle tail ("rather than racing ahead" - mechanism, clear false positive) | - |

## Scores against the agent labels

| Model | True positives | Misses | Clear false positives | Borderline flags |
|---|---|---|---|---|
| erfi-review | 1 of 3 (P05) | P11, P15 | 1 (P30) | 3 (P07, P17, P23) |
| Gemini tell-review | 3 of 3 | none | 6 (P01, P03, P13, P19, P21, P27) | 4 (P07, P17, P25, P29) |

Strict precision is 1/5 for erfi-review and 3/13 for Gemini; recall is 1/3
against 3/3. Counting borderline flags as useful, erfi-review's flags are 4
of 5 defensible and Gemini's 7 of 13.

## What this says about the two checks

- **Gemini has the recall a gate needs and pays for it in false flags on
  factual prose.** Instructions ("Do all of this before..."), deployment
  order, measured-vs-documented framing and colon list-intros all get flagged.
  Its job is the pre-push gate on touched paragraphs, where a false flag costs
  one reword or a `tells-ok` comment. Do not use its raw corpus flag count as
  a quality metric; at this precision that number mostly measures how much
  factual prose the corpus has.
- **erfi-review is quieter and most of what it flags is defensible**, but it
  missed the aphorism fragment and the announce lead-in - the two kinds it
  also missed in the earlier probe. Its regex for trailing participles fires
  on mechanism clauses ("rather than racing ahead into another stall"), which
  is the one clear false positive here. If its prompt is touched, the gap to
  close is aphorism fragments and announce lead-ins, accepting that flags
  will rise.
- Neither model's flags are a verdict. The three labels here are one reader's
  judgment; the sheet is still in the repo for a second, independent pass
  (`2026-11-19-erfi-review-labels.md`), and the file:line key is local at
  `~/.local/state/agent-work/lex-tells/label-key.tsv` (local only).
