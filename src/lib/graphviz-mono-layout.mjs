/**
 * Rehype plugin: rewrite the Helvetica fontname in dot/graphviz fences to
 * Courier, whose metrics Graphviz knows. Courier advances 0.6em, Inconsolata
 * 0.5em, so every label laid out for Courier fits when CSS renders it in
 * Inconsolata. Dot sources keep the documented boilerplate.
 *
 * Usage in astro.config.mjs, before @beoe/rehype-graphviz in rehypePlugins:
 *   import rehypeGraphvizMonoLayout from "./src/lib/graphviz-mono-layout.mjs";
 *   // ...
 *   rehypePlugins: [rehypeGraphvizMonoLayout, rehypeGraphviz],
 */
export default function rehypeGraphvizMonoLayout() {
  const isDot = (/** @type {any} */ node) => {
    const cls = node.properties?.className;
    const list = Array.isArray(cls) ? cls : typeof cls === "string" ? cls.split(" ") : [];
    return list.includes("language-dot") || list.includes("language-graphviz");
  };
  const walk = (/** @type {any} */ node) => {
    if (node.type === "element" && node.tagName === "code" && isDot(node)) {
      for (const child of node.children ?? []) {
        if (child.type === "text") {
          child.value = child.value.replace(/fontname\s*=\s*"[^"]*"/gi, 'fontname="Courier"');
        }
      }
      return;
    }
    node.children?.forEach(walk);
  };
  return (/** @type {any} */ tree) => walk(tree);
}

export { rehypeGraphvizMonoLayout };