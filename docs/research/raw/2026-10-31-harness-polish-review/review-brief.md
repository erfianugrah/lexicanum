# Adversarial review brief (lexicanum#57)

Worktree: ~/lexicanum/.worktrees/57-harness-polish. READ-ONLY: do not edit any file anywhere.
Writers just did an edit pass on agent-harness doc pages (presentation, diagrams, AI-slop removal,
voice). Writer drafts are known to invent numbers, dates, counts and code excerpts, and to "correct"
facts wrongly. Assume the diff contains fabrications and find them.

For each assigned file, run `git -C ~/lexicanum/.worktrees/57-harness-polish diff HEAD -- <file>`
and examine every ADDED or CHANGED claim (numbers, dates, counts, file:line refs, config values,
behaviour statements, quoted strings). Check each against the source:
- harness source: ~/dotfiles (.pi/agent/extensions, .pi/agent/extensions/lib, .pi/agent/skills,
  .pi/agent/prompts, .claude/, .config/git/hooks, docs/plans, docs/research, bin/, git log)
- other repos named in the page (e.g. ~/infra/forgejo-compose, ~/infra/ai/llmc, ~/infra/mnemosyne,
  ~/infra/resume) - read-only. Never read .env or sops files; never print secrets.
Also check: a fact the writer DELETED as "unverifiable" or "wrong" that is actually true and
load-bearing (search the source for it).

Also flag, with line numbers:
- leaks: hostnames under erfi.io/servarr.io/servarr.dev/lab.erfi.io or IPs not already elsewhere in
  src/content/docs (check with `rg -l -F '<x>' src/content/docs`), /home paths, named people,
  employer/customer names, quoted blocked/canary terms.
- remaining AI tells: negative parallelism, colon-headline label stamps, participle tails that
  restate, decorative bold, moralising closers, "worth noting"/"crucially"/"quietly"/"the catch".
- diagrams whose content contradicts the prose or the source.

Final message: a table per file - line | claim | verdict (OK / WRONG / UNSUPPORTED / LEAK / TELL) |
source file:line or command that shows it. List only problems plus a one-line count of claims
checked OK. Be concrete: give the corrected text for each WRONG item.
Do NOT edit files. Do NOT dispatch further subagents. Your final message must contain findings, not a plan.
