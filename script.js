let allFoods = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Fetch Foods from foods.json
fetch("foods.json")
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load food data.");
        }
        return response.json();
    })
    .then(foods => {
        allFoods = foods;
        populateCategoryFilter();
        displayFoods(allFoods);
        updateCartUI();
    })
    .catch(error => {
        console.error("Error loading foods:", error);
        document.getElementById("foodContainer").innerHTML = "<p>Failed to load food items.</p>";
    });

// Display Foods
function displayFoods(foods) {
    const foodContainer = document.getElementById("foodContainer");

    if (foods.length === 0) {
        foodContainer.innerHTML = "<p>No food items found.</p>";
        return;
    }

    foodContainer.innerHTML = foods.map(food => `
        <div class="food-card">
            <img src="${food.image}" alt="${food.name}">
            <h3>${food.name}</h3>
            <p class="price">₹${food.price}</p>
            <p>${food.description}</p>
            <button class="add-to-cart" data-id="${food.id}" data-name="${food.name}" data-price="${food.price}" data-image="${food.image}">Add to Cart</button>
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

// Populate Category Filter
function populateCategoryFilter() {
    let categories = ["all", ...new Set(allFoods.map(food => food.category))];
    let categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = categories.map(category => `
        <option value="${category}">${category}</option>
    `).join("");
}

// Filter Foods by Category
function filterFoods() {
    let category = document.getElementById("categoryFilter").value;
    let filteredFoods = category === "all" ? allFoods : allFoods.filter(food => food.category === category);
    displayFoods(filteredFoods);
}

// Search Foods
function searchFood() {
    let query = document.getElementById("searchBox").value.toLowerCase();
    let filteredFoods = allFoods.filter(food => food.name.toLowerCase().includes(query));
    displayFoods(filteredFoods);
}

// Sorting Function
function sortFoods() {
    let option = document.getElementById("sortOptions").value;
    let sortedFoods = [...allFoods];

    if (option === "price-low") sortedFoods.sort((a, b) => a.price - b.price);
    if (option === "price-high") sortedFoods.sort((a, b) => b.price - a.price);

    displayFoods(sortedFoods);
}

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Ensure all items have correct properties
cart = cart.map(item => ({
    name: item.name || "Unknown Item",
    price: parseFloat(item.price) || 0,  // Fix NaN issue
    quantity: item.quantity || 1,
    image: item.image || "placeholder.jpg"
}));

// Function to update the cart display
function updateCartDisplay() {
    let cartContainer = document.getElementById("cart-items");
    let totalAmount = 0;

    cartContainer.innerHTML = "";  // Clear previous content

    cart.forEach((item, index) => {
        let itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;

        cartContainer.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" width="50">
                <span>${item.name} (${item.quantity}x)</span>
                <span>₹${itemTotal.toFixed(2)}</span>
                <button onclick="increaseQuantity(${index})">+</button>
                <button onclick="decreaseQuantity(${index})">-</button>
                <button onclick="removeItem(${index})">Remove</button>
            </div>
        `;
    });

    document.getElementById("total-price").innerText = `Total: ₹${totalAmount.toFixed(2)}`;
}

// Update cart display when page loads
updateCartDisplay();


// Update Cart UI
function updateCartUI() {
    let cartCount = document.querySelector(".cart-btn span");
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = `(${totalItems})`;
}

// Open Cart Page
function openCartPage() {
    window.location.href = "cart.html"; 
}
