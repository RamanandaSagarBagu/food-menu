const API = "/api";

// ----- UI helpers -----
function $(s) { return document.querySelector(s); }
function $a(s) { return document.querySelectorAll(s); }

function showToast(msg, color = "bg-green-600") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `fixed bottom-6 right-6 text-white px-4 py-2 rounded ${color}`;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2000);
}

function openModal(html) {
  $("#modal").innerHTML = html;
  const overlay = $("#modalOverlay");
  overlay.classList.remove("hidden");
}
function closeModal() {
  $("#modalOverlay").classList.add("hidden");
  $("#modal").innerHTML = "";
}

// close modal on overlay click
$("#modalOverlay").addEventListener("click", (e) => {
  if (e.target === $("#modalOverlay")) closeModal();
});

// ----- Tabs -----
$("#tab-menu-btn").addEventListener("click", () => showTab("tab-menu"));
$("#tab-orders-btn").addEventListener("click", () => showTab("tab-orders"));
$("#tab-coupons-btn").addEventListener("click", () => showTab("tab-coupons"));

function showTab(id) {
  $a(".tab-section").forEach(s => s.classList.add("hidden"));
  $(`#${id}`).classList.remove("hidden");
}

// ----- Menu: load/add/edit/delete -----
async function loadMenu() {
  const res = await fetch(`${API}/menu`);
  const menu = await res.json();
  const tbody = $("#menuTable");
  tbody.innerHTML = "";
  menu.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-2">${item.name}</td>
      <td class="px-4 py-2">₹${item.price}</td>
      <td class="px-4 py-2">${item.category}</td>
      <td class="px-4 py-2">${item.available ? "Yes" : "No"}</td>
      <td class="px-4 py-2">
        <button class="text-blue-600 mr-3" onclick="openEditMenu(${item.id})">Edit</button>
        <button class="text-red-600" onclick="deleteMenu(${item.id})">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

$("#openAddMenuBtn").addEventListener("click", () => {
  openModal(`
    <h3 class="text-lg font-semibold mb-4">Add Menu Item</h3>
    <div class="space-y-2">
      <input id="m_name" class="w-full border p-2 rounded" placeholder="Name"/>
      <input id="m_price" class="w-full border p-2 rounded" placeholder="Price" type="number"/>
      <input id="m_category" class="w-full border p-2 rounded" placeholder="Category"/>
      <select id="m_available" class="w-full border p-2 rounded">
        <option value="true">Available</option>
        <option value="false">Not available</option>
      </select>
    </div>
    <div class="mt-4 text-right">
      <button onclick="closeModal()" class="mr-2 px-3 py-1">Cancel</button>
      <button onclick="createMenu()" class="bg-blue-600 text-white px-3 py-1 rounded">Create</button>
    </div>
  `);
});

async function createMenu() {
  const body = {
    name: $("#m_name").value.trim(),
    price: parseFloat($("#m_price").value) || 0,
    category: $("#m_category").value.trim(),
    available: $("#m_available").value === "true"
  };
  if (!body.name) { showToast("Name required", "bg-red-600"); return; }
  await fetch(`${API}/menu`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
  showToast("Menu item added");
  closeModal();
  loadMenu();
}

window.openEditMenu = function (id) {
  (async () => {
    const res = await fetch(`${API}/menu`);
    const items = await res.json();
    const item = items.find(i => i.id === id);
    if (!item) { showToast("Item not found", "bg-red-600"); return; }
    openModal(`
      <h3 class="text-lg font-semibold mb-4">Edit Menu Item</h3>
      <div class="space-y-2">
        <input id="m_name" class="w-full border p-2 rounded" value="${escapeHtml(item.name)}"/>
        <input id="m_price" class="w-full border p-2 rounded" value="${item.price}" type="number"/>
        <input id="m_category" class="w-full border p-2 rounded" value="${escapeHtml(item.category)}"/>
        <select id="m_available" class="w-full border p-2 rounded">
          <option value="true" ${item.available ? "selected":""}>Available</option>
          <option value="false" ${!item.available ? "selected":""}>Not available</option>
        </select>
      </div>
      <div class="mt-4 text-right">
        <button onclick="closeModal()" class="mr-2 px-3 py-1">Cancel</button>
        <button onclick="saveMenu(${id})" class="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
      </div>
    `);
  })();
};

async function saveMenu(id) {
  const body = {
    name: $("#m_name").value.trim(),
    price: parseFloat($("#m_price").value) || 0,
    category: $("#m_category").value.trim(),
    available: $("#m_available").value === "true"
  };
  await fetch(`${API}/menu/${id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
  showToast("Menu updated");
  closeModal();
  loadMenu();
}

async function deleteMenu(id) {
  if (!confirm("Delete this item?")) return;
  await fetch(`${API}/menu/${id}`, { method: "DELETE" });
  showToast("Deleted");
  loadMenu();
}

// ----- Orders -----
async function loadOrders() {
  const res = await fetch(`${API}/orders`);
  const orders = await res.json();
  const tbody = $("#ordersTable");
  tbody.innerHTML = "";
  orders.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-2">${o.id}</td>
      <td class="px-4 py-2">${(o.items||[]).map(i => escapeHtml(i.name || i)).join(", ")}</td>
      <td class="px-4 py-2">₹${o.total}</td>
      <td class="px-4 py-2">${o.status}</td>
      <td class="px-4 py-2">
        <button class="text-blue-600 mr-2" onclick="updateOrderStatus(${o.id}, 'Processing')">Process</button>
        <button class="text-green-600 mr-2" onclick="updateOrderStatus(${o.id}, 'Delivered')">Deliver</button>
        <button class="text-red-600" onclick="deleteOrder(${o.id})">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function updateOrderStatus(id, status) {
  await fetch(`${API}/orders/${id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status }) });
  showToast(`Order ${status}`);
  loadOrders();
}

async function deleteOrder(id) {
  if (!confirm("Delete this order?")) return;
  await fetch(`${API}/orders/${id}`, { method: "DELETE" });
  showToast("Order deleted");
  loadOrders();
}

// ----- Coupons -----
$("#openAddCouponBtn").addEventListener("click", () => {
  openModal(`
    <h3 class="text-lg font-semibold mb-4">Add Coupon</h3>
    <div class="space-y-2">
      <input id="c_code" class="w-full border p-2 rounded" placeholder="Code (e.g. FOOD10)"/>
      <select id="c_type" class="w-full border p-2 rounded">
        <option value="percent">Percent</option>
        <option value="flat">Flat</option>
      </select>
      <input id="c_discount" type="number" class="w-full border p-2 rounded" placeholder="Discount value"/>
    </div>
    <div class="mt-4 text-right">
      <button onclick="closeModal()" class="mr-2 px-3 py-1">Cancel</button>
      <button onclick="createCoupon()" class="bg-green-600 text-white px-3 py-1 rounded">Create</button>
    </div>
  `);
});

async function loadCoupons() {
  const res = await fetch(`${API}/coupons`);
  const coupons = await res.json();
  const tbody = $("#couponsTable");
  tbody.innerHTML = "";
  coupons.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="px-4 py-2">${c.code}</td>
      <td class="px-4 py-2">${c.type}</td>
      <td class="px-4 py-2">${c.discount}${c.type === "percent" ? "%" : "₹"}</td>
      <td class="px-4 py-2">
        <button class="text-blue-600 mr-3" onclick="openEditCoupon(${c.id})">Edit</button>
        <button class="text-red-600" onclick="deleteCoupon(${c.id})">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function createCoupon() {
  const body = {
    code: $("#c_code").value.trim(),
    type: $("#c_type").value,
    discount: parseFloat($("#c_discount").value) || 0
  };
  if (!body.code) { showToast("Code required", "bg-red-600"); return; }
  await fetch(`${API}/coupons`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
  showToast("Coupon added");
  closeModal();
  loadCoupons();
}

window.openEditCoupon = function (id) {
  (async () => {
    const res = await fetch(`${API}/coupons`);
    const arr = await res.json();
    const c = arr.find(x => x.id === id);
    if (!c) { showToast("Coupon not found", "bg-red-600"); return; }
    openModal(`
      <h3 class="text-lg font-semibold mb-4">Edit Coupon</h3>
      <div class="space-y-2">
        <input id="c_code" class="w-full border p-2 rounded" value="${escapeHtml(c.code)}"/>
        <select id="c_type" class="w-full border p-2 rounded">
          <option value="percent" ${c.type === "percent" ? "selected": ""}>Percent</option>
          <option value="flat" ${c.type === "flat" ? "selected": ""}>Flat</option>
        </select>
        <input id="c_discount" type="number" class="w-full border p-2 rounded" value="${c.discount}"/>
      </div>
      <div class="mt-4 text-right">
        <button onclick="closeModal()" class="mr-2 px-3 py-1">Cancel</button>
        <button onclick="saveCoupon(${c.id})" class="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
      </div>
    `);
  })();
};

async function saveCoupon(id) {
  const body = {
    code: $("#c_code").value.trim(),
    type: $("#c_type").value,
    discount: parseFloat($("#c_discount").value) || 0
  };
  if (!body.code) { showToast("Code required", "bg-red-600"); return; }
  await fetch(`${API}/coupons/${id}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
  showToast("Coupon saved");
  closeModal();
  loadCoupons();
}

async function deleteCoupon(id) {
  if (!confirm("Delete coupon?")) return;
  await fetch(`${API}/coupons/${id}`, { method: "DELETE" });
  showToast("Deleted");
  loadCoupons();
}

// ----- Utilities -----
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[s]);
}

// ----- Init -----
loadMenu();
loadOrders();
loadCoupons();
showTab("tab-menu");
