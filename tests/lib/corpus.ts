/**
 * Where the corpus lives, and how to read it.
 *
 * Every test file had its own copy of these paths and its own dist-gating rule.
 * That is exactly the drift that let the old bash checks disagree with each other
 * about which files were in scope, so there is one definition here and the test
 * files ask for what they need.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { parseMdx, type Doc } from "./mdx";

export const ROOT = new URL("../..", import.meta.url).pathname;
export const DOCS = join(ROOT, "src/content/docs");
export const DIST = join(ROOT, "dist");

/** The two collections that produce pages. */
export const COLLECTIONS = ["guides", "reference"] as const;

/**
 * Dist-dependent assertions must be gated on THIS, not on dist/ merely existing.
 * `bun run build` runs the suite twice, and in the first pass dist/ still holds the
 * previous build - grading it there either passes on stale HTML while the current
 * source is broken, or fails on a page the same command is about to create. Only
 * the post-build pass sets CHECK_BUILT.
 */
export const CHECK_BUILT = !!process.env.CHECK_BUILT && existsSync(DIST);

/** Every doc in the corpus, parsed once. */
export function collectDocs(): Doc[] {
  const out: Doc[] = [];
  for (const dir of COLLECTIONS) {
    const d = join(DOCS, dir);
    if (!existsSync(d)) continue;
    for (const f of readdirSync(d)) {
      if (!f.endsWith(".mdx") && !f.endsWith(".md")) continue;
      out.push(parseMdx(`${dir}/${f}`, readFileSync(join(d, f), "utf8")));
    }
  }
  return out;
}

/** Source text for a slug like "guides/foo", trying .mdx then .md. */
/**
 * Every built page, as DIST-relative paths ending in index.html.
 *
 * Deliberately a portable fs walk rather than shelling out. The first version
 * of the caller ran `rg --files dist`, which is fine on the dev box and dies on
 * the CI runner with `Executable not found in $PATH: "rg"` - ripgrep is not
 * part of the Actions image. A canary proved that check discriminated, but a
 * canary runs in the same environment as the check, so it cannot see a
 * toolchain assumption.
 *
 * The site homepage is "index.html" with no directory prefix; collectDocs()
 * does not return it, so callers comparing against the doc count must exclude
 * it.
 */
export function builtPages(): string[] {
  if (!existsSync(DIST)) return [];
  return (readdirSync(DIST, { recursive: true }) as string[])
    .map(String)
    .filter((p) => p === "index.html" || p.endsWith(`${sep}index.html`));
}

export function readSource(slug: string): { path: string; text: string } | undefined {
  for (const ext of [".mdx", ".md"]) {
    const p = join(DOCS, `${slug}${ext}`);
    if (existsSync(p)) return { path: p, text: readFileSync(p, "utf8") };
  }
  return undefined;
}

/** Built page path for a slug or a doc path (extension optional). */
export function builtPath(slugOrDocPath: string): string {
  return join(DIST, `${slugOrDocPath.replace(/\.(mdx|md)$/, "")}/index.html`);
}

/**
 * Built HTML for a slug, or undefined when it was not built. Returns undefined
 * unless CHECK_BUILT, so callers cannot accidentally read a stale build.
 */
export function readBuilt(slugOrDocPath: string): string | undefined {
  if (!CHECK_BUILT) return undefined;
  const p = builtPath(slugOrDocPath);
  return existsSync(p) ? readFileSync(p, "utf8") : undefined;
}
