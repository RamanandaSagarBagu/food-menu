// Food items data
const foodItems = [
    { id: 1, name: "Chicken Biryani", price: 250, category: "Biryani", description: "Spicy Hyderabad Biryani", image: "biryani.jpg" },
    { id: 2, name: "Paneer Butter Masala", price: 180, category: "Curry", description: "Creamy paneer curry", image: "paneer.jpg" },
    { id: 3, name: "Rogan Josh", price: 320, category: "Curry", description: "Rich and flavorful Kashmiri dish", image: "rogan.jpg" },
    { id: 4, name: "Masala Dosa", price: 120, category: "South Indian", description: "Crispy dosa with potato filling", image: "dosa.jpg" }
];

let cart = [];

// Function to display food items
function displayFoodItems(items) {
    console.log("Loading food items...");
    const foodContainer = document.getElementById("foodContainer");
    foodContainer.innerHTML = "";

    if (items.length === 0) {
        foodContainer.innerHTML = "<p>No items found.</p>";
        return;
    }

    items.forEach(item => {
        const foodCard = document.createElement("div");
        foodCard.classList.add("food-card");
        foodCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>₹${item.price}</p>
            <p>${item.description}</p>
            <button onclick="addToCart(${item.id})">Add to Cart</button>
        `;
        foodContainer.appendChild(foodCard);
    });
}

// Function to filter foods
function filterFoods() {
    const category = document.getElementById("categoryFilter").value;
    const filteredItems = category === "all" ? foodItems : foodItems.filter(item => item.category === category);
    displayFoodItems(filteredItems);
}

// Function to search foods
function searchFood() {
    const query = document.getElementById("searchBox").value.toLowerCase();
    const filteredItems = foodItems.filter(item => item.name.toLowerCase().includes(query));
    displayFoodItems(filteredItems);
}

// Function to sort foods
function sortFoods() {
    const sortBy = document.getElementById("sortOptions").value;
    let sortedItems = [...foodItems];

    if (sortBy === "price-low") {
        sortedItems.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
        sortedItems.sort((a, b) => b.price - a.price);
    }

    displayFoodItems(sortedItems);
}

// Function to add to cart
function addToCart(id) {
    const item = foodItems.find(food => food.id === id);
    const existingItem = cart.find(cartItem => cartItem.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    updateCart();
}

// Function to update cart display
function updateCart() {
    const cartCount = document.getElementById("cart-count");
    const cartItemsList = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartItemsList.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const li = document.createElement("li");
        li.innerHTML = `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity} <button onclick="removeFromCart(${item.id})">❌</button>`;
        cartItemsList.appendChild(li);
    });

    cartTotal.textContent = total;
}

// Function to remove item from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

// Function to toggle cart modal
function toggleCart() {
    const cartModal = document.getElementById("cart-modal");
    cartModal.style.display = cartModal.style.display === "block" ? "none" : "block";
}

// Function to handle checkout
function checkout() {
    alert("Checkout not implemented yet!");
}

// Ensure cart modal is hidden initially
window.onload = function () {
    console.log("Page loaded");
    document.getElementById("cart-modal").style.display = "none"; // Hides the cart modal on page load
    displayFoodItems(foodItems);
};
