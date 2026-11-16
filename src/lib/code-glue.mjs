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
 * Limits, so the glue never overflows the line or squeezes code:
 * - plain text glued to code is at most MAX_GLUE characters;
 * - a word with one code: the code carries `--glue`, its glued character
 *   count, and the CSS narrows its max-width by that much, so a full-width
 *   code plus its ")" still fits the line;
 * - a word with several codes ("(`CONFIG0`..`3`)", "`a`/`b`") is glued only
 *   up to MAX_MULTI characters, which fit one line at a 390px phone width
 *   without shrinking either code. Longer ones still break after "/" or "-".
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
// Most characters a word may glue to its code ("(", ")", ".", "..", "-ish").
const MAX_GLUE = 12;
// A word with several codes this long fits a list item at 390px (255px).
const MAX_MULTI = 28;

const classes = (/** @type {any} */ node) => {
  const cls = node.properties?.className;
  return Array.isArray(cls) ? cls : typeof cls === "string" ? cls.split(" ") : [];
};

const hasCode = (/** @type {any} */ node) =>
  node.type === "element" &&
  (node.tagName === "code" || (!SKIP.has(node.tagName) && (node.children ?? []).some(hasCode)));

// Characters of text in a node, code included.
const textLen = (/** @type {any} */ node) =>
  node.type === "text"
    ? [...node.value].length
    : (node.children ?? []).reduce((/** @type {number} */ n, /** @type {any} */ c) => n + textLen(c), 0);

// Every inline code element in a node, the node itself included.
const codesIn = (/** @type {any} */ node) =>
  node.type !== "element"
    ? []
    : node.tagName === "code"
      ? [node]
      : (node.children ?? []).flatMap(codesIn);

/** Wrap each multi-node word holding inline code in span.house-glue. */
function glue(/** @type {any} */ parent) {
  const kids = parent.children;
  if (!kids?.length || !kids.some(hasCode)) return;
  /** @type {{ node: any, word: boolean }[]} */
  const atoms = [];
  for (const child of kids) {
    if (child.type === "text") {
      for (const piece of child.value.split(SPACE)) {
        if (piece) atoms.push({ node: { type: "text", value: piece }, word: !SPACE.test(piece) });
      }
    } else if (child.type === "element" && PHRASING.has(child.tagName)) {
      atoms.push({ node: child, word: true });
    } else {
      atoms.push({ node: child, word: false });
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
    const codes = word.flatMap((a) => codesIn(a.node));
    const total = word.reduce((n, a) => n + textLen(a.node), 0);
    const plain = total - codes.reduce((n, c) => n + textLen(c), 0);
    const ok = codes.length === 1 || total <= MAX_MULTI;
    if (word.length > 1 && codes.length && plain <= MAX_GLUE && ok) {
      if (codes.length === 1) {
        codes[0].properties = { ...codes[0].properties, style: `--glue:${plain}` };
      }
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
