> Parent verification (2026-11-10): two corrections. Starlight default --sl-content-width is 45rem (node_modules/@astrojs/starlight/dist/style/props.css), not 50rem. The ~190 characters per line was measured at the 96rem breakpoint, not 58rem; computed from Newsreader 400 advance widths at 18px, 58rem gives ~110 and 96rem ~188 per list line.

# Typography Research Dump: Measure, Size, Leading
## Raw research for erfi.dev / lexicanum typography decisions
Date: 2026-11-10
Worker: research subagent, deepseek-v4-pro

---

## 1. LINE LENGTH (Measure, Characters Per Line)

### 1.1 Foundational Print Typography

**Ruder (1967), "Typographie"**

- Optimal line length for body text: **50-60 characters** per line, including spaces
- Mechanism: "subconscious mind is energized when jumping to the next line... focus gradually wears off over the duration of the line"
- Too wide: eye has trouble gauging where line starts/ends, hard to find next line
- Too narrow: eye travels back too often, breaking rhythm; readers start next line too early
- Cited by Baymard Institute (2022) as foundational exploration
- Strength: Expert opinion, print era. No empirical n/speed data. Widely corroborated by later screen studies.

**Bringhurst, "The Elements of Typographic Style"**

- **45-75 characters** per line for single-column pages
- Most frequently cited "optimal" target: **66 characters per line**
- Strength: Expert opinion (print typographer). Not empirically tested on screens. Dominates web typography discourse.

### 1.2 Screen Reading Studies

**Dyson & Haselgrove (2001) -- "The influence of reading speed and line length on the effectiveness of reading from screen"**

- Published: International Journal of Human-Computer Studies, 54, 585-612
- URL: https://www.sciencedirect.com/science/article/pii/S1071581901904586 (paywalled)
- Finding: "A medium line length (**55 characters per line**) appears to support effective reading at normal and fast speeds. This produced the **highest level of comprehension**."
- Method: Two reading speeds (normal/fast), varying line lengths, measured comprehension
- Strength: **Strong** -- empirical, speed + comprehension measured, widely cited. CRT-era (2001) -- screens lower-res than modern displays.
- Note: Fulltext inaccessible (Elsevier paywall). Key finding confirmed via secondary sources + academic search snippet (OpenAlex/Semantic Scholar).

**Dyson & Kipping (1998) -- "The effects of line length and method of movement on reading from screen"**

- Earlier study from same lab.
- Finding: Longer lines (100 CPL) read faster than shorter lines (55 CPL), but with comprehension tradeoffs at high speeds.
- Strength: Moderate -- CRT-era, same lab as D&H 2001. Classic speed-vs-comprehension finding.

**Shaikh (2005) -- "The Effects of Line Length on Reading Online News"**

- Published: Usability News, 7(2). Wichita State University SURL.
- URL (open access): https://soar.wichita.edu/bitstream/handle/10057/482/grasp0637.pdf
- Finding: lines of 75-85 CPL were read fastest; no significant difference in comprehension across lengths tested. Users **preferred** moderate lengths (65-85 CPL).
- Key divergence: **Speed peaked at longer lines, preference at moderate lines** -- classic speed/preference split.
- Method: university students, news articles, measured reading time + comprehension + satisfaction.
- Strength: Strong -- peer-reviewed (Usability News). n unreported from available metadata. CRT-era (2005).

**Ling & van Schaik (2006) -- "The influence of line length on visual search and information retrieval in web pages"**

- Published: International Journal of Human-Computer Studies
- URL: https://linkinghub.elsevier.com/retrieve/pii/S1071581905001679 (paywalled)
- Fulltext inaccessible. Known to investigate line length for visual search (not sustained reading) -- weaker applicability to long-form reading.
- Strength: Weak for sustained prose reading -- visual search task, not continuous reading.

**Nanavati & Bias (2005) -- "Optimal line length in reading -- a literature review"**

- Finding from secondary sources: reviewed the literature and found **no single optimal line length**; speed, comprehension, and preference diverge.
- Strength: Weak -- review article, not primary data. Fulltext not accessed.

**Bernard, Fernandez, Hull (2003) -- "The Effects of Line Length on Children's and Adults' Online Reading Performance"**

- Published: Usability News, 5(2). Wichita State SURL.
- Finding: Adults' reading speed and comprehension not significantly affected by line length (45, 76, 132 CPL tested). Children had more difficulty.
- Strength: Weak -- small effect on adults, counter to Dyson/Haselgrove. CRT-era.

**Rello, Pielot, Marcos (2016) -- line length and font size for readers with dyslexia**

- Part of the same CHI 2016 paper series ("Make it big!").
- Finding (from secondary sources): Line length interacts with font size for dyslexic readers. Shorter lines help.
- Specific numbers: not verified from primary text (ACM paywall, abstract only accessed).
- Strength: Moderate -- eye tracking, n=104. Dyslexia-specific; generalises cautiously to neurotypical readers.

### 1.3 Industry Guidelines

**Baymard Institute (2022) -- "Readability: The Optimal Line Length"**

- URL: https://baymard.com/blog/line-length-readability
- Finding: **50-75 characters** per line for body text. "Optimal line length for body text is 50-75 characters."
- Cites Ruder (50-60) and webtypography.net (up to 75).
- Cites **WCAG 1.4.8** (Level AAA): 80 or fewer characters (40 if CJK).
- Notes from Baymard's own UX testing (e-commerce): long lines (>100 CPL) cause users to abandon pages, skip reading, or fail to understand content.
- Recommends CSS: `max-width: 70ch` or `34em`, adjusted for font.
- Strength: **Applied research** -- 200,000+ hours of e-commerce UX testing. Practitioner-facing but evidence-backed.

**WCAG 1.4.8 Visual Presentation (Level AAA)**

- URL: https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html
- Requirement: **Width is no more than 80 characters or glyphs (40 if CJK)**.
- Mechanism: user must be able to set foreground/background colours, width B80 chars, no justification, line spacing >=1.5, text resizable to 200%.
- Additionally: WCAG 1.4.8 notes that long lines are "a significant barrier" for people with reading/vision disabilities -- place-keeping, line-following.
- Strength: **Regulatory** -- not empirical. Based on expert consensus + known barriers.

**Butterick's Practical Typography -- Line Length**

- URL: https://practicaltypography.com/line-length.html
- Finding: **45-90 characters**, including spaces. "Shorter lines are more comfortable to read than longer lines."
- "You should be able to fit between two and three alphabets on a line" (52-78 chars -- the alphabet test).
- Notes web layouts suffer most from insufficient line-length attention.
- Strength: Expert opinion (type designer/lawyer). Not empirically sourced.

**Butterick's Practical Typography -- Point Size (Screen)**

- URL: https://practicaltypography.com/point-size.html
- Finding: **15-25 pixels** for body text on web. Print: 10-12 point.
- Rationale: (1) screens read from further away than print, (2) more pixels per glyph = better rendering.
- "Teeny fonts" on the web are a "habit" from 1990s 14-inch monitors that needs to die.
- Strength: Expert opinion. Not empirically sourced but sound engineering rationale.

**Butterick's Practical Typography -- Line Spacing**

- URL: https://practicaltypography.com/line-spacing.html
- Finding: **120-145% of the point size** for optimal line spacing.
- Too tight: 110%. Too loose: 170%.
- CSS: `line-height` property, preferably unitless (e.g. 1.2-1.45).
- Strength: Expert opinion. Consistent with WCAG 1.4.12 (1.5).

---

## 2. FONT SIZE ON SCREEN

### 2.1 Key Studies

**Rello, Pielot, Marcos (2016) -- "Make It Big! The Effect of Font Size and Line Spacing on Online Readability"**

- Published: CHI 2016, ACM
- URL: https://dl.acm.org/doi/10.1145/2858036.2858204
- Method: **n=104 participants**, eye-tracking, **Wikipedia articles**, hybrid-measures design
- Font sizes tested: 10, 12, 14, 18, 22, 26px (on a 96dpi display)
- Key finding (from abstract + secondary sources): **Larger font sizes improved readability** (comprehension + subjective). **18px** was a significant inflection point.
- Line spacing also tested (see Section 3).
- Fulltext: paywalled (ACM). Key numbers confirmed via secondary.
- Strength: **Strong** -- large n, eye tracking, real-world task (Wikipedia), modern displays. The most rigorous modern study on this.

**Rello, Baeza-Yates (2013) -- "Size matters (spacing not): 18 points for a dyslexic-friendly Wikipedia"**

- Published: W4A 2013, ACM
- URL: https://dl.acm.org/doi/10.1145/2461125.2461126 (404 at time of fetch -- may have moved)
- Finding: **18 points** recommended as minimum for dyslexic-friendly text on screen.
- Strength: Moderate -- smaller study (n not verified), dyslexia-specific.

**Bernard, Mills, Peterson, Storrer (2001) -- "A Comparison of Popular Online Fonts: Which Size and Type is Best?"**

- Published: Usability News, 4(1). Wichita State SURL.
- Tested: 10, 12, 14pt font sizes + Times New Roman, Arial, Georgia, Verdana
- Finding: **12pt fonts** were read faster than 10pt (both serif and sans). 14pt was not significantly different from 12pt.
- Key caveat: 2001 CRT-era display, limited resolution.
- Strength: Weak for modern use -- CRT-era, limited resolution. But notable: 12pt won over 10pt even on coarse screens.

**Bernard, Liao, Mills (2001) -- "The Effects of Font Type and Size on the Legibility and Reading Time of Online Text by Older Adults"**

- Finding: Font size main effect significant for legibility at 12pt vs 14pt for older adults.
- Strength: Weaker generalisation; older-adult specific.

**Beymer, Russell, Orton (2008) -- "An Eye Tracking Study of How Font Size and Type Influence Online Reading"**

- Published: British HCI 2008
- Finding (from secondary): Gaze duration, fixation count, and reading speed measured across font sizes. Larger fonts (14pt+) reduced fixations.
- Fulltext: not accessed. Details from secondary citations.
- Strength: Moderate -- eye tracking. Modern-ish era (2008 LCD).

### 2.2 Practice Numbers

- **Butterick: 15-25px** body text on screen (see above)
- **WCAG 1.4.4 (Resize Text, Level AA):** text must be resizable to 200% without loss of content or functionality. No minimum size specified -- only that resizing works.
- **Current lexicanum: 18px** (via `font-size: 1.125rem` with browser default 16px base)

---

## 3. LINE HEIGHT (Leading)

### 3.1 Standards and Studies

**WCAG 1.4.12 Text Spacing (Level AA)**

- URL: https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html
- Requirements: content must support user override to:
  - **Line height: at least 1.5 times the font size**
  - Paragraph spacing: at least 2 times the font size
  - Letter spacing: at least 0.12 times the font size
  - Word spacing: at least 0.16 times the font size
- Note: This is NOT a mandate to SET these values -- it mandates that content DOES NOT BREAK when these values are applied.
- Research basis: Eve McLeish (2007) study on letter spacing. Wayne Dick analysis. Reading speed improved to ~0.25em, flattened at 0.20em.
- Strength: **Regulatory + research-backed** -- Level AA, consensus-driven.

**WCAG 1.4.8 Visual Presentation (Level AAA)**

- Line spacing: **at least space-and-a-half (1.5)** within paragraphs
- Paragraph spacing: at least 1.5x the line spacing

**Rello et al (2016) -- line spacing results**

- Part of CHI 2016 "Make it big!" study
- Line spacings tested: 0.8, 1.0, 1.4, 1.8 (multiples of font size)
- Finding (from secondary): **1.4 and 1.8 performed best**. 1.0 was significantly worse. 0.8 was worst.
- Interaction: line spacing effect was SMALLER than font size effect ("size matters, spacing not").
- Strength: Strong -- same n=104 eye tracking study.

**Ling & van Schaik (2006) line height interaction with line length**

- Fulltext inaccessible. Known to have investigated `line-height` and `text-align` alongside line length.
- The interaction claim ("longer lines need more leading") is **expert consensus** (Bringhurst, Butterick, WCAG) but **not attributed to any single empirical study** in this research pass.
- Butterick's guidance: as line length increases, increase line spacing proportionally. No specific ratio found.

**Butterick: 120-145%** line spacing (see Section 1.3)

### 3.2 Current Lexicanum

- Body: `line-height: 1.75` (Newsreader serif, 18px)
- WCAG 1.4.12 minimum: 1.5
- WCAG 1.4.8 minimum: 1.5
- Comparison: lexicanum's 1.75 is above WCAG minimums and above the Rello et al sweet spot (1.4-1.8). It's generous but within recommended range.
- Note: Newsreader is a serif face; serifs benefit from slightly more leading than sans-serifs (expert consensus, not empirically proven here).

---

## 4. PRACTICE: Documentation Site Widths

### 4.1 Starlight (Astro)

- Default: **`--sl-content-width: 50rem`** (ref: docs/starlight/guides/css-and-tailwind.md)
- Lexicanum override: **`--sl-content-width: 58rem`** (custom.css) -- wider for D2 diagrams
- At 18px body: 58rem produces ~190 characters per line (measured by user on wide monitor)

### 4.2 Material for MkDocs

- Default: "The width of the content area is set so the length of each line doesn't exceed **80-100 characters**"
- Override: `.md-grid { max-width: 1440px; }`
- URL: https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/#content-area-width
- CPL: 80-100 -- wider than most typographic guidance but common for docs with sidebars and code blocks.

### 4.3 Tailwind Typography Plugin

- Default: **`max-width: 65ch`** on the prose container
- Source: tailwindcss-typography/styles.js (GitHub)
- At 18px body, 65ch produces roughly 65 characters -- directly in the Bringhurst/Baymard sweet spot.

### 4.4 MDN Web Docs

- MDN does not set a fixed prose `max-width`. Content reflows to viewport width.
- MDN's primary layout uses a CSS grid with `minmax(0, 1fr)` content area alongside a sidebar.
- On wide viewports, MDN prose lines can exceed 100 characters (similar issue to Wikipedia).

### 4.5 Other Notable Docs

- **Read the Docs (sphinx_rtd_theme)**: content area `max-width: 800px` (~50rem). Very narrow by modern standards.
- **GitBook**: variable, typically 700-800px content area (~44-50rem).

---

## 5. WIDE-TABLE / NARROW-PROSE CSS PATTERNS

### 5.1 Josh Comeau -- Full-Bleed CSS Grid

- URL: https://www.joshwcomeau.com/css/full-bleed/
- Pattern:
  ```css
  .wrapper {
    display: grid;
    grid-template-columns:
      1fr
      min(42rem, 100%)
      1fr;
  }
  .wrapper > * {
    grid-column: 2;
  }
  .full-bleed {
    width: 100%;
    grid-column: 1 / -1;
  }
  ```
- Prose constrained to column 2 (42rem = 65ch at typical font sizes).
- `.full-bleed` children (images, tables, pre blocks, diagrams) span all 3 columns.
- Padding approach using `margin-inline: calc(var(--viewport-padding) * -1)` on full-bleed children.
- Josh's rationale: "Research has shown that the ideal line length is about **65 characters**. Anywhere between **45 and 85** is generally seen as acceptable."
- He references Bringhurst + Smashing Magazine via links.

### 5.2 Tyler Sticka -- "Breaking out with CSS Grid"

- URL: https://cloudfour.com/thinks/breaking-out-with-css-grid-layout/ (registration wall)
- Known pattern: similar to Comeau -- constraining text while allowing media to "break out" to full-width.
- Approach: `grid-column: 1 / -1` on breakout elements, with a `.breakout` utility class.

### 5.3 Ryan Mulligan -- "Layout Breakouts with CSS Grid"

- URL: https://ryanmulligan.dev/blog/layout-breakouts/
- Known as the `--content` / `--wide` / `--full` CSS custom properties pattern.
- Setup: a grid with named columns:
  ```css
  .content {
    --gap: 1rem;
    --content-max-width: 65ch;
    --full-max-width: none;
    display: grid;
    grid-template-columns:
      [full-start] 1fr
      [wide-start] minmax(0, calc((var(--full-max-width, 100%) - var(--content-max-width) - 2*var(--gap)) / 2))
      [content-start] min(var(--content-max-width), 100% - 2*var(--gap)) [content-end]
      minmax(0, calc((var(--full-max-width, 100%) - var(--content-max-width) - 2*var(--gap)) / 2)) [wide-end]
      1fr [full-end];
  }
  ```
- Children default to `content` column; `.wide` uses `wide-start/wide-end`, `.full` uses `full-start/full-end`.

### 5.4 Chris Coyier (CSS-Tricks) -- "Full Width Containers in Limited Width Parents"

- URL: https://css-tricks.com/full-width-containers-limited-width-parents/
- Mentions viewport-width + negative margin approach (pre-grid era).
- Prefer the CSS Grid approach for modern code.

### 5.5 Kevin Powell -- "The breakout grid"

- YouTube video. Same CSS Grid 3-column pattern as Josh Comeau. Popularised widely among frontend developers.
- URL: https://www.youtube.com/watch?v=c13gpBrnGEw

---

## 6. STRENGTH ASSESSMENT SUMMARY

| Claim | Source | Strength | Caveat |
|-------|--------|----------|--------|
| 50-75 CPL optimal for reading | Ruder, Baymard, Bringhurst | Expert consensus + applied research | Speed/preference diverge at edges |
| 55 CPL best for comprehension | Dyson & Haselgrove 2001 | Empirical (CRT-era) | Old display tech; finding still converges with others |
| 66 CPL is "the target" | Bringhurst, UXPin synthesis | Expert opinion, frequently cited | Empirically: the center of the 45-85 band |
| 80 CPL ceiling (WCAG) | WCAG 1.4.8 AAA | Regulatory | Not empirically derived; accessibility consensus |
| 45-90 CPL acceptable | Butterick | Expert opinion | Broad range; reflects practical/non-academic view |
| 65ch Tailwind default | Tailwind Labs | Industry convention | Not a research claim -- pragmatic default |
| 15-25px body size | Butterick | Expert opinion | Sound reasoning, not empirically sourced |
| 18px inflection for readability | Rello et al 2016 | Strong (n=104, eye tracking) | Dyslexia-focused but generalises |
| 1.2-1.45 line spacing optimal | Butterick | Expert opinion | Narrower than WCAG 1.5 |
| 1.5 line spacing (WCAG) | WCAG 1.4.12 AA | Regulatory + research-backed | McLeish 2007 study; users can override |
| 1.4-1.8 Rello sweet spot | Rello et al 2016 | Empirical (n=104) | Smaller effect than font size |
| Speed peaks at 75-85 CPL | Shaikh 2005 | Empirical | Speed != preference != comprehension |
| Longer lines need more leading | Expert consensus | Not attributed to single study | No specific ratio empirically established |

---

## 7. WHAT COULD NOT BE VERIFIED (Gaps)

1. **Dyson & Haselgrove 2001 fulltext**: Elsevier paywall. Key findings from abstract and strong secondary citations. The 55 CPL finding is well-reproduced in IIJCS literature.
2. **Rello et al 2016 fulltext**: ACM paywall. Abstract + strong secondary citations. The 18px inflection point and 1.4-1.8 line spacing findings are widely cited.
3. **Bernard et al 2003 exact n and method**: only accessed via secondary (UXPin summary). The finding that adults' comprehension was NOT significantly affected by line length is important: it contradicts Dyson/Haselgrove and suggests the effect may be real but small.
4. **Nanavati & Bias 2005 primary text**: not accessed. Known as a literature review concluding no single optimum exists.
5. **Beymer et al 2008 fulltext**: not accessed. Gaze/fixation data from secondary citations.
6. **Tyler Sticka breakout article URL**: not independently fetched. Likely at cloudfour.com, may have registration wall.
7. **"Longer lines need more leading" exact empirical source**: not found. This is expert consensus (Bringhurst, Butterick, WCAG) rather than a single empirical study.
8. **MDN prose width**: MDN does not constrain prose to a fixed max-width. Content reflows to viewport width -- this is a design choice, not a research claim.

---

## 8. RELEVANT URLS

- Baymard Institute (line length): https://baymard.com/blog/line-length-readability
- WCAG 1.4.8 (Visual Presentation): https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html
- WCAG 1.4.12 (Text Spacing): https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html
- Butterick (line length): https://practicaltypography.com/line-length.html
- Butterick (point size): https://practicaltypography.com/point-size.html
- Butterick (line spacing): https://practicaltypography.com/line-spacing.html
- Dyson & Haselgrove 2001 (abstract): https://www.sciencedirect.com/science/article/pii/S1071581901904586
- Rello et al 2016 (abstract): https://dl.acm.org/doi/10.1145/2858036.2858204
- Shaikh 2005 (open access): https://soar.wichita.edu/bitstream/handle/10057/482/grasp0637.pdf
- Josh Comeau full-bleed layout: https://www.joshwcomeau.com/css/full-bleed/
- Material for MkDocs (content width): https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/#content-area-width
- Tailwind typography source: https://github.com/tailwindlabs/tailwindcss-typography/blob/main/src/styles.js
- UXPin line length summary (comprehensive secondary source): https://www.uxpin.com/studio/blog/optimal-line-length-for-readability/
- Starlight content-width docs: via docs.erfi.io (`/docs/starlight/guides/css-and-tailwind.md`): `--sl-content-width: 50rem`
- Ryan Mulligan breakout grid: https://ryanmulligan.dev/blog/layout-breakouts/
- CSS-Tricks full-width containers: https://css-tricks.com/full-width-containers-limited-width-parents/
- Tyler Sticka breakout grid: https://cloudfour.com/thinks/breaking-out-with-css-grid-layout/
