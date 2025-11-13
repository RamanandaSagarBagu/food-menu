/* docs/script.js
   - Fetches /api/menu (live)
   - Uses imageData (base64) if present, else item.image, else fallback
   - Lazy loading, search, category filter, sort
   - Cart saved to localStorage with badge update
   - Toast notification
*/

const API_MENU = "/api/menu";
const foodContainer = document.getElementById("foodContainer");
const searchBox = document.getElementById("searchBox");
const categoryFilter = document.getElementById("categoryFilter");
const sortOptions = document.getElementById("sortOptions");
const toast = document.getElementById("toast");
const noItems = document.getElementById("noItems");
const CART_KEY = "foodmenu_cart_v1";

let allMenu = []; // populated from server
let filteredMenu = [];

// ---- Fetch menu from backend ----
async function fetchMenu() {
  try {
    const res = await fetch(API_MENU);
    if (!res.ok) throw new Error("Failed to load menu");
    allMenu = await res.json();
    buildCategoryFilter();
    applyControls();
  } catch (err) {
    console.error(err);
    showToast("Could not load menu", true);
  }
}

// ---- Render menu ----
function renderMenu(list) {
  foodContainer.innerHTML = "";
  if (!list || list.length === 0) {
    noItems.style.display = "block";
    return;
  } else {
    noItems.style.display = "none";
  }

  const frag = document.createDocumentFragment();
  list.forEach(item => {
    const article = document.createElement("article");
    article.className = "food-card";
    article.dataset.id = item.id;

    // resolve image: prefer imageData, then image URL
    const src = item.imageData || item.image || null;

    let mediaHtml = "";
    if (src) {
      // create img element
      mediaHtml = `<img loading="lazy" src="${escapeHTML(src)}" alt="${escapeHTML(item.name)}" onerror="this.onerror=null;this.style.display='none';">`;
    } else {
      mediaHtml = `<div class="fallback">No image</div>`;
    }

    article.innerHTML = `
      ${mediaHtml}
      <h3>${escapeHTML(item.name)}</h3>
      <div class="price">₹${Number(item.price || 0)}</div>
      <p>${escapeHTML(item.category || "")}</p>
      <button class="btn add-to-cart" data-id="${item.id}">Add to Cart</button>
    `;
    frag.appendChild(article);
  });

  foodContainer.appendChild(frag);
  attachAddButtons();
}

// ---- Controls: search/filter/sort ----
function buildCategoryFilter() {
  const set = new Set(allMenu.map(i => i.category).filter(Boolean));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  [...set].sort().forEach(cat => {
    const o = document.createElement("option");
    o.value = cat;
    o.textContent = cat;
    categoryFilter.appendChild(o);
  });
}

function applyControls() {
  const q = (searchBox.value || "").trim().toLowerCase();
  const cat = categoryFilter.value;
  const sortBy = sortOptions.value;

  filteredMenu = allMenu.filter(item => {
    if (cat !== "all" && item.category !== cat) return false;
    if (!q) return true;
    const hay = ((item.name || "") + " " + (item.category || "") + " " + (item.description || "")).toLowerCase();
    return hay.includes(q);
  });

  if (sortBy === "price-low") filteredMenu.sort((a,b) => (a.price||0) - (b.price||0));
  else if (sortBy === "price-high") filteredMenu.sort((a,b) => (b.price||0) - (a.price||0));
  else if (sortBy === "name-az") filteredMenu.sort((a,b) => (a.name||"").localeCompare(b.name||""));

  renderMenu(filteredMenu);
}

// ---- Cart helpers ----
function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}
function addToCart(itemId) {
  const item = allMenu.find(i => String(i.id) === String(itemId));
  if (!item) { showToast("Item not found", true); return; }
  const cart = getCart();
  const existing = cart.find(c => String(c.id) === String(itemId));
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else cart.push({ id: item.id, name: item.name, price: item.price || 0, qty: 1, image: item.imageData || item.image || null });
  saveCart(cart);
  showToast(`${item.name} added to cart`);
}
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((s,i) => s + (i.qty || 0), 0);
  const el = document.getElementById("cart-count");
  if (el) el.textContent = total;
}

// ---- attach Add buttons ----
function attachAddButtons() {
  document.querySelectorAll(".add-to-cart").forEach(btn => {
    btn.addEventListener("click", (ev) => {
      const id = btn.getAttribute("data-id");
      addToCart(id);
    });
  });
}

// ---- toast ----
let toastTimer = null;
function showToast(msg, isError=false, duration=1400) {
  toast.textContent = msg;
  toast.setAttribute("aria-hidden", "false");
  toast.style.background = isError ? "#dc2626" : "#10b981";
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.setAttribute("aria-hidden", "true");
  }, duration);
}

// ---- utility ----
function escapeHTML(s) {
  if (!s && s !== 0) return "";
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

// ---- events ----
let searchTimer = null;
searchBox.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(applyControls, 200);
});
categoryFilter.addEventListener("change", applyControls);
sortOptions.addEventListener("change", applyControls);

// ---- init ----
updateCartCount();
fetchMenu();
