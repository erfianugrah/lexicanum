# Fact-check: commit 3ec4737 (lexicanum#24)

Provenance: all commit dates cited below (2025-07-01, 2025-12-17, 2026-02-17, 2026-06-09, 2026-08-03, 2026-10-15, 2026-10-27) are from `gh api repos/supabase/supabase/commits` output received this session - confirmed as present in session tool output.

Commit: `3ec4737` - "docs(privatelink): track the live Supabase guide"
Files: `reference/supabase-aws-privatelink.mdx`, `guides/supabase-aws-privatelink-tofu.mdx`

## Sources checked

| Source | URL | Version |
|--------|-----|---------|
| Live guide (HEAD) | https://raw.githubusercontent.com/supabase/supabase/master/apps/docs/content/guides/platform/privatelink.mdx | master @ 2026-10-30 |
| Guide @ 09f80f5 | https://raw.githubusercontent.com/supabase/supabase/09f80f5/apps/docs/content/guides/platform/privatelink.mdx | 2026-10-15 ("reference the ability to use custom dns from VPCE") |
| Guide @ 038e68b diff | gh api repos/supabase/supabase/commits/038e68b | 2026-10-27 ("unify pooler guidance") |
| Guide @ b17a33f | https://raw.githubusercontent.com/supabase/supabase/b17a33f/apps/docs/content/guides/platform/privatelink.mdx | 2026-08-03 ("cleanup privatelink documentation") |
| Guide @ 48b372d | https://raw.githubusercontent.com/supabase/supabase/48b372d/apps/docs/content/guides/platform/privatelink.mdx | 2025-12-17 ("Feature/private link" - original) |
| Guide @ 972b477 | https://raw.githubusercontent.com/supabase/supabase/972b477/apps/docs/content/guides/platform/privatelink.mdx | 2025-07-01 ("privatelink feature" - alpha) |
| Features page | https://supabase.com/features/privatelink | 2026-10-30 (live) |
| Read replicas doc | https://supabase.com/docs/guides/platform/read-replicas | 2026-10-30 (live) |
| Lexicanum corpus | `rg` across ~/lexicanum/src/content/docs | HEAD @ 3ec4737 |
| Git log (guide) | gh api repos/supabase/supabase/commits?path=...privatelink.mdx | 30 commits, 2025-07 to 2026-10 |

## Findings table

### Claim (a) - Read replicas now self-serve

**What the commit says:** "The Add connection form takes the primary or a specific replica, every database needs its own connection, and View connection shows the resource configuration ID and share ARN. Previously the guide said to go through the account rep."

**Evidence:**
- Live guide Step 1: "Select the database: the primary database or a specific read replica"; "Each database, whether the primary or a read replica, needs its own connection"; "Select View connection to see the VPC Lattice resource configuration ID and ARNs"
- Old guide (b17a33f, 2026-08-03): admonition "Contact support if you would like to create a PrivateLink connection for a read-only replica." + Limitations "Read Replicas: To establish PrivateLink with a Read Replica, reach out to your account rep."
- Original (48b372d, 2025-12-17): admonition "Contact support if you would like to create a PrivateLink connection for a read-only replica." + Limitations "Read Replicas: PrivateLink does not currently support read replicas"
- Alpha original (972b477, 2025-07-01): "PrivateLink is currently in alpha and available exclusively to Enterprise customers. Contact your account manager."

**Transition:** Added in 09f80f5 (2026-10-15), which introduced the "Add connection" flow with database selector, View connection details, and per-database connection model.

**Verdict: CONFIRMED.** "Account rep" wording is directly from b17a33f Limitations; the self-serve flow appeared 2026-10-15.

---

### Claim (b) - Restrict all access step, previously "contact support to disable public connectivity"

**What the commit says:** "The guide's optional last step is now enabling 'Restrict all access' under Network Restrictions; previously it said 'contact support to disable public connectivity'."

**Evidence:**
- Live guide Step 7: "In Network Restrictions, enable Restrict all access"
- Original guide (48b372d, 2025-12-17) Step 7: "Disable public connectivity (optional): 1. Contact Supabase support to disable public connectivity"
- Intermediate (b17a33f, 2026-08-03): NO Step 7 at all - the section was removed during the cleanup

**Transition:** 48b372d: "Contact Supabase support to disable public connectivity" -> b17a33f: removed entirely -> 09f80f5 (2026-10-15): "enable Restrict all access"

**Verdict: CONFIRMED.** The original guide verbatim said "Contact Supabase support to disable public connectivity."

---

### Claim (c) - Private DNS name db.<ref>.privatelink.supabase.co

**What the commit says:** "The guide offers an optional private DNS name on the endpoint, db.<ref>.privatelink.supabase.co, resolving to the endpoint only inside the VPC. The page marks it untested and says verify-full against it is unverified because the cert measured in 2026-08 carried only db.<ref>.supabase.co."

**Evidence:**
- Live guide Step 4 Option A item 10: "Optionally, select **Enable private DNS name** to use a Supabase hostname instead of the endpoint DNS name. The private DNS name is `db.[project_ref].privatelink.supabase.co`. It resolves only to the endpoint from within the selected VPC."
- Old guide (b17a33f, 2026-08-03) Step 4 Option A item 8: "Enable the **Enable DNS name** option if you want to use a DNS record instead of the endpoints IP address(es)" - VPCE DNS only, no privatelink.supabase.co
- Added in 09f80f5 (2026-10-15), commit message "reference the ability to use custom dns from VPCE"

**Lexicanum caveat accuracy:** The page correctly states it's untested and the cert concern is noted as a caveat, not a claim about the guide. The DNS name format is verified correct.

**Verdict: CONFIRMED.** DNS name format matches guide exactly.

---

### Claim (d) - SG step lists both 5432 and 6543; previously only 5432

**What the commit says:** "The security-group step now lists both 5432 and 6543; previously only 5432." The tofu guide: "The official walkthrough showed 5432 only when this was built (it lists both since; read 2026-10-30)."

**Evidence:**
- Live guide Step 3: "Direct connection: Postgres (TCP, port 5432) - Dedicated pooler connection: Custom TCP (port 6543) - If you use both direct and dedicated pooler connections, add both rules"
- Original guide (48b372d, 2025-12-17) Step 3: ONLY "Postgres (TCP, port 5432)" - no PgBouncer port
- Intermediate (b17a33f, 2026-08-03): ALREADY had both - "Direct connection: Postgres (TCP, port 5432) - PgBouncer connection: Custom TCP (port 6543)"

**Timing:** The 5432-to-both transition happened in the b17a33f cleanup (committed 2026-08-03). The lexicanum page's measurements were done around August 2026 (cert dates in page). If the measurement was done against a guide version predating b17a33f, the "showed 5432 only when this was built" is accurate.

**Residual inconsistency - Gotchas section (tofu guide line 317):** The commit updated Step 4 from present-tense "shows 5432 only" to past-tense "showed 5432 only when this was built (it lists both since)", but left the Gotchas and lessons learned section at line 317 in present tense: "**SG 5432-only walkthrough.** The guide's SG step opens 5432 only, but the endpoint also serves PgBouncer on 6543."

**Verdict: CONFIRMED** (original guide was 5432-only). **But:** the Gotchas section (tofu line 317) is stale - still present-tense "opens" while Step 4 was corrected to past-tense. This is an internal inconsistency in the commit.

---

### Claim (e) - 12-hour share expiry

**What the commit says:** "The RAM resource share expires if not accepted within 12 hours, after which the connection must be recreated."

**Evidence:**
- Live guide Step 1: "You must accept the resource share within 12 hours, or the request expires and can no longer be accepted in AWS. You'll need to create a new connection to try again."
- Old guide (b17a33f, 2026-08-03): No mention of any expiry window
- Original (48b372d, 2025-12-17): No mention of expiry
- Added in 09f80f5 (2026-10-15)

**Verdict: CONFIRMED.** The 12-hour figure and recreate-after-expiry requirement match the guide verbatim.

---

### Claim (f) - Features page still labels PrivateLink Beta

**What the commit says:** "PrivateLink is labelled 'Stage: Beta' on the features page, though the setup guide no longer carries a beta label."

**Evidence:**
- Features page (live): "PrivateLink is currently in Beta with some constraints" - says "Beta" but does NOT say "Stage: Beta"
- Guide beta label removal: Original (972b477): "currently in alpha...". 48b372d: "currently in beta and available only to Team and Enterprise customers". b17a33f (2026-08-03): removed entirely, now just "available only to Team and Enterprise customers". Live: same.
- d1ac14c (2026-02-17, from git log): "privatelink is in beta not alpha" - confirms the alpha->beta transition

**Verdict: OVERSTATED - wording imprecision, substance correct.** The features page does label PrivateLink as Beta (confirmed), but the exact phrase "Stage: Beta" does not appear on the features page. The features page says "currently in Beta". The two lexicanum pages quote "Stage: Beta" as if it's a literal label:

- `reference/supabase-aws-privatelink.mdx:277`: "labelled 'Stage: Beta' on the features page"
- `guides/supabase-aws-privatelink-tofu.mdx:13`: "still labelled 'Stage: Beta' on the features page"

The guide no longer carrying a beta label is confirmed.

---

## Counter-evidence

### 1. Gotchas section stale (tofu guide, line 317)

The Gotchas entry "**SG 5432-only walkthrough**" at line 317 remained in present tense after the commit:

```
- **SG 5432-only walkthrough.** The guide's SG step opens 5432 only, but the endpoint also serves PgBouncer on 6543.
```

Compare with the updated Step 4 (line 144):

```
The official walkthrough showed 5432 only when this was built (it lists both since; read 2026-10-30);
```

The Gotchas entry should be updated to match. It now reads as a current claim about the guide when the guide has listed both ports since at least 2026-08-03.

**Correction:** Change "opens 5432 only" to "opened 5432 only (the guide lists both since; read 2026-10-30)".

### 2. "Stage: Beta" is not the literal label

The features page (https://supabase.com/features/privatelink) says "PrivateLink is currently in Beta", not "Stage: Beta". The two lexicanum pages quote "Stage: Beta" as a literal label:

- `reference/supabase-aws-privatelink.mdx:277`
- `guides/supabase-aws-privatelink-tofu.mdx:13`

The third reference (`supabase-data-surface-lockdown.mdx:116`) correctly says just "Beta" without "Stage:".

**Correction:** Drop "Stage:" from the quoted label, or use a paraphrase without quotes. The substance is correct - the features page does say Beta.

### 3. SG transition timing nuance (minor)

The commit says the guide "previously only 5432" which is correct for the original guide (48b372d, 2025-12-17). However, the transition to both ports happened by b17a33f (2026-08-03), which predates the lexicanum build period (August 2026, per cert dates). The updated text already handles this correctly with "when this was built" / "when this was measured" qualifiers, so no correction needed - but the Gotchas residual (item 1 above) undermines this.

### 4. Regional exclusion unverifiable

The tofu guide (line 13) says "it previously excluded `eu-central-2`". The guide's commit history shows:
- 871e554 (2026-06-09, from git log): "fix(docs): Delete regional availability details for PrivateLink (#46774)"
- The commit's full diff is not accessible by SHA (branch likely squashed/deleted)

The commit message confirms regional availability details existed and were deleted, but the specific `eu-central-2` exclusion cannot be verified against the source. Marked unverifiable.

## Summary

| Claim | Verdict |
|-------|---------|
| (a) Read replicas self-serve | CONFIRMED |
| (b) "Restrict all access" replaced "contact support to disable" | CONFIRMED |
| (c) Private DNS name `db.<ref>.privatelink.supabase.co` | CONFIRMED |
| (d) SG now lists both 5432 and 6543; previously only 5432 | CONFIRMED (but Gotchas stale) |
| (e) 12-hour RAM share expiry | CONFIRMED |
| (f) Features page still labels PrivateLink Beta | OVERSTATED ("Stage: Beta" vs "currently in Beta") |

Two actionable corrections needed within the commit's scope (in the lexicanum files, not the guide):
1. Tofu guide Gotchas line 317 - update "opens 5432 only" to past tense
2. Both pages - replace "Stage: Beta" with accurate wording matching the features page ("currently in Beta" or just "Beta")