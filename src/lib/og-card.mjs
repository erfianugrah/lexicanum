// og-card.mjs - renders dist/thumbnail.jpg (the og:image social card) at
// build time via satori + sharp, so the doc counts on the card can never
// drift from the corpus. Design mirrors the site: flat dark palette from
// src/styles/custom.css, sharp 3px frame, Plex Sans 600 title, Plex Mono
// accents, the ea monogram, doc counts measured from src/content/docs.
//
// Invoked from the ogCard integration in astro.config.mjs
// (astro:build:done). Not run in dev - og:image is pointless on localhost.

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

// Palette: hsl values lifted from src/styles/custom.css (dark mode).
const C = {
  gray1: "hsl(220, 6%, 92%)",
  gray2: "hsl(220, 5%, 75%)",
  gray3: "hsl(220, 5%, 55%)",
  gray5: "hsl(220, 6%, 22%)",
  black: "hsl(220, 10%, 8%)",
  accent: "hsl(217, 70%, 62%)",
};

const countDocs = async (root, sub) =>
  (await readdir(join(root, "src/content/docs", sub))).filter((f) =>
    f.endsWith(".mdx"),
  ).length;

const mono = (children, style = {}) => ({
  type: "div",
  props: {
    style: { fontFamily: "IBM Plex Mono", ...style },
    children,
  },
});

export async function writeOgCard(root, outDir) {
  const [guides, reference] = await Promise.all([
    countDocs(root, "guides"),
    countDocs(root, "reference"),
  ]);

  const [plexSans, plexMono, markRaw] = await Promise.all([
    readFile(
      join(
        root,
        "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff",
      ),
    ),
    readFile(
      join(
        root,
        "node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff",
      ),
    ),
    readFile(join(root, "public/ea_favicon.png")),
  ]);

  // The ea mark is black-on-transparent; invert to match the dark card.
  const mark = await sharp(markRaw)
    .negate({ alpha: false })
    .png()
    .toBuffer();
  const markUri = `data:image/png;base64,${mark.toString("base64")}`;

  const card = {
    type: "div",
    props: {
      style: {
        width: 1200,
        height: 630,
        display: "flex",
        background: C.black,
        padding: 28,
        fontFamily: "IBM Plex Sans",
        color: C.gray1,
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
              border: `1px solid ${C.gray5}`,
              borderRadius: 3,
              padding: "44px 52px",
            },
            children: [
              {
                type: "img",
                props: {
                  src: markUri,
                  width: 54,
                  height: 54,
                  style: { opacity: 0.92 },
                },
              },
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 96,
                          fontWeight: 600,
                          letterSpacing: "-0.015em",
                          lineHeight: 1.05,
                        },
                        children: "Erfi's Lexicanum",
                      },
                    },
                    mono("notes on computers and networks", {
                      marginTop: 18,
                      fontSize: 27,
                      color: C.accent,
                    }),
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    borderTop: `1px solid ${C.gray5}`,
                    paddingTop: 20,
                    fontSize: 15,
                    letterSpacing: "0.14em",
                    color: C.gray3,
                  },
                  children: [
                    mono(`${guides} GUIDES · ${reference} REFERENCE`, {
                      color: C.gray2,
                    }),
                    mono("erfi.dev"),
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
      { name: "IBM Plex Sans", data: plexSans, weight: 600, style: "normal" },
      { name: "IBM Plex Mono", data: plexMono, weight: 400, style: "normal" },
    ],
  });

  const out = join(outDir, "thumbnail.jpg");
  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(out);
  return { out, guides, reference };
}
