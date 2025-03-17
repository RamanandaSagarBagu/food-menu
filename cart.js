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

    let totalAmount = 0;

    cart.forEach((item, index) => {
        // Ensure price is a number to avoid NaN
        item.price = parseFloat(item.price) || 0;

        let itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <img src="${item.image}" class="cart-img" alt="${item.name}">
            <div class="cart-details">
                <h4>${item.name} (x${item.quantity})</h4>
                <p>₹${itemTotal.toFixed(2)}</p>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
    });

    cartTotal.textContent = totalAmount.toFixed(2);
}

// Update Quantity
function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            removeFromCart(index);
        } else {
            localStorage.setItem("cart", JSON.stringify(cart));
            displayCart();
        }
    }
}

// Remove Item
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
}

// Proceed to Payment (Example)
function proceedToPayment() {
    alert("Redirecting to Payment...");
    // Add payment gateway integration here
}

// Initialize cart display on page load
window.onload = displayCart;
