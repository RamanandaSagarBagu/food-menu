// docs/admin.js
// Admin Dashboard JS - full functionality for Menu, Orders, Coupons, Analytics

const API = "/api";
const toastEl = document.getElementById("adminToast");
const modalOverlay = document.getElementById("modalOverlay");
const modalRoot = document.getElementById("modal");

// ----------------- Auth & Logout -----------------
function checkAuth() {
  if (localStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "admin-login.html";
  }
}
checkAuth();

document.querySelectorAll("#logoutBtn, #logoutBtn2").forEach(btn => {
  if (btn) btn.addEventListener("click", () => {
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "admin-login.html";
  });
});

// ----------------- Utilities -----------------
function showToast(msg, type = "success", ms = 1800) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.style.display = "block";
  toastEl.style.background = type === "error" ? "#8b1e1e" : "#0b2f1a";
  toastEl.style.color = "white";
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => {
    toastEl.style.display = "none";
  }, ms);
}

function closeModal() {
  modalOverlay.setAttribute("aria-hidden", "true");
  modalOverlay.style.display = "none";
  modalRoot.innerHTML = "";
}
function openModal(html) {
  modalRoot.innerHTML = html;
  modalOverlay.style.display = "flex";
  modalOverlay.setAttribute("aria-hidden", "false");
}
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

function readFileAsDataURL(inputEl) {
  const file = inputEl && inputEl.files && inputEl.files[0];
  if (!file) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function formatCurrency(v) {
  return `₹${Number(v || 0).toLocaleString("en-IN")}`;
}

function el(selector) { return document.querySelector(selector); }
function elAll(selector) { return Array.from(document.querySelectorAll(selector)); }

// ----------------- Navigation & Tabs -----------------
const navButtons = elAll(".nav button");
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const page = btn.dataset.page;
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const pageEl = document.getElementById("page-" + page);
    if (pageEl) pageEl.classList.add("active");
    // run per-page loaders
    if (page === "menu") loadMenu();
    if (page === "orders") loadOrders();
    if (page === "coupons") loadCoupons();
    if (page === "home") refreshDashboard();
  });
});

// top search (global)
const topSearch = el("#topSearch");
if (topSearch) {
  topSearch.addEventListener("input", debounce(() => {
    // search across items/orders/coupons depending on active page
    const active = document.querySelector(".page.active");
    if (!active) return;
    if (active.id === "page-menu") applyMenuFilters();
    if (active.id === "page-orders") applyOrderFilters();
    if (active.id === "page-coupons") applyCouponFilters();
    if (active.id === "page-home") refreshDashboard();
  }, 250));
}

// ----------------- Debounce -----------------
function debounce(fn, ms = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

// ----------------- State -----------------
let MENU = [];     // all menu items
let ORDERS = [];   // all orders
let COUPONS = [];  // all coupons

// ----------------- Menu Management -----------------
async function loadMenu() {
  try {
    const res = await fetch(`${API}/menu`);
    MENU = await res.json();
    populateMenuTable(MENU);
    populateMenuCategoryFilter();
    updateTopItems();
  } catch (err) {
    console.error("loadMenu:", err);
    showToast("Failed to load menu", "error");
  }
}

function populateMenuTable(list) {
  const tbody = el("#menuTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  list.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${item.imageData || item.image || 'fallback.jpg'}" alt="" class="img-thumb" onerror="this.src='fallback.jpg'">
          <div>
            <div style="font-weight:700;color:#fff">${escapeHtml(item.name)}</div>
            <div class="small text-muted">${escapeHtml(item.description || "")}</div>
          </div>
        </div>
      </td>
      <td>${escapeHtml(item.category || "")}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${item.available ? "✅" : "❌"}</td>
      <td>
        <button class="btn ghost" data-action="edit" data-id="${item.id}">Edit</button>
        <button class="btn ghost" data-action="delete" data-id="${item.id}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // attach handlers
  tbody.querySelectorAll("button").forEach(btn => {
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "edit") btn.addEventListener("click", () => openEditMenuModal(id));
    if (action === "delete") btn.addEventListener("click", () => confirmDeleteMenu(id));
  });
}

function populateMenuCategoryFilter() {
  const sel = el("#menuFilterCategory");
  if (!sel) return;
  const set = new Set(MENU.map(i => i.category).filter(Boolean));
  sel.innerHTML = `<option value="all">All Categories</option>`;
  [...set].sort().forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    sel.appendChild(o);
  });
}
function applyMenuFilters() {
  const q = (el("#menuSearch") && el("#menuSearch").value.trim().toLowerCase()) || "";
  const cat = (el("#menuFilterCategory") && el("#menuFilterCategory").value) || "all";
  const sort = (el("#menuSort") && el("#menuSort").value) || "default";

  let out = MENU.filter(it => {
    if (cat !== "all" && it.category !== cat) return false;
    if (!q) return true;
    const hay = `${it.name} ${it.category} ${it.description || ""}`.toLowerCase();
    return hay.includes(q);
  });

  if (sort === "price-low") out.sort((a,b) => (a.price||0) - (b.price||0));
  if (sort === "price-high") out.sort((a,b) => (b.price||0) - (a.price||0));

  populateMenuTable(out);
}

el("#menuSearch")?.addEventListener("input", debounce(applyMenuFilters, 150));
el("#menuFilterCategory")?.addEventListener("change", applyMenuFilters);
el("#menuSort")?.addEventListener("change", applyMenuFilters);

// Add Menu
el("#addMenuBtn")?.addEventListener("click", openAddMenuModal);
el("#quickAddBtn")?.addEventListener("click", openAddMenuModal);

function openAddMenuModal() {
  const html = `
    <h2 style="margin-top:0;color:#ffb49b">Add Menu Item</h2>
    <div style="display:flex;gap:12px">
      <div style="flex:1">
        <label class="small text-muted">Name</label>
        <input id="f_name" class="input" placeholder="Paneer Butter Masala"/>
        <label class="small text-muted">Price</label>
        <input id="f_price" class="input" type="number" placeholder="Price in ₹"/>
        <label class="small text-muted">Category</label>
        <input id="f_category" class="input" placeholder="Veg / Non-Veg / Dessert"/>
        <label class="small text-muted">Description</label>
        <textarea id="f_description" class="input" placeholder="Short description" rows="3"></textarea>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <label class="small text-muted">Available</label>
          <select id="f_available" class="input" style="width:140px">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
      <div style="width:260px">
        <label class="small text-muted">Image (drag & drop or select)</label>
        <div id="f_drop" style="height:160px;border-radius:8px;border:1px dashed rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;flex-direction:column;background:#071018;">
          <div class="small text-muted">Drop image here</div>
          <input id="f_image" type="file" accept="image/*" style="margin-top:8px"/>
          <div id="f_preview" style="margin-top:8px"></div>
        </div>
      </div>
    </div>
    <div style="margin-top:12px;text-align:right">
      <button id="cancelAdd" class="btn ghost">Cancel</button>
      <button id="saveAdd" class="btn primary">Create</button>
    </div>
  `;
  openModal(html);

  // attach drag & drop
  const drop = el("#f_drop");
  const fileInput = el("#f_image");
  const preview = el("#f_preview");

  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.style.borderColor = "#ff7043"; });
  drop.addEventListener("dragleave", () => { drop.style.borderColor = "rgba(255,255,255,0.06)"; });
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.style.borderColor = "rgba(255,255,255,0.06)";
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const dt = new DataTransfer();
    dt.items.add(f);
    fileInput.files = dt.files;
    previewImageFile(f, preview);
  });

  fileInput.addEventListener("change", () => {
    const f = fileInput.files[0];
    if (f) previewImageFile(f, preview);
  });

  el("#cancelAdd").addEventListener("click", closeModal);
  el("#saveAdd").addEventListener("click", async () => {
    const body = {
      name: el("#f_name").value.trim(),
      price: parseFloat(el("#f_price").value) || 0,
      category: el("#f_category").value.trim(),
      description: el("#f_description").value.trim(),
      available: el("#f_available").value === "true"
    };
    if (!body.name) { showToast("Name required", "error"); return; }
    const dataUrl = await readFileAsDataURL(fileInput);
    if (dataUrl) body.imageData = dataUrl;
    try {
      const res = await fetch(`${API}/menu`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to create");
      const created = await res.json();
      showToast("Item created");
      closeModal();
      await loadMenu();
    } catch (err) {
      console.error(err);
      showToast("Create failed", "error");
    }
  });
}

function previewImageFile(file, container) {
  const reader = new FileReader();
  reader.onload = () => {
    container.innerHTML = `<img src="${reader.result}" style="max-width:100%;border-radius:8px">`;
  };
  reader.readAsDataURL(file);
}

async function openEditMenuModal(id) {
  const item = MENU.find(i => String(i.id) === String(id));
  if (!item) { showToast("Item not found", "error"); return; }
  const html = `
    <h2 style="margin-top:0;color:#ffd7c6">Edit Item</h2>
    <div style="display:flex;gap:12px">
      <div style="flex:1">
        <label class="small text-muted">Name</label>
        <input id="f_name" class="input" value="${escapeHtml(item.name)}"/>
        <label class="small text-muted">Price</label>
        <input id="f_price" class="input" type="number" value="${item.price}"/>
        <label class="small text-muted">Category</label>
        <input id="f_category" class="input" value="${escapeHtml(item.category || "")}"/>
        <label class="small text-muted">Description</label>
        <textarea id="f_description" class="input" rows="3">${escapeHtml(item.description || "")}</textarea>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
          <label class="small text-muted">Available</label>
          <select id="f_available" class="input" style="width:140px">
            <option value="true" ${item.available ? "selected":""}>Yes</option>
            <option value="false" ${!item.available ? "selected":""}>No</option>
          </select>
        </div>
      </div>
      <div style="width:260px">
        <label class="small text-muted">Image</label>
        <div id="f_drop" style="height:160px;border-radius:8px;border:1px dashed rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center;flex-direction:column;background:#071018;">
          <div class="small text-muted">Drop new image or leave as is</div>
          <input id="f_image" type="file" accept="image/*" style="margin-top:8px"/>
          <div id="f_preview" style="margin-top:8px">${item.imageData ? `<img src="${item.imageData}" style="max-width:100%;border-radius:8px">` : (item.image ? `<img src="${item.image}" style="max-width:100%;border-radius:8px">` : "")}</div>
        </div>
      </div>
    </div>
    <div style="margin-top:12px;text-align:right">
      <button id="cancelEdit" class="btn ghost">Cancel</button>
      <button id="saveEdit" class="btn primary">Save</button>
    </div>
  `;
  openModal(html);

  const drop = el("#f_drop");
  const fileInput = el("#f_image");
  const preview = el("#f_preview");

  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.style.borderColor = "#ff7043"; });
  drop.addEventListener("dragleave", () => { drop.style.borderColor = "rgba(255,255,255,0.06)"; });
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.style.borderColor = "rgba(255,255,255,0.06)";
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const dt = new DataTransfer();
    dt.items.add(f);
    fileInput.files = dt.files;
    previewImageFile(f, preview);
  });

  fileInput.addEventListener("change", () => {
    const f = fileInput.files[0];
    if (f) previewImageFile(f, preview);
  });

  el("#cancelEdit").addEventListener("click", closeModal);
  el("#saveEdit").addEventListener("click", async () => {
    const body = {
      name: el("#f_name").value.trim(),
      price: parseFloat(el("#f_price").value) || 0,
      category: el("#f_category").value.trim(),
      description: el("#f_description").value.trim(),
      available: el("#f_available").value === "true"
    };
    const dataUrl = await readFileAsDataURL(fileInput);
    if (dataUrl) body.imageData = dataUrl;

    try {
      const res = await fetch(`${API}/menu/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Update failed");
      showToast("Item updated");
      closeModal();
      await loadMenu();
    } catch (err) {
      console.error(err);
      showToast("Update failed", "error");
    }
  });
}

function confirmDeleteMenu(id) {
  const html = `
    <h3 style="margin-top:0;color:#ffbdbd">Delete Item</h3>
    <p class="small text-muted">Are you sure you want to delete this item? This action cannot be undone.</p>
    <div style="text-align:right;margin-top:12px">
      <button id="cancelDel" class="btn ghost">Cancel</button>
      <button id="confirmDel" class="btn primary" style="background:#c43a3a">Delete</button>
    </div>
  `;
  openModal(html);
  el("#cancelDel").addEventListener("click", closeModal);
  el("#confirmDel").addEventListener("click", async () => {
    try {
      const res = await fetch(`${API}/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Deleted");
      closeModal();
      await loadMenu();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  });
}

// ----------------- Orders -----------------
async function loadOrders() {
  try {
    const res = await fetch(`${API}/orders`);
    ORDERS = await res.json();
    populateOrdersTable(ORDERS);
    refreshDashboard(); // stats depend on orders
  } catch (err) {
    console.error(err);
    showToast("Failed to load orders", "error");
  }
}

function populateOrdersTable(list) {
  const tbody = el("#ordersTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  list.forEach(order => {
    const itemsStr = (order.items || []).map(i => i.name || i).join(", ");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${escapeHtml(itemsStr)}</td>
      <td>${formatCurrency(order.total)}</td>
      <td>${escapeHtml(order.status || "")}</td>
      <td>
        <button class="btn ghost" data-action="process" data-id="${order.id}">Process</button>
        <button class="btn ghost" data-action="deliver" data-id="${order.id}">Deliver</button>
        <button class="btn ghost" data-action="view" data-id="${order.id}">View</button>
        <button class="btn" data-action="delete" data-id="${order.id}" style="background:#8b1e1e;color:#fff">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button").forEach(btn => {
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "process") btn.addEventListener("click", () => updateOrderStatus(id, "Processing"));
    if (action === "deliver") btn.addEventListener("click", () => updateOrderStatus(id, "Delivered"));
    if (action === "view") btn.addEventListener("click", () => openViewOrderModal(id));
    if (action === "delete") btn.addEventListener("click", () => confirmDeleteOrder(id));
  });
}

async function updateOrderStatus(id, status) {
  try {
    const res = await fetch(`${API}/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) throw new Error("Update failed");
    showToast(`Order ${status}`);
    await loadOrders();
  } catch (err) {
    console.error(err);
    showToast("Update failed", "error");
  }
}

function openViewOrderModal(id) {
  const o = ORDERS.find(x => String(x.id) === String(id));
  if (!o) { showToast("Order not found", "error"); return; }
  const itemsHtml = (o.items || []).map(i => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,0.03)"><div>${escapeHtml(i.name)}</div><div>₹${i.price || "-"}</div></div>`).join("");
  const html = `
    <h3 style="margin-top:0;color:#ffd7c6">Order ${o.id}</h3>
    <div style="max-height:320px;overflow:auto">${itemsHtml}</div>
    <div style="margin-top:8px;font-weight:800">${formatCurrency(o.total)}</div>
    <div style="margin-top:12px;text-align:right">
      <button id="closeOrder" class="btn ghost">Close</button>
    </div>
  `;
  openModal(html);
  el("#closeOrder").addEventListener("click", closeModal);
}

function confirmDeleteOrder(id) {
  const html = `
    <h3 style="margin-top:0;color:#ffbdbd">Delete Order</h3>
    <p class="small text-muted">Delete order ${id}?</p>
    <div style="text-align:right;margin-top:12px">
      <button id="cancelDel" class="btn ghost">Cancel</button>
      <button id="confirmDel" class="btn primary" style="background:#c43a3a">Delete</button>
    </div>
  `;
  openModal(html);
  el("#cancelDel").addEventListener("click", closeModal);
  el("#confirmDel").addEventListener("click", async () => {
    try {
      const res = await fetch(`${API}/orders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Order deleted");
      closeModal();
      await loadOrders();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  });
}

// ----------------- Coupons -----------------
async function loadCoupons() {
  try {
    const res = await fetch(`${API}/coupons`);
    COUPONS = await res.json();
    populateCouponsTable(COUPONS);
  } catch (err) {
    console.error(err);
    showToast("Failed to load coupons", "error");
  }
}

function populateCouponsTable(list) {
  const tbody = el("#couponsTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  list.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(c.code)}</td>
      <td>${escapeHtml(c.type)}</td>
      <td>${c.type === "percent" ? c.discount + "%" : formatCurrency(c.discount)}</td>
      <td>
        <button class="btn ghost" data-action="edit" data-id="${c.id}">Edit</button>
        <button class="btn" data-action="delete" data-id="${c.id}" style="background:#8b1e1e;color:#fff">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button").forEach(btn => {
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "edit") btn.addEventListener("click", () => openEditCouponModal(id));
    if (action === "delete") btn.addEventListener("click", () => confirmDeleteCoupon(id));
  });
}

el("#addCouponBtn")?.addEventListener("click", openAddCouponModal);

function openAddCouponModal() {
  const html = `
    <h3 style="margin-top:0;color:#ffd7c6">Add Coupon</h3>
    <div>
      <label class="small text-muted">Code</label>
      <input id="c_code" class="input" placeholder="FOOD10"/>
      <label class="small text-muted">Type</label>
      <select id="c_type" class="input">
        <option value="percent">Percent</option>
        <option value="flat">Flat</option>
      </select>
      <label class="small text-muted">Discount</label>
      <input id="c_discount" class="input" type="number" placeholder="10"/>
    </div>
    <div style="text-align:right;margin-top:12px">
      <button id="cancelC" class="btn ghost">Cancel</button>
      <button id="saveC" class="btn primary">Create</button>
    </div>
  `;
  openModal(html);
  el("#cancelC").addEventListener("click", closeModal);
  el("#saveC").addEventListener("click", async () => {
    const body = { code: el("#c_code").value.trim(), type: el("#c_type").value, discount: parseFloat(el("#c_discount").value) || 0 };
    if (!body.code) { showToast("Code required", "error"); return; }
    try {
      const res = await fetch(`${API}/coupons`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Create coupon failed");
      showToast("Coupon created");
      closeModal();
      await loadCoupons();
    } catch (err) {
      console.error(err);
      showToast("Create failed", "error");
    }
  });
}

function openEditCouponModal(id) {
  const c = COUPONS.find(x => String(x.id) === String(id));
  if (!c) { showToast("Coupon not found", "error"); return; }
  const html = `
    <h3 style="margin-top:0;color:#ffd7c6">Edit Coupon</h3>
    <div>
      <label class="small text-muted">Code</label>
      <input id="c_code" class="input" value="${escapeHtml(c.code)}"/>
      <label class="small text-muted">Type</label>
      <select id="c_type" class="input">
        <option value="percent" ${c.type === "percent" ? "selected":""}>Percent</option>
        <option value="flat" ${c.type === "flat" ? "selected":""}>Flat</option>
      </select>
      <label class="small text-muted">Discount</label>
      <input id="c_discount" class="input" type="number" value="${c.discount}"/>
    </div>
    <div style="text-align:right;margin-top:12px">
      <button id="cancelC" class="btn ghost">Cancel</button>
      <button id="saveC" class="btn primary">Save</button>
    </div>
  `;
  openModal(html);
  el("#cancelC").addEventListener("click", closeModal);
  el("#saveC").addEventListener("click", async () => {
    const body = { code: el("#c_code").value.trim(), type: el("#c_type").value, discount: parseFloat(el("#c_discount").value) || 0 };
    if (!body.code) { showToast("Code required", "error"); return; }
    try {
      const res = await fetch(`${API}/coupons/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Update failed");
      showToast("Coupon updated");
      closeModal();
      await loadCoupons();
    } catch (err) {
      console.error(err);
      showToast("Update failed", "error");
    }
  });
}

function confirmDeleteCoupon(id) {
  const html = `
    <h3 style="margin-top:0;color:#ffbdbd">Delete Coupon</h3>
    <p class="small text-muted">Delete coupon ${id}?</p>
    <div style="text-align:right;margin-top:12px">
      <button id="cancelDel" class="btn ghost">Cancel</button>
      <button id="confirmDel" class="btn" style="background:#c43a3a;color:#fff">Delete</button>
    </div>
  `;
  openModal(html);
  el("#cancelDel").addEventListener("click", closeModal);
  el("#confirmDel").addEventListener("click", async () => {
    try {
      const res = await fetch(`${API}/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      showToast("Deleted");
      closeModal();
      await loadCoupons();
    } catch (err) {
      console.error(err);
      showToast("Delete failed", "error");
    }
  });
}

// ----------------- Dashboard analytics -----------------
function refreshDashboard() {
  // compute stats from ORDERS and MENU
  const today = new Date().toISOString().slice(0,10);
  const todayOrders = ORDERS.filter(o => (o.createdAt || "").slice(0,10) === today).length;
  const totalRevenue = ORDERS.reduce((s,o) => s + (Number(o.total) || 0), 0);
  const pending = ORDERS.filter(o => o.status === "Processing").length;
  const delivered = ORDERS.filter(o => o.status === "Delivered").length;

  el("#stat-today-orders").textContent = todayOrders;
  el("#stat-revenue").textContent = formatCurrency(totalRevenue);
  el("#stat-pending").textContent = pending;
  el("#stat-delivered").textContent = delivered;

  renderSalesChart();
  renderTopItems();
  renderRecentOrders();
}

function updateTopItems() {
  // keep top items updated when menu changes
  renderTopItems();
}

function renderTopItems() {
  // naive: compute frequency from orders
  const freq = {};
  ORDERS.forEach(o => {
    (o.items || []).forEach(it => {
      const name = it.name || it;
      freq[name] = (freq[name]||0) + (it.qty || 1);
    });
  });
  const arr = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const container = el("#topItemsList");
  if (!container) return;
  container.innerHTML = "";
  if (arr.length === 0) {
    container.innerHTML = `<div class="small text-muted">No sales yet</div>`;
    return;
  }
  arr.forEach(([name, count]) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.padding = "8px 0";
    row.innerHTML = `<div>${escapeHtml(name)}</div><div class="small text-muted">${count} sold</div>`;
    container.appendChild(row);
  });
}

function renderRecentOrders() {
  const container = el("#recentOrdersList");
  if (!container) return;
  container.innerHTML = "";
  const recent = ORDERS.slice().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,6);
  recent.forEach(o => {
    const row = document.createElement("div");
    row.style.padding = "8px 0";
    row.style.borderBottom = "1px dashed rgba(255,255,255,0.03)";
    row.innerHTML = `<div style="display:flex;justify-content:space-between"><div>Order ${o.id}</div><div class="small text-muted">${o.status}</div></div><div class="small text-muted">${(o.items||[]).map(i=>i.name||i).join(", ")}</div>`;
    container.appendChild(row);
  });
}

// Simple sales chart (last 7 days)
function renderSalesChart() {
  const canvas = el("#chartSales");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const days = [];
  for (let i=6;i>=0;i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0,10));
  }
  const totals = days.map(day => ORDERS.filter(o => (o.createdAt || "").slice(0,10) === day).reduce((s,o) => s + (Number(o.total)||0), 0));

  // responsive canvas clear
  const DPR = window.devicePixelRatio || 1;
  const W = canvas.clientWidth || 700;
  const H = canvas.clientHeight || 260;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  ctx.scale(DPR, DPR);
  ctx.clearRect(0,0,W,H);

  // background grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let y=0;y<5;y++) {
    const yy = H * (y/5);
    ctx.beginPath();
    ctx.moveTo(0, yy);
    ctx.lineTo(W, yy);
    ctx.stroke();
  }

  // compute max
  const max = Math.max(...totals, 10);
  const pad = 20;
  const innerW = W - pad*2;
  const innerH = H - pad*2;
  const stepX = innerW / (days.length - 1);

  // path
  ctx.beginPath();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = "#ff7043";
  for (let i=0;i<totals.length;i++) {
    const x = pad + i * stepX;
    const y = pad + innerH - (totals[i]/max) * innerH;
    if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();

  // fill gradient
  const grad = ctx.createLinearGradient(0, pad, 0, H);
  grad.addColorStop(0, "rgba(255,112,67,0.18)");
  grad.addColorStop(1, "rgba(255,112,67,0.02)");
  ctx.lineTo(pad + (totals.length-1)*stepX, pad + innerH);
  ctx.lineTo(pad, pad + innerH);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // draw points
  ctx.fillStyle = "#fff";
  totals.forEach((v,i) => {
    const x = pad + i * stepX;
    const y = pad + innerH - (v/max) * innerH;
    ctx.beginPath();
    ctx.arc(x,y,3.2,0,Math.PI*2);
    ctx.fill();
  });

  // labels
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "12px sans-serif";
  days.forEach((d,i) => {
    const label = d.slice(5); // MM-DD
    const x = pad + i * stepX;
    ctx.fillText(label, x - 18, H - 6);
  });
}

// ----------------- Helpers -----------------
function escapeHtml(s) {
  if (!s && s !== 0) return "";
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

// ----------------- Init & load all data -----------------
async function initialLoad() {
  await Promise.allSettled([loadMenu(), loadOrders(), loadCoupons()]);
  // start with dashboard
  refreshDashboard();
}
initialLoad();
