/**
 * Rehype plugin: keep inline code on one line with the characters it touches.
 *
 * house-starlight.css renders inline code as an inline block, so a span that
 * fits moves to the next line whole instead of splitting. An inline block is
 * an atomic inline, and browsers allow a line break on either side of one, so
 * a closing ")" or the ".." in "CONFIG0..3" could land alone on the next line.
 * This pass wraps every word that contains inline code (a run of nodes with
 * no space between them, e.g. "(", <code>, ")") in a span the CSS marks
 * `white-space: nowrap` (.house-glue). The code keeps `white-space: normal`,
 * so a span longer than the line still wraps inside its own box.
 *
 * Usage in astro.config.mjs, last in rehypePlugins:
 *   import rehypeCodeGlue from "./src/lib/code-glue.mjs";
 *   // ...
 *   rehypePlugins: [...otherPlugins, rehypeCodeGlue],
 */

// Elements that sit inside a line of text. Anything else (blocks, MDX
// components, comments) ends a word.
const PHRASING = new Set([
  "a", "abbr", "b", "bdi", "bdo", "cite", "code", "data", "del", "dfn", "em",
  "i", "ins", "kbd", "mark", "q", "s", "samp", "small", "span", "strong",
  "sub", "sup", "time", "u", "var",
]);
// Never look inside these.
const SKIP = new Set(["pre", "code", "kbd", "samp", "script", "style", "svg", "math"]);
// Breakable white space only: a no-break space does not end a word.
const SPACE = /([ \t\n\r\f]+)/;

const classes = (/** @type {any} */ node) => {
  const cls = node.properties?.className;
  return Array.isArray(cls) ? cls : typeof cls === "string" ? cls.split(" ") : [];
};

const hasCode = (/** @type {any} */ node) =>
  node.type === "element" &&
  (node.tagName === "code" || (!SKIP.has(node.tagName) && (node.children ?? []).some(hasCode)));

/** Wrap each multi-node word holding inline code in span.house-glue. */
function glue(/** @type {any} */ parent) {
  const kids = parent.children;
  if (!kids?.length || !kids.some(hasCode)) return;
  /** @type {{ node: any, word: boolean, code: boolean }[]} */
  const atoms = [];
  for (const child of kids) {
    if (child.type === "text") {
      for (const piece of child.value.split(SPACE)) {
        if (piece) atoms.push({ node: { type: "text", value: piece }, word: !SPACE.test(piece), code: false });
      }
    } else if (child.type === "element" && PHRASING.has(child.tagName)) {
      atoms.push({ node: child, word: true, code: hasCode(child) });
    } else {
      atoms.push({ node: child, word: false, code: false });
    }
  }
  const out = [];
  let changed = false;
  for (let i = 0; i < atoms.length; ) {
    if (!atoms[i].word) {
      out.push(atoms[i++].node);
      continue;
    }
    let j = i;
    while (j < atoms.length && atoms[j].word) j++;
    const word = atoms.slice(i, j);
    if (word.length > 1 && word.some((a) => a.code)) {
      out.push({
        type: "element",
        tagName: "span",
        properties: { className: ["house-glue"] },
        children: word.map((a) => a.node),
      });
      changed = true;
    } else {
      out.push(...word.map((a) => a.node));
    }
    i = j;
  }
  if (changed) parent.children = out;
}

export default function rehypeCodeGlue() {
  const walk = (/** @type {any} */ node) => {
    if (node.type === "element" && (SKIP.has(node.tagName) || classes(node).includes("katex"))) return;
    // A glue span is already one word; only its children need a look.
    if (!classes(node).includes("house-glue")) glue(node);
    node.children?.forEach(walk);
  };
  return (/** @type {any} */ tree) => walk(tree);
}

export { rehypeCodeGlue };
