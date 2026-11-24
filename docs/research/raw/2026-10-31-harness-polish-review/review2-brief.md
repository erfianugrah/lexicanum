# Second adversarial review

Repo: ~/lexicanum (main, commit bcfc8a9). READ-ONLY everywhere: do not edit, stage or commit anything.
The commit 35cf98c..bcfc8a9 rewrote agent-harness doc pages (presentation, diagrams, AI-prose cleanup)
and also changed facts. A first review pass by a small model found almost nothing, which is not
credible for ~2,000 changed lines written by agents. Assume the diff contains fabricated or wrongly
"corrected" facts, and find them.

For each assigned file: `git -C ~/lexicanum diff 35cf98c bcfc8a9 -- <file>`.

1. Every ADDED or CHANGED factual claim (number, date, count, file:line reference, config value,
   flag, default, behaviour statement, quoted code): open the cited or implied source and confirm.
   Sources: <harness repo> (.pi/agent/extensions, .pi/agent/extensions/lib, .pi/agent/skills,
   .pi/agent/prompts, .claude/, .config/git/hooks, bin/, docs/plans, docs/research, git log),
   <forgejo stack repo>, <llmc repo>, <knowledge-graph repo>, <resume repo>. file:line refs must
   point at the right line in the CURRENT file. Never read .env or sops-encrypted files; never print
   secret values.
2. Every DELETED claim: was it actually wrong/unverifiable, or was a true, load-bearing fact lost?
   Search the source before accepting a deletion.
3. Diagrams (```dot fences): do nodes and edges match the prose and the source? Render with
   `dot -Tsvg` if needed.
4. Internal consistency: does the page now contradict itself or another series page (the hub is
   src/content/docs/reference/pi-harness-journey.mdx)?
5. Leaks: hostnames under erfi.io / servarr.io / servarr.dev / lab.erfi.io or IPs that appear in no
   other doc (`rg -l -F '<x>' src/content/docs`), /home paths, named people, employer or customer
   names.
6. Remaining AI prose tells: negative parallelism, colon-headline label stamps, participle tails
   that restate, decorative bold, moralising closers, rhythm triplets, "quietly"/"the catch"/
   "worth noting"/"crucially".

Final message: per file, a table: line (in bcfc8a9) | claim | verdict (WRONG / LOST / UNSUPPORTED /
INCONSISTENT / LEAK / TELL) | evidence (file:line or command + output excerpt) | corrected text.
List problems only, then one line with the number of claims you checked and found OK. Do not pad
with OK rows. If a check could not be done, say which and why.
Do NOT edit files. Do NOT dispatch further subagents - execute the checks yourself. Your final
message must contain the findings, not a plan.
