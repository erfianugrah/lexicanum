# Fix-pass brief (2026-10-15, round 2)

The review round left findings for the author in `batch-N.md`, `meta.md` and
`diff-verify.md` (same directory). The author's instruction is "fix it all".
This round fixes every open finding for your batch. Read `BRIEF.md` first: its
house style, verify commands and forbidden git commands still apply. This file
overrides only its fix policy.

## Inputs for your batch

- your `batch-N.md`: every "Unfixed", "Skeleton gaps" and summary item
- `meta.md`: the section 2 table rows and any section 1 item for files in your batch
- `diff-verify.md`: any leftover item for files in your batch

Your batch's file list is `batches/batch-N.txt`, minus any file your prompt
excludes. Edit only those files.

## Policy by axis

D, accuracy (do these first):
- Settle each finding from the doc's own evidence: its evidence table, the
  dates it gives, its linked run artifacts (the `out/<date>/` links can be
  fetched), or arithmetic on figures the doc states.
- Change a number only when that evidence settles it. List every changed
  number in your report under "Number changes" with before, after and the
  evidence. If the evidence does not settle it, reconcile the wording so both
  figures stay and say what each measures (for example "59 ms and 249 ms
  (evidence table)" instead of "tens of milliseconds"). Never delete a figure.
- A self-contradiction (for example `guides/vyos-dot`) is resolved toward
  what the doc's own config and later sections show, and the lede/description
  is brought in line.

A, structure, derived strictly from the doc's own content:
- Guide `## File reference`: a table of the files, paths and config objects
  the guide's own steps create or edit, read from its code fences and prose.
  Skip with a note if the guide touches no files.
- Guide `## Gotchas and lessons learned`: collect the gotchas already in the
  doc (Asides, step warnings, "note" paragraphs) as one-line bullets linking
  to the section where each is explained. Add no new gotcha.
- Guide `## Verification`: collect the verification commands and expected
  output already in the steps. If the doc has none, report it; do not invent
  commands.
- Reference TL;DR: 3-5 bullets of the doc's own conclusions, figures copied
  verbatim.
- Which-to-pick table / decision guide: only where the doc compares options;
  build it from the comparison content already there. Do not force one onto a
  single-system architecture doc - mark it n/a in the report.
- `## Related docs`: only docs that exist (`ls` the path), each with a named
  relationship. Add the missing back-link for one-way pairs named in meta.md.
- Dot diagrams: every decision diagram gets a text fallback (existing rule).
- "Historical since" stated as a body `:::note`: move it to the top
  `<Aside type="caution" title="Historical since YYYY-MM-DD">` form per AGENTS.md.
- Heading hierarchy (a doc starting at h3, bold Title Case headings): fix
  levels and case. Level changes do not change slugs.
- Practices-table cells over 90 characters: move the justification into the
  Evidence cell; keep every API path and identifier. Leave the cell if that is
  impossible and say why.
- No file moves or renames, no new frontmatter fields.

B / C, prose:
- Fix every reported tell and style item, sentence-level.
- Bold: keep bold run-in labels at the start of list items, gotcha bullets and
  numbered steps (the author's convention, kept by the 2026-08-28 sweep). Rewrite
  a label that grades itself ("The big win.", "The trap.") into a plain
  descriptive one. Remove bold used as emphasis inside running prose; keep at
  most one bold phrase per section, and only for a safety warning.
- American spelling in a heading: change it, then add `<a id="old-slug"></a>`
  on the line after the heading so existing links keep working, and list the
  anchor in your report.
- Keep `must` where the doc uses it for a requirement.

Pins: `tests/pins.test.ts` pins exact strings. If a pin fails because of your
edit, change your edit. Never edit tests.

## Verify and report

Run the three verify commands from `BRIEF.md` on your files. Write the report
to `fix-N.md` (`fix-meta.md` for the local worker):

```
# Fix batch N
## Number changes   (path:line before -> after - evidence)
## New anchors      (path: old-slug)
## Per file: what was fixed, and any finding left open with the reason
```
