let cart = JSON.parse(localStorage.getItem("cart")) || [];
let couponApplied = false;
let couponDiscount = 0;
let appliedCouponCode = "";
function displayCart() {
  const cartContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");
  const taxAmount = document.getElementById("tax-amount");
  const couponDiscountElement = document.getElementById("coupon-discount");
  const subtotalElement = document.getElementById("subtotal");

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0.00";
    cartCount.textContent = "0";
    taxAmount.textContent = "0.00";
    couponDiscountElement.textContent = "0.00";
    subtotalElement.textContent = "0.00";
    return;
  }

  let subtotal = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    if (!item || !item.name || !item.price) return;

    const quantity = item.quantity || 1;
    totalItems += quantity;
    subtotal += item.price * quantity;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    // Create star rating HTML if delivered
    let ratingHTML = "";
    if (item.status === "Delivered") {
      ratingHTML = `
        <div class="rating-stars" data-index="${index}">
          ${[1, 2, 3, 4, 5].map(i => `
            <span class="star" data-star="${i}">${(item.rating >= i) ? '★' : '☆'}</span>
          `).join("")}
        </div>`;
    }

    cartItem.innerHTML = `
      <img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.src='fallback.jpg';" />
      <div class="cart-details">
        <h4>${item.name} (x${quantity})</h4>
        <p>₹${(item.price * quantity).toFixed(2)}</p>
        <p>Status: <strong>${item.status || 'Processing'}</strong></p>
        ${item.status === "Delivered" ? '' : `
          <button onclick="updateQuantity(${index}, 1)">+</button>
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        `}
        ${ratingHTML}
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });

  let discountedTotal = subtotal - couponDiscount;
  let tax = discountedTotal * 0.05;

  cartTotal.textContent = (discountedTotal + tax).toFixed(2);
  cartCount.textContent = totalItems;
  couponDiscountElement.textContent = couponDiscount.toFixed(2);
  subtotalElement.textContent = subtotal.toFixed(2);
  taxAmount.textContent = tax.toFixed(2);

  attachRatingEvents();
}

// Display cart
function displayCart() {
  const cartContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");
  const taxAmount = document.getElementById("tax-amount");
  const couponDiscountElement = document.getElementById("coupon-discount");
  const subtotalElement = document.getElementById("subtotal");

  cartContainer.innerHTML = "";
  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0.00";
    cartCount.textContent = "0";
    taxAmount.textContent = "0.00";
    couponDiscountElement.textContent = "0.00";
    subtotalElement.textContent = "0.00";
    return;
  }

  let subtotal = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    if (!item || !item.name || !item.price) return;

    const quantity = item.quantity || 1;
    const isDelivered = item.status === "Delivered";
    totalItems += quantity;
    subtotal += item.price * quantity;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
      <img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.src='fallback.jpg';" />
      <div class="cart-details">
        <h4>${item.name} (x${quantity})</h4>
        <p>₹${(item.price * quantity).toFixed(2)}</p>
        <p class="status">Status: ${item.status || "Processing"}</p>
        ${isDelivered ? renderStars(index) : `
          <button onclick="updateQuantity(${index}, 1)">+</button>
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        `}
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });

  let discountedSubtotal = subtotal - couponDiscount;
  let tax = discountedSubtotal * 0.05;
  let total = discountedSubtotal + tax;

  cartTotal.textContent = total.toFixed(2);
  cartCount.textContent = totalItems;
  couponDiscountElement.textContent = couponDiscount.toFixed(2);
  subtotalElement.textContent = subtotal.toFixed(2);
  taxAmount.textContent = tax.toFixed(2);
}

// Quantity update
function updateQuantity(index, change) {
  if (cart[index]) {
    cart[index].quantity = (cart[index].quantity || 1) + change;
    if (cart[index].quantity <= 0) {
      removeFromCart(index);
    } else {
      saveCart();
    }
  }
}

// Remove item
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

// Save
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

// Payment
function proceedToPayment() {
  alert("Redirecting to Razorpay/UPI Payment...");
  // Add Razorpay logic here
}

// Coupon
function applyCoupon() {
  const code = document.getElementById("coupon-code").value.trim().toUpperCase();
  const msg = document.getElementById("coupon-message");

  const validCoupons = {
    "SAVE10": 10,
    "FOODIE20": 20,
    "FREEMEAL": 30
  };

  if (validCoupons[code]) {
    couponApplied = true;
    couponDiscount = validCoupons[code];
    appliedCouponCode = code;
    msg.textContent = `Coupon "${code}" applied!`;
  } else {
    couponApplied = false;
    couponDiscount = 0;
    msg.textContent = "Invalid coupon code.";
  }

  saveCart();
}

// Remove coupon
function removeCoupon() {
  couponApplied = false;
  couponDiscount = 0;
  appliedCouponCode = "";
  document.getElementById("coupon-message").textContent = "Coupon removed.";
  document.getElementById("coupon-code").value = "";
  saveCart();
}

// Toggle breakdown
function togglePriceBreakdown() {
  const section = document.getElementById("price-breakdown");
  const arrow = document.getElementById("toggle-arrow");

  if (section.style.display === "none" || section.style.display === "") {
    section.style.display = "block";
    arrow.textContent = "➖";
  } else {
    section.style.display = "none";
    arrow.textContent = "➕";
  }
}

// Star rating
function renderStars(index) {
  return `
    <div class="stars" data-index="${index}">
      ⭐⭐⭐⭐⭐
    </div>
  `;
}

window.onload = displayCart;
