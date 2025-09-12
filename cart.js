let cart = JSON.parse(localStorage.getItem("cart")) || [];
let appliedCoupon = null;
const TAX_RATE = 0.05; // 5%

// Display Cart
function displayCart() {
  let container = document.getElementById("cart-items");
  let subtotalEl = document.getElementById("subtotal");
  let discountEl = document.getElementById("discount");
  let taxEl = document.getElementById("tax");
  let totalEl = document.getElementById("cart-total");

  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    subtotalEl.textContent = "0.00";
    discountEl.textContent = "0.00";
    taxEl.textContent = "0.00";
    totalEl.textContent = "0.00";
    return;
  }

  let subtotal = 0;
  cart.forEach((item, index) => {
    let qty = item.quantity || 1;
    subtotal += item.price * qty;

    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.src='fallback.png';">
      <div class="cart-details">
        <h4>${item.name} (x${qty})</h4>
        <p>₹${(item.price * qty).toFixed(2)}</p>
        <div class="cart-controls">
          <button onclick="updateQuantity(${index}, 1)">+</button>
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(div);
  });

  // Coupon
  let discount = 0;
  if (appliedCoupon === "FOOD10") discount = subtotal * 0.10;

  // Tax
  let taxable = subtotal - discount;
  let tax = taxable * TAX_RATE;

  // Final Total
  let total = taxable + tax;

  subtotalEl.textContent = subtotal.toFixed(2);
  discountEl.textContent = discount.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  totalEl.textContent = total.toFixed(2);
}

// Quantity
function updateQuantity(index, change) {
  if (!cart[index]) return;
  cart[index].quantity = (cart[index].quantity || 1) + change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
}
function removeFromCart(index) { cart.splice(index, 1); saveCart(); }
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); displayCart(); }

// Coupons
function applyCoupon() {
  let code = document.getElementById("coupon-code").value.trim().toUpperCase();
  if (code === "FOOD10") {
    appliedCoupon = code;
    alert("Coupon applied: 10% OFF!");
  } else {
    alert("Invalid coupon!");
  }
  displayCart();
}
function removeCoupon() { appliedCoupon = null; displayCart(); }

// Payment (Razorpay Example)
function proceedToPayment() {
  let total = parseFloat(document.getElementById("cart-total").textContent) * 100; // paise
  if (total <= 0) { alert("Cart is empty!"); return; }

  let options = {
    key: "rzp_test_1234567890", // Replace with your Razorpay key
    amount: total,
    currency: "INR",
    name: "Food Order",
    description: "Checkout Payment",
    handler: function (response) {
      alert("Payment Successful! ID: " + response.razorpay_payment_id);
      updateOrderStatus();
    },
    theme: { color: "#ff5722" }
  };

  let rzp = new Razorpay(options);
  rzp.open();
}

// Order Tracking
function updateOrderStatus() {
  document.getElementById("status-cart").classList.remove("active");
  document.getElementById("status-processing").classList.add("active");
  setTimeout(() => {
    document.getElementById("status-processing").classList.remove("active");
    document.getElementById("status-delivered").classList.add("active");
  }, 5000);
}

// Init
window.onload = displayCart;
