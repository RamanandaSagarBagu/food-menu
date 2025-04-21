let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Display Cart
function displayCart() {
    const cartContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "0.00";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        if (!item || !item.name || !item.price) return;

        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        total += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.className = "cart-item";

        cartItem.innerHTML = `
            <img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.src='fallback.jpg'">
            <div class="cart-details">
                <h4>${item.name} (x${quantity})</h4>
                <p>₹${itemTotal.toFixed(2)}</p>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
    });

    cartTotal.textContent = total.toFixed(2);
}

// Update Quantity
function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        if (cart[index].quantity <= 0) removeFromCart(index);
        else saveCart();
    }
}

// Remove
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

// Save and Refresh
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

// Proceed to Checkout
function proceedToPayment() {
    alert("Redirecting to payment gateway...");
    // Integrate Razorpay, Paytm, etc.
}

// Initialize
window.onload = displayCart;
