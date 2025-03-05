let allFoods = [];
let cart = [];

// Fetch Foods
fetch('foods.json')
    .then(response => response.json())
    .then(foods => {
        allFoods = foods;
        populateCategoryFilter();
        displayFoods(allFoods);
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

    // Attach event listeners after rendering new items
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

// Search Function
function searchFood() {
    let query = document.getElementById('searchBox').value.toLowerCase();
    let filteredFoods = allFoods.filter(food => food.name.toLowerCase().includes(query));
    displayFoods(filteredFoods);
}

// Category Filter
function populateCategoryFilter() {
    let categories = [...new Set(allFoods.map(food => food.category))];
    let categoryFilter = document.getElementById('categoryFilter');
    categories.forEach(category => {
        let option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function filterFoods() {
    let category = document.getElementById('categoryFilter').value;
    let filteredFoods = category === "all" ? allFoods : allFoods.filter(food => food.category === category);
    displayFoods(filteredFoods);
}

// Sorting
function sortFoods() {
    let option = document.getElementById('sortOptions').value;
    let sortedFoods = [...allFoods];

    if (option === "price-low") sortedFoods.sort((a, b) => a.price - b.price);
    if (option === "price-high") sortedFoods.sort((a, b) => b.price - a.price);

    displayFoods(sortedFoods);
}

// Cart Functions
function addToCart(name, price) {
    let cartButton = document.querySelector(".cart-btn");
    let cartCount = document.querySelector(".cart-btn span");

    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    updateCartCount();
}

// Update cart count in button
function updateCartCount() {
    let cartCount = document.querySelector(".cart-btn span");
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = `(${totalItems})`;
}

// Toggle Cart Display
function toggleCart() {
    let cartModal = document.getElementById("cart-modal");
    cartModal.style.display = cartModal.style.display === "block" ? "none" : "block";
}

// Remove Item from Cart
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCartCount();
    displayCartItems();
}

// Display Cart Items
function displayCartItems() {
    let cartList = document.getElementById("cart-items");
    if (!cartList) return;

    cartList.innerHTML = cart.length === 0
        ? "<p>Cart is empty.</p>"
        : cart.map(item => `
            <div class="cart-item">
                <p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>
                <button class="remove-cart" onclick="removeFromCart('${item.name}')">Remove</button>
            </div>
        `).join('');
}
