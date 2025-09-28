/* cart.js
   Handles:
   - Displaying cart (from localStorage 'cart')
   - Coupons (FOOD10 = 10% off, FLAT50 = ₹50 off)
   - Tax 5% (applied after discount)
   - Checkout: Razorpay integration (test key) + UPI fallback modal
   - Order creation and tracking with persistence in localStorage
*/

// ---------- Constants ----------
const TAX_RATE = 0.05;
const COUPONS = {
  'FOOD10': { type: 'percent', value: 10, label: '10% off' },
  'FLAT50': { type: 'flat', value: 50, label: '₹50 off' }
};

let appliedCoupon = null;

// ---------- Helpers ----------
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

// Toast
function showToast(msg, time = 1800) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => {
    t.classList.remove('show');
  }, time);
}

// ---------- Display ----------
function displayCart() {
  const container = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('cart-total');
  const couponMsg = document.getElementById('coupon-message');

  container.innerHTML = '';
  couponMsg.textContent = '';

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p style="padding:12px;color:#666">Your cart is empty.</p>';
    subtotalEl.textContent = '0.00';
    discountEl.textContent = '0.00';
    taxEl.textContent = '0.00';
    totalEl.textContent = '0.00';
    updateCartBadge();
    return;
  }

  let subtotal = 0;
  cart.forEach((item, idx) => {
    const qty = item.quantity || 1;
    const itemTotal = Number(item.price) * qty;
    subtotal += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image || 'fallback.png'}" class="cart-img" onerror="this.src='fallback.png'">
      <div class="cart-details">
        <h4>${escapeHtml(item.name)} (x${qty})</h4>
        <p>₹${itemTotal.toFixed(2)}</p>
        <div class="cart-controls">
          <button onclick="updateQuantity(${idx},1)">+</button>
          <button onclick="updateQuantity(${idx},-1)">-</button>
          <button class="remove-btn" onclick="removeFromCart(${idx})">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  // Discount
  let discount = calculateDiscount(subtotal);

  // Tax
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * TAX_RATE;
  const total = Math.max(0, taxable + tax);

  subtotalEl.textContent = subtotal.toFixed(2);
  discountEl.textContent = discount.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  totalEl.textContent = total.toFixed(2);

  if (appliedCoupon) {
    couponMsg.textContent = `Coupon "${appliedCoupon}" applied.`;
  }

  updateCartBadge();
}

// ---------- Utilities ----------
function updateQuantity(index, delta) {
  let cart = getCart();
  if (!cart[index]) return;
  cart[index].quantity = (cart[index].quantity || 1) + delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart(cart);
  showToast('Cart updated');
}

function removeFromCart(index) {
  let cart = getCart();
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart(cart);
  showToast('Item removed');
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = total;
}

// ---------- Coupons ----------
function applyCoupon() {
  const code = document.getElementById('coupon-code').value.trim().toUpperCase();
  const msg = document.getElementById('coupon-message');
  if (!code) { msg.textContent = 'Enter a coupon code.'; return; }
  if (COUPONS[code]) {
    appliedCoupon = code;
    msg.textContent = `Applied: ${COUPONS[code].label}`;
    showToast('Coupon applied');
  } else {
    appliedCoupon = null;
    msg.textContent = 'Invalid coupon';
    showToast('Invalid coupon');
  }
  displayCart();
}
function removeCoupon() {
  appliedCoupon = null;
  document.getElementById('coupon-code').value = '';
  document.getElementById('coupon-message').textContent = 'Coupon removed';
  displayCart();
}

function calculateDiscount(subtotal) {
  if (!appliedCoupon) return 0;
  const c = COUPONS[appliedCoupon];
  if (!c) return 0;
  if (c.type === 'percent') return subtotal * (c.value / 100);
  return c.value;
}

// ---------- Checkout ----------
function openCheckoutOptions() {
  const modal = document.createElement('div');
  modal.className = 'upi-modal active';
  modal.innerHTML = `
    <div class="upi-card">
      <h3>Select Payment</h3>
      <p style="margin:6px 0 12px 0">Total: ₹${document.getElementById('cart-total').textContent}</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button id="pay-razor">Pay with Razorpay</button>
        <button id="pay-upi">Pay with UPI</button>
        <button id="pay-cancel" style="background:#ccc;color:#000">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('pay-cancel').onclick = () => modal.remove();
  document.getElementById('pay-upi').onclick = () => { modal.remove(); showUPIFallback(); };
  document.getElementById('pay-razor').onclick = () => { modal.remove(); openRazorpay(); };
}

// Razorpay
function openRazorpay() {
  const totalRupees = parseFloat(document.getElementById('cart-total').textContent) || 0;
  if (totalRupees <= 0) { showToast('Cart total is zero'); return; }

  const amountPaisas = Math.round(totalRupees * 100);
  const options = {
    key: "rzp_test_1234567890", // Replace with your Razorpay key
    amount: amountPaisas,
    currency: "INR",
    name: "Food Order",
    description: "Payment for food order",
    handler: function (response) {
      createOrder('razorpay', response.razorpay_payment_id || 'TESTPAYID');
    },
    modal: {
      ondismiss: function () {
        showToast('Payment popup closed');
      }
    },
    theme: { color: "#ff7043" }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}

// UPI fallback
function showUPIFallback() {
  const amount = document.getElementById('cart-total').textContent;
  const upiId = "yourupi@upi"; // Replace with actual
  const modal = document.createElement('div');
  modal.className = 'upi-modal active';
  modal.innerHTML = `
    <div class="upi-card">
      <h3>Pay via UPI</h3>
      <p>Total: ₹${amount}</p>
      <p><strong>UPI ID:</strong> ${upiId}</p>
      <img src="upi-qr.png" alt="UPI QR" onerror="this.style.display='none'">
      <p>After paying, click <strong>I have paid</strong> to confirm.</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
        <button id="upi-paid">I have paid</button>
        <button id="upi-cancel" style="background:#ccc;color:#000">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('upi-cancel').onclick = () => modal.remove();
  document.getElementById('upi-paid').onclick = () => {
    modal.remove();
    createOrder('upi', 'UPI_TXN_PLACEHOLDER');
  };
}

// ---------- Orders & Tracking ----------
function createOrder(paymentMethod, paymentId) {
  const cart = getCart();
  if (!cart || cart.length === 0) { showToast('Cart empty'); return; }

  const subtotal = cart.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
  const discount = calculateDiscount(subtotal);
  const tax = Math.max(0, subtotal - discount) * TAX_RATE;
  const total = Math.max(0, subtotal - discount + tax);

  const orderId = 'ORD' + Date.now();
  const order = {
    id: orderId,
    items: cart,
    subtotal, discount, tax, total,
    payment: { method: paymentMethod, ref: paymentId },
    status: 'placed',
    createdAt: new Date().toISOString()
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  localStorage.removeItem('cart');
  appliedCoupon = null;
  showToast('Order placed: ' + orderId);

  simulateTracking(orderId);
  displayCart();
  showLastOrder(orderId);
}

function simulateTracking(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return;

  orders[idx].status = 'processing';
  localStorage.setItem('orders', JSON.stringify(orders));
  updateTrackingUI(orderId);

  setTimeout(() => {
    const olist = JSON.parse(localStorage.getItem('orders') || '[]');
    const i = olist.findIndex(o => o.id === orderId);
    if (i !== -1) {
      olist[i].status = 'out';
      localStorage.setItem('orders', JSON.stringify(olist));
      updateTrackingUI(orderId);
    }
  }, 5000);

  setTimeout(() => {
    const olist = JSON.parse(localStorage.getItem('orders') || '[]');
    const i = olist.findIndex(o => o.id === orderId);
    if (i !== -1) {
      olist[i].status = 'delivered';
      localStorage.setItem('orders', JSON.stringify(olist));
      updateTrackingUI(orderId);
    }
  }, 10000);
}

function showLastOrder(orderId) {
  document.getElementById('order-tracking').style.display = 'block';
  updateTrackingUI(orderId);
}

function updateTrackingUI(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orders.find(o => o.id === orderId) || orders[orders.length - 1];
  if (!order) { setTrackingStep('none'); return; }

  setTrackingStep(order.status);
  const msg = document.getElementById('tracking-message');
  msg.textContent = `Order ${order.id} - Status: ${order.status.toUpperCase()}`;
}

function setTrackingStep(step) {
  const placed = document.getElementById('step-placed');
  const processing = document.getElementById('step-processing');
  const out = document.getElementById('step-out');
  const delivered = document.getElementById('step-delivered');
  [placed, processing, out, delivered].forEach(el => el.classList.remove('active'));
  if (step === 'placed') placed.classList.add('active');
  if (step === 'processing') processing.classList.add('active');
  if (step === 'out') out.classList.add('active');
  if (step === 'delivered') delivered.classList.add('active');
}

// ---------- Escape HTML ----------
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
}

// ---------- Init ----------
function initCartPage() {
  displayCart();
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if (orders.length > 0) {
    const last = orders[orders.length - 1];
    showLastOrder(last.id);
  } else {
    document.getElementById('order-tracking').style.display = 'none';
  }
  updateCartBadge();
}

window.addEventListener('DOMContentLoaded', initCartPage);
