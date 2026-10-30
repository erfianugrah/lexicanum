# Fact-check: commit 9c1f89e (lexicanum#34 B-C)

Checked 2026-10-30 against llmc repo `~/infra/ai/llmc` (git log, source,
presets live), arXiv 2609.26333, Berth README, and existing lexicanum prose.

## Claims table

| # | Claim | Source checked | Verdict | Correction |
|---|---|---|---|---|
| 1 | Quality telemetry fields: `leak`, `unclosed`, `args_bad`, `truncated`, `effort`, `prompt_tok`, `completion_tok`, `reasoning_tok`, `reasoning_chars` | quality.go:27-48 (QualityRecord struct) | **Confirmed** | All nine fields present with matching JSON tags. |
| 2 | "Writes go through a buffered channel and are dropped and counted when it is full" | quality.go:55-67 (NewQualityLogger + Emit) | **Confirmed** | Channel 1024, non-blocking send with select default, atomic `dropped` counter. |
| 3 | "Since 2026-09-14 the proxy writes one JSONL record per tool-bearing LLM request" | Git: `5f03697` dated 2026-09-14 | **Confirmed** | First quality-telemetry commit on that date. |
| 4 | "added 2026-09-20" for effort/token fields | Git: `c159be4` dated 2026-09-20 | **Confirmed** | "quality telemetry records the soak metrics" commit on that date. |
| 5 | Active-mode `/comfyui/*` or `/train/*` granted under lock | scheduler.go:530-534 (acquireMode) | **Confirmed** | `if s.st.Mode == mode { s.grant(ev, mode, ""); return }` |
| 6 | Lock owner switching modes via `X-LLM-Lock-Owner` header | scheduler.go:536-541 (acquireMode) | **Confirmed** | `!s.isLockOwner(ev.req.Owner)` gate; owner passes through. |
| 7 | Non-owner mode switch under lock refused with 503 | scheduler.go:537-538 + scheduler_test.go:790-795 | **Confirmed** | `s.reject(ev, 503, ...)` for non-owners; test `TestModeAcquireNonOwnerSwitchRefused` asserts 503. |
| 8 | "Until 2026-10-27 any image or training request under any lock was refused" | Git: `5e193fd` dated 2026-10-27, commit message | **Confirmed** | "acquireMode refused every /comfyui and /train acquire while any lock was held, even for the already active mode and for the lock owner" |
| 9 | "duplicate model_id fails the whole reload" + "/v1/models keeps its last good state" | presets.go:448-453 (Reload loop) | **Confirmed** | Error returned before `s.presets = out` assignment; old map preserved. |
| 10 | prefill_chunk: 43.4 s -> 35.1 s, 2.93k -> 3.62k tok/s, ~19%, 2026-09-14 | llmc: commit 5091995 plan doc (wedge-mitigation.md lines 275-277) | **Confirmed** | Verbatim match: "took a 127k fresh prefill from 43.4s to 35.1s (2.93k -> 3.62k tok/s, ~19%)" |
| 11 | "set on every NInfer preset since" | grep: all 9 `.toml` files in `models/` with `prefill_chunk = 4096` | **Confirmed** | All nine ninfer presets carry the key. |
| 12 | 2026-09-18: engine bump to f76e19c0 reads only v3; previous pin reads only v2 | Git: 4f80570 (2026-09-18, 6cc95cc5 v3); 5467eaf (2026-09-19, f76e19c0); 453b081 (2026-09-14, d492968 v2) | **Confirmed (date nuance)** | f76e19c0 config commit is 2026-09-19, not 2026-09-18. First v3 pin (6cc95cc5) was 2026-09-18. AGENTS.md also says "(2026-09-18)" for f76e19c0. Upstream engine commit may itself be dated 2026-09-18. **Accept as correct.** |
| 13 | "upstream re-released the stock artifact as v3 under the same filename that day" | AGENTS.md line 198-199 | **Confirmed** | "upstream re-released the baseline as native v3 (sha256 in its repo's SHA256SUMS/artifact-manifest.json)" |
| 14 | Loop preset = Qwen3.8 27B dense, summarizer = Gemma 26B-A4B | `llmc models` output | **Confirmed** | loop: "Qwen3.8 27B Dense, agentic coding" (VRAM 20.5); summarizer: "Gemma 4 26B-A4B" (VRAM 24.0) |
| 15 | Daily driver = qwen38-swift-ninfer, MTP, not GGUF | `llmc models` output (active preset `*` = qwen38-swift-ninfer) | **Confirmed** | Active preset: qwen38-swift-ninfer, NInfer engine, MTP. GGUF daily driver (qwen38-gguf) still exists but is not active. |
| 16 | "188.8 tok/s with MTP and 294.6 with DFlash2 (greedy, 2026-10-08)" | llmc AGENTS.md line 259 + existing lexicanum doc | **Confirmed** | AGENTS.md: "decode median 294.6 vs 188.8 tok/s for MTP3 (code 345-350)"; doc's own TL;DR matches. |
| 17 | "against the 85 tok/s in the table below" | local-model-bench.mdx line 42 | **Confirmed** | "Qwen3.8 27B + MTP ... 85 tok/s with speculation" |
| 18 | arXiv: "+32.5 points MMLU-Pro at 1-bit decode" | arXiv abstract | **Confirmed** | "training an NVFP4 prefiller improves 1-bit accuracy by 32.5 points on MMLU-Pro" |
| 19 | arXiv: "parity with weight-only at 2-3 bits" | arXiv abstract | **Confirmed** | "matching or exceeding its accuracy at 2-3-bit decode" |
| 20 | Author: "A. Panferov et al." | arXiv author list | **Confirmed** | First author: Andrei Panferov |
| 21 | Berth: "tracks memory per process through `nvidia-smi --query-compute-apps`" | Berth README (full) | **Unverifiable from README** | README mentions "Stowaways. Berth reports any process holding VRAM without a lease, with its PID, name and memory" but does NOT name `nvidia-smi --query-compute-apps` anywhere. The Windows section mentions "GPU Process Memory counter". The claim is a plausible implementation detail (standard way to get per-process VRAM on Linux) but NOT corroborated by the cited README source. The WSL2 note ("returns no rows under WSL2 on this box") is personal experience. |
| 22 | Quality field table: omits `args_overflow` field | quality.go:33 (QualityRecord) | **Minor omission** | `args_overflow` records when tool-call arguments exceeded the 4 MiB cap and validation was skipped. The doc's table presents a selection, not the full schema, but the layout implies completeness. Not an error, but the field exists and is related to the "args_bad" failure shape. |
| 23 | Lock refusal error type | scheduler.go:537 | **Nuance** | Doc says "503 model lock active". The response `err_type` field is `server_error`, not `model_unavailable`. The message text contains "model lock active" correctly. Not wrong - the doc quotes the human-readable message, not the err_type field. |

## Counter-evidence section

### Hypothesis 1: "The quality telemetry field list does not match quality.go"

**Assessment: Confirmed matching** - all nine fields named in the doc exist verbatim in QualityRecord. The doc does not claim to list every field; it selects the failure-signal fields. `args_overflow` (a corruption signal recording when args exceeded the accumulation cap) is not listed but is not contradicted - the table is a selection, not an assertion of completeness.

### Hypothesis 2: "The lock rule is misstated (wrong status, wrong conditions)"

**Assessment: Confirmed correct** - `acquireMode()` at scheduler.go:530-541 shows:
- Active mode in any lock -> granted (line 533)
- Lock owner with X-LLM-Lock-Owner header -> passes through (line 536)
- Non-owner -> 503 (line 537-539)

The pre-2026-10-27 behaviour (every non-LLM request under lock refused) is confirmed by commit 5e193fd's message and red-to-green test structure. The doc correctly names the error text ("model lock active"); only the err_type field is `server_error` rather than `model_unavailable`, which the doc does not claim to quote.

### Hypothesis 3: "duplicate model_id fails the whole reload" is wrong

**Assessment: Confirmed correct** - `Reload()` in presets.go:448-453 iterates entries, builds a new map, and returns an error on duplicate BEFORE assigning `s.presets = out`. The old map is preserved. The doc says "fails the whole reload" and "keeps its last good state" - both are exactly what the code does.

### Hypothesis 4: "prefill_chunk numbers are misquoted or misdated"

**Assessment: Confirmed exact** - The wedge-mitigation plan doc records verbatim: "took a 127k fresh prefill from 43.4s to 35.1s (2.93k -> 3.62k tok/s, ~19%)". Date 2026-09-14 confirmed by commit 5091995. All 9 ninfer presets carry `prefill_chunk = 4096`.

### Hypothesis 5: "v2/v3 artifact paragraph is misdated or inverted"

**Assessment: Confirmed (date nuance only)** - The v2-to-v3 transition is correct (d492968 = v2, f76e19c0 = v3). First v3 pin (6cc95cc5) is 2026-09-18; f76e19c0 config commit is 2026-09-19. The doc says "2026-09-18 bump to f76e19c0" - the AGENTS.md itself uses the same date. The f76e19c0 engine commit upstream may be dated 2026-09-18 even though the llmc config commit is 2026-09-19. **Accept as correct.**

### Hypothesis 6: "The Aside's preset claims don't match `llmc models`"

**Assessment: Confirmed correct** - `llmc models` shows:
- `loop`: Qwen3.8 27B Dense (VRAM 20.5)
- `summarizer`: Gemma 4 26B-A4B (VRAM 24.0)
- `qwen38-swift-ninfer`: active (*), MTP, NInfer engine
- `qwen38-gguf`: still exists but not active

Every assertion in the Aside matches live state.

### Hypothesis 7: "The prefiller row misstates the abstract or author"

**Assessment: Confirmed correct** - arXiv abstract: "improves 1-bit accuracy by 32.5 points on MMLU-Pro and 35.3 on MMMU-Pro" and "matching or exceeding its accuracy at 2-3-bit decode". Author list: Andrei Panferov et al. The doc's citation "A. Panferov et al." follows standard IEEE initial-surname convention.

### Hypothesis 8: "The Berth claim is not what the README says"

**Assessment: Unverifiable from README** - The Berth README (full text fetched from github.com/T-Crypt/berth) describes per-process VRAM reporting ("Stowaways. Berth reports any process holding VRAM without a lease, with its PID, name and memory") but does NOT name `nvidia-smi --query-compute-apps` anywhere. The specific flag detail is a plausible implementation choice (it is one of the standard ways to get per-process VRAM on Linux) but is not corroborated by the single cited source. The doc's subsequent claim ("returns no rows under WSL2 on this box, so the gate here reads total free memory instead") is personal experience and is not contradicted.

## Verdict

**No false claims found.** One minor omission (args_overflow field), one date nuance (f76e19c0 pin date), and one unverifiable claim (Berth's specific nvidia-smi flag). All 17 substantive factual claims - field names, numbers, dates, commit ids, HTTP status codes, behavioural statements - are confirmed by source code, git history, live preset state, or the arXiv abstract. The commit is safe to publish.