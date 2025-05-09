// --- Cart Data Management ---
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let appliedCoupon = null;

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartUI() {
  const cartItemsEl = document.getElementById("cart-items");
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const subtotalEl = document.getElementById("subtotal");
  const couponDiscountEl = document.getElementById("coupon-discount");
  const taxAmountEl = document.getElementById("tax-amount");

  cartItemsEl.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <img src="${item.image || 'fallback.jpg'}" alt="${item.name}" class="cart-img" />
      <div class="cart-details">
        <h4>${item.name}</h4>
        <p>₹${item.price}</p>
        <button onclick="removeItem(${index})" class="remove-btn">Remove</button>
        <div class="status">Status: In Cart</div>
        <div class="rating-stars">
          ${[...Array(5)].map((_, i) =>
            `<span class="star" onclick="rateItem(${index}, ${i + 1})">${i < (item.rating || 0) ? '★' : '☆'}</span>`
          ).join('')}
        </div>
      </div>
    `;
    cartItemsEl.appendChild(itemEl);
    subtotal += item.price;
  });

  let discount = appliedCoupon ? 50 : 0;
  let tax = (subtotal - discount) * 0.05;
  let total = subtotal - discount + tax;

  cartCountEl.textContent = cart.length;
  cartTotalEl.textContent = total.toFixed(2);
  subtotalEl.textContent = subtotal.toFixed(2);
  couponDiscountEl.textContent = discount.toFixed(2);
  taxAmountEl.textContent = tax.toFixed(2);
}

// --- Cart Actions ---
function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function rateItem(index, stars) {
  cart[index].rating = stars;
  saveCart();
  updateCartUI();
  showToast("Thanks for rating!");
}

// --- Coupon ---
function applyCoupon() {
  const code = document.getElementById("coupon-code").value.trim();
  const messageEl = document.getElementById("coupon-message");

  if (code === "SAVE50") {
    appliedCoupon = code;
    messageEl.textContent = "Coupon applied successfully!";
  } else {
    messageEl.textContent = "Invalid coupon code.";
  }
  updateCartUI();
}

function removeCoupon() {
  appliedCoupon = null;
  document.getElementById("coupon-code").value = "";
  document.getElementById("coupon-message").textContent = "";
  updateCartUI();
}

// --- Toast ---
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// --- Toggle Breakdown ---
function togglePriceBreakdown() {
  const section = document.getElementById("price-breakdown");
  const arrow = document.getElementById("toggle-arrow");
  const isVisible = section.style.display === "block";
  section.style.display = isVisible ? "none" : "block";
  arrow.textContent = isVisible ? "➕" : "➖";
}

// --- Payment Stub ---
function proceedToPayment() {
  showToast("Proceeding to payment (mock)...");
  // Implement Razorpay or UPI logic here if needed
}

// --- Initialize ---
document.addEventListener("DOMContentLoaded", updateCartUI);
