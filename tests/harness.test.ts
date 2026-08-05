/**
 * Checks about the checks.
 *
 * Two failures got through not because a check was wrong but because of where
 * it lived: `verify:docs:links` existed for months with nothing calling it, so
 * a citation 404'd unnoticed; and a dist walk shelled out to ripgrep, which the
 * dev box has and the Actions runner does not, so the check reported "nothing
 * to check" instead of failing.
 *
 * Both are structural and both are cheap to assert, which is the whole case for
 * this file. It stops here: a harness that spends more effort verifying itself
 * than the corpus it guards has inverted its purpose.
 */
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { ROOT } from "./lib/corpus";

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};

describe("every check has a trigger", () => {
  const WORKFLOWS = join(ROOT, ".github/workflows");
  const workflows = existsSync(WORKFLOWS)
    ? readdirSync(WORKFLOWS)
        .filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"))
        .map((f) => readFileSync(join(WORKFLOWS, f), "utf8"))
    : [];

  const checks = Object.keys(pkg.scripts).filter((n) => /^(verify|check)(:|$)/.test(n));

  test("the corpus of checks is non-empty", () => {
    expect(checks.length).toBeGreaterThan(0);
    expect(workflows.length).toBeGreaterThan(0);
  });

  test.each(checks)("%s is invoked somewhere", (name) => {
    // A check nobody runs is an intention, and intentions do not fail. Either
    // `bun run build` calls it - so it gates every deploy - or a workflow does,
    // on a schedule or an event. Inlining the command into `build` instead of
    // calling the script by name defeats this, which is why `build` runs
    // `bun run verify:docs` rather than repeating its body.
    // The negative lookahead is load-bearing: a plain substring test for
    // "run verify:docs" is satisfied by "run verify:docs:links", which would
    // report the orphan as triggered by the workflow that runs its sibling.
    const call = new RegExp(`run ${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![:\\w-])`);
    const inBuild = call.test(pkg.scripts.build ?? "");
    const inWorkflow = workflows.some((w) => call.test(w));
    expect(inBuild || inWorkflow ? [] : [`${name} is defined but never invoked`]).toEqual([]);
  });
});

describe("no test shells out", () => {
  /**
   * Spawning a process makes a test depend on the machine it runs on. The dist
   * walk that did it passed here and died on the runner, and its canary could
   * not see the problem because the canary ran on the same machine.
   *
   * Node's fs covers everything this suite needs, so the ban is absolute and
   * the exemptions are for files that mention a token without calling one.
   */
  const TOKENS = [
    /\bspawnSync\b/,
    /\bexecSync\b/,
    /\bexecFileSync\b/,
    /\bexecFile\b/,
    /\bBun\.spawn\w*/,
    /\bBun\.\$/,
    /node:child_process/,
    /from ["']bun["']/,
  ];

  /** file (tests/-relative) -> why it is allowed to name a token. */
  const EXEMPT = new Map<string, string>([["harness.test.ts", "names the tokens in order to ban them"]]);

  // Normalised to forward slashes so an exemption key reads the same on every
  // platform as it does in this file.
  const files = (readdirSync(join(ROOT, "tests"), { recursive: true }) as string[])
    .map((p) => String(p).split(sep).join("/"))
    .filter((p) => p.endsWith(".ts"));

  test("the file walk found the suite", () => {
    expect(files.length).toBeGreaterThan(3);
  });

  test.each(files.filter((f) => !EXEMPT.has(f)))("%s uses fs, not a subprocess", (f) => {
    const text = readFileSync(join(ROOT, "tests", f), "utf8");
    expect(TOKENS.filter((re) => re.test(text)).map((re) => re.source)).toEqual([]);
  });

  test("no exemption is stale", () => {
    // An exempt file that no longer names a token is the defect, same as a
    // grandfathered doc that has gone clean.
    const stale = [...EXEMPT.keys()].filter((f) => {
      const p = join(ROOT, "tests", f);
      if (!existsSync(p)) return true;
      const text = readFileSync(p, "utf8");
      return !TOKENS.some((re) => re.test(text));
    });
    expect(stale).toEqual([]);
  });
});
