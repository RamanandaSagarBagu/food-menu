let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayCart() {
    let cartContainer = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "0";
        return;
    }

    cart.forEach(item => {
        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <img src="${item.image}" class="cart-img">
            <div class="cart-details">
                <h4>${item.name} (x${item.quantity})</h4>
                <p>₹${item.price * item.quantity}</p>
                <button onclick="updateQuantity('${item.id}', 1)">+</button>
                <button onclick="updateQuantity('${item.id}', -1)">-</button>
                <button onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
    });

    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = totalAmount;
}

// Update Quantity
function updateQuantity(id, change) {
    let item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) removeFromCart(id);
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
    }
}

// Remove Item
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

// Proceed to Payment (Example)
function proceedToPayment() {
    alert("Redirecting to Payment...");
    // Razorpay or other payment gateway logic here
}

// Initialize cart display on page load
window.onload = displayCart;
