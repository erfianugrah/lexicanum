# Erfi's Lexicanum

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

Notes, guides, and architecture references on the stuff I actually run - Supabase,
Cloudflare, k3s, home networking, self-hosting. Published at https://erfi.dev.
Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

**AGENTS.md is the authoring contract** (doc types, skeletons, citation
convention, house style). Read it before adding or editing docs.

## Project structure

```
.
├── scripts/
│   │   └── new-doc.ts       # `bun run new` doc scaffolder
├── src/
│   ├── content/
│   │   └── docs/
│   │       ├── guides/      # Task-sequenced how-tos (Diataxis how-to)
│   │       └── reference/   # Explanation-led architecture docs
│   ├── components/          # TopicCards.astro (homepage card grids), etc.
│   ├── lib/
│   │   └── taxonomy.mjs     # TAXONOMY table + sidebar/redirect generators
│   ├── content.config.ts    # docs collection + taxonomy frontmatter schema
│   └── styles/custom.css
├── tests/                   # All doc checks; run inside `bun run build`
├── astro.config.mjs
└── package.json
```

## Navigation is frontmatter-driven

Adding a doc means running `bun run new` (prompts for type/category/title and
scaffolds the file with correct frontmatter and the section skeleton) or
writing the doc by hand - the sidebar, redirects, and homepage cards are all
derived from frontmatter:

```yaml
---
title: ...
description: ...
author: Erfi Anugrah
category: supabase        # required; one of TAXONOMY in src/lib/taxonomy.mjs
group: tenancy            # required when the category has groups
featured: true            # optional: show on the homepage card grid
blurb: "..."              # optional: card text (defaults to description)
aliases:                  # optional: old published URLs, emitted as redirects
  - "/reference/old-slug"
---
```

- A missing or unknown `category`/`group` fails the build (schema enum +
  generator), so no doc falls out of the nav silently.
- Sidebar entries carry a Guide/Reference badge stamped from the folder, so
  doc type is visible in the nav.
- Renaming or moving a doc = rename the file + add its old URL to `aliases`.
  A colliding alias fails the build.
- Adding a *category* is a deliberate edit to `TAXONOMY` in
  `src/lib/taxonomy.mjs`; the schema enums derive from it.
- Dev caveat: sidebar/redirects are computed once at server start - restart
  `bun dev` after changing taxonomy frontmatter.

## Commands

| Command                  | Action                                          |
| :----------------------- | :---------------------------------------------- |
| `bun install`            | Install dependencies                            |
| `bun run new`            | Scaffold a new doc (frontmatter + skeleton)     |
| `bun dev`                | Dev server at `localhost:4321`                  |
| `bun run build`          | Run all doc tests, then build to `./dist/`      |
| `bun test`               | Run the doc checks without building             |
| `bun run verify:docs:links` | Opt-in external-link reachability check      |
| `bun run deploy`         | Deploy via Wrangler                             |

## Resources

- [Starlight documentation](https://starlight.astro.build/)
- [Astro documentation](https://docs.astro.build)
- [Diataxis](https://diataxis.fr/) - the guide/reference doc-type split
