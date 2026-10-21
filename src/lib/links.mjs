/**
 * Doc-to-doc links, for the "Linked from" section on every page.
 *
 * Deliberately independent of tests/lib/mdx.ts: tests/docs.test.ts compares
 * the backlinks this module renders into dist/ against the ones the test
 * parser derives from source, so two extractors have to agree before a build
 * passes. Same rules as the parser: links inside code fences and MDX comments
 * are not links, a #fragment still links the doc, a trailing slash is optional.
 */

const FENCE = /^[ \t]*(`{3,}|~{3,})/;
const LINK = /\]\((\/(?:guides|reference)\/[a-z0-9-]+)\/?(?:#[^)\s]*)?\)/g;

/** Site-internal doc links in an MDX body, as ids like "guides/foo". */
export function docLinks(body) {
  const out = new Set();
  let fence = null;
  let inComment = false;
  for (const line of body.split("\n")) {
    const m = line.match(FENCE);
    if (fence) {
      if (m && m[1][0] === fence[0] && m[1].length >= fence.length && line.trim() === m[1]) fence = null;
      continue;
    }
    if (m) {
      fence = m[1];
      continue;
    }
    let text = line;
    if (inComment) {
      const end = text.indexOf("*/}");
      if (end === -1) continue;
      text = text.slice(end + 3);
      inComment = false;
    }
    text = text.replace(/\{\/\*.*?\*\/\}/g, "");
    const open = text.indexOf("{/*");
    if (open !== -1) {
      text = text.slice(0, open);
      inComment = true;
    }
    for (const l of text.matchAll(LINK)) out.add(l[1].slice(1));
  }
  return [...out];
}

/**
 * Map of doc id -> docs that link to it, sorted by title. `entries` are
 * content-collection entries ({ id, body, data: { title, draft } }). Drafts
 * do not build, so they neither appear as a source nor get a section.
 */
export function backlinks(entries) {
  const live = entries.filter((e) => !e.data.draft && /^(guides|reference)\//.test(e.id));
  const ids = new Set(live.map((e) => e.id));
  const map = new Map();
  for (const src of live) {
    for (const target of docLinks(src.body ?? "")) {
      if (target === src.id || !ids.has(target)) continue;
      if (!map.has(target)) map.set(target, []);
      map.get(target).push({ id: src.id, title: src.data.title });
    }
  }
  for (const list of map.values()) list.sort((a, b) => a.title.localeCompare(b.title));
  return map;
}
