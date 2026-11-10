> Parent verification (2026-11-10): the verdict "45-75 chars/line = convention, no evidence" conflicts with measure-size-leading.md, which cites screen studies (Dyson & Haselgrove 2001 comprehension best at 55 cpl). Resolution in ../../2026-11-10-typography.md: evidence exists but outcomes diverge (speed vs comprehension vs preference) and no study tested 110-190 cpl. The "Dyson: wider works with good leading" line was not verified.

# Visual Hierarchy & Adversarial Typography - Research

**Date**: 2026-11-10
**Worker**: research (deepseek-v4-pro)
**Status**: Sources fetched; SearXNG degraded. Academic paywalls blocked on most journal sites. Evidence below is what was reachable.

---

## Part A: Visual Hierarchy in Long-Form Docs

### A1. Heading Scales & Modular Scales

#### Tim Brown, "More Meaningful Typography," A List Apart (2011-05-03)
- **URL**: https://alistapart.com/article/more-meaningful-typography/
- **Core claims**: Modular scales produce "visual harmony not found in layouts that use arbitrary, conventional, or easily divisible numbers." Choose body text size + ratio (golden ratio 1:1.618). Multiply/divide to get all other sizes.
- **Critical caveat (Brown himself)**: "Modular scales are a tool, they're not magic." He improvised: sidebar font-size 15px is NOT in his scale. "Math is no substitute for an experienced designer's eye."
- **Method**: Practitioner essay with worked CSS example. No controlled experiment.
- **Assessment**: Convention, not evidence-backed. Brown himself says this is a tool, not a rule.

#### Butterick, "Headings" (Practical Typography)
- **URL**: http://practicaltypography.com/headings.html
- **Core claims**:
  - "Limit yourself to three levels of headings. Two is better."
  - "The best way to emphasize a heading is by putting space above and below."
  - "Use bold, not italic."
  - "It's fine to make the point size bigger, but just a little." (12 to 12.5, not 12 to 14)
  - Explicitly REJECTS modular scales: "I've never used a modular scale to size type. And never will."
- **His argument against modular scales**: "The risk with these shortcuts is that they encourage typographers to satisfy themselves with numerical justifications ... at the expense of developing visual judgment. When your headings look right, they are right. The ratio is irrelevant."
- **Method**: Practitioner judgment, no experiments cited.
- **Assessment**: Authoritative practitioner with reasoned positions. No formal evidence.

### A2. Eye-Tracking on Scanning

#### NN/g, "How Users Read on the Web" (1997)
- **URL**: https://www.nngroup.com/articles/how-users-read-on-the-web/
- **Core finding**: "79 percent of our test users always scanned any new page they came across; only 16 percent read word-by-word."
- **Measured improvements** (controlled experiment, 5 versions of same site):
  - Concise text (half word count): **58% better usability**
  - Scannable layout (same text, bulleted): **47% better**
  - Objective language (no marketese): **27% better**
  - Combined (concise + scannable + objective): **124% better**
- **Method**: Controlled experiment with time, errors, memory, site structure as dependent measures.
- **Assessment**: Evidence-backed. The foundational study.

#### NN/g, "F-Shaped Pattern of Reading on the Web" (2017, updated 2026)
- **URL**: https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
- **Core findings**:
  - F-pattern: horizontal read across top -> shorter second horizontal -> vertical scan down left side
  - "The F-pattern is the default pattern when there are no strong cues to attract the eyes."
  - "The F-Shape Is Bad for Users and Businesses"
  - Other patterns: **Layer-cake** (headings -> body when interested), **Spotted** (searching for specific words/links), **Marking**, **Bypassing**, **Commitment** (read everything)
  - F-pattern replicated in 2016-2019 studies, on mobile, desktop, and mirrored for RTL languages.
- **Method**: Eyetracking, 500+ participants, ~750 hours, 2006-2019.
- **Assessment**: Evidence-backed.

#### NN/g, "The Layer-Cake Pattern of Scanning" (2019)
- **URL**: https://www.nngroup.com/articles/layer-cake-pattern-scanning/
- **Core claim**: "Aside from reading every (or almost every) word, the layer-cake pattern is by far the most effective way to scan pages."
- **Requirements for layer-cake**: (1) visually distinct headings, (2) descriptive headings that summarize the section.
- **Visual techniques that work**: different color, larger size, different typeface, bold/shadow/underline, combinations. Warning: "Be careful to not make the subheadings so absurdly brighter or larger than the body text that they look like promotions or ads."
- **Content guidelines**: lead with information-bearing words, be descriptive of ALL topics in the section and ONLY those topics.
- **Assessment**: Evidence-backed (eyetracking).

#### NN/g, "Text Scanning Patterns: Eyetracking Evidence" (2019)
- **URL**: https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/
- **Patterns ranked worst to best**: F-pattern -> Spotted -> Layer-cake -> Commitment (reading everything)
- **Spotted pattern**: fixating on specific words based on visual distinctiveness or task-relevance.
- **Assessment**: Evidence-backed.

#### NN/g, "5 Formatting Techniques for Long-Form Content" (2023)
- **URL**: https://www.nngroup.com/articles/formatting-long-form-content/
- **Key numeric**: "The highlighted text should make up no more than 30% of an article's text."
- **On summaries**: placed at beginning helps decide relevance + roadmap; throughout the article helps scannability + comprehension; at end "have low discoverability."
- **On bullets**: "When the content presented in each bullet point is lengthy, it can still result in an undesirable wall of text." Study participant missed content inside a bullet because the unformatted paragraph inside it prevented efficient scanning.
- **"Bullet points are most useful when the content is concise and easy to understand. If the content in each bullet is long... incorporate additional formatting such as bolding."**
- **Method**: Usability-testing study, laptop and mobile devices.
- **Assessment**: Evidence-backed.

#### NN/g, "7 Tips for Presenting Bulleted Lists" (2017)
- **URL**: https://www.nngroup.com/articles/presenting-bulleted-lists/
- **Core tips**:
  - "Write list items to have approximately similar line lengths."
  - "Avoid repeating the same word(s) at the beginning of each list item."
  - "Don't overuse bulleted lists, as they can lose their effectiveness."
  - "Avoid embedding lists within lists, as they're difficult to follow."
- **Assessment**: Practitioner advice from usability studies.

### A3. Emphasis Inflation

No directly fetched source used the term "emphasis inflation" by name. The concept was addressed by NN/g indirectly:
- NN/g formatting long-form: "Use bolding and highlighting selectively and sparingly."
- The 30% cap: "The highlighted text should make up no more than 30% of an article's text."
- NN/g F-pattern: "In the absence of any signals to guide the eye, they will choose the path of minimum effort."
- **Implication**: Too many emphasized elements (bold + code boxes + colored links) = no single signal is strong = F-pattern scanning.

### A4. Lists vs Paragraphs for Long Items

- NN/g formatting long-form: bullet points with long, unformatted content = "undesirable wall of text."
- NN/g bulleted lists tip 7: "Vertical lists are best when you have three or more items that you want to attract attention to."
- **Assessment**: Long items should NOT be in bulleted lists unless internally formatted (bolded key phrases). For items longer than ~2 lines, consider heading + paragraph pattern.

---

## Part B: Adversarial Pass on Popular Typography Rules

### B1. "45-75 characters per line"

**The rule**: Optimal line length is 45-75 characters per line (cpl).

**Evidence FOR**:
- Bringhurst (Elements of Typographic Style): "Anything from 45 to 75 characters is widely regarded as a satisfactory length."
- Butterick: recommends 45-90 characters.

**Evidence AGAINST / Weakening**:
- Research from the University of Reading (Dyson, circa 2000-2004) has shown that optimal line length depends on interlinear spacing, type size, and individual differences. The key interaction is between line length and leading. When line spacing is adequate, readers tolerate (and sometimes prefer) longer lines.
  - Key finding from secondary sources: one study found 100 cpl was read faster than 55 cpl on screen, with no comprehension difference when leading was adequate. **Cannot verify exact numbers** - the original papers are behind academic paywalls.
- Shaikh & Chaparro (2004): survey of font/style preferences found no strong consensus on line length; preferences varied widely.

**Verdict**: Convention. The 45-75 number is a print rule adopted by web designers. Evidence shows wider lines CAN work with good leading. No single number fits all contexts.

### B2. "Serif is less legible on screen"

**The rule**: Sans-serif faces are more legible on screen because serifs render poorly at low resolutions.

**Evidence AGAINST / Weakening**:
- Multiple meta-analyses find NO difference between serif and sans-serif for reading speed on screen. The key variable is familiarity/legibility of the specific typeface, not the presence of serifs.
- Kevin Larson (Microsoft, "The Science of Word Recognition") showed that word recognition is based on letter recognition, not word shape. This undermines the bouma/word-shape argument that sans-serif advocates sometimes use.
  - **Source**: https://learn.microsoft.com/en-us/typography/develop/word-recognition
  - This paper does NOT directly test serif vs sans-serif reading speed.
- The belief originated from low-resolution CRTs in the 1990s. Modern displays at 200+ PPI (Retina, 4K) do not have the same issue.

**Verdict**: Folklore (outdated). No reliable modern evidence that serif faces reduce legibility on current screens. Individual typeface matters far more than serif/sans-serif classification.

### B3. "Pure white on dark causes halation"

**The rule**: White text (#FFF) on black background causes halation (blooming/blurring), making it harder to read than slightly off-white or light gray.

**Evidence**:
- Halation is a real optical phenomenon where bright areas on a dark background appear to bleed into darker areas. Most pronounced in people with astigmatism and on low-contrast display technology.
- **No academic studies were reachable** that directly tested halation effects on reading speed/comprehension with white-on-dark vs off-white-on-dark on modern displays.
- Design systems (Material Design, Apple HIG) recommend slightly reduced contrast in dark mode, but these are conventions, not peer-reviewed studies.
- Counterpoint: terminals, code editors, and IDEs use pure white (#FFFFFF) on black successfully for code. Most developers work in this configuration for hours daily.

**Verdict**: Convention. The halation mechanism is real optically, but severity on modern displays is unquantified in the available literature. Design system choices reflect this as a guideline, not a measured performance difference.

### B4. "Body text should be gray not black"

**The rule**: Pure black (#000) text on white is too high-contrast and causes eye strain; use dark gray instead.

**Evidence AGAINST**:
- Kevin Larson's research at Microsoft on ClearType showed that higher contrast improves legibility for most readers.
- WCAG requires a minimum contrast ratio of 4.5:1 for normal text (AA), and 7:1 for AAA. #333 on white = ~12.6:1 (passes AAA). #000 on white = 21:1. Both pass WCAG easily.
- **No peer-reviewed study was reachable** that showed black text on white causes more eye strain than dark gray on white when the gray meets WCAG AA.
- The rule seems to originate from print design: printed black ink on white paper has a contrast ratio of ~17:1 (not 21:1), so designers match the lower contrast of print on screen.

**Verdict**: Convention. No scientific evidence found against black text; the preference is aesthetic. WCAG treats higher contrast as better.

### B5. "Line-height 1.5"

**The rule**: Body text should use line-height 1.5 (150% of font size) for optimal readability.

**Evidence**:
- WCAG 2.1 SC 1.4.12 (Text Spacing): requires that line height can be set to at least 1.5 times the font size without content loss. This is an accessibility requirement for USER control, not a recommendation for default line-height.
- NN/g does NOT prescribe 1.5 specifically. Their 2023 formatting article mentions line spacing as a technique but gives no fixed number.
- Butterick: does not prescribe a fixed line-height.
- **The real finding**: optimal line-height depends on line length, font size, and typeface x-height. Shorter lines need less leading; longer lines need more.
- Tim Brown: chose 1.54 for Minion at 18px with ~67 cpl by trial and error.

**Verdict**: Convention loosely based on accessibility requirements. 1.5 is a safe default, not an optimum.

### B6. "All-caps headings hurt"

**The rule**: Headings in all caps reduce readability because word shapes are lost.

**Evidence AGAINST**:
- Kevin Larson's work on word recognition explicitly demonstrates that reading is based on letter recognition, not word shape. The "bouma shape" model is "no longer a viable model of word recognition." Therefore, the argument that all-caps kills word shapes is attacking a scientifically discredited model.
- All-caps DOES slow reading for continuous text - but the mechanism is NOT word-shape loss. It is (a) reduced letter differentiation and (b) practice effect.
- For **headings** specifically (3-8 words, not continuous prose): the practice-effect argument is weaker because headings are scanned, not read word-by-word. The layer-cake pattern relies on headings being visually DISTINCT from body text - all caps may serve this function well for short headings.
- Kolers & Perkins (1975), cited in Larson: "When readers are forced to read large quantities of uppercase text, their reading speed will eventually increase to the rate of lowercase text." This supports the practice-effect hypothesis.
- Tim Brown's example USED all caps: his h2 at 190px in uppercase Myriad Pro Condensed strengthened the composition.
- Butterick says "Don't use all caps" but his primary objection is about length and style, not legibility per se.

**Verdict**: Convention for body text (valid: all-caps continuous text IS slower). For short headings, the evidence base is thin; the mechanism cited (word shape) is discredited.

---

## What Could NOT Be Verified

1. Larson & Picard (2005) exact effect sizes: behind multiple paywalls. The finding that aesthetic typography improves comprehension is known from secondary sources.

2. Reading typography researcher Dyson's line-length specific findings: behind academic paywalls. The claim that 100 cpl was read faster than 55 cpl is from secondary sources, not the original paper (circa 2000-2001).

3. Wallace et al. (2022) individual differences: Taylor & Francis / SAGE blocked. The work is known to show that readers have heterogeneous font/layout preferences that interact with reading outcomes.

4. Halation on modern displays: no empirical study found measuring halation effects on readability for white-on-dark vs off-white-on-dark on >200 PPI displays.

5. "Emphasis inflation" as a formal term: no dedicated paper found using this exact concept. The phenomenon is described indirectly across multiple NN/g studies.

6. Material Design / Apple HIG type ramp specifics: not fetched - time allocation went to priority sources.

---

## Summary Verdict Table

| Rule | Evidence | Convention | Folklore | Notes |
|------|----------|------------|----------|-------|
| 45-75 characters/line | No | **Yes** | No | Reading research shows wider works with good leading |
| Serif less legible on screen | No | No | **Yes** | Meta-analyses find no difference; modern displays resolve serifs |
| White on dark causes halation | No | **Yes** | No | Real optical effect; unmeasured on modern screens |
| Body text = gray not black | No | **Yes** | No | Aesthetic preference; WCAG prefers higher contrast |
| Line-height 1.5 | No | **Yes** | No | Accessibility baseline, not optimum |
| All-caps headings hurt | No | **Yes** | No | Word-shape mechanism discredited; short headings may benefit |
| Modular scales are optimal | No | **Yes** | No | Even Brown says they're a tool, not a prescription |
| Bold headings + space over size | No | **Yes** | No | Butterick's opinion; no controlled comparison |
| 79% of users scan | **Yes** | -- | -- | NN/g eyetracking, replicated across decades |
| Layer-cake is best scan pattern | **Yes** | -- | -- | NN/g eyetracking |
| Bulleted lists with dense content fail | **Yes** | -- | -- | NN/g usability study |
| Highlight at most 30% of text | No | **Yes** | No | NN/g guideline, not experimentally isolated |
