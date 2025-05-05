// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import rehypeMermaid from "rehype-mermaid";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://erfi.dev",
  integrations: [
    sitemap(),
    starlight({
      title: "Tech Docs",
      favicon: "/ea_favicon.png",
      head: [
        {
          tag: "meta",
          attrs: {
            name: "description",
            content:
              "Technical documentation and guides for various technologies and services",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://cdn.erfianugrah.com/Tenhult_3.JPG",
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
            content: "Erfi Tech Docs",
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
            "name": "Erfi Tech Docs",
            "url": "https://erfi.dev",
            "description":
              "Technical documentation and guides for various technologies and services",
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
    }),
  ],
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid"],
    },
    rehypePlugins: [
      [rehypeMermaid, {
        strategy: "inline-svg",
        mermaidConfig: {
          theme: "default",
          fontFamily: "arial,sans-serif",
        },
        colorScheme: "light dark",
        errorFallback: (element, diagram, error) => {
          // Create a pre element with the diagram source and error message
          return {
            type: "element",
            tagName: "pre",
            properties: { className: ["mermaid-error"] },
            children: [
              {
                type: "element",
                tagName: "code",
                properties: { className: ["language-mermaid"] },
                children: [{ type: "text", value: diagram }],
              },
              {
                type: "element",
                tagName: "div",
                properties: { className: ["mermaid-error-message"] },
                children: [{
                  type: "text",
                  value: `Error rendering diagram: ${error.message}`,
                }],
              },
            ],
          };
        },
      }],
    ],
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
