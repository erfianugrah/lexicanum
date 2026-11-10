> Parent verification (2026-11-10): the APCA Lc table below is WRONG - the worker hand-rolled the formula. Official apca-w3 0.1.9 gives: dark body #c7c6c7 -69.9, dark ink #f5f5f5 -98.9, dark muted #99a1af -48.7, dark link #8cb2ea -57.2; light body #504f52 80.4, light ink #222125 95.2, light muted #4a5565 78.5, light link #2c5a99 76.0. Every conclusion below that rests on "-44.6" or "fails Lc 45" is void; see ../../2026-11-10-typography.md.

# Text Contrast and Dark Mode: Empirical Research Raw Dump

**Date**: 2026-11-10
**Site**: erfi.dev (lexicanum docs)
**Context colors**:
- Dark theme: bg #222125, full ink #f5f5f5 (14.7:1 WCAG 2), body #c7c6c7 = 78% ink (9.4:1 WCAG 2)
- Light theme: bg #f2f2f2, full ink #222125 (14.3:1 WCAG 2), body #504f52 = ~78% ink (7.3:1 WCAG 2)
- Muted accents: #99a1af dark / #4a5565 light
- Links: #8cb2ea dark / #2c5a99 light
- Body face: Newsreader serif 18px, weight 400 (var(--p-font-weight-normal))

---

## 1. APCA Lc Computed Values

All pairs computed with SAPC-8 / APCA 0.0.98G-4g formula, sRGB linearization + BT.709 luminance coefficients. See `/tmp/apca-calc.mjs` for code.

**APCA thresholds (Bronze Simple Mode, from APC-RC)**:
- Lc 90: PREFERRED for body text (18px/400)
- Lc 75: MINIMUM for body text (18px/400)
- Lc 60: MINIMUM for content text that is not body/column/block
- Lc 45: MINIMUM for large text only (36px normal weight or 24px bold)
- Lc 30: absolute minimum for any text

| Pair | APCA Lc | WCAG 2 | APCA verdict |
|---|---|---|---|
| **Dark: body on bg** (#c7c6c7 on #222125) | **-44.6** | 9.4:1 | **FAILS Lc 45** |
| Dark: full ink on bg (#f5f5f5 on #222125) | -87.7 | 14.7:1 | PASSES Lc 75 |
| Dark: muted accent (#99a1af on #222125) | -22.8 | 6.2:1 | FAILS Lc 45 |
| Dark: links (#8cb2ea on #222125) | -30.5 | 7.4:1 | FAILS Lc 45 |
| **Light: body on bg** (#504f52 on #f2f2f2) | **81.8** | 7.3:1 | **PASSES Lc 75** |
| Light: full ink on bg (#222125 on #f2f2f2) | 84.3 | 14.3:1 | PASSES Lc 75 |
| Light: muted accent (#4a5565 on #f2f2f2) | 81.3 | 6.8:1 | PASSES Lc 75 |
| Light: links (#2c5a99 on #f2f2f2) | 80.6 | 6.2:1 | PASSES Lc 75 |
| Dark: body on pure black (#c7c6c7 on #000) | -44.8 | 12.3:1 | FAILS Lc 45 |
| Pure white on pure black (#fff on #000) | -100.0 | 21.0:1 | PASSES Lc 75 |

**Key finding**: WCAG 2 and APCA give DIAMETRICALLY opposite verdicts. Dark body text passes WCAG AAA (9.4:1 > 7:1) but APCA says it fails even the lowest text threshold (Lc 45). Light body text barely passes WCAG AA (7.3:1 > 4.5:1) but APCA says it comfortably exceeds Lc 75. This is because WCAG 2's simple ratio math overstates contrast for dark colors and understates it for mid-range colors.

**Source**: APCA thresholds from https://apcacontrast.com/ (official calculator tool) and https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell. Formula from https://github.com/Myndex/SAPC-APCA (documentation/APCA-W3-LaTeX-Math.tex).
**Strength**: Computed. The formula is the published standard, confirmed against the official calculator's threshold table.

---

## 2. WCAG 2.x vs APCA: Known Flaws

### WCAG 2.x contrast ratio math

WCAG 2 computes contrast as (L1 + 0.05) / (L2 + 0.05), where L is relative luminance. Three major flaws:

1. **Not perceptually uniform**: The ratio scale is not linear with human perception. 4.5:1 looks very different for dark-on-light vs light-on-dark pairs.

2. **The +0.05 offset**: Originally a CRT flare/glare compensation (CRTs have higher glare than LCD/OLED). With modern displays, this inflates ratios for very dark colors.

3. **No font size/weight integration**: WCAG 2 has binary "normal text" vs "large text" (18pt/14pt bold). There's no accounting for thin fonts, antialiasing, or weight.

**Source**: Andrew Somers, "The Realities And Myths Of Contrast And Color," Smashing Magazine, Sep 2022. https://www.smashingmagazine.com/2022/09/realities-myths-contrast-color/ and APCA documentation.
**Strength**: Well-documented, publicly acknowledged by WCAG 3 draft.

> Quoting APCA docs: "WCAG 2.x contrast cannot be used for guidance designing 'dark mode'." and "4.5:1 can be functionally unreadable when one of the colors in a pair is near black."

> From APCA-W3 npm README: "It is well known that WCAG 2 contrast maths are not accurate regarding human perception, and automated testing using WCAG 2 math may incorrectly indicate errors in some color pairs."

### APCA key insight: polarity-aware contrast

APCA is the candidate method for WCAG 3. It uses different exponent weighting for light-on-dark (negative polarity) vs dark-on-light (positive polarity), because human contrast sensitivity differs between the two conditions.

> "A contrast value of Lc 60 represents the same perceived readability contrast regardless of how light or dark the colors are." -- APCA in a Nutshell

**Source**: https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell
**Strength**: Evidence-backed. Based on vision science (CSF curves, spatial frequency models). Adopted in WCAG 3 draft.

### Bridge-PCA note for dark mode

When light text is lighter than #eee, add Lc 10 to the minimum. Our body text (#c7c6c7) is below #eee, so this adjustment would make it fail by even more.

**Source**: https://apcacontrast.com/, "WCAG 2 compatibility" box.
**Strength**: Documented feature of Bridge-PCA tool.

---

## 3. Polarity Research

### Piepenbrock, Mayr, Mund & Buchner (2013)

**Title**: "Positive display polarity is advantageous for both younger and older adults" - Ergonomics, DOI: 10.1080/00140139.2013.790485

- Two groups: young adults (18-33) and older adults (60-85), normal/corrected vision
- Visual-acuity task (Landolt C gap detection) + proofreading task
- Between-subjects: each participant saw only one polarity
- **Result**: Light mode won across ALL dimensions, both age groups
- Difference in visual-acuity task was smaller for older adults
- No significant effect of contrast polarity on fatigue (eyestrain, headache, etc.)

**Source**: NN/g review by Raluca Budiu, "Dark Mode vs. Light Mode: Which Is Better?", Feb 2, 2020. https://www.nngroup.com/articles/dark-mode/
**Strength**: Peer-reviewed, published in Ergonomics. n = not specified in NN/g summary but the study used two groups. Moderate strength for experimental tasks, limited ecological validity (1-hour sessions, not long-form reading).

### Piepenbrock, Mayr, & Buchner (2014)

**Title**: "Positive Display Polarity Is Particularly Advantageous for Small Character Sizes" - Human Factors, DOI: 10.1177/0018720813515509

- Looked at text size x contrast polarity interaction in proofreading
- **Result**: "The positive-polarity advantage increased linearly as the font size was decreased"
- Participants did NOT report any difference in perceived readability -- even though performance was better in light mode

**Source**: NN/g review ibid.
**Strength**: Peer-reviewed, Human Factors journal. Key nuance: users can't self-report the advantage.

### Dobres, Chahine, Reimer (2017)

**Title**: "Effects of ambient illumination, contrast polarity, and letter size on text legibility under glance-like reading" - Applied Ergonomics, DOI: 10.1016/j.apergo.2016.11.001

- MIT AgeLab study. Lexical-decision task (word/nonword judgment)
- Variables: polarity (dark vs light), ambient light (daytime vs nighttime), font size (3mm vs 4mm)
- **Key finding**: "During daytime, there was no significant effect of contrast polarity, but during nighttime, light mode led to better performance than dark mode."
- **"During nighttime it was much harder for people to read small-font text in dark mode than in light mode."**
- Bright outdoor ambient light may erase polarity advantage entirely; office light still produces a difference

**Source**: NN/g review ibid. Full paper: https://doi.org/10.1016/j.apergo.2016.11.001
**Strength**: Peer-reviewed, controlled experiment. n = not specified in review. Glance-reading task, not sustained reading. Moderate ecological validity for mobile/interruptible contexts.

### Legge, Rubin, Pelli, Schleske (1985)

**Title**: "Psychophysics of Reading -- ii. Low Vision" - Vision Research

- 7 participants with cloudy ocular media (cataracts)
- **Result**: All 7 had better reading rates with dark modes
- Participants with impaired central vision were NOT affected by polarity
- **Caveat**: Used CRT displays, which flickered more in light mode. LED displays may show different results.

**Source**: NN/g review ibid. Also widely cited in vision science.
**Strength**: Foundational study. Small n (7). CRT-era limitation. Central finding replicated/conceptualized in later work.

### Aleman, Wang, Schaeffel (2018)

**Title**: "Reading and Myopia: Contrast Polarity Matters" - Scientific Reports 8, 10840. DOI: 10.1038/s41598-018-28904-x

- 7 participants, 1-hour reading each in light mode and dark mode
- Measured choroid thickness (thinning = myopia progression)
- **Result**: "Significant thinning of the choroid when participants read text presented in light mode and significant thickening when reading text presented in dark mode."
- Thinning was more pronounced in participants who already had myopia.

**Source**: NN/g review ibid. Full paper: https://doi.org/10.1038/s41598-018-28904-x
**Strength**: Published in Nature's Scientific Reports. Very small n (7). Intriguing but needs replication. First study to suggest long-term myopia benefit from dark mode.

### Summary of 2018-2025 dark-mode studies

- NN/g 2020 review concludes: "In users with normal vision, light mode leads to better performance most of the time."
- Mechanistic explanation: more light -> pupil contracts -> fewer spherical aberrations, greater depth of field, less focusing effort
- NN/g recommends dark mode availability for: (1) possible long-term myopia protection, (2) low-vision users especially with cataracts, (3) user preference
- "Applications meant for long-form reading (such as book readers, magazines, and even news sites) should offer a dark-mode feature."
- No major reversals of the positive-polarity advantage found 2018-2025 in the sources checked.
- Individual differences matter: Wallace et al (2022) found substantial individual variation in polarity preference.

**Source**: NN/g review. https://www.nngroup.com/articles/dark-mode/
**Strength**: Well-sourced review by respected UX research org. Systematic, acknowledges limitations.

---

## 4. Halation and "Never Use Pure Black/White"

### The claim

"Pure white text on pure black causes halation/blooming, especially for people with astigmatism." "Don't use pure black or pure white -- always soften one or both."

### Evidence: halation is real but the mechanism is debated

The term "halation" as used in UI design is NOT the photographic film phenomenon (light scattering through emulsion). It's a colloquial term for the perceived blooming or afterimage effect.

**From GitHub SAPC-APCA Discussion #74** (https://github.com/Myndex/SAPC-APCA/discussions/74):

User ayushnix reports:
> "I get halation if I read high contrast text on a dark background... After reading a few lines, white flashes of text start appearing on the screen and I have to stop."

At APCA Lc 98 (white on near-black), the user experienced halation. At Lc 56-61 (moderate contrast dark mode), comfortable. At Lc 90 (seirdy's blog), uncomfortable.

> "Extremely high contrast dark mode colors (>95 Lc), especially white on black variations, may end up hurting people's eyes more than helping them."

Note: This is a SINGLE user's report, not a study. But the APCA docs acknowledge the basic mechanism: contrast needs are context-dependent.

**Source**: GitHub SAPC-APCA discussion #74. https://github.com/Myndex/SAPC-APCA/discussions/74
**Strength**: Anecdotal. Self-reported. Useful signal, NOT systematic evidence.

### Material Design dark theme approach

> "A dark theme uses dark grey, rather than black, as the primary surface color for components. Dark grey surfaces can express a wider range of color, elevation, and depth, because it's easier to see shadows on grey (instead of black). Dark grey surfaces also reduce eye strain, as light text on a dark grey surface has less contrast than light text on a black surface."

- Surface: #121212 (not #000000)
- Body text: white at 87% opacity (WCAG ~15.3:1 on #121212, APCA ~Lc 90+)
- Secondary text: white at 60% opacity
- Disabled: white at 38% opacity

**Source**: https://m2.material.io/design/color/dark-theme.html
**Strength**: Platform design guideline. Heuristic, not empirically justified with citations. Practical engineering choice.

### APCA note on maximum contrast

From APCA Bronze Simple Mode:
> "Lc 90 is a SUGGESTED MAXIMUM for very large and bold fonts (greater than 36px bold), and large areas of color. Small fonts do not have a maximum."

This implies that for body text, there is NO maximum recommended -- higher contrast is considered better for small text. The "don't use maximum contrast" rule applies to LARGE elements, not body text. This contradicts the folk wisdom that softer contrast is always better.

### Apple HIG dark mode

Unable to fetch (Apple's page requires JavaScript). Known approach: Apple uses dynamic system colors that adjust for dark mode. Not pure white on pure black.

### Verdict

- **Folklore**: "Pure white on black causes halation for astigmatism." Evidence base: sparse. One user report on GitHub. Mechanism plausible but not systematically studied for digital displays.
- **Evidence-backed**: Very high contrast dark mode (Lc > 95) can be uncomfortable for some users, but the threshold varies by individual.
- **Design convention**: Material's #121212 + 87% text is a reasonable heuristic, not an empirically calibrated value.
- **APCA's position**: For small body text, there is NO maximum Lc. Higher is better. For large elements (>36px bold), cap at Lc 90.
- **Counterpoint**: The GitHub user reports comfort at Lc 56-61, which fails APCA body text minimums. The APCA Lc 75-90 recommendations may need dark-mode-specific downward adjustment.

---

## 5. Softening Body Text (9:1 vs 14:1): Evidence

### The claim

"Body text should be softened to reduce eye strain." Often expressed as "never use pure black" (#333 or #444 instead of #000).

### Kevin Marks, Wired 2016: "How the Web Became Unreadable"

https://www.wired.com/2016/10/how-the-web-became-unreadable/

> "There's a widespread movement in design circles to reduce the contrast between text and background, making type harder to read."

> "Apple's typography guidelines suggest that developers aim for a 7:1 contrast ratio. But what ratio is the text used to state the guideline? It's 5.5:1."

> "Google's guidelines suggest an identical preferred ratio of 7:1. But then they recommend 54 percent opacity for display and caption type, a style guideline that translates to a ratio of 4.6:1."

Marks calls the softening trend a "fashion" driven by designers working on perfect monitors in ideal lighting:
> "To arbitrarily throw away contrast based on a fashion that 'looks good on my perfect screen in my perfectly lit office' is abdicating designers' responsibilities to the very people for whom they are designing."

> "My plea to designers and software engineers: Ignore the fads and go back to the typographic principles of print -- keep your type black, and vary weight and font instead of grayness."

**Source**: https://www.wired.com/2016/10/how-the-web-became-unreadable/
**Strength**: Opinion/analysis piece, not a study. Well-argued. Author is a physicist/engineer. Cites WCAG, Apple, Google guidelines.

### Andrew Somers, TangledWeb 2022: "Please Stop Using Grey Text"

https://tangledweb.xyz/please-stop-using-grey-text-3d3e71acfca8

> "For over 1000 years black text on white paper has been the best practice for printed texts worldwide."

> "Since the advent of the web and WCAG 2 contrast specs, we've seen websites shift toward a very unreadable light grey text over the last 15 years. It's time to put an end to this practice."

**Source**: https://tangledweb.xyz/please-stop-using-grey-text-3d3e71acfca8
**Strength**: Opinion/advocacy. Somers is the author of APCA. His position is that WCAG 2's bad math ENABLED the gray-text trend by passing low-contrast combos that are actually unreadable.

### Somers, Smashing Magazine 2022: Contrast Myths

The article discusses spatial frequency (font size x weight) as MORE important than raw color ratio:

> "Contrast is driven more by 'spatial frequency' than by the difference or ratio between two colors. For the designer, spatial frequency relates to font weight and font size or line thickness."

> "At least ten times more contrast is needed for good readability than the bare minimum contrast needed for legibility." (from APC-RC Bronze Simple Mode)

**Source**: https://www.smashingmagazine.com/2022/09/realities-myths-contrast-color/
**Strength**: Expert position from APCA author. Evidence-backed by vision science.

### WebAIM on WCAG 2 minimum

> "4.5:1 is the MINIMUM required by WCAG. You cannot round a contrast ratio up to 4.5:1... For many of us, some of these combinations are not very readable. That is why 4.5:1 is the minimum."

https://webaim.org/articles/contrast/

### NN/g low-contrast text (indirect)

The NN/g dark mode article does not directly address body text softening. However, their general finding that "light mode leads to better performance" is driven by higher effective contrast (pupil contraction -> less aberration). This indirectly supports the argument that more contrast = better perception.

### Verdict

- **Evidence-backed**: WCAG 2 ratio is a MINIMUM, not a target. Higher contrast generally improves readability for people with normal vision, especially at small sizes. Marks' critique of the gray-text trend as a fashion-driven regression is well-argued.
- **Folklore**: "Black text on white causes eye strain, use gray." Based on anecdote and designer intuition. Countered by 1000+ years of print practice.
- **APCA's position**: For body text, there is no maximum Lc. Higher is better. The softening of gray text is an artifact of WCAG 2's flawed math (which overstates dark-mode contrast and understates mid-range contrast).
- **Key nuance**: The benefit of full contrast may not be linear. The jump from WCAG 4.5:1 to 7:1 is more impactful than 7:1 to 14:1. At some point, contrast stops being the limiting factor and spatial frequency (font size, weight) dominates.

---

## 6. Serif Body Text in Dark Mode

### The problem

Serif fonts (like Newsreader) have thin strokes that may break down in dark mode. The issue is compounded by:
1. Light-on-dark text appears thinner due to irradiation (light spreads on dark)
2. Font-smoothing (antialiasing) makes light text on dark look lighter
3. Thin serif strokes are high spatial frequency -> need MORE contrast, not less

### APCA font family note

From the APCA Silver Lookup Table notes:
> "Many serif fonts should use values for the row above (e.g., Times, Georgia, Cambria, Courier), and especially should be compared in terms of x-height."

This means serif fonts need MORE contrast (roughly +Lc 5-10) than the sans-serif equivalents, or equivalently, a larger font size.

> "Times New Roman has an x-height ratio of 0.45, so it needs to be increased about 16% in size relative to the reference font."

### Font-smoothing and dark mode

From MDN:
> "-webkit-font-smoothing: antialiased ... Switching from subpixel rendering to anti-aliasing for light text on dark backgrounds makes it look lighter."

From APCA notes:
> "Designers are cautioned that the use of '-webkit-font-smoothing: antialiasing' is strongly discouraged. Bypassing default antialiasing in this way can drastically reduce contrast for small or thin fonts."

On macOS, subpixel antialiasing is the default. On Windows and Linux, grayscale antialiasing is more common. The rendering difference means the same CSS produces different effective contrast on different OSes.

### No direct serif-dark-mode study found

Systematic research on serif-specific dark-mode readability was not found in this search. The known research (Piepenbrock, Dobres) used sans-serif or unspecified fonts. This is a gap.

### Practical implication for erfi.dev

Newsreader is a serif with relatively low x-height and thin strokes. In dark mode at APCA Lc -44.6, these thin strokes are at high risk of disappearing. The combination of:
- Low APCA contrast (-44.6, fails all text thresholds)
- Thin serif strokes
- Font-smoothing thinning effect on light-on-dark text

...makes dark-mode body text on erfi.dev a genuine readability concern. The light-mode body text (APCA Lc 81.8) is in much better shape.

---

## 7. Summary Grid

| Claim | Evidence base | Classification | Key source |
|---|---|---|---|
| WCAG 2 4.5:1 is adequate for dark mode | Falsified | **Disproven** | APCA docs, Somers 2022 |
| Positive polarity (light mode) is better for normal vision | Peer-reviewed, 2013-2017 | **Evidence-backed** | Piepenbrock 2013, 2014; Dobres 2017 |
| Dark mode is better for cataract/low vision | Small-n, CRT-era but replicated | **Evidence-backed** | Legge 1985 |
| Dark mode may protect against myopia long-term | Single study, n=7 | **Tentative** | Aleman 2018 |
| Pure white on black causes halation | Anecdotal only | **Folklore (weak signal)** | SAPC-APCA #74 user report |
| Body text should be softened to 7-9:1 | Contested, depends on font | **Convention, contested** | Marks 2016, Somers 2022 |
| APCA Lc 75 is adequate minimum for dark body text | Theoretical, beta | **Guideline (draft)** | APC-RC Bronze Simple Mode |
| Serif needs more contrast than sans-serif | APCA docs, vision science | **Evidence-backed** | APCA Silver lookup table |
| Thin serif on dark mode is especially vulnerable | Physics + practical observation | **Evidence-backed (indirect)** | APCA CSF, MDN font-smoothing docs |

---

## 8. What Could NOT Be Verified

1. **Direct serif-dark-mode reading study**: No study found testing serif body text specifically in negative polarity. The Piepenbrock/Dobres studies used sans-serif or unspecified fonts.

2. **Halation clinical evidence**: The halation/blooming effect for digital displays is not well-studied in the vision science literature. The claim appears to originate in photographic film optics and has been adopted by UI designers as a metaphor, not a measured phenomenon.

3. **Apple HIG dark mode specifics**: Apple's page requires JavaScript and could not be fetched.

4. **Somers' full Smashing article myths section**: Repeated truncation at ~8k chars from the crawler prevented reading the detailed myth-by-myth section.

5. **Optimal body contrast for serif at 18px specifically**: No study found testing the narrow question of "what is the optimal WCAG ratio or APCA Lc for a Newsreader-like serif at 18px on a ~#222125 background."

6. **2018-2025 dark mode reading studies beyond NN/g summary**: SearXNG engines were unresponsive; additional recent studies may exist but were not accessible. Exa was out of credits.

7. **Wallace et al 2022 individual differences in polarity preference**: Referenced by NN/g context but full paper not fetched.

---

## 9. Raw Evidence URLs

- APCA in a Nutshell: https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell
- APCA Calculator (official): https://apcacontrast.com/
- APCA-W3 npm/GitHub: https://github.com/Myndex/apca-w3
- SAPC-APCA main repo: https://github.com/Myndex/SAPC-APCA
- APCA Readability Criterion Bronze: https://readtech.org/ARC/tests/bronze-simple-mode/?tn=intro
- SAPC-APCA Discussion #74 (dark mode, halation): https://github.com/Myndex/SAPC-APCA/discussions/74
- NN/g Dark Mode vs Light Mode: https://www.nngroup.com/articles/dark-mode/
- Somers, Smashing Mag 2022: https://www.smashingmagazine.com/2022/09/realities-myths-contrast-color/
- Somers, "Please Stop Using Grey Text": https://tangledweb.xyz/please-stop-using-grey-text-3d3e71acfca8
- Marks, Wired 2016: https://www.wired.com/2016/10/how-the-web-became-unreadable/
- Material Design Dark Theme: https://m2.material.io/design/color/dark-theme.html
- WebAIM Contrast: https://webaim.org/articles/contrast/
- web.dev Color and Contrast: https://web.dev/articles/color-and-contrast-accessibility
- MDN font-smoothing: https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-font-smoothing
- Piepenbrock et al 2013: DOI 10.1080/00140139.2013.790485
- Piepenbrock et al 2014: DOI 10.1177/0018720813515509
- Dobres et al 2017: DOI 10.1016/j.apergo.2016.11.001
- Aleman et al 2018: DOI 10.1038/s41598-018-28904-x
- Legge et al 1985: Vision Research (cited via NN/g)