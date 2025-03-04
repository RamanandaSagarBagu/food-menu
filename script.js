// Sample food items (You can load these dynamically from a backend)
const foodItems = [
    { name: "Chicken Biryani", price: 250, category: "Biryani", image: "biryani.jpg" },
    { name: "Paneer Butter Masala", price: 200, category: "Curry", image: "paneer.jpg" },
    { name: "Mutton Rogan Josh", price: 350, category: "Curry", image: "mutton.jpg" },
    { name: "Masala Dosa", price: 120, category: "South Indian", image: "dosa.jpg" }
];

// Global cart array
let cart = [];

// Function to render food items
function displayFoodItems(items) {
    const foodGrid = document.getElementById("food-grid");
    foodGrid.innerHTML = ""; // Clear previous items

    items.forEach(item => {
        const foodCard = document.createElement("div");
        foodCard.classList.add("food-card");
        foodCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3 class="food-title">${item.name}</h3>
            <p class="food-price">₹${item.price}</p>
            <p class="food-description">${item.category} Dish</p>
            <button onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
        `;
        foodGrid.appendChild(foodCard);
    });
}

// Function to add items to the cart
function addToCart(name, price) {
    let item = cart.find(product => product.name === name);
    
    if (item) {
        item.quantity += 1; // Increase quantity if item exists
    } else {
        cart.push({ name, price, quantity: 1 });
    }

    updateCartUI();
}

// Function to update the cart UI
function updateCartUI() {
    let cartContent = document.getElementById("cart-content");
    let totalPrice = 0;
    
    cartContent.innerHTML = `<h2>Your Cart</h2>`;

    if (cart.length === 0) {
        cartContent.innerHTML += `<p>Your cart is empty.</p>`;
    } else {
        cart.forEach(item => {
            totalPrice += item.price * item.quantity;
            cartContent.innerHTML += `
                <p>${item.name} × ${item.quantity} - ₹${item.price * item.quantity}</p>
            `;
        });
    }

    cartContent.innerHTML += `<h3>Total: ₹${totalPrice}</h3>
        <button onclick="checkout()">Checkout</button>`;

    document.getElementById("cart-count").innerText = `(${cart.length})`; // Update cart count
}

// Open cart modal
function openCart() {
    updateCartUI();
    document.getElementById("cart-modal").style.display = "flex";
}

// Close cart modal
function closeCart() {
    document.getElementById("cart-modal").style.display = "none";
}

// Checkout function
function checkout() {
    alert("Order placed successfully!");
    cart = []; // Clear cart
    updateCartUI();
    closeCart();
}

// Function to filter food items by category
function filterCategory(category) {
    if (category === "All Categories") {
        displayFoodItems(foodItems);
    } else {
        const filteredItems = foodItems.filter(item => item.category === category);
        displayFoodItems(filteredItems);
    }
}

// Function to sort food items
function sortFoodItems(criteria) {
    let sortedItems = [...foodItems];

    if (criteria === "Price Low to High") {
        sortedItems.sort((a, b) => a.price - b.price);
    } else if (criteria === "Price High to Low") {
        sortedItems.sort((a, b) => b.price - a.price);
    }

    displayFoodItems(sortedItems);
}

// Function to search food items
function searchFood(query) {
    const filteredItems = foodItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase())
    );
    displayFoodItems(filteredItems);
}

// Initialize the food menu on page load
window.onload = function () {
    displayFoodItems(foodItems);
};
