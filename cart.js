let cart = JSON.parse(localStorage.getItem("cart")) || [];
let couponApplied = false;
let couponDiscount = 0;

// Define multiple coupons (as an example)
const coupons = {
  "FLAT50": 50,
  "SAVE20": 20,
  "OFF100": 100
};

// Function to display cart
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

  let totalAmount = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    if (!item || !item.name || !item.price) return;

    const quantity = item.quantity || 1;
    totalItems += quantity;
    totalAmount += item.price * quantity;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
      <img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.src='fallback.jpg';" />
      <div class="cart-details">
        <h4>${item.name} (x${quantity})</h4>
        <p>₹${(item.price * quantity).toFixed(2)}</p>
        <button onclick="updateQuantity(${index}, 1)">+</button>
        <button onclick="updateQuantity(${index}, -1)">-</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });

  // Calculate tax (5%)
  let tax = totalAmount * 0.05;

  // Apply coupon discount if any
  let finalAmount = totalAmount - couponDiscount;
  
  // Update UI elements
  subtotalElement.textContent = totalAmount.toFixed(2);
  couponDiscountElement.textContent = couponDiscount.toFixed(2);
  taxAmount.textContent = tax.toFixed(2);
  cartTotal.textContent = (finalAmount + tax).toFixed(2);
  cartCount.textContent = totalItems;
}

// Function to update item quantity
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

// Function to remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

// Proceed to payment
function proceedToPayment() {
  alert("Redirecting to Razorpay/UPI Payment...");
  // Razorpay/UPI integration logic goes here
}

// Apply coupon discount
function applyCoupon() {
  const couponCode = document.getElementById("coupon-code").value.trim().toUpperCase();
  const couponMessage = document.getElementById("coupon-message");

  // Check if the coupon code is valid
  if (coupons[couponCode]) {
    couponApplied = true;
    couponDiscount = coupons[couponCode];
    couponMessage.textContent = "Coupon applied successfully!";
  } else {
    couponApplied = false;
    couponDiscount = 0;
    couponMessage.textContent = "Invalid coupon code.";
  }

  saveCart();
}

// Remove coupon
function removeCoupon() {
  couponApplied = false;
  couponDiscount = 0;
  document.getElementById("coupon-code").value = ""; // Clear the coupon code input
  document.getElementById("coupon-message").textContent = "";
  saveCart();
}

// Toggle the price breakdown section
function togglePriceBreakdown() {
  const priceBreakdown = document.getElementById("price-breakdown");
  const arrow = document.getElementById("toggle-arrow");

  if (priceBreakdown.style.display === "none" || priceBreakdown.style.display === "") {
    priceBreakdown.style.display = "block";
    arrow.textContent = "➖"; // Change to minus symbol
  } else {
    priceBreakdown.style.display = "none";
    arrow.textContent = "➕"; // Change to plus symbol
  }
}

// Add a simple order tracking section
function displayOrderTracking() {
  const orderTrackingSection = document.getElementById("order-tracking");

  // Add some dummy status for now
  const status = "Processing"; // Change based on your actual order status logic

  orderTrackingSection.innerHTML = `
    <h4>Order Tracking</h4>
    <p>Status: <strong>${status}</strong></p>
  `;
}

window.onload = function() {
  displayCart();
  displayOrderTracking();
};
