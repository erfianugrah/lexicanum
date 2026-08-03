#!/usr/bin/env python3
"""Emit 'claim<TAB>expect<TAB>must_appear' per row from a doc's `evidence:`
frontmatter block, plus a leading 'lab<TAB><lab>' line.

Hand-parses the block rather than pulling in a YAML dependency: the shape is
fixed by the zod schema in src/content.config.ts, and the harness must run on a
bare CI runner. Single-quoted scalars are the norm here because must_appear
carries literals like \\$10/month that a double-quoted scalar would reject.
"""
import re, sys

def unquote(v: str) -> str:
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] == "'":
        return v[1:-1].replace("''", "'")
    if len(v) >= 2 and v[0] == v[-1] == '"':
        return v[1:-1].replace('\\"', '"')
    return v

src = open(sys.argv[1], encoding="utf-8").read()
m = re.match(r"^---\n(.*?\n)---\n", src, re.S)
if not m:
    sys.exit(0)
fm = m.group(1)
blk = re.search(r"^evidence:\n(.*?)(?=^\S|\Z)", fm, re.S | re.M)
if not blk:
    sys.exit(0)
body = blk.group(1)

lab = re.search(r"^\s+lab:\s*(.+)$", body, re.M)
if lab:
    print("lab\t" + unquote(lab.group(1)))

rows, cur = [], None
for line in body.splitlines():
    if re.match(r"^\s*-\s*claim:", line):
        if cur:
            rows.append(cur)
        cur = {"claim": unquote(line.split(":", 1)[1]), "expect": "empirically-proven", "must_appear": ""}
    elif cur is not None:
        k = re.match(r"^\s+(must_appear|expect):\s*(.*)$", line)
        if k:
            cur[k.group(1)] = unquote(k.group(2))
if cur:
    rows.append(cur)

for r in rows:
    print("{claim}\t{expect}\t{must_appear}".format(**r))
