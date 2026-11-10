> Parent verification (2026-11-10): inline code is boxed with 1px var(--color-hairline-strong) (src/styles/house-starlight.css), not var(--house-hue-2). Newsreader sxHeight 852/2000 = 0.426 confirmed (glyph x top incl. overshoot 0.441); Literata/Source Serif 4 ratios below were not re-measured by the parent.

# Typeface Choice for Long-Form Technical Docs on Screen - Raw Research Dump

**Date:** 2026-11-10
**Context:** docs site erfi.dev (lexicanum). Body: Newsreader 18px serif. Headings/nav: Overpass Mono caps. Code/tables: Inconsolata. No sans face.

## 1. Serif vs Sans on Screen: Empirical Evidence

### 1.1 Richardson (2022) -- Definitive Meta-Review

**Source:** John T. E. Richardson, *The Legibility of Serif and Sans Serif Typefaces: Reading from Paper and Reading from Screens*, SpringerBriefs in Education, 2022. Open Access. https://doi.org/10.1007/978-3-030-90984-0

**Key quotes from Chapter 9 (General Conclusions):**

> "The modal finding from the research studies that have been reviewed is that there [is no] difference in the legibility of serif and sans serif typefaces when they are used to generate printed material."

> "There is no support for traditional beliefs that serif typefaces are superior to sans serif typefaces and certainly no support for Morison's (1959) assertion that 'the serif is essential to the reading of alphabetical composition'."

> "Based on the wealth of evidence that has accumulated over the last 140 years, the clear conclusion is that there is no difference in the legibility of serif typefaces and sans serif typefaces."

Richardson directly refutes the APA 6th edition's claim that serif fonts "improve readability and reduce eye fatigue": "there is no convincing empirical support, either." He notes APA 7th (2020) abandoned this position entirely.

**Covers:** Studies from 1880s through 2021, across letters/words, sentences, text comprehension, younger readers, older readers, and readers with disabilities.

**Strength:** High. Most comprehensive review available (open access, 2022). Comprehensive survey, not new experiment.

### 1.2 Moret-Tatay & Perea (2011) -- Lexical Decision

**Source:** "Do serifs provide an advantage in the recognition of written words?" *Journal of Cognitive Psychology*, 2011. https://doi.org/10.1080/20445911.2011.546781

**Method:** Lexical decision task (word/nonword). Lucida family, serif vs sans serif. ClearType on LCD. Block list and mixed list conditions.

**Results:** "Results showed a small, but significant advantage in response times for words written in a sans serif font. Thus, sans serif fonts should be the preferred choice for text in computer screens."

**Strength:** Low-medium. Lexical decision is not continuous reading. Small effect. Single font family.

### 1.3 Perea (2013) -- Eye Tracking During Sentence Reading

**Source:** "Why does the APA recommend the use of serif fonts?" *Psicothema*, 2013. https://doi.org/10.7334/psicothema2012.141

**Method:** Eye tracking. Sentences in serif vs sans serif, same family.

**Results:** "No differences due to typeface in eye movements, except for a minimal effect in the number of progressive saccadic movements. There is no reason why APA publication norms recommend the use of serif fonts beyond uniformity in manuscript preparation and presentation."

**Strength:** Medium. Eye tracking is gold standard for reading research. But short sentences, not long-form.

### 1.4 Boyarski, Neuwirth, Forlizzi & Regli (1998) -- CHI '98

**Source:** "A Study of Fonts Designed for Screen Display," *CHI '98*. https://doi.org/10.1145/274644.274658

**Method:** n=48, Nelson-Denny Reading Test. Georgia (serif, screen-optimised) vs Verdana (sans-serif, screen-optimised) vs Times Roman vs Verdana Italic. 10pt, 640x480, CRT monitor.

**Key results:**
- Georgia vs Times: No objective reading speed/comprehension difference. Subjective preference for Georgia (p<.05).
- Georgia vs Verdana: "Participants answered more questions correctly (9.8 vs. 9.0) when viewing the test in Georgia than they did when viewing the test in Verdana (p < .05). The difference expressed as a percentage of the mean score for Verdana is a difference of 8.9%." No time difference. Direct comparison: slight preference for Verdana on "easiest to read."
- Verdana vs Verdana Italic: No objective difference. Strong subjective preference for non-italic.

**Strength:** Low-medium. Small n (16 per test pair). Dated hardware. The Georgia>Verdana comprehension finding with n=16 is underpowered; authors note hundreds of subjects would be needed for adequate power on reading time.

### 1.5 Wallace, Bylinskii, Dobres et al. (2022) -- ACM TOCHI

**Source:** "Towards Individuated Reading Experiences: Different Fonts Increase Reading Speed for Different Individuals," *ACM TOCHI*, 2022. https://doi.org/10.1145/3502222

**Method:** Remote crowdsourced study. 16 fonts, perceptually size-normalised to Times at 16px. Hundreds of MTurk participants, ages 18-71. "Interlude Reading" -- short passages.

**Key results:**
- "Participants' reading speeds (measured in WPM) increased by 35% when comparing fastest and slowest fonts without affecting reading comprehension."
- "High WPM variability across fonts suggests that one font does not fit all."
- "Preference does not predict speed even when font size is controlled."
- "No single factor predicts reading speed."
- "Different fonts work best for different people."

**Critical detail:** The 35% is WITHIN-subject (each person's fastest vs slowest font). No single font was best across subjects. Font size was normalised by human perception -- novel and important.

**Strength:** High for the individuation thesis. Large n, size-normalised, real-world conditions. Weakness: remote (uncontrolled viewing), interlude reading (not long-form). Did not test specialised reading fonts.

### 1.6 The "Dispute" Paper (2022)

**Source:** "The dispute about sans serif versus serif fonts: An interaction between the variables of serif and stroke contrast," *Acta Psychologica*, 2022. https://doi.org/10.1016/j.actpsy.2022.103623

**Status:** Could not fetch full text (403 from publisher). Abstract indicates interaction between serifs and stroke contrast -- serifs alone have no simple main effect. Key argument: the serif/sans comparison is confounded by other font variables.

**Strength:** Cannot assess without full text.

---

## 2. X-Height and Apparent Size

### 2.1 Legge & Bigelow (2011)

**Source:** G.E. Legge & C.A. Bigelow, "Does print size matter for reading? A review of findings from vision science and typography," *Journal of Vision*, 2011.

**Status:** Could not locate full text. Known from secondary citations: x-height (not nominal point size) determines apparent print size. Critical print size for fluent reading is ~0.2 degrees visual angle for x-height.

### 2.2 Font Metrics -- Measured x-height/unitsPerEm

Tool: fontTools on actual font files. Newsreader static from local node_modules; comparison fonts from upstream GitHub.

| Font | unitsPerEm | xHeight | Cap Height | xRatio | Notes |
|------|-----------|---------|------------|--------|-------|
| **Newsreader** (static 400) | 2000 | 852 | 1340 | **0.426** | Low x-height, old-style text face |
| **Source Serif 4** (variable) | 1000 | 475 | 670 | **0.475** | +11.5% over Newsreader |
| **Literata** (variable) | 1000 | 507 | 700 | **0.507** | +19.0% over Newsreader |
| **Overpass Mono** (400) | 2000 | 1022 | 1400 | **0.511** | Monospace, large x-height |
| **Inconsolata** (400) | 1000 | 457 | 623 | **0.457** | +7.3% over Newsreader |

Merriweather variable TTFs failed fontTools parsing -- re-download needed.

**Implication:** At same CSS font-size 18px, Literata renders body text ~19% taller in x-height than Newsreader (9.13px vs 7.67px). Source Serif 4 is ~11.5% taller. Newsreader at 18px has x-height ~7.7px, approximately 0.19 degrees visual angle at 60cm viewing distance -- near the critical print size threshold of 0.2 degrees identified by Legge & Bigelow.

### 2.3 Newsreader Fontsource Configuration

Installed: `@fontsource/newsreader` v26 -- STATIC version (individual woff2 per weight). The metadata confirms variable axes exist (opsz: 6-72, default 16; wght: 200-800; ital: 0-1), BUT:
- Static CSS declares only weight, no font-variation-settings -- no opsz control.
- `@fontsource-variable/newsreader` is NOT installed. It exists on npm and exposes the opsz axis.
- Static instances are likely the opsz=16 default. At 18px body text, the optical-size axis is unused.

**Implication:** Newsreader's optical-size axis (6-72) is a key feature. Using static instances means the font renders at its 16-point optical design, which may be suboptimal at 18px body. Switching to `@fontsource-variable/newsreader` would allow `font-variation-settings: 'opsz' 18`.

---

## 3. Monospace and All-Caps for Headings/Labels

### 3.1 Butterick's Practical Typography -- Monospaced Fonts

**Source:** https://practicaltypography.com/monospaced-fonts.html

> "Monospaced fonts were invented to suit the mechanical requirements of typewriters. They were not invented to win beauty contests. Compared to proportional fonts, monospaced fonts are harder to read. And because they take up more horizontal space, you'll always get fewer words per page with a monospaced font."

> "In standard body text, there are no good reasons to use monospaced fonts. So don't. Use proportional fonts."

Exception for code: "software code includes compressed syntax like (int i=1; i<111; i++) which is more legible when set in a monospaced font."

**Strength:** Expert opinion (typographer/type designer), not empirical study.

### 3.2 Tinker & Paterson (1932/1963) -- Typeface Legibility

**Source:** Tinker (1963), *Legibility of Print*, summarising Paterson & Tinker (1932). https://doi.org/10.1037/h0070644

**Findings via Richardson (2022):** Tinker tested 10 typefaces. "American Typewriter, a slab serif typeface that imitated typewriting... [was] read significantly more slowly than Scotch Roman." However, sans serif Kabel Light was not. Tinker concluded: "Typefaces in common use are equally legible. This includes the typefaces with serifs and those without serifs."

**Monospace specifically:** American Typewriter was closest to monospace and was slower. But confounded with slab-serif styling.

**Strength:** Medium. Classic study, but confounded monospace with slab serif.

### 3.3 Arditi & Cho (2007) -- Letter Case and Text Legibility

**Source:** "Letter case and text legibility in normal and low vision," *Vision Research*, 2007. https://doi.org/10.1016/j.visres.2007.06.002

**Status:** Full text could not be fetched (Elsevier paywall). 

**From secondary sources:** Lower-case text is more legible than upper-case. Upper-case words form uniform rectangles that must be read letter-by-letter. For short labels/headings, the disadvantage is less severe.

**Strength for all-caps headings:** Well-established. For reading flow, caps are measurably slower. For short labels, the penalty shrinks.

### 3.4 Gap: No Modern Monospace-vs-Proportional Reading Study

No dedicated study comparing proportional vs monospace fonts for headings/labels was found through available channels.

---

## 4. Mixing Typefaces (Serif Body + Mono Headings + Mono Inline Code)

### 4.1 Butterick's Practical Typography -- Mixing Fonts

**Source:** https://practicaltypography.com/mixing-fonts.html

Key principles:
- "Mixing fonts is never a requirement -- it's an option."
- "The rule of diminishing returns applies. Most documents can tolerate a second font. Few can tolerate a third. Almost none can tolerate four or more."
- "You can mix any two fonts that are identifiably different. If you've heard that you can only mix a serif font with a sans serif font, it's not true."
- "It rarely works to have multiple fonts in a single paragraph."
- "Combine fonts by the same font designer."

### 4.2 Butterick -- Bold or Italic

**Source:** https://practicaltypography.com/bold-or-italic.html

- "Bold or italic -- think of them as mutually exclusive."
- "With a serif font, use italic for gentle emphasis, or bold for heavier emphasis."
- "If you're using a sans serif font, skip italic and use bold for emphasis."

### 4.3 Current erfi.dev Setup Assessment

| Role | Font | Type |
|------|------|------|
| Body prose | Newsreader 18px | Serif (editorial, optical-sizing) |
| h2 headings | Overpass Mono caps (~26px) | Monospace, all-caps |
| h3 headings | Overpass Mono mixed case | Monospace, category-hue |
| Nav/labels | Overpass Mono | Monospace |
| Code | Inconsolata (bordered boxes) | Monospace |
| Tables | Inconsolata | Monospace |

**Against Butterick:** 3 faces total -- at edge of tolerance. Overpass Mono + Inconsolata are BOTH monospaced; they compete for the "mono/technical" slot. Serif body + mono headings reverses the common pattern.

### 4.4 Inline Code Styling in Major Docs Sites

| Site | Inline code style |
|------|------------------|
| **MDN Web Docs** | Light grey background, no border, slight padding |
| **Stripe Docs** | Tinted background, no border |
| **GitHub Docs** | Very light grey background, no border |
| **Rust Book** | No background, just monospace face |
| **Tailwind Typography** (default) | Light grey background, rounded, no border |
| **erfi.dev (lexicanum)** | Bordered box: `border: 1px solid var(--house-hue-2)` |

**The bordered-box approach is unusual.** Most sites use subtle grey tint. Borders add visual noise in dense technical prose. No empirical study found comparing inline code styling methods.

---

## 5. Bold Run-in Lead-ins in Lists

### 5.1 Typographic Guidance

**Butterick:** Bold is for "heavier emphasis." Use sparingly. With serif body text, italic for gentle emphasis, bold for heavier.

**Common practice:** TL;DR bullet patterns in technical writing use bold lead-ins followed by roman explanation (GitHub READMEs, MDN, Stripe docs). No empirical study found on "bold run-in + roman body in list items" for reading speed or comprehension.

**Newsreader 700 Bold:** Weight 700 is bold-but-not-black, provides emphasis while maintaining readability. Consistent with Butterick's guidance for serif fonts.

---

## What Could NOT Be Verified

1. **Arditi & Cho (2005)** "Serifs and font legibility" -- paywalled (Elsevier). Richardson (2022) reviewed and found it did not demonstrate serif superiority.

2. **Arditi & Cho (2007)** "Letter case and text legibility" -- paywalled. Known from secondary sources to show lowercase advantage.

3. **Legge & Bigelow (2011)** "Does print size matter for reading?" -- paper not accessible. Known from secondary citations.

4. **Wallace et al. (2022) full results section** -- truncated by fetch tool. Per-font WPM rankings and tables were in the truncated section. Re-retrieval with higher char limit might get these.

5. **Dispute paper (2022)** -- 403 from publisher. Abstract only.

6. **Monospace vs proportional reading speed** -- no dedicated modern study found. Closest is Tinker (1932) where American Typewriter was slower, confounded with slab-serif.

7. **Inline code border boxes vs tint** -- no empirical study on visual noise from bordered inline elements.

8. **Merriweather font metrics** -- TTF files failed fontTools parsing.

9. **Charis SIL, PT Serif, Georgia metrics** -- not downloaded.

---

## Synthesis

The RESEARCH CONSENSUS (from Richardson 2022 and multiple individual studies) is that there is NO reliable difference in reading speed or comprehension between serif and sans serif typefaces on screen. Individual font design matters more than the serif/sans classification.

The INDIVIDUATION FINDING (Wallace 2022) is the most important modern result: different fonts work better for different people, with within-subject speed differences up to 35%. No single font wins across readers. This undercuts any argument that "serif is better" or "sans is better" for a general audience.

For erfi.dev, the empirical case around Newsreader specifically rests on:
- Its low x-height (0.426) means 18px Newsreader has physically smaller x-height than 18px of most other serifs. A reader accustomed to Georgia or Literata will perceive Newsreader as smaller.
- The optical-size axis is valuable but currently unused (static fontsource).
- No study tested Newsreader specifically.

The monospace-for-headings choice has little direct empirical evidence. Tinker (1932) suggests monospaced faces are slower for continuous reading, but headings are short labels. Expert opinion (Butterick) is against monospace for anything but code. Two mono faces (Overpass Mono + Inconsolata) in one document is unusual.

The bordered inline code boxes are visually heavier than the industry-standard tint-background approach. No empirical comparison exists, but the visual-noise argument is plausible.
