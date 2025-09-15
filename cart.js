let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orderStatus = "In Cart"; // Default status
let appliedCoupon = null;

// Function to Display Cart Items
function displayCart() {
    let cartContainer = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");
    let priceBreakdown = document.getElementById("price-breakdown");
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "0.00";
        priceBreakdown.innerHTML = "";
        return;
    }

    let subtotal = 0;
    cart.forEach((item, index) => {
        if (!item || !item.name || !item.price) return; // Skip invalid items

        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <img src="${item.image}" class="cart-img" alt="${item.name}" 
                onerror="this.src='fallback.png';">
            <div class="cart-details">
                <h4>${item.name} (x${item.quantity || 1})</h4>
                <p>₹${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                <div class="cart-controls">
                    <button class="increase-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    <button class="decrease-btn" onclick="updateQuantity(${index}, -1)">-</button>
                    <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;

        cartContainer.appendChild(cartItem);
        subtotal += item.price * (item.quantity || 1);
    });

    // Tax (5%)
    let tax = subtotal * 0.05;

    // Coupon
    let discount = 0;
    if (appliedCoupon === "FLAT50") {
        discount = 50;
    }

    let total = subtotal + tax - discount;
    if (total < 0) total = 0;

    // Update totals
    cartTotal.textContent = total.toFixed(2);
    priceBreakdown.innerHTML = `
        <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
        <p>Tax (5% GST): ₹${tax.toFixed(2)}</p>
        <p>Discount: -₹${discount.toFixed(2)}</p>
        <h3>Final Total: ₹${total.toFixed(2)}</h3>
    `;
}

// Update Quantity
function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        if (cart[index].quantity <= 0) removeFromCart(index);
        else saveCart();
    }
}

// Remove Item
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

// Save & Refresh Cart
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

// Apply Coupon
function applyCoupon() {
    let code = document.getElementById("coupon-code").value.trim();
    if (code === "FLAT50") {
        appliedCoupon = "FLAT50";
        alert("Coupon Applied: ₹50 off!");
    } else {
        appliedCoupon = null;
        alert("Invalid Coupon Code");
    }
    displayCart();
}

// Checkout Modal
function proceedToPayment() {
    document.getElementById("paymentModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("paymentModal").style.display = "none";
}

// Razorpay Payment
function payNow() {
    let total = document.getElementById("cart-total").textContent;
    let options = {
        key: "rzp_test_1234567890", // Replace with your Razorpay Key
        amount: parseFloat(total) * 100, // in paisa
        currency: "INR",
        name: "Food Order",
        description: "Checkout Payment",
        handler: function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            updateOrderStatus("Processing");
        },
        theme: {
            color: "#ff7043",
        },
    };
    let rzp = new Razorpay(options);
    rzp.open();
}

// Pay Later
function payLater() {
    alert("Order Placed! You can pay at delivery.");
    updateOrderStatus("Processing");
    closeModal();
}

// Order Tracking
function updateOrderStatus(status) {
    orderStatus = status;
    let statusBox = document.getElementById("order-status");
    if (statusBox) {
        statusBox.innerHTML = `<p><strong>Order Status:</strong> ${orderStatus}</p>`;
    }

    // Simulate progression
    if (status === "Processing") {
        setTimeout(() => updateOrderStatus("Out for Delivery"), 5000);
        setTimeout(() => updateOrderStatus("Delivered"), 10000);
    }
}

// Initialize cart display on page load
window.onload = displayCart;
