const API_BASE = "/api";

// --- Tabs ---
document.querySelectorAll("[data-tab]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-content").forEach(tab => tab.classList.add("hidden"));
    document.getElementById(btn.dataset.tab).classList.remove("hidden");
  });
});

// --- Toast Helper ---
function showToast(msg, color = "bg-green-600") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = `fixed bottom-4 right-4 text-white px-4 py-2 rounded shadow ${color}`;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2000);
}

// --- MENU ---
async function loadMenu() {
  const res = await fetch(`${API_BASE}/menu`);
  const data = await res.json();
  const tbody = document.getElementById("menuTable");
  tbody.innerHTML = "";
  data.forEach(item => {
    tbody.innerHTML += `
      <tr class="border-b">
        <td class="p-2">${item.name}</td>
        <td class="p-2">₹${item.price}</td>
        <td class="p-2">${item.category}</td>
        <td class="p-2">${item.available ? "✅" : "❌"}</td>
        <td class="p-2">
          <button onclick="deleteItem(${item.id})" class="text-red-500">Delete</button>
        </td>
      </tr>`;
  });
}
document.getElementById("addItemBtn").addEventListener("click", async () => {
  const newItem = {
    name: newName.value,
    price: parseFloat(newPrice.value),
    category: newCategory.value,
    available: newAvailable.value === "true"
  };
  await fetch(`${API_BASE}/menu`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newItem) });
  showToast("Item added!");
  loadMenu();
});
async function deleteItem(id) {
  await fetch(`${API_BASE}/menu/${id}`, { method: "DELETE" });
  showToast("Item deleted!", "bg-red-600");
  loadMenu();
}

// --- ORDERS ---
async function loadOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  const data = await res.json();
  const tbody = document.getElementById("ordersTable");
  tbody.innerHTML = "";
  data.forEach(order => {
    tbody.innerHTML += `
      <tr class="border-b">
        <td class="p-2">${order.id}</td>
        <td class="p-2">${order.items.map(i => i.name).join(", ")}</td>
        <td class="p-2">₹${order.total}</td>
        <td class="p-2">${order.status}</td>
        <td class="p-2">
          <button onclick="updateStatus(${order.id}, 'Processing')" class="text-blue-600">Process</button>
          <button onclick="updateStatus(${order.id}, 'Delivered')" class="text-green-600">Deliver</button>
        </td>
      </tr>`;
  });
}
async function updateStatus(id, status) {
  await fetch(`${API_BASE}/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  showToast(`Order ${status}`);
  loadOrders();
}

// --- COUPONS ---
async function loadCoupons() {
  const res = await fetch(`${API_BASE}/coupons`);
  const data = await res.json();
  const tbody = document.getElementById("couponsTable");
  tbody.innerHTML = "";
  data.forEach(c => {
    tbody.innerHTML += `
      <tr class="border-b">
        <td class="p-2">${c.code}</td>
        <td class="p-2">${c.type}</td>
        <td class="p-2">${c.discount}${c.type === "percent" ? "%" : "₹"}</td>
      </tr>`;
  });
}

// Load all by default
loadMenu();
loadOrders();
loadCoupons();
