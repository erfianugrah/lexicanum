// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeGraphviz from "@beoe/rehype-graphviz";
import { getCache } from "@beoe/cache";

// Build-cache for rendered diagrams so unchanged dot blocks are not re-rendered
// through the wasm Graphviz engine on every build.
const beoeCache = await getCache();

// @beoe/rehype-graphviz emits SVGs with only a viewBox (no width/height), so
// each stretches to 100% of the column - wide diagrams squeeze their text, tall
// ones blow up. This pass gives every diagram an intrinsic size (the viewBox
// dims scaled up so they read at a generous size), which custom.css then caps
// by column width and max-height. Aspect ratio is preserved; nothing stretches.
const DIAGRAM_SCALE = 1.5;
function rehypeGraphvizIntrinsicSize() {
  const walk = (node) => {
    if (node.type === "element") {
      if (node.tagName === "svg") {
        const p = node.properties || (node.properties = {});
        const vb = p.viewBox ?? p.viewbox;
        if (vb && p.width == null && p.height == null) {
          const n = String(vb).trim().split(/[\s,]+/).map(Number);
          if (n.length === 4 && n[2] > 0 && n[3] > 0) {
            p.width = Math.round(n[2] * DIAGRAM_SCALE);
            p.height = Math.round(n[3] * DIAGRAM_SCALE);
          }
        }
      }
      node.children?.forEach(walk);
    } else {
      node.children?.forEach(walk);
    }
  };
  return (tree) => walk(tree);
}

// GFM renders the footnote section under a screen-reader-only
// <h2 id="footnote-label">Footnotes</h2>. Rename it to "References" and drop the
// sr-only class so it reads as a real visible section (and shows as "References"
// in the table of contents), matching the repo's citation convention.
function rehypeFootnoteLabelToReferences() {
  const walk = (node) => {
    if (
      node.type === "element" &&
      node.tagName === "h2" &&
      node.properties &&
      node.properties.id === "footnote-label"
    ) {
      const cls = node.properties.className;
      if (Array.isArray(cls)) {
        node.properties.className = cls.filter((c) => c !== "sr-only");
      }
      node.children = [{ type: "text", value: "References" }];
    }
    node.children?.forEach(walk);
  };
  return (tree) => walk(tree);
}

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://erfi.dev",
  fonts: [
    {
      name: "IBM Plex Sans",
      cssVariable: "--font-plex-sans",
      provider: fontProviders.fontsource(),
      // Variable font: single woff2 per subset, weight axis 100-700
      weights: ["100 700"],
      styles: ["normal", "italic"],
      subsets: ["latin"],
      fallbacks: [
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "sans-serif",
      ],
    },
    {
      name: "IBM Plex Mono",
      cssVariable: "--font-plex-mono",
      provider: fontProviders.fontsource(),
      // Static font — only the weights we actually use
      weights: [400, 600],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: [
        "ui-monospace",
        "SFMono-Regular",
        "Menlo",
        "Consolas",
        "monospace",
      ],
    },
  ],
  integrations: [sitemap(), starlight({
    title: "Erfi's Lexicanum",
    favicon: "/ea_favicon.png",
    customCss: ["./src/styles/custom.css"],
    components: {
      Head: './src/components/Head.astro',
    },
    editLink: {
      baseUrl: "https://github.com/erfianugrah/erfi-dev-docs/edit/main/",
    },
    head: [
      {
        tag: "meta",
        attrs: {
          name: "description",
          content: "Working on Computer stuff",
        },
      },
      {
        tag: "meta",
        attrs: {
          property: "og:image",
          content: "https://erfi.dev/thumbnail.JPG",
        },
      },
      {
        tag: "meta",
        attrs: {
          property: "og:image:alt",
          content: "Cover image for erfi.dev technical documentation",
        },
      },
      {
        tag: "meta",
        attrs: {
          property: "og:site_name",
          content: "Erfi's Lexicanum",
        },
      },
      {
        tag: "meta",
        attrs: {
          property: "og:locale",
          content: "en_US",
        },
      },
      {
        tag: "meta",
        attrs: {
          name: "twitter:card",
          content: "summary_large_image",
        },
      },
      {
        tag: "meta",
        attrs: {
          name: "color-scheme",
          content: "light dark",
        },
      },
      {
        tag: "script",
        attrs: {
          type: "application/ld+json",
        },
        content: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Lexicanum",
          "url": "https://erfi.dev",
          "description": "Computer stuff",
        }),
      },
    ],
    social: [{
      icon: "github",
      label: "GitHub",
      href: "https://github.com/erfianugrah",
    }],
    sidebar: [
      {
        label: "Guides",
        items: [{ autogenerate: { directory: "guides" } }],
      },
      {
        label: "Reference",
        items: [{ autogenerate: { directory: "reference" } }],
      },
    ],
    expressiveCode: {
      shiki: {
        // These fence tags aren't in Shiki's bundled grammar set; alias them to
        // the closest available language so the build stops warning and they
        // still get sensible (or plain) highlighting.
        langAlias: {
          conf: "ini",
          caddy: "ini",
          promql: "txt",
          logql: "txt",
        },
      },
    },
  }), react()],
  markdown: {
    // Astro 7 switched the default processor to Sätteri; remark/rehype plugins
    // require the unified() pipeline from @astrojs/markdown-remark.
    // Plugins and gfm are passed directly into unified() (the top-level
    // markdown.remarkPlugins / rehypePlugins / gfm options are deprecated in v7).
    processor: unified({
      // gfm: true is the default; kept explicit as a guardrail against regressions.
      gfm: true,
      remarkPlugins: [remarkMath],
      rehypePlugins: [
        rehypeKatex,
        // Renders ```dot / ```graphviz fences to inline SVG at build time via
        // @hpcc-js/wasm (no system Graphviz binary, so CI needs no install step).
        // Diagrams are theme-adaptive line art; dark mode is handled in custom.css.
        [rehypeGraphviz, {
          strategy: "inline",
          class: "not-content",
          cache: beoeCache,
        }],
        // After rehypeGraphviz: give each diagram an intrinsic (scaled) size.
        rehypeGraphvizIntrinsicSize,
        // Rename the GFM "Footnotes" section heading to "References".
        rehypeFootnoteLabelToReferences,
      ],
    }),
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["dot", "graphviz"],
    },
  },
  build: {
    concurrency: 4,
    measuring: {
      entryBuilding: true,
      pageGeneration: true,
      bundling: true,
      rendering: true,
      assetProcessing: true,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
});