let allFoods = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Fetch Foods
fetch("foods.json")
    .then(response => response.json())
    .then(foods => {
        allFoods = foods;
        populateCategoryFilter();
        displayFoods(allFoods);
        updateCartUI();
    });

// Display Foods
function displayFoods(foods) {
    const foodContainer = document.getElementById("foodContainer");
    foodContainer.innerHTML = foods.map(food => `
        <div class="food-card">
            <img src="${food.image}" alt="${food.name}">
            <h3>${food.name}</h3>
            <p class="price">₹${food.price}</p>
            <p>${food.description}</p>
            <button class="add-to-cart" data-id="${food.id}" data-name="${food.name}" 
                data-price="${food.price}" data-image="${food.image}">
                Add to Cart
            </button>
        </div>
    `).join("");

    attachCartEventListeners();
}

// Attach event listeners for "Add to Cart" buttons
function attachCartEventListeners() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            let foodItem = {
                id: this.getAttribute("data-id"),
                name: this.getAttribute("data-name"),
                price: parseFloat(this.getAttribute("data-price")),
                image: this.getAttribute("data-image"),
                quantity: 1
            };
            addToCart(foodItem);
        });
    });
}

// Add Item to Cart
function addToCart(foodItem) {
    let existingItem = cart.find(item => item.id === foodItem.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(foodItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Update Cart UI
function updateCartUI() {
    let cartList = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");
    let cartCount = document.querySelector(".cart-btn span");

    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = `(${totalItems})`;

    if (!cartList || !cartTotal) return; // Prevent error if elements are not on this page

    if (cart.length === 0) {
        cartList.innerHTML = "<p>Your cart is empty.</p>";
        cartTotal.textContent = "Total: ₹0";
        return;
    }

    cartList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" class="cart-img">
            <div class="cart-details">
                <p>${item.name} (x${item.quantity})</p>
                <p>₹${item.price * item.quantity}</p>
                <button onclick="updateQuantity('${item.id}', 1)">+</button>
                <button onclick="updateQuantity('${item.id}', -1)">-</button>
                <button onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        </div>
    `).join("");

    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = `Total: ₹${totalAmount}`;
}

// Update Item Quantity in Cart
function updateQuantity(id, change) {
    let item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) removeFromCart(id);
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Remove Item from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
}

// Open Cart Page
function openCartPage() {
    window.location.href = "cart.html"; 
}

document.querySelector(".cart-btn").addEventListener("click", openCartPage);

// Display Cart Items (for cart.html)
function displayCartItems() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");

    if (!cartContainer || !cartTotal) return;

    cartContainer.innerHTML = "";
    let totalAmount = 0;

    cart.forEach(item => {
        let cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-img">
            <div class="cart-details">
                <h4>${item.name} (x${item.quantity})</h4>
                <p>₹${item.price * item.quantity}</p>
                <button onclick="updateQuantity('${item.id}', 1)">+</button>
                <button onclick="updateQuantity('${item.id}', -1)">-</button>
                <button onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
        totalAmount += item.price * item.quantity;
    });

    cartTotal.textContent = `Total: ₹${totalAmount}`;
}

// Run when `cart.html` loads
window.onload = function() {
    if (window.location.pathname.includes("cart.html")) {
        displayCartItems();
    }
};

// Clear Cart
function clearCart() {
    localStorage.removeItem("cart");
    cart = [];
    updateCartUI();
    displayCartItems();
}

// Proceed to Checkout
function proceedToCheckout() {
    alert("Redirecting to payment...");
    // Integrate Razorpay or UPI payment here
}

// Go Back to Menu
function goBack() {
    window.location.href = "index.html"; 
}
