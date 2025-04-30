let cart = JSON.parse(localStorage.getItem("cart")) || [];
let couponApplied = false;
let couponDiscount = 0;

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

  // Apply coupon discount if any
  totalAmount -= couponDiscount;

  // Tax calculation
  let tax = totalAmount * 0.05; // 5% GST

  // Update UI elements
  cartTotal.textContent = (totalAmount + tax).toFixed(2);
  cartCount.textContent = totalItems;
  couponDiscountElement.textContent = couponDiscount.toFixed(2);
  subtotalElement.textContent = totalAmount.toFixed(2);
  taxAmount.textContent = tax.toFixed(2);
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

// Proceed to payment (Razorpay/UPI integration)
function proceedToPayment() {
  const totalAmount = parseFloat(document.getElementById("cart-total").textContent);

  if (totalAmount > 0) {
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      name: "Your Store Name",
      description: "Food Order Payment",
      handler: function (response) {
        alert("Payment successful!");
        // Save order and show tracking
        showOrderTracking(response.razorpay_payment_id);
      },
      theme: {
        color: "#F37254"
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } else {
    alert("Your cart is empty!");
  }
}

// Apply coupon discount
function applyCoupon() {
  const couponCode = document.getElementById("coupon-code").value.trim().toUpperCase();
  const couponMessage = document.getElementById("coupon-message");

  // Example coupon check
  if (couponCode === "FLAT50") {
    couponApplied = true;
    couponDiscount = 50; // ₹50 discount
    couponMessage.textContent = "Coupon applied successfully!";
  } else {
    couponApplied = false;
    couponDiscount = 0;
    couponMessage.textContent = "Invalid coupon code.";
  }

  saveCart();
}

// Show order tracking info
function showOrderTracking(paymentId) {
  const trackingBox = document.getElementById("order-tracking");
  trackingBox.style.display = "block";
  document.getElementById("order-status").textContent = `Your payment (ID: ${paymentId}) has been successfully processed. Your order is on the way!`;
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

window.onload = displayCart;
