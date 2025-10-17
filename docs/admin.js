const backendURL = "http://localhost:3000/api";

// ===== MENU =====
async function loadMenu() {
  const res = await fetch(`${backendURL}/menu`);
  const menu = await res.json();
  const tbody = document.querySelector("#menuTable tbody");
  tbody.innerHTML = "";
  menu.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.id}</td>
      <td><input value="${item.name}" data-id="${item.id}" class="editName"></td>
      <td><input type="number" value="${item.price}" data-id="${item.id}" class="editPrice"></td>
      <td><input value="${item.category}" data-id="${item.id}" class="editCategory"></td>
      <td>
        <select data-id="${item.id}" class="editAvailable">
          <option value="true" ${item.available?'selected':''}>Yes</option>
          <option value="false" ${!item.available?'selected':''}>No</option>
        </select>
      </td>
      <td>
        <button onclick="updateItem(${item.id})">Update</button>
        <button onclick="deleteItem(${item.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function addItem() {
  const name = document.getElementById("newName").value;
  const price = parseFloat(document.getElementById("newPrice").value);
  const category = document.getElementById("newCategory").value;
  const available = document.getElementById("newAvailable").value === "true";
  if(!name || !price || !category) { alert("Fill all fields"); return; }
  await fetch(`${backendURL}/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, category, available })
  });
  loadMenu();
}

async function updateItem(id) {
  const name = document.querySelector(`.editName[data-id='${id}']`).value;
  const price = parseFloat(document.querySelector(`.editPrice[data-id='${id}']`).value);
  const category = document.querySelector(`.editCategory[data-id='${id}']`).value;
  const available = document.querySelector(`.editAvailable[data-id='${id}']`).value === "true";
  await fetch(`${backendURL}/menu/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, category, available })
  });
  loadMenu();
}

async function deleteItem(id) {
  await fetch(`${backendURL}/menu/${id}`, { method: "DELETE" });
  loadMenu();
}

document.getElementById("addItemBtn").addEventListener("click", addItem);

// ===== ORDERS =====
async function loadOrders() {
  const res = await fetch(`${backendURL}/orders`);
  const orders = await res.json();
  const tbody = document.querySelector("#ordersTable tbody");
  tbody.innerHTML = "";
  orders.forEach(order => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${order.id}</td>
      <td>${order.items.map(i=>i.name).join(", ")}</td>
      <td>${order.total}</td>
      <td>
        <select onchange="updateOrderStatus(${order.id}, this.value)">
          <option value="Processing" ${order.status==='Processing'?'selected':''}>Processing</option>
          <option value="Delivered" ${order.status==='Delivered'?'selected':''}>Delivered</option>
        </select>
      </td>
      <td></td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateOrderStatus(id, status) {
  await fetch(`${backendURL}/orders/${id}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ status })
  });
  loadOrders();
}

// ===== COUPONS =====
async function loadCoupons() {
  const res = await fetch(`${backendURL}/coupons`);
  const coupons = await res.json();
  const tbody = document.querySelector("#couponsTable tbody");
  tbody.innerHTML = "";
  coupons.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td><td>${c.code}</td><td>${c.type}</td><td>${c.discount}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ===== INITIAL LOAD =====
loadMenu();
loadOrders();
loadCoupons();
