
// FORKLAB status board. Pre-deployment: contract is null and the board shows
// the drawn state. At deployment, set CONFIG.contract and the board reads
// freeSold / paidSold / window times from chain.
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
  if (!CONFIG.contract) return; // drawn state stands until deployment
  // Live reads are wired at deployment time, when selectors are final.
})();
