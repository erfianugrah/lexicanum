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

/** Live (non-draft) guides and reference docs. */
function liveDocs(entries) {
  return entries.filter((e) => !e.data.draft && /^(guides|reference)\//.test(e.id));
}

/**
 * Map of doc id -> docs it links to, sorted by title. Same filtering as
 * backlinks(): no self-links, no links to drafts or missing docs.
 */
export function outlinks(entries) {
  const live = liveDocs(entries);
  const titles = new Map(live.map((e) => [e.id, e.data.title]));
  const map = new Map();
  for (const src of live) {
    const out = docLinks(src.body ?? "")
      .filter((t) => t !== src.id && titles.has(t))
      .map((t) => ({ id: t, title: titles.get(t) }))
      .sort((a, b) => a.title.localeCompare(b.title));
    if (out.length) map.set(src.id, out);
  }
  return map;
}

/** Wrap a title onto lines of at most `width` characters, for a node label. */
function wrap(text, width = 28) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

const quote = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

/**
 * Graphviz source for one page's neighbourhood: docs linking in on the left,
 * the page in the middle, docs it links to on the right. A pair that links
 * both ways is one double-headed edge. Returns undefined when the page has
 * no neighbours. House dot boilerplate (AGENTS.md): no colours, transparent
 * background; custom.css themes it.
 */
export function neighbourhoodDot(page, inbound = [], outbound = []) {
  const ins = new Map(inbound.map((d) => [d.id, d]));
  const outs = new Map(outbound.map((d) => [d.id, d]));
  if (!ins.size && !outs.size) return undefined;
  const node = (d) => `  ${quote(d.id)} [label=${quote(wrap(d.title))}, URL=${quote(`/${d.id}/`)}, tooltip=${quote(d.title)}];`;
  const lines = [
    "digraph {",
    '  rankdir=LR; bgcolor="transparent"; nodesep=0.15; ranksep=0.5;',
    '  fontname="Helvetica,Arial,sans-serif";',
    '  node [fontname="Helvetica,Arial,sans-serif", fontsize=10, shape=box, margin="0.18,0.08"];',
    '  edge [arrowsize=0.6];',
    `  ${quote(page.id)} [label=${quote(wrap(page.title))}, style=bold];`,
  ];
  for (const d of new Map([...ins, ...outs]).values()) lines.push(node(d));
  for (const id of ins.keys()) {
    if (outs.has(id)) lines.push(`  ${quote(page.id)} -> ${quote(id)} [dir=both];`);
    else lines.push(`  ${quote(id)} -> ${quote(page.id)};`);
  }
  for (const id of outs.keys()) {
    if (!ins.has(id)) lines.push(`  ${quote(page.id)} -> ${quote(id)};`);
  }
  lines.push("}");
  return lines.join("\n");
}

/**
 * Map of doc id -> docs that link to it, sorted by title. `entries` are
 * content-collection entries ({ id, body, data: { title, draft } }). Drafts
 * do not build, so they neither appear as a source nor get a section.
 */
export function backlinks(entries) {
  const live = liveDocs(entries);
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
