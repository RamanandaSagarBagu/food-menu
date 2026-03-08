/* cart.js
   Handles:
   - Displaying cart
   - Coupons
   - Tax
   - Razorpay + UPI payment
   - Sends order to backend (/api/orders)
*/

const TAX_RATE = 0.05;
const API_BASE = "http://localhost:3000/api/orders";

const COUPONS = {
  'FOOD10': { type: 'percent', value: 10, label: '10% off' },
  'FLAT50': { type: 'flat', value: 50, label: '₹50 off' }
};

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function fixImageUrl(url) {
  if (!url) return './fallback.jpg';

  if (url.includes('github.com/') && url.includes('/blob/')) {
    url = url.replace('github.com/', 'raw.githubusercontent.com/').replace('/blob/', '/');
  }

  try {
    const decoded = decodeURI(url);
    return encodeURI(decoded);
  } catch {
    return url;
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

let appliedCoupon = null;

function displayCart() {
  const container = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('cart-total');

  container.innerHTML = '';

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = "<p>Your cart is empty</p>";
    subtotalEl.textContent = "0";
    discountEl.textContent = "0";
    taxEl.textContent = "0";
    totalEl.textContent = "0";
    return;
  }

  let subtotal = 0;

  cart.forEach((item, idx) => {

    const qty = item.quantity || 1;
    const total = item.price * qty;

    subtotal += total;

    const div = document.createElement('div');
    div.className = 'cart-item';

    div.innerHTML = `
      <img src="${fixImageUrl(item.image)}" class="cart-img">
      <div class="cart-details">
        <h4>${escapeHtml(item.name)} (x${qty})</h4>
        <p>₹${total.toFixed(2)}</p>
        <button onclick="updateQuantity(${idx},1)">+</button>
        <button onclick="updateQuantity(${idx},-1)">-</button>
        <button onclick="removeFromCart(${idx})">Remove</button>
      </div>
    `;

    container.appendChild(div);
  });

  let discount = calculateDiscount(subtotal);
  let tax = (subtotal - discount) * TAX_RATE;
  let finalTotal = subtotal - discount + tax;

  subtotalEl.textContent = subtotal.toFixed(2);
  discountEl.textContent = discount.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  totalEl.textContent = finalTotal.toFixed(2);
}

function updateQuantity(index, delta) {
  const cart = getCart();
  cart[index].quantity = (cart[index].quantity || 1) + delta;

  if (cart[index].quantity <= 0) cart.splice(index, 1);

  saveCart(cart);
}

function removeFromCart(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function applyCoupon() {
  const code = document.getElementById("coupon-code").value.toUpperCase();

  if (COUPONS[code]) {
    appliedCoupon = code;
    showToast("Coupon applied");
  } else {
    appliedCoupon = null;
    showToast("Invalid coupon");
  }

  displayCart();
}

function calculateDiscount(subtotal) {
  if (!appliedCoupon) return 0;

  const c = COUPONS[appliedCoupon];

  return c.type === "percent"
    ? subtotal * (c.value / 100)
    : c.value;
}

function openRazorpay() {

  const total = parseFloat(document.getElementById("cart-total").textContent);

  const options = {
    key: "rzp_test_1234567890",
    amount: total * 100,
    currency: "INR",
    name: "Food Order",
    handler: function (response) {
      createOrder("razorpay", response.razorpay_payment_id);
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

function showUPIFallback() {
  createOrder("upi", "UPI_MANUAL_PAYMENT");
}

/* -------------------------------
   CREATE ORDER → SEND TO BACKEND
-------------------------------- */

async function createOrder(paymentMethod, paymentId) {

  const cart = getCart();

  if (!cart.length) return showToast("Cart empty");

  const subtotal = cart.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
  const discount = calculateDiscount(subtotal);
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + tax;

  const order = {
    items: cart,
    total: total,
    paymentMethod: paymentMethod,
    paymentId: paymentId,
    status: "Processing"
  };

  try {

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(order)
    });

    const data = await res.json();

    showToast("Order placed successfully!");

    localStorage.removeItem("cart");

    displayCart();

  } catch (err) {

    console.error(err);
    showToast("Order failed");

  }

}

function initCartPage() {
  displayCart();
}

window.addEventListener("DOMContentLoaded", initCartPage);
