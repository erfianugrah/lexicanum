() => {
 let bad = 0, total = 0, over = 0, ex = [], oex = [];
 for (const c of document.querySelectorAll('.sl-markdown-content :not(pre) > code')) {
   const climb = (side) => { let n = c; const k = side === 'after' ? 'nextSibling' : 'previousSibling';
     while (!n[k] && n.parentElement && ['A','EM','STRONG','B','I','SPAN'].includes(n.parentElement.tagName) && !n.parentElement.classList.contains('house-glue')) n = n.parentElement;
     return n[k]; };
   for (const [side, sib] of [['after', climb('after')], ['before', climb('before')]]) {
     if (!sib || sib.nodeType !== 3 || !sib.data.length) continue;
     const i = side === 'after' ? 0 : sib.data.length - 1;
     if (/\s/.test(sib.data[i])) continue;
     total++;
     const r = document.createRange(); r.setStart(sib, i); r.setEnd(sib, i + 1);
     const cr = c.getClientRects(); if (!cr.length) continue; const box = side === 'after' ? cr[cr.length-1] : cr[0];
     const ch = r.getBoundingClientRect();
     if (Math.abs((ch.top + ch.bottom) / 2 - (box.top + box.bottom) / 2) > box.height / 2) { bad++; ex.push(side + ' [' + sib.data[i] + '] ' + c.textContent.slice(0,24) + ' | ' + (side==='after' ? sib.data.slice(0, 14) : sib.data.slice(-14))); }
   }
 }
 for (const g of document.querySelectorAll('.house-glue')) {
   let blk = g.parentElement; while (blk && getComputedStyle(blk).display.startsWith('inline')) blk = blk.parentElement;
   const cs = getComputedStyle(blk), br = blk.getBoundingClientRect();
   const right = br.right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
   for (const rr of g.getClientRects()) if (rr.right > right + 1) { over++; if (oex.length < 3) oex.push(g.textContent.slice(0,50) + ' +' + Math.round(rr.right-right) + 'px in ' + blk.tagName); break; }
 }
 let wrapped = 0;
 for (const c of document.querySelectorAll('.sl-markdown-content :not(pre) > code')) {
   const h = c.getBoundingClientRect().height, fs = parseFloat(getComputedStyle(c).fontSize);
   if (h > fs * 2.2) wrapped++;
 }
 return {total, bad, over, ex, oex, wrapped};
}
