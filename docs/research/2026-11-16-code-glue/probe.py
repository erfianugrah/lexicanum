# Counts punctuation stranded from inline code (house#23): ")" or "(" on a
# different line than the code it touches, on three built pages at 4 widths,
# with the glue span and with it disabled. Run after `bun run build`:
#   uv run --with playwright python docs/research/2026-11-16-code-glue/probe.py
# 2026-11-16, dev box Chromium: fix 0/718 at every width; nofix 156, 106, 55,
# 58 of 718 at 390, 800, 1280, 1920px.
import sys, subprocess, time
from playwright.sync_api import sync_playwright
pages = ["reference/m483-flash-locks-and-glitch-oracles/", "reference/cloudflare-supabase-architecture/", "guides/10gbe-link-tuning/"]
JS = """() => {
 let bad = 0, total = 0, ex = [];
 for (const c of document.querySelectorAll('.sl-markdown-content :not(pre) > code')) {
   for (const [side, sib] of [['after', c.nextSibling], ['before', c.previousSibling]]) {
     if (!sib || sib.nodeType !== 3 || !sib.data.length) continue;
     const i = side === 'after' ? 0 : sib.data.length - 1;
     if (/\\s/.test(sib.data[i])) continue;
     total++;
     const r = document.createRange(); r.setStart(sib, i); r.setEnd(sib, i + 1);
     const cr = c.getClientRects(); const box = side === 'after' ? cr[cr.length-1] : cr[0];
     const ch = r.getBoundingClientRect();
     if (Math.abs((ch.top + ch.bottom) / 2 - (box.top + box.bottom) / 2) > box.height / 2) { bad++; if (ex.length < 3) ex.push(side + ' ' + c.textContent + ' ' + sib.data.slice(0, 8)); }
   }
 }
 return {total, bad, ex, overflow: document.documentElement.scrollWidth > innerWidth};
}"""
srv = subprocess.Popen([sys.executable, "-m", "http.server", "23999", "-d", "dist"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
try:
  with sync_playwright() as p:
    b = p.chromium.launch()
    for mode in ["fix", "nofix"]:
      for w in [390, 800, 1280, 1920]:
        pg = b.new_page(viewport={"width": w, "height": 900})
        tb = tl = 0; exs = []; ov = False
        for u in pages:
          pg.goto(f"http://127.0.0.1:23999/{u}")
          if mode == "nofix": pg.add_style_tag(content=".house-glue{white-space:normal!important}")
          r = pg.evaluate(JS); tb += r["bad"]; tl += r["total"]; exs += r["ex"]; ov |= r["overflow"]
        print(mode, w, f"stranded {tb}/{tl}", "overflow" if ov else "", exs[:3])
        pg.close()
    b.close()
finally:
  srv.terminate()
