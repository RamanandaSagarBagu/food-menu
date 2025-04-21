let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discount = 0;

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

        const itemDiv = document.createElement("div");
        itemDiv.classList.add("cart-item");

        itemDiv.innerHTML = `
            <img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.src='fallback.jpg';">
            <div class="cart-details">
                <h4>${item.name} (x${quantity})</h4>
                <p>₹${itemTotal.toFixed(2)}</p>
                <button onclick="updateQuantity(${index}, 1)">+</button>
                <button onclick="updateQuantity(${index}, -1)">-</button>
                <button onclick="removeFromCart(${index})">Remove</button>
            </div>
        `;

        cartContainer.appendChild(itemDiv);
    });

    total -= discount;
    if (total < 0) total = 0;
    cartTotal.textContent = total.toFixed(2);
}

function updateQuantity(index, change) {
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        if (cart[index].quantity <= 0) removeFromCart(index);
        else saveCart();
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

function applyCoupon() {
    const code = document.getElementById("coupon-code").value.trim().toLowerCase();
    if (code === "save50") {
        discount = 50;
        alert("₹50 discount applied!");
    } else {
        discount = 0;
        alert("Invalid coupon code.");
    }
    displayCart();
}

function proceedToPayment() {
    const total = parseFloat(document.getElementById("cart-total").textContent);
    alert(`Redirecting to payment gateway for ₹${total.toFixed(2)}...`);
    // Razorpay integration will go here
}

window.onload = displayCart;
