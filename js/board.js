// FORKLAB status board + casting ruler.
// Pre-deployment: contract is null and the board shows the drawn state.
const CONFIG = {
  contract: null, // sale contract address, published here at deployment
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
