// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import remarkD2 from "remark-d2";
import sitemap from "@astrojs/sitemap";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://erfi.dev",
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
        autogenerate: { directory: "guides" },
      },
      {
        label: "Reference",
        autogenerate: { directory: "reference" },
      },
    ],
  }), react()],
  markdown: {
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