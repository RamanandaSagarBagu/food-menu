// Global Variables
let allFoods = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fetch Foods
fetch('foods.json')
    .then(response => response.json())
    .then(foods => {
        allFoods = foods;
        populateCategoryFilter();
        displayFoods(allFoods);
        updateCartCount();
        displayCartItems();
    });

// Display Foods
function displayFoods(foods) {
    const foodContainer = document.getElementById('foodContainer');
    foodContainer.innerHTML = foods.map(food => `
        <div class="food-card">
            <img src="${food.image}" alt="${food.name}">
            <h3>${food.name}</h3>
            <p class="price">₹${food.price}</p>
            <p>${food.description}</p>
            <button class="add-to-cart" data-name="${food.name}" data-price="${food.price}">Add to Cart</button>
        </div>
    `).join('');

    attachCartEventListeners();
}

// Attach event listeners for "Add to Cart" buttons
function attachCartEventListeners() {
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            let name = this.getAttribute("data-name");
            let price = parseFloat(this.getAttribute("data-price"));
            addToCart(name, price);
        });
    });
}

// Add Item to Cart
function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
}

// Update cart count in button
function updateCartCount() {
    document.getElementById("cart-count").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Display Cart Items
function displayCartItems() {
    let cartList = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");
    if (!cartList || !cartTotal) return;

    cartList.innerHTML = cart.length === 0
        ? "<p>Cart is empty.</p>"
        : cart.map(item => `
            <div class="cart-item">
                <p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>
                <button class="remove-cart" onclick="removeFromCart('${item.name}')">Remove</button>
            </div>
        `).join('');
    
    cartTotal.textContent = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// Remove Item from Cart
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCartItems();
}

// Toggle Cart Display
function toggleCart() {
    let cartModal = document.getElementById("cart-modal");
    cartModal.style.display = cartModal.style.display === "block" ? "none" : "block";
}

// Search Function
function searchFood() {
    let query = document.getElementById('searchBox').value.toLowerCase();
    displayFoods(allFoods.filter(food => food.name.toLowerCase().includes(query)));
}

// Category Filter
function populateCategoryFilter() {
    let categories = [...new Set(allFoods.map(food => food.category))];
    let categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

function filterFoods() {
    let category = document.getElementById('categoryFilter').value;
    displayFoods(category === "all" ? allFoods : allFoods.filter(food => food.category === category));
}

// Sorting
function sortFoods() {
    let option = document.getElementById('sortOptions').value;
    let sortedFoods = [...allFoods];

    if (option === "price-low") sortedFoods.sort((a, b) => a.price - b.price);
    if (option === "price-high") sortedFoods.sort((a, b) => b.price - a.price);

    displayFoods(sortedFoods);
}

// Razorpay Payment
function checkout() {
    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let options = {
        "key": "YOUR_RAZORPAY_KEY",
        "amount": totalAmount * 100,
        "currency": "INR",
        "name": "Food Order",
        "description": "Payment for food order",
        "handler": function(response) {
            alert("Payment Successful! Order ID: " + response.razorpay_payment_id);
            trackOrder(response.razorpay_payment_id);
        },
    };
    let rzp = new Razorpay(options);
    rzp.open();
}

// Order Tracking
function trackOrder(orderId) {
    let orderStatus = document.getElementById("order-status");
    orderStatus.innerHTML = `<p>Order ID: ${orderId} - Status: Preparing</p>`;
    setTimeout(() => orderStatus.innerHTML = `<p>Order ID: ${orderId} - Status: Out for Delivery</p>`, 5000);
    setTimeout(() => orderStatus.innerHTML = `<p>Order ID: ${orderId} - Status: Delivered</p>`, 10000);
}
