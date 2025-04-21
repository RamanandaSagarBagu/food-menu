let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Function to Display Cart Items
function displayCart() {
    let cartContainer = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "0.00";
        return;
    }

    let totalAmount = 0;
    cart.forEach((item, index) => {
        if (!item || !item.name || !item.price) return; // Skip invalid items

        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <img src="${item.image}" class="cart-img" alt="${item.name}">
            <div class="cart-details">
                <h4>${item.name} (x${item.quantity || 1})</h4>
                <p>₹${(item.price * (item.quantity || 1)).toFixed(2)}</p>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
        totalAmount += item.price * (item.quantity || 1);
    });

    cartTotal.textContent = totalAmount.toFixed(2);
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

// Proceed to Payment (Example)
function proceedToPayment() {
    alert("Redirecting to Payment...");
    // Razorpay or other payment logic here
}

// Initialize cart display on page load
window.onload = displayCart;
cartItem.innerHTML = `
    <img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.src='fallback.jpg';">
    <div class="cart-details">
        <h4>${item.name} (x${item.quantity || 1})</h4>
        <p>₹${(item.price * (item.quantity || 1)).toFixed(2)}</p>
        <button onclick="updateQuantity(${index}, 1)">+</button>
        <button onclick="updateQuantity(${index}, -1)">-</button>
        <button onclick="removeFromCart(${index})">Remove</button>
    </div>
`;
