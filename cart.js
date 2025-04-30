let cart = JSON.parse(localStorage.getItem("cart")) || [];
let couponApplied = false;
let couponDiscount = 0;
let appliedCouponCode = "";

window.onload = displayCart;

// ------------------ CART DISPLAY ------------------
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

    // Star rating HTML
    let ratingHTML = "";
    if (isDelivered) {
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
        ${!isDelivered ? `
          <button onclick="updateQuantity(${index}, 1)">+</button>
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
        ` : ''}
        ${ratingHTML}
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

  attachRatingEvents();
}

// ------------------ CART ACTIONS ------------------
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

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

// ------------------ COUPONS ------------------
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
    appliedCouponCode = "";
    msg.textContent = "Invalid coupon code.";
  }

  saveCart();
}

function removeCoupon() {
  couponApplied = false;
  couponDiscount = 0;
  appliedCouponCode = "";
  document.getElementById("coupon-message").textContent = "Coupon removed.";
  document.getElementById("coupon-code").value = "";
  saveCart();
}

// ------------------ RATINGS ------------------
function attachRatingEvents() {
  const starContainers = document.querySelectorAll(".rating-stars");
  starContainers.forEach(container => {
    const index = container.getAttribute("data-index");
    const stars = container.querySelectorAll(".star");

    stars.forEach(star => {
      star.addEventListener("click", () => {
        const selectedRating = parseInt(star.getAttribute("data-star"));
        const currentRating = cart[index].rating || 0;

        if (selectedRating === currentRating) {
          cart[index].rating = 0;
          showToast("Rating removed.");
        } else {
          cart[index].rating = selectedRating;
          showToast("Thanks for rating!");
        }

        saveCart();
      });
    });
  });
}

// ------------------ PAYMENT ------------------
function proceedToPayment() {
  alert("Redirecting to Razorpay/UPI Payment...");
  // Razorpay logic goes here
}

// ------------------ PRICE BREAKDOWN TOGGLE ------------------
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

// ------------------ TOAST ------------------
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}
