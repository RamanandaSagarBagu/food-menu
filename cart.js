/* cart.js
   Handles:
   - Displaying cart (read from localStorage 'cart')
   - Coupons (FOOD10 = 10% off, FLAT50 = ₹50 off)
   - Tax 5% (applied after discount)
   - Checkout: Razorpay integration (test key) + UPI fallback modal
   - Order creation and tracking with persistence in localStorage
*/

// ---------- Helpers ----------
const TAX_RATE = 0.05;
const COUPONS = {
  'FOOD10': { type:'percent', value:10, label:'10% off' },
  'FLAT50': { type:'flat', value:50, label:'₹50 off' }
};

function getCart(){ return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); displayCart(); }

// Toast
function showToast(msg, time=1800){
  let t = document.querySelector('.toast');
  if(!t){
    t = document.createElement('div'); t.className='toast'; document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity='1'; t.style.transform='translateY(0)';
  clearTimeout(t._timeout); t._timeout = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(8px)'; }, time);
}

// ---------- Coupon state ----------
let appliedCoupon = null;

// ---------- Display ----------
function displayCart(){
  const container = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const taxEl = document.getElementById('tax');
  const totalEl = document.getElementById('cart-total');
  const couponMsg = document.getElementById('coupon-message');

  container.innerHTML = '';
  couponMsg.textContent = '';

  const cart = getCart();
  if(cart.length === 0){
    container.innerHTML = '<p style="padding:12px;color:#666">Your cart is empty.</p>';
    subtotalEl.textContent = '0.00'; discountEl.textContent='0.00'; taxEl.textContent='0.00'; totalEl.textContent='0.00';
    updateCartBadge();
    return;
  }

  let subtotal = 0;
  cart.forEach((item, idx)=>{
    const qty = item.quantity || 1;
    const itemTotal = Number(item.price) * qty;
    subtotal += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image || 'fallback.jpg'}" class="cart-img" onerror="this.src='fallback.jpg'">
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
  let discount = 0;
  if(appliedCoupon && COUPONS[appliedCoupon]){
    const c = COUPONS[appliedCoupon];
    if(c.type === 'percent') discount = subtotal * (c.value/100);
    else discount = c.value;
  }

  // Tax on (subtotal - discount)
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * TAX_RATE;
  const total = Math.max(0, taxable + tax);

  subtotalEl.textContent = subtotal.toFixed(2);
  discountEl.textContent = discount.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  totalEl.textContent = total.toFixed(2);

  if(appliedCoupon){ couponMsg.textContent = `Coupon "${appliedCoupon}" applied.`; }
  updateCartBadge();
}

// ---------- Utilities ----------
function updateQuantity(index, delta){
  let cart = getCart();
  if(!cart[index]) return;
  cart[index].quantity = (cart[index].quantity||1) + delta;
  if(cart[index].quantity <= 0) cart.splice(index,1);
  saveCart(cart);
  showToast('Cart updated');
}

function removeFromCart(index){
  let cart = getCart();
  if(!cart[index]) return;
  cart.splice(index,1);
  saveCart(cart);
  showToast('Item removed');
}

function updateCartBadge(){
  const cart = getCart();
  const total = cart.reduce((s,i)=> s + (i.quantity||0), 0);
  // Update menu page cart-count if present
  const badge = document.getElementById('cart-count') || document.querySelector('#cart-count');
  if(badge) badge.textContent = total;
}

// ---------- Coupons ----------
function applyCoupon(){
  const code = document.getElementById('coupon-code').value.trim().toUpperCase();
  const msg = document.getElementById('coupon-message');
  if(!code){ msg.textContent = 'Enter a coupon code.'; return; }
  if(COUPONS[code]){
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
function removeCoupon(){ appliedCoupon = null; document.getElementById('coupon-code').value=''; document.getElementById('coupon-message').textContent='Coupon removed'; displayCart(); }

// ---------- Checkout Options (choose Razorpay or UPI) ----------
function openCheckoutOptions(){
  // Simple chooser modal created dynamically
  const modal = document.createElement('div');
  modal.className = 'upi-modal';
  modal.innerHTML = `
    <div class="upi-card">
      <h3>Select Payment</h3>
      <p style="margin:6px 0 12px 0">Total: ₹${document.getElementById('cart-total').textContent}</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        <button id="pay-razor" style="background:#3b82f6;color:#fff;padding:10px 14px;border-radius:8px;border:none;cursor:pointer">Pay with Razorpay</button>
        <button id="pay-upi" style="background:#10b981;color:#fff;padding:10px 14px;border-radius:8px;border:none;cursor:pointer">Pay with UPI</button>
        <button id="pay-cancel" style="background:#e5e7eb;padding:10px 14px;border-radius:8px;border:none;cursor:pointer">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('pay-cancel').onclick = ()=> modal.remove();
  document.getElementById('pay-upi').onclick = ()=> { modal.remove(); showUPIFallback(); };
  document.getElementById('pay-razor').onclick = ()=> { modal.remove(); openRazorpay(); };
}

// ---------- Razorpay integration (demo/test) ----------
function openRazorpay(){
  const totalRupees = parseFloat(document.getElementById('cart-total').textContent) || 0;
  if(totalRupees <= 0){ showToast('Cart total is zero'); return; }

  const amountPaisas = Math.round(totalRupees * 100);

  const options = {
    key: "rzp_test_1234567890", // << REPLACE with your key in production
    amount: amountPaisas,
    currency: "INR",
    name: "Food Order",
    description: "Payment for food order",
    handler: function (response){
      // Successful payment
      createOrder('razorpay', response.razorpay_payment_id || 'TESTPAYID');
    },
    modal: {
      ondismiss: function(){
        // If cancelled, nothing — user can retry or use UPI fallback
        showToast('Payment popup closed');
      }
    },
    theme: { color: "#ff7043" }
  };

  const rzp = new Razorpay(options);
  rzp.open();
}

// ---------- UPI fallback UI ----------
function showUPIFallback(){
  const amount = document.getElementById('cart-total').textContent;
  const upiId = "yourupi@upi"; // change to real UPI if needed
  const modal = document.createElement('div');
  modal.className = 'upi-modal';
  modal.innerHTML = `
    <div class="upi-card">
      <h3>Pay via UPI</h3>
      <p>Total: ₹${amount}</p>
      <p><strong>UPI ID:</strong> ${upiId}</p>
      <img src="upi-qr.png" alt="UPI QR" onerror="this.style.display='none'">
      <p>After paying, click <strong>I have paid</strong> to confirm.</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:12px">
        <button id="upi-paid" style="background:#10b981;color:#fff;padding:10px;border-radius:8px;border:none;cursor:pointer">I have paid</button>
        <button id="upi-cancel" style="background:#e5e7eb;padding:10px;border-radius:8px;border:none;cursor:pointer">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('upi-cancel').onclick = ()=> modal.remove();
  document.getElementById('upi-paid').onclick = ()=> {
    modal.remove();
    // In real flow you'd verify payment server-side. We'll assume success here.
    createOrder('upi', 'UPI_TXN_PLACEHOLDER');
  };
}

// ---------- Order creation & tracking ----------
function createOrder(paymentMethod, paymentId){
  const cart = getCart();
  if(!cart || cart.length === 0){ showToast('Cart empty'); return; }

  // Build order
  const subtotal = cart.reduce((s,i)=> s + (i.price * (i.quantity||1)), 0);
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

  // Save to orders list in localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  // Clear cart
  localStorage.removeItem('cart');
  appliedCoupon = null;
  showToast('Order placed: ' + orderId);

  // Start simulated tracking and persist tracking state
  simulateTracking(orderId);
  displayCart(); // refresh cart area
  showLastOrder(orderId);
}

// Calculate discount used in display and order creation
function calculateDiscount(subtotal){
  if(!appliedCoupon) return 0;
  const c = COUPONS[appliedCoupon];
  if(!c) return 0;
  if(c.type === 'percent') return subtotal * (c.value / 100);
  return c.value;
}

// Simulated order tracking progression and persistence
function simulateTracking(orderId){
  // store initial status
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const orderIndex = orders.findIndex(o=>o.id === orderId);
  if(orderIndex === -1) return;

  orders[orderIndex].status = 'processing';
  localStorage.setItem('orders', JSON.stringify(orders));
  updateTrackingUI(orderId);

  // After 5s -> out for delivery
  setTimeout(()=>{
    const olist = JSON.parse(localStorage.getItem('orders') || '[]');
    const idx = olist.findIndex(o=>o.id === orderId);
    if(idx !== -1){
      olist[idx].status = 'out';
      localStorage.setItem('orders', JSON.stringify(olist));
      updateTrackingUI(orderId);
    }
  }, 5000);

  // After 10s -> delivered
  setTimeout(()=>{
    const olist = JSON.parse(localStorage.getItem('orders') || '[]');
    const idx = olist.findIndex(o=>o.id === orderId);
    if(idx !== -1){
      olist[idx].status = 'delivered';
      localStorage.setItem('orders', JSON.stringify(olist));
      updateTrackingUI(orderId);
    }
  }, 10000);
}

// Show last order in tracking panel
function showLastOrder(orderId){
  document.getElementById('order-tracking').style.display = 'block';
  updateTrackingUI(orderId);
}

// Update tracking UI based on latest orders or specific order
function updateTrackingUI(orderId){
  // If no orderId, pick last order
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  let order = null;
  if(orderId){
    order = orders.find(o=>o.id===orderId);
  } else {
    order = orders[orders.length-1];
  }
  if(!order){
    // reset UI to 'In Cart' only
    setTrackingStep('none');
    return;
  }

  const status = order.status || 'placed';
  if(status === 'placed') setTrackingStep('placed');
  if(status === 'processing') setTrackingStep('processing');
  if(status === 'out') setTrackingStep('out');
  if(status === 'delivered') setTrackingStep('delivered');

  const msg = document.getElementById('tracking-message');
  msg.textContent = `Order ${order.id} - Status: ${status.toUpperCase()}`;
}

// Apply active class to steps
function setTrackingStep(step){
  const placed = document.getElementById('step-placed');
  const processing = document.getElementById('step-processing');
  const out = document.getElementById('step-out');
  const delivered = document.getElementById('step-delivered');

  // reset
  [placed,processing,out,delivered].forEach(el => el.classList.remove('active'));

  if(step === 'none'){ placed.classList.add('active'); return; }
  if(step === 'placed'){ placed.classList.add('active'); return; }
  if(step === 'processing'){ processing.classList.add('active'); return; }
  if(step === 'out'){ out.classList.add('active'); return; }
  if(step === 'delivered'){ delivered.classList.add('active'); return; }
}

// Escape helper (simple)
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

// ---------- Init ----------
function initCartPage(){
  displayCart();
  // show last order if exists
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if(orders.length > 0){
    const last = orders[orders.length - 1];
    showLastOrder(last.id);
  } else {
    document.getElementById('order-tracking').style.display = 'none';
  }
  // update badge in menu if present
  const cartCountEls = document.querySelectorAll('#cart-count');
  cartCountEls.forEach(el => {
    const total = getCart().reduce((s,i)=> s + (i.quantity||0),0);
    el.textContent = total;
  });
}

// Run init on load
window.addEventListener('DOMContentLoaded', initCartPage);
