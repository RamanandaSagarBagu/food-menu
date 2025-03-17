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
            <p class="price">₹${food.price.toFixed(2)}</p>
            <p>${food.description}</p>
            <button class="add-to-cart" data-id="${food.id}" 
                data-name="${food.name}" 
                data-price="${food.price}" 
                data-image="${food.image}">
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
            let foodId = this.getAttribute("data-id");
            let foodName = this.getAttribute("data-name");
            let foodPrice = parseFloat(this.getAttribute("data-price")) || 0; // Fix NaN issue
            let foodImage = this.getAttribute("data-image");

            let foodItem = {
                id: foodId,
                name: foodName,
                price: foodPrice,
                image: foodImage,
                quantity: 1
            };

            addToCart(foodItem);
        });
    });
}

// Add to Cart Function
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

function updateCartDisplay() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];  // Get cart from local storage

    // Find the cart count element
    let cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = `(${totalItems})`;
    } else {
        console.warn("Cart count element not found.");  // This will warn you in the console
    }

    // Find the cart items container
    let cartItemsContainer = document.getElementById("cart-items");
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = "";  // Clear old items

        // Add new cart items
        cart.forEach(item => {
            let itemElement = document.createElement("div");
            itemElement.innerHTML = `${item.name} (x${item.quantity}) - ₹${item.price}`;
            cartItemsContainer.appendChild(itemElement);
        });
    } else {
        console.warn("Cart items container not found.");
    }
}

// Increase Quantity
function increaseQuantity(index) {
    cart[index].quantity += 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}

// Decrease Quantity
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1); // Remove item if quantity is 0
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}

// Remove Item from Cart
function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
}

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

// Run when the page loads
updateCartDisplay();
