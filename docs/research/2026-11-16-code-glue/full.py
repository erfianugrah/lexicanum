# Sweep for a card (inline code glue): every page in dist/sitemap-0.xml at
# 390 and 1280px, with the glue ("fix") and with it disabled ("nofix").
#   stranded       code/punctuation pairs ("(", ")", ",", "..") whose
#                  character sits on a different line than the code
#   glue-overflow  .house-glue spans reaching past their block's content box
#   wrapped-codes  inline codes taller than one line
# Run after `bun run build`, from the repo root:
#   uv run --with playwright python docs/research/2026-11-16-code-glue/full.py chromium
#   uv run --with 'playwright==1.59.0' python docs/research/2026-11-16-code-glue/full.py firefox
# (1.59.0 matches the firefox-1511 build on the dev box.)
# 2026-11-16, final kit (house v0.1.39), 12104 pairs on 190 pages:
#   chromium 390: stranded 12 (nofix 2555), overflow 4, wrapped 4535 (4424)
#   chromium 1280: stranded 2 (nofix 907), overflow 0
#   firefox 390: stranded 10 (nofix 2458), overflow 4, wrapped 3918 (3838)
#   firefox 1280: stranded 1 (nofix 880), overflow 0
# Remaining strands are words over the glue caps, breaking after "/", "-" or
# ":" (one "," at 390). Overflow: 4 table cells at 390px, 6-13px.
import sys, subprocess, time, re, os
from playwright.sync_api import sync_playwright
urls = re.findall(r"<loc>https://erfi.dev/([^<]*)</loc>", open("dist/sitemap-0.xml").read())
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(HERE, "../../.."))
JS = open(os.path.join(HERE, "check.js")).read()
srv = subprocess.Popen([sys.executable, "-m", "http.server", "23998", "-d", "dist"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
engine = sys.argv[1]
try:
  with sync_playwright() as p:
    kw = {}
    b = getattr(p, engine).launch(**kw)
    for mode in ["fix", "nofix"]:
      for w in [390, 1280]:
        pg = b.new_page(viewport={"width": w, "height": 900})
        S = T = O = W = 0; ex = []; oex = []
        for u in urls:
          pg.goto(f"http://127.0.0.1:23998/{u}", wait_until="load")
          if mode == "nofix": pg.add_style_tag(content=".house-glue{white-space:normal!important} .house-glue code{max-width:100%!important;min-width:0!important}")
          r = pg.evaluate(JS)
          S += r["bad"]; T += r["total"]; O += r["over"]; W += r["wrapped"]
          ex += [u + ": " + e for e in r["ex"]]; oex += [u + ": " + e for e in r["oex"]]
        print(engine, mode, w, f"pages {len(urls)} stranded {S}/{T} glue-overflow {O} wrapped-codes {W}", oex[:5]); print("\n".join(ex[:6]), flush=True)
        pg.close()
    b.close()
finally: srv.terminate()
