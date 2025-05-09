// cart.js - Updated logic for cart behavior

const cartItemsContainer = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const subtotalEl = document.getElementById("subtotal");
const couponDiscountEl = document.getElementById("coupon-discount");
const taxAmountEl = document.getElementById("tax-amount");
const cartCountEl = document.getElementById("cart-count");
const couponCodeInput = document.getElementById("coupon-code");
const couponMessage = document.getElementById("coupon-message");
const priceBreakdown = document.getElementById("price-breakdown");
const toggleArrow = document.getElementById("toggle-arrow");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let appliedCoupon = localStorage.getItem("coupon") || "";

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function renderCart() {
  cartItemsContainer.innerHTML = "";
  cart.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.innerHTML = `
      <img src="${item.image || 'fallback.jpg'}" class="cart-img" alt="${item.name}" />
      <div class="cart-details">
        <h4>${item.name}</h4>
        <p>₹${item.price}</p>
        <p class="status">Status: ${item.status}</p>
        <div>
          <button onclick="updateQuantity(${index}, -1)" ${item.status === 'Delivered' ? 'disabled' : ''}>-</button>
          <span>${item.quantity}</span>
          <button onclick="updateQuantity(${index}, 1)" ${item.status === 'Delivered' ? 'disabled' : ''}>+</button>
        </div>
        <button class="remove-btn" onclick="removeItem(${index})" ${item.status === 'Delivered' ? 'disabled' : ''}>Remove</button>
        <div class="rating-stars">
          ${[...Array(5)].map((_, i) => `<span class="star">★</span>`).join('')}
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(itemEl);
  });
}

function updateCart() {
  let subtotal = 0;
  cart.forEach(item => subtotal += item.price * item.quantity);
  let discount = appliedCoupon === "FOOD10" ? subtotal * 0.1 : 0;
  let tax = (subtotal - discount) * 0.05;
  let total = subtotal - discount + tax;

  cartTotalEl.textContent = total.toFixed(2);
  subtotalEl.textContent = subtotal.toFixed(2);
  couponDiscountEl.textContent = discount.toFixed(2);
  taxAmountEl.textContent = tax.toFixed(2);
  cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  renderCart();
}

function removeItem(index) {
  if (cart[index].status === "Delivered") return;
  cart.splice(index, 1);
  saveCart();
}

function updateQuantity(index, change) {
  if (cart[index].status === "Delivered") return;
  cart[index].quantity = Math.max(1, cart[index].quantity + change);
  saveCart();
}

function applyCoupon() {
  const code = couponCodeInput.value.trim();
  if (code === "FOOD10") {
    appliedCoupon = code;
    localStorage.setItem("coupon", code);
    couponMessage.textContent = "Coupon Applied!";
    couponMessage.style.color = "green";
  } else {
    couponMessage.textContent = "Invalid Coupon Code";
    couponMessage.style.color = "red";
  }
  updateCart();
}

function removeCoupon() {
  appliedCoupon = "";
  localStorage.removeItem("coupon");
  couponCodeInput.value = "";
  couponMessage.textContent = "Coupon removed.";
  couponMessage.style.color = "red";
  updateCart();
}

function togglePriceBreakdown() {
  if (priceBreakdown.style.display === "none" || priceBreakdown.style.display === "") {
    priceBreakdown.style.display = "block";
    toggleArrow.textContent = "➖";
  } else {
    priceBreakdown.style.display = "none";
    toggleArrow.textContent = "➕";
  }
}

function proceedToPayment() {
  cart = cart.map(item => {
    if (item.status === "In Cart") return { ...item, status: "Processing" };
    if (item.status === "Processing") return { ...item, status: "Delivered" };
    return item;
  });
  saveCart();
  alert("Order status updated. Check cart again.");
}

// Initial load
document.addEventListener("DOMContentLoaded", () => {
  if (appliedCoupon) couponCodeInput.value = appliedCoupon;
  updateCart();
});
