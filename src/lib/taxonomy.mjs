/**
 * Frontmatter-driven navigation: taxonomy, sidebar, and redirects.
 *
 * The taxonomy (which categories exist, their order, their subgroups) lives
 * here in ONE ordered table; the content-collection schema enums derive from
 * it in src/content.config.ts. Doc membership lives in each doc's frontmatter
 * (`category`, optional `group`, optional `sidebar.order`, optional
 * `aliases`). No framework supports page-declared group membership natively -
 * Starlight frontmatter only orders within directory-derived groups - so this
 * module scans the docs directories at config-load time and builds the
 * sidebar array itself (the pattern documented in
 * https://github.com/stalwartlabs/website/blob/main/astro.config.mjs).
 *
 * Sort within a group: guides before reference docs, then optional numeric
 * `order`, then title. Every entry also carries a Guide/Reference badge
 * stamped from its folder - doc type is invisible in the sidebar otherwise.
 * The taxonomy order is the sidebar order.
 *
 * Failure handling: a doc missing `category`, carrying an unknown
 * category/group, or missing `group` in a category that has groups throws at
 * config-load - the build fails with the filename, because a doc absent from
 * the sidebar is otherwise reachable only through search and nobody notices.
 */
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { parse } from "yaml";

export const TAXONOMY = [
  {
    id: "supabase",
    label: "Supabase",
    blurb: "Where tenants live, what they cost, and how to move them - the largest cluster here.",
    groups: [
      { id: "tenancy", label: "Tenancy and placement" },
      { id: "migrations", label: "Migrations and upgrades" },
      { id: "operations", label: "Operations and access" },
      { id: "architecture", label: "Architecture and data" },
    ],
  },
  {
    id: "cloudflare",
    label: "Cloudflare",
    blurb: "Workers, caching, tunnels, and the WAN - the edge provider half of the estate.",
    groups: [
      { id: "edge", label: "Edge and Workers" },
      { id: "connectivity", label: "Connectivity and access" },
    ],
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    blurb: "k3s on ARM64: deployment, ingress, and observability.",
  },
  {
    id: "networking",
    label: "Networking and DNS",
    blurb: "The self-hosted edge and the resolvers behind it.",
  },
  {
    id: "homelab",
    label: "Homelab and self-hosting",
    blurb: "The services that run on the home network, and the network they run on.",
  },
  {
    id: "workstations",
    label: "Workstations and tooling",
    blurb: "Hardware tuning and the tooling around the machines.",
  },
];

const DOCS_ROOT = fileURLToPath(new URL("../content/docs/", import.meta.url));
const DIRS = ["guides", "reference"];

let cache = null;

/** Read every doc's id, title, and taxonomy frontmatter (memoized). */
export function collectDocMeta() {
  // Config load calls this via buildSidebar AND buildRedirects; the memo
  // makes both come from one scan, so sidebar and redirects can never
  // disagree about what exists.
  if (cache) return cache;
  const docs = [];
  for (const dir of DIRS) {
    for (const file of readdirSync(join(DOCS_ROOT, dir))) {
      if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;
      const id = `${dir}/${file.replace(/\.(mdx|md)$/, "")}`;
      const raw = readFileSync(join(DOCS_ROOT, dir, file), "utf8");
      const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!fm) throw new Error(`${id}: no frontmatter block`);
      const data = parse(fm[1]);
      if (data.draft) continue;
      if (!data.category) throw new Error(`${id}: frontmatter has no category`);
      const category = TAXONOMY.find((c) => c.id === data.category);
      if (!category) {
        throw new Error(
          `${id}: unknown category "${data.category}" (known: ${TAXONOMY.map((c) => c.id).join(", ")})`,
        );
      }
      if (data.group != null && !(category.groups ?? []).some((g) => g.id === data.group)) {
        throw new Error(
          `${id}: unknown group "${data.group}" for category "${data.category}" (known: ${(category.groups ?? []).map((g) => g.id).join(", ") || "none"})`,
        );
      }
      // Without a group in a grouped category the doc lands in no subgroup -
      // it would build but have no nav entry. Fail here, not in a test later.
      if (data.group == null && category.groups) {
        throw new Error(
          `${id}: category "${data.category}" requires a group (${category.groups.map((g) => g.id).join(", ")})`,
        );
      }
      docs.push({
        id,
        title: data.title,
        type: dir,
        category: data.category,
        group: data.group ?? null,
        order: typeof data.sidebar === "object" ? data.sidebar?.order : undefined,
        aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
      });
    }
  }
  cache = docs;
  return docs;
}

function byTypeThenOrder(a, b) {
  // Guides first: a reader in a topic group usually wants to DO something.
  if (a.type !== b.type) return a.type === "guides" ? -1 : 1;
  if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
  return String(a.title).localeCompare(String(b.title));
}

// Doc type is otherwise invisible in the sidebar: two same-topic docs, one
// task and one concept, look identical. The folder already knows the type, so
// stamp it. Guide = tip (green), Reference = note (blue).
const BADGE = {
  guides: { text: "Guide", variant: "tip" },
  reference: { text: "Reference", variant: "note" },
};

function entry(d) {
  return { slug: d.id, badge: BADGE[d.type] };
}

/**
 * Build the Astro `redirects` map from `aliases:` frontmatter, so renaming or
 * moving a doc is a frontmatter change on the doc itself rather than a config
 * edit. An alias that collides with a live doc or another alias throws here -
 * a redirect shadowing a real page would otherwise win silently.
 */
export function buildRedirects() {
  const docs = collectDocMeta();
  const live = new Set(docs.map((d) => `/${d.id}`));
  const out = {};
  for (const d of docs) {
    for (const alias of d.aliases) {
      if (!alias.startsWith("/")) throw new Error(`${d.id}: alias "${alias}" must start with /`);
      if (live.has(alias)) throw new Error(`${d.id}: alias "${alias}" collides with a live doc`);
      if (out[alias]) throw new Error(`${d.id}: alias "${alias}" is already claimed by ${out[alias]}`);
      out[alias] = `/${d.id}`;
    }
  }
  return out;
}

/** Build the Starlight `sidebar` config array from doc frontmatter. */
export function buildSidebar() {
  const docs = collectDocMeta();
  return TAXONOMY.map((category) => {
    const inCategory = docs.filter((d) => d.category === category.id);
    if (category.groups) {
      const items = category.groups
        .map((group) => ({
          label: group.label,
          items: inCategory
            .filter((d) => d.group === group.id)
            .sort(byTypeThenOrder)
            .map(entry),
        }))
        .filter((group) => group.items.length > 0);
      // A category whose groups all filtered out would render as a bare
      // label with nothing under it; drop it entirely instead.
      return items.length > 0 ? { label: category.label, items } : null;
    }
    const items = inCategory.sort(byTypeThenOrder).map(entry);
    return items.length > 0 ? { label: category.label, items } : null;
  }).filter((c) => c !== null);
}
