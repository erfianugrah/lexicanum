# Components

- **TopicCards.astro** - Homepage discovery hub. Renders one section per
  taxonomy category (`TAXONOMY` in `src/lib/taxonomy.mjs`): a CardGrid of
  `featured: true` docs, then a collapsed full listing of every doc in the
  category. Driven entirely by frontmatter.
- **Head.astro** - Starlight head override; loads the house kit's
  `house/DiagramExpand.astro` (click-to-expand for shrunk Graphviz diagrams).
- **MarkdownContent.astro** - Starlight body override; appends the "Linked
  from" list of docs that link to the page (`src/lib/links.mjs`).
