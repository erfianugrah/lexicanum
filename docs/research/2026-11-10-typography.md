# Typography research: contrast, font, measure, hierarchy (2026-11-10)

Question from the owner, looking at the TL;DR of
`reference/nixos-router-network-design` in dark mode on a wide monitor: is the
contrast, the font and the hierarchy right, and what does typography research
say about each?

> Status 2026-11-10: change 2 below shipped and stays (full ink body,
> prose links at Lc 91+, References 17px; house kit 0.1.22+). Change 1 (the
> measure) shipped as a 34rem cap, then a centred reading axis (kit
> 0.1.23); the owner rejected both and the layout was reverted to the
> single wide column (kit 0.1.24, lexicanum 822f96b). The measure is to be
> redone from screenshots of established docs sites (lexicanum#82). The
> `house check` type step (house v0.1.21) enforces both rules. Changes 3 and 4 were decided by owner A/B on 2026-11-10
> (house#13, `house preview` of Newsreader / Source Serif 4 / Literata,
> 18 / 19 / 20px, strong / hairline / no code box): keep Newsreader at
> 18px with the strong inline-code box. No change shipped. The numbers in "What the page does now" are the
> pre-change state.

Method: four parallel research workers (raw dumps in
`raw/2026-11-10-typography/`), then a parent pass that re-measured or
re-fetched every load-bearing claim. Three worker claims were wrong and are
corrected at the top of their dumps; the numbers below are the parent's.

## What the page does now (measured)

| Property | Value | How it was checked |
|---|---|---|
| Body face | Newsreader 400, 18px, line-height 1.75 | `src/styles/house-starlight.css` |
| Newsreader x-height | 0.426 of the em (sxHeight 852/2000); 7.7px at 18px | fontTools on `@fontsource/newsreader/files/newsreader-latin-400-normal.woff` |
| Newsreader build | static instance, no `fvar`; the variable package exposes opsz 6-72 (default 16) | fontTools table list; https://api.fontsource.org/v1/variable/newsreader |
| Prose column | 58rem, growing to 64/72/80/88/96rem at viewport 72/90/100/120/150rem | `src/styles/custom.css` |
| Characters per line (list item) | 58rem ~110, 72rem ~139, 80rem ~155, 96rem ~188 | Newsreader advance widths, avg 7.83px/char at 18px on a sample of this page's prose |
| Starlight default column | 45rem (~84 per line at this face and size) | `node_modules/@astrojs/starlight/dist/style/props.css` |
| Body colour | 78% ink mixed into the surface | `house-starlight.css` |
| Inline code | Inconsolata 0.875em, 1px `--color-hairline-strong` box, no fill | `house-starlight.css` |

Contrast, WCAG 2 ratio and APCA Lc (official `apca-w3` 0.1.9):

| Pair | WCAG 2 | APCA Lc |
|---|---|---|
| Dark body #c7c6c7 on #222125 (78% ink) | 9.4:1 | -69.9 |
| Dark full ink #f5f5f5 | 14.7:1 | -98.9 |
| Dark link #8cb2ea | - | -57.2 |
| Dark muted #99a1af | - | -48.7 |
| Light body #504f52 on #f2f2f2 (78% ink) | 7.3:1 | 80.4 |
| Light full ink #222125 | 14.3:1 | 95.2 |
| Light link #2c5a99 | - | 76.0 |
| Light muted #4a5565 | - | 78.5 |

Other ink levels: dark 85% -78.8, 90% -85.5, 95% -91.9; light 85% 86.2,
90% 89.7, 95% 93.0.

Neither the 78% body tone nor the 80-96rem widths were evaluated when chosen.
78% came from restoring the pre-restyle look (house 1278086, 2026-11-09). The
wide breakpoints (lexicanum e3ff505, 2026-07-15) were added so wide screens
would not show empty margins; that commit says the 96rem cap avoids
"200-char prose lines", and the cap still allows 188.

## Findings by axis

### Line length - the clearest problem

- Screen studies measure different outcomes and they disagree. Dyson &
  Haselgrove (2001): comprehension best at about 55 per line. Dyson & Kipping
  (1998): 100 per line read faster than 55. Bernard et al (2003): no
  significant adult effect across 45/76/132. Shaikh (2005): speed peaked at
  75-85, preference 65-85. Sources and strengths: `raw/.../measure-size-leading.md`.
- Guidance converges anyway: Bringhurst 45-75 (66 ideal), Baymard 50-75,
  WCAG 1.4.8 (AAA) at most 80, Tailwind Typography `max-width: 65ch`,
  Starlight default 45rem.
- No study found tested 155-190 characters per line. The page runs 110 at its
  narrowest desktop breakpoint and 188 at the widest. This is the one finding
  where the evidence, the conventions and the framework default all point the
  same way.
- The usual fix keeps a wide column for tables, code and diagrams and caps
  only running text (p, li, blockquote, dl, asides) at about 70-80 characters
  (~34-39rem at this face): the CSS grid breakout pattern,
  https://www.joshwcomeau.com/css/full-bleed/ and
  https://ryanmulligan.dev/blog/layout-breakouts/ .

### Contrast - WCAG 2 and APCA disagree on dark mode

- WCAG 2 passes both themes at AAA (9.4:1 and 7.3:1). APCA documentation says
  WCAG 2 "overstates contrast for dark colors" and "cannot be used for
  guidance designing dark mode":
  https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell
- APCA bronze levels for body text: Lc 75 minimum, Lc 90 preferred, at a
  reference x-height of 0.52; "Times New Roman has an x-height ratio of 0.45,
  so it needs to be increased about 16% in size" (same page). Newsreader at
  0.426 and 18px is equivalent to ~14.7px of the reference face.
- Against those levels: light body (80.4) clears the minimum, dark body
  (-69.9) does not, and dark links (-57.2) sit in body text below Lc 60.
  At 90% ink both themes land near Lc 90 (-85.5 / 89.7).
- Softened grey body text has no supporting evidence in the dumps; the
  sources found argue against it (Kevin Marks, Wired 2016,
  https://www.wired.com/2016/10/how-the-web-became-unreadable/ ; Somers,
  "Please Stop Using Grey Text", https://tangledweb.xyz/please-stop-using-grey-text-3d3e71acfca8 ).
  APCA sets no maximum for small body text.
- Polarity: dark text on light reads better for most people with normal
  vision (Piepenbrock, Mayr and Buchner 2013/2014; NN/g summary
  https://www.nngroup.com/articles/dark-mode/ ). Dark mode is still a
  legitimate user choice; it should reach the same Lc as light mode.
- Halation from white on dark: no clinical study found; one user report on
  APCA's forum of discomfort at Lc 98 and comfort at 56-61
  (https://github.com/Myndex/SAPC-APCA/discussions/74). Anecdote, but it is
  the only counter-evidence to raising dark-mode contrast.
- Caveat: APCA is a draft (WCAG 3 candidate), not a standard.

### Font - the class is fine, the x-height is small

- Serif vs sans makes no measurable difference on paper or screen: Richardson
  (2022) review of the literature, "there seems to be no difference in the
  legibility of serif typefaces and sans serif typefaces either when reading
  from paper or when reading from screens",
  https://link.springer.com/chapter/10.1007/978-3-030-90984-0_16
- Individual readers differ more than font classes do: Wallace et al (2022,
  ACM TOCHI), "reading speeds ... increased by 35% when comparing fastest and
  slowest fonts" within readers, "one font does not fit all",
  https://doi.org/10.1145/3502222 . No font is best for everyone.
- Size: Rello et al (CHI 2016, eye tracking, n=104) put the readability
  threshold at 18px (worker-reported from the abstract; not re-read by the
  parent). That threshold is in CSS px of the tested face, and Newsreader's
  0.426 x-height makes 18px look smaller than 18px of a typical screen face.
- x-heights of alternatives, measured 2026-11-10 from the Google Fonts
  default instance ('x' glyph top / em, fontTools): Literata 0.507,
  Source Serif 4 0.492 (the worker's 0.475 was wrong), Newsreader 0.441.
  At 18px they read as 17.5, 17.0 and 15.2px of the APCA reference face.
- Newsreader is a static opsz-16 cut; the variable build would let the
  browser use opsz 18 at body size. Small effect; low priority.
- Mono faces for headings and labels: no study tested short monospace or
  all-caps headings; the caps and monospace penalties in the literature were
  measured on running text. No evidence either way for this use.

### Hierarchy - emphasis inflation in the TL;DR

- NN/g, "Formatting long-form content": "When the content presented in each
  bullet point is lengthy, it can still result in an undesirable wall of
  text", and "the highlighted text should make up no more than 30% of an
  article's text" (guideline, not an experiment),
  https://www.nngroup.com/articles/formatting-long-form-content/
- The screenshot's TL;DR has 9 bullets of 2 lines each; every one carries a
  bold lead-in and most carry 1-4 boxed code spans. Bold, boxes and coloured
  links compete on every line, so none of them stands out.
- Inline code: MDN, GitHub, Stripe and Tailwind Typography use a tint or no
  box (worker-reported, `raw/.../typeface.md`); the house rules forbid tinted
  boxes, so the alternatives here are a box, colour only, or mono alone.
- Heading scale: Butterick and Tim Brown both say ratio-based scales do not
  replace judgment; spacing above a heading is the cheapest hierarchy cue.
  Nothing found argues against the current h2/h3 split.

## Verdict per popular rule

| Rule | Status | Applies here |
|---|---|---|
| 45-75 characters per line | Evidence mixed on the exact number; convention strong; nothing tested 150+ | Yes - 110-188 now |
| Serif less legible on screen | Refuted (Richardson 2022) | No |
| Grey body text is easier to read | No evidence found; criticised | Yes - 78% ink |
| White on dark causes halation | Anecdote only | Weakly - argues against pure white, not against 90% |
| Light mode reads better | Evidence (Piepenbrock et al) for normal vision | Context only |
| 18px body minimum | One eye-tracking study (Rello 2016) | Met nominally; small x-height |
| Line-height 1.5 | WCAG user-override floor, not an optimum | 1.75 is fine |
| All-caps headings hurt | Measured on running text only | Unknown for short heads |
| Long bullets stay scannable | Against: NN/g | Yes - TL;DR |

## Changes this research supports, strongest first

1. Cap running text at about 70-80 characters per line (~34-39rem) and let
   tables, code and diagrams use the full column. lexicanum `custom.css` plus
   a breakout rule; the cap could live in the house Starlight kit.
2. Raise body text to about 90% ink in both themes (APCA ~Lc 85-90), and
   check dark links (-57.2) against Lc 75. Change the dark muted tone only
   where it carries readable text. House kit (`house-starlight.css`).
3. Either raise the body size to 19-20px or move to a serif with a larger
   x-height; compare in `house preview` rather than by argument, since
   Wallace 2022 says readers differ.
4. Lighten the inline-code box (hairline instead of hairline-strong, or no
   box) and keep TL;DR bullets to one line each. Writing convention plus kit.

What would change the pick: if the owner reads mostly in dark mode at night
and finds 90% ink glaring, the APCA forum anecdote favours stopping at 85%
(Lc -78.8, still above Lc 75). If wide-column prose was wanted on purpose for
scanning speed, Dyson & Kipping 1998 is the one result in its favour.

## Not verified by the parent

Dyson and Rello full texts (paywalled; abstracts and secondary sources
only), Arditi & Cho 2005/2007, Legge & Bigelow 2011, Material Design's
dark-theme text opacity, and every NN/g claim other than the two quoted
above.
