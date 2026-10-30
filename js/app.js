const CATS = ["ورود", "نباتات داخلية", "عناية سهلة"];
const STATUS = {new: ["جديد", "primary"], prep: ["قيد التجهيز", "warning"], done: ["تم التوصيل", "success"], cancel: ["ملغي", "secondary"]};
const LOW_STOCK = 10;
const $ = id => document.getElementById(id);
const money = n => "$" + n.toLocaleString("en-US", {maximumFractionDigits: 2});
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* ---------- البيانات التجريبية ---------- */
const SEED = [
  [1,"ورد جوري أحمر",0,32,"🌹",34],[2,"توليب هولندي",0,25,"🌷",18],[3,"عباد الشمس",0,19,"🌻",40],
  [4,"لافندر",0,17,"🪻",8],[5,"أوركيد فالينوبسيس",0,48,"🌸",12],[6,"هيبسكس",0,15,"🌺",25],
  [7,"نبات الثعبان",1,20,"🌿",30],[8,"مونستيرا",1,37,"🍃",6],[9,"بوتس",1,13,"🪴",44],
  [10,"صبار",2,9,"🌵",52],[11,"ألوفيرا",2,12,"🌱",9],[12,"نبات الزاميا",2,24,"☘️",20]
].map(([id, name, c, price, emoji, stock]) => ({id, name, cat: CATS[c], price, emoji, stock}));

const NAMES = ["سارة أحمد","محمد علي","ليلى حسن","خالد يوسف","نور الدين","هند سالم","عمر فاروق","مريم خالد","يوسف إبراهيم","رنا محمود","فهد العتيبي","دانة ناصر"];
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function genOrders() {
  const r = rng(7), list = [];
  for (let i = 0; i < 70; i++) {
    const age = Math.floor(r() * 30), date = new Date(); date.setHours(8 + Math.floor(r() * 12), 0, 0, 0); date.setDate(date.getDate() - age);
    const items = Array.from({length: 1 + Math.floor(r() * 3)}, () => ({pid: 1 + Math.floor(r() * 12), qty: 1 + Math.floor(r() * 3)}));
    const total = items.reduce((n, it) => n + SEED[it.pid - 1].price * it.qty, 0);
    const status = age > 3 ? (r() < .06 ? "cancel" : "done") : ["new", "prep", "done"][Math.floor(r() * 3)];
    list.push({id: 0, customer: NAMES[Math.floor(r() * NAMES.length)], date: date.toISOString(), items, total, status});
  }
  list.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((o, i) => o.id = 2000 - i);
  return list;
}
let products = load("batlat-a-products", SEED), orders = load("batlat-a-orders", null);
if (!orders) { orders = genOrders(); store("batlat-a-orders", orders); }

function toast(m) { $("toastMsg").textContent = m; bootstrap.Toast.getOrCreateInstance($("toast"), {delay: 2000}).show(); }
const catOf = pid => (products.find(p => p.id === pid) || {}).cat || "أخرى";
const nameOf = pid => (products.find(p => p.id === pid) || {name: "منتج محذوف"}).name;
const dayKey = d => `${d.getDate()}/${d.getMonth() + 1}`;

/* ---------- التنقل والثيم ---------- */
document.querySelectorAll("#tabs [data-view]").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll("#tabs .nav-link").forEach(x => x.classList.toggle("active", x === b));
  ["overview", "orders", "products"].forEach(v => $(v).classList.toggle("d-none", v !== b.dataset.view));
  if (b.dataset.view === "overview") renderOverview();
}));
function applyTheme(t) { document.documentElement.dataset.bsTheme = t; $("theme").textContent = t === "dark" ? "الوضع الفاتح" : "الوضع الداكن"; store("batlat-a-theme", t); renderOverview(); }
$("theme").addEventListener("click", () => applyTheme(document.documentElement.dataset.bsTheme === "dark" ? "light" : "dark"));

/* ---------- نظرة عامة ---------- */
let lineChart, pieChart;
function renderOverview() {
  const days = +$("range").value, from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - days + 1);
  const inRange = orders.filter(o => new Date(o.date) >= from && o.status !== "cancel");
  const sales = inRange.reduce((n, o) => n + o.total, 0), avg = inRange.length ? sales / inRange.length : 0;
  const low = products.filter(p => p.stock < LOW_STOCK).length;
  $("kpis").innerHTML = [
    ["إجمالي المبيعات", money(sales), ""], ["عدد الطلبات", inRange.length, ""],
    ["متوسط قيمة الطلب", money(avg), ""], ["منتجات منخفضة المخزون", low, low ? "warn" : ""]
  ].map(([l, v, c]) => `<div class="col-6 col-lg-3"><div class="card kpi ${c} p-3"><div class="text-body-secondary small">${l}</div><div class="v">${v}</div></div></div>`).join("");

  const labels = [], byDay = {};
  for (let i = 0; i < days; i++) { const d = new Date(from); d.setDate(from.getDate() + i); labels.push(dayKey(d)); byDay[dayKey(d)] = 0; }
  inRange.forEach(o => byDay[dayKey(new Date(o.date))] += o.total);
  const byCat = {}, byProd = {};
  inRange.forEach(o => o.items.forEach(it => {
    const p = products.find(x => x.id === it.pid); if (!p) return;
    byCat[p.cat] = (byCat[p.cat] || 0) + p.price * it.qty; byProd[it.pid] = (byProd[it.pid] || 0) + p.price * it.qty;
  }));

  const text = getComputedStyle(document.body).color, grid = "rgba(128,128,128,.2)", font = {family: "Cairo"};
  Chart.defaults.font.family = "Cairo"; Chart.defaults.color = text;
  if (lineChart) lineChart.destroy(); if (pieChart) pieChart.destroy();
  lineChart = new Chart($("lineChart"), {type: "line",
    data: {labels, datasets: [{data: labels.map(l => byDay[l]), borderColor: "#2f9e6b", backgroundColor: "rgba(47,158,107,.15)", fill: true, tension: .3, pointRadius: 2}]},
    options: {maintainAspectRatio: false, plugins: {legend: {display: false}}, scales: {x: {grid: {color: grid}}, y: {grid: {color: grid}, beginAtZero: true}}}});
  pieChart = new Chart($("pieChart"), {type: "doughnut",
    data: {labels: Object.keys(byCat), datasets: [{data: Object.values(byCat), backgroundColor: ["#d6336c", "#2f9e6b", "#e0a100", "#3a5bff"], borderWidth: 0}]},
    options: {maintainAspectRatio: false, plugins: {legend: {position: "bottom"}}}});

  const top = Object.entries(byProd).sort((a, b) => b[1] - a[1]).slice(0, 5), max = top[0] ? top[0][1] : 1;
  $("top").innerHTML = top.length ? top.map(([pid, v]) => `<div class="d-flex align-items-center gap-3 py-1">
    <span style="width:150px">${esc(nameOf(+pid))}</span><div class="flex-grow-1"><div class="bar" style="width:${v / max * 100}%"></div></div><strong>${money(v)}</strong></div>`).join("")
    : '<p class="text-body-secondary mb-0">لا توجد مبيعات في هذه الفترة.</p>';
}
$("range").addEventListener("input", renderOverview);

/* ---------- الطلبات ---------- */
$("os").innerHTML = '<option value="all">كل الحالات</option>' + Object.entries(STATUS).map(([k, [l]]) => `<option value="${k}">${l}</option>`).join("");
function renderOrders() {
  const q = $("oq").value.trim(), s = $("os").value;
  const list = orders.filter(o => (s === "all" || o.status === s) && (!q || o.customer.includes(q) || String(o.id).includes(q)));
  $("ocount").textContent = `${list.length} طلب`;
  $("obody").innerHTML = list.length ? list.map(o => `<tr>
    <td>${o.id}</td><td>${esc(o.customer)}</td><td>${new Date(o.date).toLocaleDateString("ar-EG-u-nu-latn")}</td>
    <td>${o.items.reduce((n, i) => n + i.qty, 0)}</td><td>${money(o.total)}</td>
    <td><select class="form-select form-select-sm w-auto text-bg-${STATUS[o.status][1]}" data-oid="${o.id}" aria-label="حالة الطلب ${o.id}">
      ${Object.entries(STATUS).map(([k, [l]]) => `<option value="${k}" ${k === o.status ? "selected" : ""}>${l}</option>`).join("")}</select></td></tr>`).join("")
    : '<tr><td colspan="6" class="text-center text-body-secondary py-4">لا توجد طلبات مطابقة.</td></tr>';
}
$("obody").addEventListener("change", e => {
  const o = orders.find(x => x.id == e.target.dataset.oid); if (!o) return;
  o.status = e.target.value; store("batlat-a-orders", orders); renderOrders(); toast(`تم تحديث حالة الطلب ${o.id}`);
});
["oq", "os"].forEach(id => $(id).addEventListener("input", renderOrders));

/* ---------- المنتجات ---------- */
const pm = new bootstrap.Modal($("pm")); let editId = null;
$("fc").innerHTML = CATS.map(c => `<option>${c}</option>`).join("");
function renderProducts() {
  $("pbody").innerHTML = products.map(p => `<tr>
    <td><span class="fs-4 me-2">${esc(p.emoji)}</span>${esc(p.name)}</td><td>${esc(p.cat)}</td><td>${money(p.price)}</td>
    <td><div class="input-group input-group-sm w-auto" style="width:130px!important">
      <button class="btn btn-outline-secondary" data-dec="${p.id}" aria-label="تقليل المخزون">−</button>
      <span class="form-control stock-in">${p.stock}</span>
      <button class="btn btn-outline-secondary" data-inc="${p.id}" aria-label="زيادة المخزون">+</button></div></td>
    <td>${p.stock === 0 ? '<span class="badge text-bg-danger">نفد</span>' : p.stock < LOW_STOCK ? '<span class="badge text-bg-warning">مخزون منخفض</span>' : '<span class="badge text-bg-success">متوفر</span>'}</td>
    <td class="text-nowrap"><button class="btn btn-sm btn-outline-secondary" data-edit="${p.id}">تعديل</button>
      <button class="btn btn-sm btn-outline-danger" data-del="${p.id}">حذف</button></td></tr>`).join("");
}
const saveP = () => { store("batlat-a-products", products); renderProducts(); };
$("pbody").addEventListener("click", e => {
  const d = e.target.dataset, p = products.find(x => x.id == (d.inc || d.dec || d.edit || d.del));
  if (!p) return;
  if (d.inc) { p.stock++; saveP(); }
  else if (d.dec) { p.stock = Math.max(0, p.stock - 1); saveP(); }
  else if (d.del) { if (confirm(`حذف «${p.name}»؟`)) { products = products.filter(x => x !== p); saveP(); toast("تم حذف المنتج"); } }
  else if (d.edit) { openForm(p); }
});
function openForm(p) {
  editId = p ? p.id : null; $("pf").classList.remove("was-validated");
  $("pmTitle").textContent = p ? "تعديل منتج" : "إضافة منتج";
  $("fn").value = p ? p.name : ""; $("fc").value = p ? p.cat : CATS[0]; $("fe").value = p ? p.emoji : "🌿";
  $("fp").value = p ? p.price : ""; $("fs").value = p ? p.stock : ""; pm.show();
}
$("addBtn").addEventListener("click", () => openForm(null));
$("pf").addEventListener("submit", e => {
  e.preventDefault(); e.target.classList.add("was-validated"); if (!e.target.checkValidity()) return;
  const data = {name: $("fn").value.trim(), cat: $("fc").value, emoji: $("fe").value || "🌿", price: +$("fp").value, stock: +$("fs").value};
  if (editId) Object.assign(products.find(x => x.id === editId), data);
  else products.push({id: Math.max(0, ...products.map(x => x.id)) + 1, ...data});
  saveP(); pm.hide(); toast("تم حفظ المنتج");
});

/* ---------- تشغيل ---------- */
renderOrders(); renderProducts();
applyTheme(load("batlat-a-theme", matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
