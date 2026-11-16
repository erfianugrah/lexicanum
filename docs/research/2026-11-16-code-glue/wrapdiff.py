# Which inline codes wrap with the glue but not without it (or the reverse),
# Chromium at 390px, grouped by in-glue / lone-code (--glue set) / container.
# This found the 0.75em-per-character deduction splitting `gw_priority`
# mid-word in narrow table cells (291 codes) before the td min-width rule.
# Run after `bun run build`, from the repo root:
#   uv run --with playwright python docs/research/2026-11-16-code-glue/wrapdiff.py
import sys, subprocess, time, re, os, collections
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(HERE, "../../.."))
urls = re.findall(r"<loc>https://erfi.dev/([^<]*)</loc>", open("dist/sitemap-0.xml").read())
JS = """() => [...document.querySelectorAll('.sl-markdown-content :not(pre) > code')].map(c => {
  const h = c.getBoundingClientRect().height, fs = parseFloat(getComputedStyle(c).fontSize);
  return [h > fs * 2.2, !!c.closest('.house-glue'), !!c.getAttribute('style'), c.closest('td,th') ? 'td' : c.closest('li') ? 'li' : 'p', c.textContent.slice(0, 30)] })"""
srv = subprocess.Popen([sys.executable, "-m", "http.server", "23994", "-d", "dist"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
cat = collections.Counter(); ex = collections.defaultdict(list)
try:
  with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 390, "height": 900})
    for u in urls:
      pg.goto(f"http://127.0.0.1:23994/{u}"); a = pg.evaluate(JS)
      pg.add_style_tag(content=".house-glue{white-space:normal!important} .house-glue code{max-width:100%!important;min-width:0!important}"); n = pg.evaluate(JS)
      for x, y in zip(a, n):
        if x[0] != y[0]:
          k = ("newly-wrapped" if x[0] else "unwrapped", "in-glue" if x[1] else "outside", "lone" if x[2] else "-", x[3]); cat[k] += 1
          if len(ex[k]) < 4: ex[k].append(u.split('/')[1] + ': ' + x[4])
    b.close()
finally: srv.terminate()
for k, v in cat.most_common(): print(v, k, ex[k])
