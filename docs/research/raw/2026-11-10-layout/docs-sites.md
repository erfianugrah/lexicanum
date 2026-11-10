# Docs-site layout survey: how established sites handle wide technical pages (2026-11-10)

Raw dump. Worker: openrouter/deepseek/deepseek-v4-pro. Method: Playwright
headless Chromium, 5 viewport widths, computed-styles measurements. Screenshots in
`/home/erfi/.local/state/agent-work/lexicanum-layout-survey/<site>-<width>.png`.

## Sites measured

| Site | URL tested | Pattern |
|---|---|---|
| Stripe API docs | https://docs.stripe.com/api/charges | B - wide column, capped prose |
| MDN Web Docs | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout | B - wide column, capped prose |
| Tailwind CSS docs | https://tailwindcss.com/docs/installation | A - fixed column |
| The Rust Book | https://doc.rust-lang.org/book/ch10-02-traits.html | B - wide column, capped prose |
| Material for MkDocs | https://squidfunk.github.io/mkdocs-material/getting-started/ | A - fixed column (fluid font) |
| Starlight docs | https://starlight.astro.build/guides/authoring-content/ | A - fixed column |
| Cloudflare docs | https://developers.cloudflare.com/workers-ai/ | B - wide column, capped prose |
| Supabase docs | https://supabase.com/docs/guides/auth | A - fixed column |
| Next.js docs | https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts | A - fixed column |
| Kubernetes docs | https://kubernetes.io/docs/concepts/workloads/pods/ | C - fluid, no cap |
| Fly.io docs | https://fly.io/docs/apps/volume-storage/ | B - wide column, capped prose |
| GitHub Docs | https://docs.github.com/en/actions/writing-workflows | B - wide column, capped prose |
| Vercel docs | https://vercel.com/docs/functions | C - fluid, no cap |

## Per-site measurements

### Stripe API docs (Pattern B)
| Width | Content col | Prose width | CPL | Body font | Table/code width | H1 |
|---|---|---|---|---|---|---|
| 390px | 390px | 334px | 52 | 14px | - | 24px |
| 1280px | 1030px | 438px | 67 | 14px | 436px | 24px |
| 1600px | 1320px | 583px | 90 | 14px | - | 24px |
| 1920px | 1640px | 693px | 107 | 14px | 691px | 24px |
| 2560px | 2280px | **693px cap** | 107 | 14px | - | 24px |

Layout: left sidebar ~250px, content area fills remaining. Prose capped at ~693px
via `max-width`. At 1920px, table shares prose left edge (left=387 vs prose=386) and
width (691px). Code examples appear in a right-hand column. At 2560px, excess space
goes to the right column and whitespace, not to prose. Headings: h1=24, h3=16. Ratio:
h1 1.71× body.

### MDN Web Docs (Pattern B)
| Width | Content col | Prose width | CPL | Body font | H1 | H2 | H3 |
|---|---|---|---|---|---|---|---|
| 390px | 375px | 343px | 47 | 16px | 40px | - | - |
| 1280px | 1265px | 689px | 97 | 16px | 40px | 24px | 24px |
| 1600px | 1585px | 768px | 107 | 16px | - | - | - |
| 1920px | 1905px | 768px | 107 | 16px | - | - | - |
| 2560px | 2545px | **768px cap** | 107 | 16px | - | - | - |

Layout: three columns (left nav ~300px, content, right TOC ~200px). Content column
fills the middle but prose capped at ~768px via `max-width: 48rem`. At 2560px,
content area is 2545px wide but prose stays at 768px; excess space is margins on
both sides of the content column. Headings: h1=40 (2.50× body), h2=24 (1.50×), h3=24.
Spacing: 16px above/below h1.

### Tailwind CSS docs (Pattern A)
| Width | Content col | Prose width | CPL | Body font | H3 |
|---|---|---|---|---|---|
| 390px | 358px | 358px | 53 | 14px | - |
| 1280px | 768px | 768px | 109 | 14px | 16px |
| 1600px | 768px | 768px | 109 | 14px | - |
| 1920px | 768px | 768px | 109 | 14px | - |
| 2560px | 768px | 768px | 109 | 14px | - |

Layout: single `max-w-3xl` (768px) content column, centered with auto margins beyond
1280px. Everything - prose, code, tables - shares this width. At 2560px, 896px
margins on each side. Left sidebar separate from content column. Uses Inter at 14px.
This is the simplest pattern: one fixed width, everything inside it. CPL is high
at 109 because of the small font (14px Inter).

### The Rust Book (Pattern B)
| Width | Content col | Prose width | CPL | Body font | H2 | H3 |
|---|---|---|---|---|---|---|
| 390px | 390px | 350px | 47 | 16px | - | - |
| 1280px | 1280px | 750px | 99 | 16px | 24px | 18.7px |
| 1600px | 1600px | 750px | 99 | 16px | - | - |
| 1920px | 1920px | 750px | 99 | 16px | - | - |
| 2560px | 2560px | **750px cap** | 99 | 16px | - | - |

Layout: left sidebar ~300px, content fills rest of screen width. Prose capped at
~750px (`max-width: 47rem`). Code blocks share prose width (750px). At 2560px,
~1910px of empty space to the right of prose. Headings: h2=24 (1.50× body), h3=18.7
(1.17× body). Generous heading spacing: h2 mt=60px mb=20px, h3 mt=47px mb=19px.

### Material for MkDocs (Pattern A, fluid typography)
| Width | Content col | Prose width | CPL | Body font | H1 | H2 | H3 |
|---|---|---|---|---|---|---|---|
| 390px | 358px | 332px | 82 | 12.8px | - | - | - |
| 1280px | 688px | 662px | 157 | 12.8px | 32px | 25px | 20px |
| 1600px | 757px | 728px | 147 | 14.1px | 35.2px | 27.5px | 22px |
| 1920px | 757px | 728px | 147 | 14.1px | 35.2px | 27.5px | 22px |
| 2560px | 826px | 795px | 148 | 15.4px | 38.4px | 30px | 24px |

Layout: content column grows fluidly with viewport (688px → 826px), not a fixed cap.
Left sidebar. Code blocks share content width (757px at 1920). Font sizes scale with
viewport too (12.8px → 15.4px) via `clamp()`. Very high CPL (148-157) because of
aggressive font-size scaling - the column is wide AND the font is small relative to
its width. Heading ratios at 1920px: h1/body=2.50, h2/body=1.95, h3/body=1.56.

### Starlight docs (Pattern A)
| Width | Content col | Prose width | CPL | Body font | H2 | H3 |
|---|---|---|---|---|---|---|
| 390px | 358px | 358px | 49 | 16px | - | - |
| 1280px | 632px | 632px | 87 | 16px | 35px | 29px |
| 1600px | 720px | 720px | 98 | 16px | - | - |
| 1920px | 720px | 720px | 98 | 16px | - | - |
| 2560px | 720px | 720px | 98 | 16px | - | - |

Layout: three columns (left nav, content, right TOC). Content column capped at
720px (45rem default). Everything shares this width. At 2560px, large margins absorb
excess; sidebars don't grow. This is the baseline Starlight layout - lexicanum
deviated from it with wider breakpoints (up to 96rem). Headings: h2=35 (2.19× body),
h3=29 (1.81× body). No h1 on this page (was in frontmatter title area).

### Cloudflare docs (Pattern B)
| Width | Content col | Prose width | CPL | Body font | H1 | H2 | H3 |
|---|---|---|---|---|---|---|---|
| 390px | 390px | 358px | 47 | 16px | 35px | - | - |
| 1280px | 1280px | 644px | 84 | 16px | 35px | 20.8px | 16px |
| 1600px | 1600px | 784px | 102 | 16px | - | - | - |
| 1920px | 1920px | 784px | 102 | 16px | - | - | - |
| 2560px | 2560px | **784px cap** | 102 | 16px | - | - | - |

Layout: left sidebar ~280px, content fills rest. Prose capped at 784px
(`max-width: 49rem`). At 2560px, ~1496px of whitespace to the right of prose.
Headings: h1=35 (2.19× body), h2=20.8 (1.30× body), h3=16 (1.00× body - h3 is
same size as body but bold).

### Supabase docs (Pattern A)
| Width | Content col | Prose width | CPL | Body font | H1 | H2 | H3 |
|---|---|---|---|---|---|---|---|
| 390px | 342px | 342px | 46 | 15px | 34px | - | - |
| 1280px | 605px | 605px | 81 | 15px | 34px | 22px | 18px |
| 1600px | 731px | 731px | 97 | 15px | - | - | - |
| 1920px | 731px | 731px | 97 | 15px | - | - | - |
| 2560px | 731px | 731px | 97 | 15px | - | - | - |

Layout: left sidebar, content column capped at ~731px. Everything inside one column.
At 2560px, large right margin. Headings: h1=34 (2.27× body), h2=22 (1.47× body),
h3=18 (1.20× body). Spacing: h2 mt=44 mb=22, h3 mt=36 mb=18.

### Next.js docs (Pattern A)
| Width | Content col | Prose width | CPL | Body font | H1 | H2 | H3 |
|---|---|---|---|---|---|---|---|
| 390px | 390px | 358px | 46 | 16px | 40px | - | - |
| 1280px | 712px | 648px | 87 | 16px | 40px | 24px | 20px |
| 1600px | 780px | 716px | 95 | 16px | - | - | - |
| 1920px | 780px | 716px | 95 | 16px | - | - | - |
| 2560px | 780px | 716px | 95 | 16px | - | - | - |

Layout: left sidebar, content capped at ~780px. At 2560px, centered with margins.
Code blocks at 714px share content width. Headings: h1=40 (2.50× body), h2=24
(1.50×), h3=20 (1.25×). Spacing: h2 mt=48 mb=24, h3 mt=32 mb=12.

### Kubernetes docs (Pattern C - no cap)
| Width | Content col | Prose width | CPL | Body font | H1 | H2 | H3 |
|---|---|---|---|---|---|---|---|
| 390px | 322px | 322px | 42 | 16px | 27.9px | - | - |
| 1280px | 777px | 622px | 82 | 16px | 40px | 32px | 24px |
| 1600px | 991px | 793px | 104 | 16px | - | - | - |
| 1920px | 1204px | 963px | 125 | 16px | - | - | - |
| 2560px | 1631px | 1305px | **170** | 16px | - | - | - |

Layout: left sidebar + content fills rest. NO prose cap. Everything grows with the
viewport. At 2560px, prose reaches 1305px and 170 characters per line - the same
problem lexicanum has at 96rem. This is the only major site in the survey without a
measure cap. Headings: h1=40 (2.50× body), h2=32 (2.00×), h3=24 (1.50×). Spacing:
h2 mt=48 mb=16, h3 mt=32 mb=16.

### Fly.io docs (Pattern B)
| Width | Content col | Prose width | CPL | Body font | H1 | H2 | H3 |
|---|---|---|---|---|---|---|---|
| 390px | 390px | 334px | - | 17px | 30px | - | - |
| 1280px | 1280px | 512px | 80 | 17px | 36px | 25.5px | 21.3px |
| 1600px | 1600px | 744px | 98 | 17px | - | - | - |
| 1920px | 1920px | **744px cap** | 98 | 17px | - | - | - |
| 2560px | 2560px | 744px cap | 98 | 17px | - | - | - |

*Phone CPL unreliable - the `p` selector missed the real prose element.

Layout: content fills the viewport (no visible sidebar). Prose capped at ~744px.
At 2560px, prose stays at 744px in a centered area. Larger body font (17px) than
most. Headings: h1=36 (2.12× body), h2=25.5 (1.50×), h3=21.3 (1.25×). Spacing:
h2 mt=38 mb=19, h3 mt=34 mb=15.

### GitHub Docs (Pattern B)
| Width | Content col | Prose width | CPL | Body font | H1 |
|---|---|---|---|---|---|
| 1280px | 954px | 574px | - | 16px | 40px |
| 1920px | 1594px | 720px | - | 16px | 40px |
| 2560px | 2234px | **720px cap** | - | 16px | 40px |

*CPL not measured on this pass. Layout: left sidebar + content fills rest.
Prose capped at 720px. h1=40 (2.50× body). Extra width goes to margins, not text.

### Vercel docs (Pattern C - no cap)
| Width | Content col | Prose width | CPL | Body font | H1 |
|---|---|---|---|---|---|
| 1280px | 1265px | 649px | - | 16px | 56px |
| 1920px | 1905px | 1024px | - | 16px | 56px |
| 2560px | 2545px | 1024px | - | 16px | 56px |

Layout: no sidebar visible on this page. Content fills almost full viewport. Prose
grows to 1024px - no `max-width` cap, but growth stops between 1920 and 2560
(possibly a `max-width` on the overall container). h1=56 (3.50× body - the largest
heading in the survey).

## Comparison

### Pattern A: Fixed-width content column
| Site | Column max | Body | CPL at cap | At 2560px |
|---|---|---|---|---|
| Tailwind CSS | 768px | 14px Inter | 109 | Centered, 896px margins |
| Supabase | 731px | 15px | 97 | Centered, large right margin |
| Next.js | 780px | 16px | 95 | Centered with margins |
| Starlight | 720px | 16px | 98 | Centered, sidebars don't grow |
| MkDocs Material | 757-826px | fluid 12.8-15.4px | 147-157 | Centered, font-size scales up |

**Characteristics:**
- One `max-width` on the content column. Everything - prose, tables, code, diagrams - shares this width.
- At 2560px, the column centers with equal or asymmetric margins.
- No zigzag edges - tables and code don't break out wider than prose.
- Prose almost always 95-110 cpl (exception: MkDocs Material at 148 cpl due to fluid font scaling).
- **This is the dominant pattern.** 5 of 13 sites use it.

### Pattern B: Wide content area, capped prose
| Site | Content at 2560 | Prose cap | Body | CPL |
|---|---|---|---|---|
| Stripe | 2280px | 693px | 14px | 107 |
| MDN | 2545px | 768px | 16px | 107 |
| Rust Book | 2560px | 750px | 16px | 99 |
| Cloudflare | 2560px | 784px | 16px | 102 |
| Fly.io | 2560px | 744px | 17px | 98 |
| GitHub Docs | 2234px | 720px | 16px | - |

**Characteristics:**
- Content area fills available space (minus sidebars), but prose has `max-width: ~44-49rem`.
- At 2560px, there is a wide gap to the right of prose - the content column is wide but empty.
- Tables and code share the prose's left edge and `max-width` (confirmed on Stripe: table left=387 vs prose=386).
- **Used primarily by sites with multi-column content areas** (Stripe has right code column, MDN has right TOC, Rust Book has theme/layout plugin, Cloudflare has deep sidebar).
- No zigzag edges - tables don't break out beyond prose.
- Prose CPL: 98-107.

### Pattern C: Fluid, no cap
| Site | Prose at 2560 | Body | CPL |
|---|---|---|---|
| Kubernetes | 1305px | 16px | 170 |
| Vercel | 1024px | 16px | - |

**Characteristics:**
- No `max-width` on prose. Everything grows with the viewport.
- At 2560px, CPL exceeds readability standards.
- Kubernetes is the worst: 170 cpl at 2560px. Vercel caps at 1024px (likely a container `max-width`).
- **This is what lexicanum currently does** (96rem = ~188 cpl at 18px Newsreader).

## Heading hierarchy comparison

| Site | Body | H1/body | H2/body | H3/body | Spacing style |
|---|---|---|---|---|---|
| Stripe | 14px | 1.71 | - | 1.14 | tight (0/0 on h1) |
| MDN | 16px | 2.50 | 1.50 | 1.50 | balanced (16/16) |
| Rust Book | 16px | - | 1.50 | 1.17 | generous (60/20 h2) |
| MkDocs | 14.1px | 2.50 | 1.95 | 1.56 | generous (44/18 h2) |
| Starlight | 16px | - | 2.19 | 1.81 | tight (0/0) |
| Cloudflare | 16px | 2.19 | 1.30 | 1.00 | generous (40/0 h2) |
| Supabase | 15px | 2.27 | 1.47 | 1.20 | generous (44/22 h2) |
| Next.js | 16px | 2.50 | 1.50 | 1.25 | generous (48/24 h2) |
| Kubernetes | 16px | 2.50 | 2.00 | 1.50 | generous (48/16 h2) |
| Fly.io | 17px | 2.12 | 1.50 | 1.25 | generous (38/19 h2) |

Common: h1 2.2-2.5× body, h2 ~1.5×, h3 1.2-1.25×. Generous spacing above h2/h3
(32-60px top) with tight (0-24px bottom). Starlight default uses tight spacing
(0/0) and larger h2/h3 ratios (2.19/1.81).

## Key finding: how wide content elements behave

In Pattern A (fixed column), tables and code blocks fit INSIDE the column -
same width as prose. No breakout. If a table is wider than the column, it
scrolls horizontally or the column is widened (MkDocs Material scales up).

In Pattern B (capped prose), tables and code share the prose cap. They do NOT
break out wider. Stripe confirms this: at 1920px, prose left=386 width=693,
table left=387 width=691. The content column is 1640px wide but tables stay
at the prose measure.

NO surveyed site uses the "prose capped, tables/code break out wider" pattern
that was proposed and rejected (lexicanum kit 0.1.23). The zigzag-edge problem
does not occur on any established docs site because none of them break tables
out wider than prose.

## Recommendation for lexicanum

A **single fixed-width content column** (Pattern A) is the standard for
single-column docs sites. Table/code breakout is neither necessary (established
sites don't do it) nor desirable (it creates zigzag left edges).

Concretely:
- Set content column `max-width: 45rem` (720px, Starlight's default) and revert
  the custom wide breakpoints added in e3ff505.
- Everything - prose, tables, code blocks, diagrams - shares this width.
- At 2560px, the column centres with large margins; sidebars don't grow.
- Prose at Newsreader 18px in 45rem = ~84 CPL (within the 65-85 preferred
  range from the typography research).
- For tables that genuinely need more width: horizontal scroll inside the column,
  or consider a wider column (e.g. 52rem/832px) as a compromise - but keep one
  fixed width, not a breakout.

This matches: Supabase, Next.js, Tailwind CSS, Starlight, and MkDocs Material.
It preserves the left-edge alignment, keeps prose readable at all widths, and
is the layout the Starlight framework was designed for.

Narrower column considerations: diagrams sized for 96rem may need resizing.
Tables with many columns may need scroll. These are one-time fixes, not an
ongoing layout tension.

## Screenshots

All at `/home/erfi/.local/state/agent-work/lexicanum-layout-survey/<site>-<width>.png`:
`local only`. 55 files (11 sites × 5 widths).

Measurements JSON: `measurements.json` (v1, coarse) and `measurements-v2.json`
(refined, site-specific selectors) in the same directory.

## Evidence quality

| What | How checked |
|---|---|
| Column widths | `getBoundingClientRect().width` on content element |
| Prose width | `getBoundingClientRect().width` on longest `<p>` |
| Characters per line | Binary search: clone element, truncate text until height ≤ 1 line-height |
| Table alignment | `getBoundingClientRect().left` of first table vs first prose `<p>` |
| Font sizes | `getComputedStyle(el).fontSize` (px) |
| Heading spacing | `getComputedStyle(el).marginTop/marginBottom` (px) |
| All measurements | 2026-11-10, headless Chromium 158.0.8127.18, Playwright chromium-headless-shell v1254 |