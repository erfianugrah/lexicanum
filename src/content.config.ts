import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { TAXONOMY } from './lib/taxonomy.mjs';

// Taxonomy frontmatter. The sidebar, redirects, and homepage cards are all
// derived from these fields (src/lib/taxonomy.mjs, TopicCards.astro), so a
// doc only manages its own frontmatter. The enums come straight from
// TAXONOMY - one source, so an invalid value fails the build here and a
// missing category fails in the generator.
const categories = TAXONOMY.map((c) => c.id) as [string, ...string[]];
const groups = TAXONOMY.flatMap((c) => (c.groups ?? []).map((g) => g.id)) as [string, ...string[]];

const taxonomy = z.object({
	category: z.enum(categories).optional(),
	group: z.enum(groups).optional(),
	// featured: show on the homepage card grid; blurb overrides description there.
	featured: z.boolean().optional(),
	blurb: z.string().optional(),
	// Old published URLs for this doc (leading slash, no trailing slash) -
	// emitted as Astro redirects. Use when renaming or moving the doc.
	aliases: z.array(z.string()).optional(),
});

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema({ extend: taxonomy }) }),
};
