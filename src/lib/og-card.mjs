// og-card.mjs - renders dist/thumbnail.jpg (the og:image social card) at
// build time via satori + sharp, so the doc counts on the card can never
// drift from the corpus. Design uses the house identity: Overpass Mono 700
// title + uppercase labels, Inconsolata body, dark palette from
// src/styles/house.css, 6px accent bar like the site's h2 headings, small
// category-hue squares on per-category doc counts, the ea monogram.
//
// Invoked from the ogCard integration in astro.config.mjs
// (astro:build:done). Not run in dev - og:image is pointless on localhost.

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

// Dark palette from src/styles/house.css (:root[data-theme="dark"] block).
const P = {
  surface: "#222125",
  ink: "#f5f5f5",
  muted: "#99a1af",
  accent: "#a9b7c9",
  hairline: "#3e3e42",
};

// Category hues from src/styles/house-starlight.css (dark), indexed by
// TAXONOMY order from src/lib/taxonomy.mjs.
const HUES = [
  "#6fc39a", // 1: supabase
  "#eb9a5c", // 2: cloudflare
  "#aaa6f0", // 3: kubernetes
  "#6cc3c6", // 4: networking
  "#c99ad8", // 5: homelab
  "#ec8f8f", // 6: forge
  "#d9bb5c", // 7: secrets
  "#b3c96a", // 8: hardware
  "#aab6d6", // 9: workstations
];

// satori needs woff or ttf; installed by @fontsource packages.
const WF = "node_modules/@fontsource";
const FONT_FILES = {
  overpass700: `${WF}/overpass-mono/files/overpass-mono-latin-700-normal.woff`,
  overpass400: `${WF}/overpass-mono/files/overpass-mono-latin-400-normal.woff`,
  inconsolata400: `${WF}/inconsolata/files/inconsolata-latin-400-normal.woff`,
};

// Taxonomy ids in order (from src/lib/taxonomy.mjs).
const TAX_ORDER = [
  "supabase", "cloudflare", "kubernetes", "networking", "homelab",
  "forge", "secrets", "hardware", "workstations",
];

/** Count .mdx files in src/content/docs/<sub>/ */
const countDocs = async (root, sub) =>
  (await readdir(join(root, "src/content/docs", sub))).filter((f) =>
    f.endsWith(".mdx"),
  ).length;

/** Extract the `category:` value from an MDX file's YAML frontmatter. */
const catOf = async (path) => {
  const raw = await readFile(path, "utf8");
  const m = raw.match(/^category:\s*(\S+)/m);
  return m ? m[1] : null;
};

/** Count docs per taxonomy category across both guides/ and reference/. */
const countByCategory = async (root) => {
  const counts = Object.fromEntries(TAX_ORDER.map((id) => [id, 0]));
  const docs = join(root, "src/content/docs");
  for (const dir of ["guides", "reference"]) {
    for (const file of await readdir(join(docs, dir))) {
      if (!file.endsWith(".mdx")) continue;
      const cat = await catOf(join(docs, dir, file));
      if (cat && cat in counts) counts[cat]++;
    }
  }
  return counts;
};

// opts.outFile: output filename (default thumbnail.jpg).
export async function writeOgCard(root, outDir, opts = {}) {
  const [guides, reference, byCat] = await Promise.all([
    countDocs(root, "guides"),
    countDocs(root, "reference"),
    countByCategory(root),
  ]);

  const [overpass700, overpass400, inconsolata, markRaw] = await Promise.all([
    readFile(join(root, FONT_FILES.overpass700)),
    readFile(join(root, FONT_FILES.overpass400)),
    readFile(join(root, FONT_FILES.inconsolata400)),
    readFile(join(root, "public/ea_favicon.png")),
  ]);

  // The ea mark is black-on-transparent; invert to match the dark card.
  const mark = await sharp(markRaw)
    .negate({ alpha: false })
    .png()
    .toBuffer();
  const markUri = `data:image/png;base64,${mark.toString("base64")}`;

  // --- helpers -----------------------------------------------------------
  const caps = (children, style = {}) => ({
    type: "div",
    props: {
      style: {
        fontFamily: "Overpass Mono",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        display: "flex",
        ...style,
      },
      children,
    },
  });

  const text = (children, style = {}) => ({
    type: "div",
    props: {
      style: { fontFamily: "Inconsolata", display: "flex", ...style },
      children,
    },
  });

  // Per-category row: small hue square + count, spaced.
  const catRow = TAX_ORDER.map((id, i) => {
    const n = byCat[id];
    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          alignItems: "center",
          marginRight: 28,
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                width: 10,
                height: 10,
                background: HUES[i],
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: 24,
                fontFamily: "Inconsolata",
                color: P.muted,
                marginLeft: 6,
              },
              children: String(n),
            },
          },
        ],
      },
    };
  });

  const card = {
    type: "div",
    props: {
      style: {
        width: 1200,
        height: 630,
        display: "flex",
        background: P.surface,
        padding: 32,
        fontFamily: "Inconsolata",
        color: P.ink,
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              border: `1px solid ${P.hairline}`,
              padding: "48px 52px 40px",
            },
            children: [
              // --- title block (with 6px accent bar) --------------------
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    borderLeft: `6px solid ${P.accent}`,
                    paddingLeft: 24,
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontFamily: "Overpass Mono",
                          fontWeight: 700,
                          fontSize: 76,
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          lineHeight: 1.2,
                        },
                        children: "Erfi's Lexicanum",
                      },
                    },
                    text("notes on computers and networks", {
                      marginTop: 14,
                      fontSize: 28,
                      color: P.accent,
                      letterSpacing: "0.01em",
                    }),
                  ],
                },
              },
              // --- doc counts -------------------------------------------
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column" },
                  children: [
                    // Total counts line
                    caps(
                      `${guides} GUIDES · ${reference} REFERENCE`,
                      {
                        fontSize: 18,
                        color: P.ink,
                        marginBottom: 16,
                      },
                    ),
                    // Per-category counts with hue squares
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexWrap: "wrap",
                        },
                        children: catRow,
                      },
                    },
                  ],
                },
              },
              // --- footer: ea monogram + url ----------------------------
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    borderTop: `1px solid ${P.hairline}`,
                    paddingTop: 20,
                  },
                  children: [
                    {
                      type: "img",
                      props: {
                        src: markUri,
                        width: 32,
                        height: 32,
                        style: { opacity: 0.5 },
                      },
                    },
                    text("erfi.dev", {
                      fontSize: 16,
                      color: P.muted,
                      letterSpacing: "0.02em",
                    }),
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(card, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Overpass Mono", data: overpass700, weight: 700, style: "normal" },
      { name: "Overpass Mono", data: overpass400, weight: 400, style: "normal" },
      { name: "Inconsolata", data: inconsolata, weight: 400, style: "normal" },
    ],
  });

  const out = join(outDir, opts.outFile ?? "thumbnail.jpg");
  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(out);
  return { out, guides, reference };
}