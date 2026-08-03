import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Docs that publish measured numbers carry their provenance in frontmatter, so a
// doc and its evidence move, rename and delete as one file. Frontmatter does not
// render, so claim ids stay out of the reader's way while remaining checkable.
//
// scripts/verify-docs.sh asserts, per row: the claim id exists in that lab's
// claims.json, its status equals `expect` (default empirically-proven), and
// `must_appear` is present in the prose. Declaring the schema here means a
// malformed evidence block fails `astro build`, not just the harness.
const evidence = z
	.object({
		lab: z.string(), // "<repo>:labs/<lab-name>"
		rows: z
			.array(
				z.object({
					claim: z.string(), // ledger id, e.g. "A12"
					must_appear: z.string(), // literal text that must survive in the prose
					expect: z
						.enum([
							'empirically-proven',
							'refuted',
							'doc-verified',
							'doc-cited-not-tested',
						])
						.default('empirically-proven'),
				}),
			)
			.min(1),
	})
	.optional();

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({ extend: z.object({ evidence }) }),
	}),
};
