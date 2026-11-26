// FORKLAB status board + casting ruler.
// Live: board reads ForkSale on-chain.
const CONFIG = {
  contract: "0xDd0a199AB9C33eC99e1E996D29673091C1e6C583", // ForkSale, live
  rpcs: ["https://bsc-dataseed.binance.org", "https://bsc-dataseed1.defibit.io", "https://bsc.publicnode.com"],
  totalUnits: 6000, freeCap: 1000, paidCap: 5000
};
(function () {
  var path = location.pathname.replace(/\/$/, "") || "/";
  var map = { "/": "home", "/tokenomics": "tokenomics", "/whitepaper": "whitepaper", "/docs": "docs", "/swap": "swap", "/about": "about" };
  var key = map[path];
  if (key) document.querySelectorAll("nav.tabs a").forEach(function (a) { if (a.dataset.p === key) a.classList.add("on"); });

  // Casting ruler: 6,000 ticks, one per unit. First 1,000 in cyan (free lane).
  var cv = document.getElementById("ruler");
  if (cv) {
    var draw = function () {
      var W = cv.clientWidth || 1120, H = 96, S = 2;
      cv.width = W * S; cv.height = H * S;
      var ctx = cv.getContext("2d");
      ctx.scale(S, S);
      var x0 = 30, x1 = W - 30, base = 62;
      var px = function (i) { return x0 + (x1 - x0) * (i / 6000); };
      ctx.fillStyle = "rgba(127,212,255,.20)";
      ctx.fillRect(px(0), 18, px(1000) - px(0), base - 18);
      ctx.strokeStyle = "#EAF4FF"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x1, base); ctx.stroke();
      ctx.font = "11px TechMono, monospace"; ctx.textAlign = "center";
      var step = W < 560 ? 1000 : 500;
      for (var i = 0; i <= 6000; i += 10) {
        var h = 9, col = i <= 1000 ? "#7FD4FF" : "#9CC4EE";
        if (i % 500 === 0) h = 30; else if (i % 100 === 0) h = 19;
        ctx.strokeStyle = col; ctx.lineWidth = i % 500 === 0 ? 1.8 : 1;
        ctx.beginPath(); ctx.moveTo(px(i), base); ctx.lineTo(px(i), base - h); ctx.stroke();
        if (i % step === 0) {
          ctx.fillStyle = i <= 1000 ? "#7FD4FF" : "#EAF4FF";
          ctx.fillText(i === 0 ? "0001" : String(i), px(i), base - 38);
        }
      }
      ctx.fillStyle = "#7FD4FF"; ctx.textAlign = "left";
      ctx.fillText(document.documentElement.lang === "zh" ? "免费" : "FREE", px(0), base + 22);
      ctx.fillStyle = "#9CC4EE"; ctx.textAlign = "right";
      ctx.fillText(document.documentElement.lang === "zh" ? "付费" : "PAID", px(6000), base + 22);
    };
    draw();
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 150); });
  }
  if (!CONFIG.contract) return; // drawn state stands until deployment
})();

// Live status board: reads ForkSale and updates the drawn values.
(function () {
  if (!CONFIG.contract) return;
  var el = function (id) { return document.getElementById(id); };
  if (!el("st-line")) return;
  var zh = document.documentElement.lang === "zh";
  var SEL = { endTime: "0x3197cbb6", freeSold: "0xa37d6e0f", paidSold: "0x10b985d4", totalSold: "0x9106d7ba", isSealed: "0x631f9852" };
  var endTime = 0;
  function call(rpc, data) {
    var ctl = new AbortController(); var t = setTimeout(function () { ctl.abort(); }, 6000);
    return fetch(rpc, { method: "POST", headers: { "content-type": "application/json" }, signal: ctl.signal,
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: CONFIG.contract, data: data }, "latest"] }) })
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(t); if (!j.result) throw new Error("no result"); return parseInt(j.result, 16); });
  }
  function read(data) { return Promise.any(CONFIG.rpcs.map(function (r) { return call(r, data); })); }
  function fmt(n) { return n.toLocaleString("en-US"); }
  function tick() {
    if (!endTime) return;
    var left = endTime - Math.floor(Date.now() / 1000);
    var w = el("st-window"); if (!w) return;
    if (left <= 0) { w.textContent = zh ? "窗口已关闭" : "WINDOW CLOSED"; return; }
    var d = Math.floor(left / 86400), h = Math.floor(left % 86400 / 3600), m = Math.floor(left % 3600 / 60), s = left % 60;
    w.textContent = (zh ? "距关闭 " : "CLOSES IN ") + d + "D " + h + "H " + m + "M " + s + "S";
  }
  function refresh() {
    Promise.all([read(SEL.endTime), read(SEL.freeSold), read(SEL.paidSold), read(SEL.totalSold), read(SEL.isSealed)])
      .then(function (v) {
        endTime = v[0];
        var now = Math.floor(Date.now() / 1000);
        el("st-units").textContent = fmt(v[3]) + " / " + fmt(CONFIG.totalUnits);
        el("st-free").textContent = fmt(v[1]) + " / " + fmt(CONFIG.freeCap);
        el("st-paid").textContent = fmt(v[2]) + " / " + fmt(CONFIG.paidCap);
        var line = el("st-line");
        if (v[4] === 1) line.textContent = zh ? "产线已封 · 已熔毁" : "LINE SEALED · UNITS MELTED";
        else if (endTime > 0 && now < endTime) {
          line.textContent = zh ? "窗口 · 开放中" : "WINDOW · OPEN";
          var bf = el("btn-free"), bb = el("btn-buy");
          if (bf) bf.querySelector("small").textContent = zh ? "每钱包 1 个 · 通过你的代理" : "1 PER WALLET · VIA YOUR AGENT";
          if (bb) bb.querySelector("small").textContent = zh ? "每单元 0.0016 BNB · 通过你的代理" : "0.0016 BNB PER UNIT · VIA YOUR AGENT";
        } else if (endTime > 0) line.textContent = zh ? "窗口 · 已关闭" : "WINDOW · CLOSED";
        tick();
      })
      .catch(function () { /* keep drawn state, retry next cycle */ });
  }
  refresh();
  setInterval(refresh, 30000);
  setInterval(tick, 1000);
})();
