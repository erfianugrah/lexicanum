// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkD2 from "remark-d2";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

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
  }), react()],
  markdown: {
    // Explicit so GFM tables always render. astro 6.4.2 + @astrojs/mdx 5.x
    // had a regression where gfm defaulted to false in the MDX pipeline when
    // a markdown config block was present (tables leaked as raw `| ... |`
    // text). Fixed in 6.4.5 / mdx 6.0.3; kept explicit as a guardrail.
    gfm: true,
    remarkPlugins: [
      remarkMath,
      [remarkD2, {
        compilePath: "public/d2",
        linkPath: "/d2",
        defaultD2Opts: ["-t=100", "--dark-theme=200", "--layout=elk"],
      }],
    ],
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["d2"],
    },
    rehypePlugins: [rehypeKatex],
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