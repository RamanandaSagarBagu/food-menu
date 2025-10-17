/* cart.js
   Handles:
   - Displaying cart (from localStorage 'cart')
   - Coupons (FOOD10 = 10% off, FLAT50 = ₹50 off)
   - Tax 5% (after discount)
   - Checkout: Razorpay integration (test key) + UPI fallback modal
   - Order creation & tracking (localStorage)
   - Fallback image handling + GitHub raw URL fix
*/

const TAX_RATE = 0.05;
const COUPONS = {
  'FOOD10': { type: 'percent', value: 10, label: '10% off' },
  'FLAT50': { type: 'flat', value: 50, label: '₹50 off' }
};

// -------------------- Utilities --------------------
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
}

// Toast notification
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
  t._timeout = setTimeout(() => t.classList.remove('show'), time);
}

// ✅ Fix image URLs (GitHub -> raw + space fix)
function fixImageUrl(url) {
  if (!url) return './fallback.jpg';
  
  // Convert GitHub blob links to raw
  if (url.includes('github.com/') && url.includes('/blob/')) {
    url = url.replace('github.com/', 'raw.githubusercontent.com/').replace('/blob/', '/');
  }

  // Decode & re-encode safely to fix %20 or space issues
  try {
    const decoded = decodeURI(url);
    return encodeURI(decoded);
  } catch {
    return url;
  }
}

// Escape HTML
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

// -------------------- Coupon State --------------------
let appliedCoupon = null;

// -------------------- Display Cart --------------------
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
      <img 
        src="${fixImageUrl(item.image)}"
        class="cart-img"
        alt="${escapeHtml(item.name)}"
        onerror="this.onerror=null;this.src='./fallback.jpg';"
      >
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

  // Discount logic
  let discount = 0;
  if (appliedCoupon && COUPONS[appliedCoupon]) {
    const c = COUPONS[appliedCoupon];
    discount = c.type === 'percent' ? subtotal * (c.value / 100) : c.value;
  }

  // Tax + total
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

// -------------------- Quantity Updates --------------------
function updateQuantity(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].quantity = (cart[index].quantity || 1) + delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart(cart);
  showToast('Cart updated');
}

function removeFromCart(index) {
  const cart = getCart();
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart(cart);
  showToast('Item removed');
}

// -------------------- Badge Update --------------------
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = total;
}

// -------------------- Coupons --------------------
function applyCoupon() {
  const code = document.getElementById('coupon-code').value.trim().toUpperCase();
  const msg = document.getElementById('coupon-message');
  if (!code) return msg.textContent = 'Enter a coupon code.';
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

// -------------------- Checkout Options --------------------
function openCheckoutOptions() {
  const modal = document.createElement('div');
  modal.className = 'upi-modal active';
  modal.innerHTML = `
    <div class="upi-card">
      <h3>Select Payment</h3>
      <p>Total: ₹${document.getElementById('cart-total').textContent}</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button id="pay-razor" style="background:#3b82f6;color:#fff;padding:10px 14px;border-radius:8px;border:none;cursor:pointer">Razorpay</button>
        <button id="pay-upi" style="background:#10b981;color:#fff;padding:10px 14px;border-radius:8px;border:none;cursor:pointer">UPI</button>
        <button id="pay-cancel" style="background:#e5e7eb;padding:10px 14px;border-radius:8px;border:none;cursor:pointer">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('pay-cancel').onclick = () => modal.remove();
  document.getElementById('pay-upi').onclick = () => { modal.remove(); showUPIFallback(); };
  document.getElementById('pay-razor').onclick = () => { modal.remove(); openRazorpay(); };
}

// -------------------- Razorpay --------------------
function openRazorpay() {
  const totalRupees = parseFloat(document.getElementById('cart-total').textContent) || 0;
  if (totalRupees <= 0) return showToast('Cart total is zero');

  const options = {
    key: "rzp_test_1234567890",
    amount: Math.round(totalRupees * 100),
    currency: "INR",
    name: "Food Order",
    description: "Payment for your order",
    handler: response => createOrder('razorpay', response.razorpay_payment_id || 'TEST_PAY_ID'),
    modal: { ondismiss: () => showToast('Payment cancelled') },
    theme: { color: "#ff7043" }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}

// -------------------- UPI Fallback --------------------
function showUPIFallback() {
  const amount = document.getElementById('cart-total').textContent;
  const modal = document.createElement('div');
  modal.className = 'upi-modal active';
  modal.innerHTML = `
    <div class="upi-card">
      <h3>Pay via UPI</h3>
      <p>Total: ₹${amount}</p>
      <p><strong>UPI ID:</strong> yourupi@upi</p>
      <img src="upi-qr.png" alt="UPI QR" onerror="this.style.display='none'">
      <p>After payment, click "I Paid".</p>
      <div style="display:flex;gap:8px;justify-content:center">
        <button id="upi-paid" style="background:#10b981;color:#fff;padding:10px;border-radius:8px;border:none;cursor:pointer">I Paid</button>
        <button id="upi-cancel" style="background:#e5e7eb;padding:10px;border-radius:8px;border:none;cursor:pointer">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  document.getElementById('upi-cancel').onclick = () => modal.remove();
  document.getElementById('upi-paid').onclick = () => {
    modal.remove();
    createOrder('upi', 'UPI_TXN_PLACEHOLDER');
  };
}

// -------------------- Orders & Tracking --------------------
function createOrder(paymentMethod, paymentId) {
  const cart = getCart();
  if (!cart.length) return showToast('Cart empty');

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

function calculateDiscount(subtotal) {
  if (!appliedCoupon) return 0;
  const c = COUPONS[appliedCoupon];
  return c ? (c.type === 'percent' ? subtotal * (c.value / 100) : c.value) : 0;
}

function simulateTracking(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return;

  orders[idx].status = 'processing';
  localStorage.setItem('orders', JSON.stringify(orders));
  updateTrackingUI(orderId);

  setTimeout(() => updateOrderStatus(orderId, 'out'), 5000);
  setTimeout(() => updateOrderStatus(orderId, 'delivered'), 10000);
}

function updateOrderStatus(orderId, status) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const i = orders.findIndex(o => o.id === orderId);
  if (i !== -1) {
    orders[i].status = status;
    localStorage.setItem('orders', JSON.stringify(orders));
    updateTrackingUI(orderId);
  }
}

function showLastOrder(orderId) {
  document.getElementById('order-tracking').style.display = 'block';
  updateTrackingUI(orderId);
}

function updateTrackingUI(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const order = orderId ? orders.find(o => o.id === orderId) : orders[orders.length - 1];
  if (!order) return setTrackingStep('none');
  setTrackingStep(order.status);
  document.getElementById('tracking-message').textContent =
    `Order ${order.id} - Status: ${order.status.toUpperCase()}`;
}

function setTrackingStep(step) {
  const steps = ['placed', 'processing', 'out', 'delivered'];
  steps.forEach(id => {
    const el = document.getElementById(`step-${id}`);
    if (el) el.classList.remove('active');
  });
  if (steps.includes(step)) {
    const el = document.getElementById(`step-${step}`);
    if (el) el.classList.add('active');
  }
}

// -------------------- Init --------------------
function initCartPage() {
  displayCart();
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if (orders.length) showLastOrder(orders[orders.length - 1].id);
  else document.getElementById('order-tracking').style.display = 'none';
  updateCartBadge();
}

window.addEventListener('DOMContentLoaded', initCartPage);
