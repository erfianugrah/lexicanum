The four pages need corrections. I found 20 problems. Each pass made the pages tidier but carried forward several claims that were already stale or wrong at 35cf98c. It also added one new error: a hooks table for pi. And it created a few inconsistencies between pages that agree with neither each other nor the code. Line numbers are for bcfc8a9. I edited nothing.

## src/content/docs/reference/agent-guard-extensions.mdx

| line | claim | verdict | evidence | corrected text |
|---|---|---|---|---|
| 30, 97 | "pi's `tool_call` hook can only block" | WRONG (already at 35cf98c, kept) | `/opt/pi-coding-agent/docs/extensions.md:218` says `tool_call` "can mutate input or block". `.pi/agent/extensions/ascii-punctuation-guard.ts:9-20` (harness commit, 2026-10-23) says payloads are "AUTO-REWRITTEN in place instead of blocked. pi's tool_call hook can mutate event.input" | "pi's `tool_call` hook can block a call or rewrite its input in place; the first block short-circuits the other handlers, so block reasons say how to resubmit." Line 97: "pi's `tool_call` hook can block or mutate `event.input`; the ASCII guard rewrites write/edit payloads in place, and the other guards block." |
| 32 | `ascii-punctuation-guard` blocks the punctuation | WRONG (stale) | Same source: write/edit/write_stream/apply_patch payloads are rewritten, and only bash commands still block | "...`ai-tell-guard` blocks the sentence shapes; `ascii-punctuation-guard` folds smart punctuation to ASCII in write payloads and blocks it in write-ish bash." |
| 228-233 | "The `tool_call` hook blocks a write/edit/write_stream/apply_patch payload ... and the agent resubmits" | WRONG (stale since 2026-10-23) | `ascii-punctuation-guard.ts:9-20` and `:97-98` (`input.content = foldToAscii(...)`). A one-line note goes on `tool_result` (`:61`). `edit` oldText and apply_patch context lines are never rewritten | "Since 2026-10-23 a write/edit/write_stream/apply_patch payload is rewritten in place to ASCII and runs, with a one-line note on the tool result naming what changed; `edit` oldText and patch context lines are never rewritten. A write-ish bash command (commit, heredoc, `tee`, append) is still blocked, because folding a shell string can change what it does." |
| 83-94 | New "Hook (pi)" column lists only `tool_call` for several guards | WRONG (new in this diff) | `rg 'pi\.on\("' <ext>.ts` gives: ascii `tool_call`,`tool_result`; confidential-write `input`,`tool_call`,`tool_result`; tool-guard `session_start`,`session_shutdown`,`agent_end`,`input`,`tool_call`,`tool_result`; cd-agents-reload `tool_call`,`tool_result`; epistemic also `session_shutdown`. The page itself says the taint store is fed from input and tool results (284-287) and that cd-agents-reload attaches its text to the result (518) | ascii: `tool_call`, `tool_result`. confidential-write-guard: `input`, `tool_call`, `tool_result`. tool-guard: `tool_call`, `tool_result`, `input`, session events. cd-agents-reload: `tool_call`, `tool_result`. epistemic-guard: `tool_call`, `message_end`, `session_shutdown`. |
| 337 | Gated tier includes "branch and tag deletion" | WRONG (already there, recast into the table) | `lib/git-gh-gate-core.ts:739-740`: `case "branch": return !long("--force") && !sh("D","f")`, so `git branch -d` is routine. `git apply` is routine too (`:727`) and is not listed | Routine row: add "non-forced `branch -d`, `apply`". Gated row: "forced branch deletion (`-D`, `--force`), tag deletion". |
| 339, 342-368 | "Always blocked: any mutating git/gh command inside `bg_bash`". The new diagram (`bg -> bypass -> routine`) and its 4-step list have no worker branch | WRONG / INCONSISTENT | `git-gh-gate.ts:136-147`: `if (!ctx.hasUI) { ... block: true, "Mutating git/gh is main-session only" }` sits before the tier check (harness commit, 2026-10-20). agent-git-without-prompts lines 145, 156-171 and 263-268 and agent-subagents-and-worktrees line 214 all describe this block | Table: "Always blocked: any mutating git/gh command in `bg_bash`, or in a session with no UI (`pi -p` subagents, bg workers, loop agents; 2026-10-20)". Diagram: add a `ui [label="session has a UI?"]` node after `bg`, with `no -> blocked`, and add step "2. A mutating command in a session with no UI is blocked." |
| 627 | Related doc "lets guarded mutations run in their own trees" | INCONSISTENT (already there) | Workers cannot mutate git (`git-gh-gate.ts:136-147`). agent-subagents-and-worktrees line 214 says the main session commits, merges and pushes. The link label does not match the real title "Subagents, worktrees, and parallel agent work" | "- [Subagents, worktrees, and parallel agent work](/reference/agent-subagents-and-worktrees/): workers edit files in a worktree the main session created; only the main session commits, merges and pushes." |
| 625, 629 | Link labels "Why approval prompts became gates" and "Context and the prompt cache: how the harness feeds the LLM" | INCONSISTENT (already there) | Real titles: "Running agent git commands without per-command approval prompts" and "Context, prompt cache, and compaction in a coding-agent harness" | Use the real titles. |
| 290-292 | Taint blocks "a write or commit into a repo with a GitHub, GitLab or Codeberg remote" | WRONG (stale since 2026-10-20, kept) | `lib/confidential-write-guard-core.ts:307-319`: `isPublicMirrored()` uses the visibility cache (`isPublicTarget`); a known-private GitHub repo is not public | "...into a repo whose content reaches a public forge (per the visibility cache; an unknown GitHub/GitLab/Codeberg remote, or any such remote with no fresh cache, counts as public)..." |
| 588-593 | The research-raw `scripts/` directory holds the scripts that "run each recorded bash command through the same `classifyBashCommand`" | UNSUPPORTED (already there) | The directory holds only `README.md`, `bash-failures.py`, `guard-blocks.py`, `nudge-and-ssh.py` and `rerun-after-block.py`; `rg -l classifyBashCommand` matches only README.md. The README says only that "the gate replays used the live cores" | "The baseline scripts live in ... `scripts/`; the gate replays ran each recorded bash command through the live `classifyBashCommand` cores, and that replay harness is not committed there." |

## src/content/docs/reference/agent-git-without-prompts.mdx

| line | claim | verdict | evidence | corrected text |
|---|---|---|---|---|
| 119, 130, 291 | The confidential-write guard blocks "sensitive files" or "sensitive filenames" at write time | WRONG (kept in the new diagram, list and bullet) | `rg -l kdbx` over extensions, `.claude/hooks` and `.config/git/hooks` matches only `lib/prepush-gate-core.ts:56-63` (`SENSITIVE_FILE`). `confidential-write-guard.ts` and its core have no filename check. The only `.env` write rule is tool-guard `edit_dotenv` (`lib/tool-guard-core.ts:846-849`), and it is a vault-drift warning | Node: `"confidential-write guard\n(file write: blocked terms, taint)"`. Line 130: "...blocks blocked terms and, in public-mirrored repos, tainted identifiers at write time...". Line 291: "...screens every write for blocked terms and tainted identifiers; sensitive filenames are first checked by the pre-push gate." |
| 11, 184, 281 | The audit log records "every auto-allowed command" | WRONG (stale since 2026-10-26) | the harness commit "audit every mutating git/gh decision, not only auto-allows". `lib/git-tier-runtime.ts:86-96` writes a `decision` field; `git-gh-gate.ts:118,140` logs `blocked` and `auto` and the prompt path logs `approved`/`denied`. The hub (pi-harness-journey line 75) already says "every decision is written to an audit log" | "Every mutating git/gh decision (auto, approved, denied, blocked) is appended to an audit log with a timestamp, harness name, session id, working directory, the command and the decision." Table: "Audit log \| Every mutating git/gh decision \| ... plus `decision`". |
| 25, 301 | Replay "blocked 14 pushes" / "14 blocked pushes" | WRONG / INCONSISTENT with 308 ("14 of 909 commits") | The replay scans commit by commit and pushes nothing: `.config/git/hooks/lib/prepush-gate.ts:114-119` (`--replay`, `commits: [c]`). The harness commit body says "Blocking findings on that replay: 14 (1.5%)" | "...a replay of 909 commits across 6 public repos produced 14 blocks..." Table cell: "14 blocks". |
| 156-176 | Decision diagram: only "session has a UI? no -> blocked" | INCONSISTENT with table line 145 | `git-gh-gate.ts:111-124` blocks mutating git in `bg_bash` even in a UI session | Add `bgb [label="bg_bash?"]` before `ui`, with `yes -> blocked`, and list step "2. A mutating command in `bg_bash`, or in a session with no UI, is blocked." |
| 224 | The review "sends the added lines" | WRONG (partial) | `lib/prepush-llm-core.ts:24-25` sends commit message lines (`[msg sha]`) as well as added lines. The guide's own line 378 says the hook scans each commit's message too | "...sends the commit messages and added lines to that model..." |
| 190 | "flagged 128 local repos as public, and only 12 of them were" | UNSUPPORTED (already there) | Research `00-baseline-and-constraints.md:33`: "128 local repos have a GitHub remote; only 12 GitHub repos are public". That counts all public GitHub repos, not public repos among the 128. agent-leak-gates line 73 words it correctly | "That flagged 128 local repos as public, while only 12 GitHub repos were public." |
| 335 | "the six guards that run alongside the git gate" | INCONSISTENT (already there) | agent-guard-extensions lines 12 and 568: "nine guards" | "...the nine guards, the git gate among them" |
| 302-306 (deleted) | Old item "GitHub push protection ... limited to high-confidence patterns ... needs a GHAS license for private repos" was cut | LOST (minor) | `docs/research/raw/2026-10-20-agent-command-git-safety/02-leak-prevention.md:310`: "Only high-confidence patterns, needs GHAS for private repos" | Append to line 258: "It covers only GitHub's high-confidence secret patterns." |

## src/content/docs/reference/agent-secret-guard.mdx

| line | claim | verdict | evidence | corrected text |
|---|---|---|---|---|
| 39-40 (TL;DR) | Deleted "Every running container on a host is one ssh round trip." | LOST | `<secretctl repo>/README.md:166`: `docker:servarr/*#*   # every running container on servarr, one ssh`. No other line in the page says this | "...returns digests only; every running container on a host costs one ssh round trip." |
| 430-432 | A missing digest cache means both hooks run without the known-value layer "with no notice" | INCONSISTENT (already there) | Lines 440-446 on the same page: since 2026-09-29 both guards warn ("known-value layer OFF (cache missing)") | "...both hooks run without the known-value layer; the cache-health warning (Known issues) is the only signal." |

## src/content/docs/guides/agent-leak-gates.mdx

| line | claim | verdict | evidence | corrected text |
|---|---|---|---|---|
| 305 | "the gate prints \"LLM review skipped\"" | WRONG (quoted output, rephrased in this diff) | `rg -i 'review skipped' .config/git/hooks/` matches nothing. `.config/git/hooks/lib/prepush-gate.ts:171-174` prints `pre-push[llm-review]: skipped (<detail>)`, plus `warning - N term(s) seen in internal sources ... were not reviewed` | "...the gate prints `pre-push[llm-review]: skipped (no model loaded ...)` and relies on the deterministic scanners, with a warning when tainted terms went unreviewed." |
| 23 | The GitHub push protection row has Blocked terms "closed (against GitHub's own pattern set)" | UNSUPPORTED (already there) | Push protection matches secret patterns only; the plan and research describe no blocked-term list on GitHub (`02-leak-prevention.md:187-193,310`) | Blocked terms cell: "no". |
| 18 | Constants table, bash fallback "open (tool missing = warn)" | WRONG (already there, minor) | `.config/git/hooks/pre-push:143`: `command -v gitleaks` silently skips the gitleaks pass; no warning is printed | "open (gitleaks missing = silently skipped)" |

Checked and found OK, about 70 claims. They include:
- The 590 commits across 4 repos figure (`prepush-gate-core.ts:114`).
- Footnotes `plan-vis` and `plan-measure` (research finding 6; plan status table line 163).
- The 16,000-character cap and the 180 s timeout.
- `[a-z]{20}` refs.
- The blocked-term union for public targets and the lexicanum origin of that change (`confidential-write-guard-core.ts:150-157`).
- Missing gitleaks: blocks a public target, warns on a private one.
- The server gate: 10 repos plus a canary, `-o leak-gate.skip`, 120 s timeout, fails closed, server-own gitleaks config, `git log -p --format` plus `grep -v`.
- `leak-gate-terms-sync` run by hand.
- Push protection on 12 repos.
- The 2026-10-20 worker reversal.
- Session report as a notification on `agent_end`.
- The visibility-cache fallback and the 7-day staleness rule.
- Signing and identity bypass flags.
- Anthropic's 93%, 0.4% FPR on real traffic, 17% FNR on overeager actions, Sonnet 4.6 and the single-token filter (fetched the post).
- 662/317 blocks and 84% identical re-runs.
- epistemic: 160-character window, `MAX_BLOCKS` default 3, no footer without a UI.
- ai-tell: 7 rules, cap 2, prose extensions, slop words.
- cd-agents-reload: 80 lines / 4,000 characters, 751 blocks.
- untrusted-content: 845 results, 4 flagged.
- rm-guard: 171 cases, 29,820 commands, 212 -> 187.
- Kill switches; the core modules and Claude Code ports exist.

Leak check (dated record, 2026-10-31): the only hostname was one that 4 other docs already publish. No `/home` paths, private IPs or names.

Not done: rendering the dot fences with `dot -Tsvg`; I checked diagrams by reading node and edge source only. I did not re-check the pre-existing code excerpts in agent-leak-gates against source line by line, because this diff did not change them.