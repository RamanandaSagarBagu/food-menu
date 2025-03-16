// Sample Food Data
const foodItems = [
    { id: 1, name: "Chicken Biryani", category: "biryani", price: 250, img: "biryani.jpg" },
    { id: 2, name: "Veg Pizza", category: "fast-food", price: 180, img: "pizza.jpg" },
    { id: 3, name: "Gulab Jamun", category: "dessert", price: 50, img: "jamun.jpg" }
];

// Cart Array
let cart = [];

// Load Menu Items
function loadMenu(items = foodItems) {
    const menu = document.getElementById("food-menu");
    menu.innerHTML = "";
    items.forEach(item => {
        menu.innerHTML += `
            <div class="food-card">
                <img src="${item.img}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p class="price">₹${item.price}</p>
                <button class="add-to-cart" onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
    });
}

// Add to Cart
function addToCart(id) {
    let item = foodItems.find(food => food.id === id);
    cart.push(item);
    updateCartCount();
}

// Update Cart Count
function updateCartCount() {
    document.getElementById("cart-count").innerText = cart.length;
}

// Open Cart
function openCart() {
    let cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty</p>";
    } else {
        cart.forEach(item => {
            total += item.price;
            cartItems.innerHTML += `<p>${item.name} - ₹${item.price}</p>`;
        });
    }

    document.getElementById("cart-total").innerText = total;
    document.getElementById("cart-modal").style.display = "block";
}

// Close Cart
function closeCart() {
    document.getElementById("cart-modal").style.display = "none";
}

// Checkout with Razorpay (Placeholder for Integration)
function checkout() {
    alert("UPI Payment Integration Coming Soon!");
}

// Search Function
function searchFood() {
    let query = document.getElementById("search").value.toLowerCase();
    let filteredItems = foodItems.filter(item => item.name.toLowerCase().includes(query));
    loadMenu(filteredItems);
}

// Filter by Category
function filterCategory() {
    let selectedCategory = document.getElementById("category").value;
    let filteredItems = selectedCategory === "all" 
        ? foodItems 
        : foodItems.filter(item => item.category === selectedCategory);
    loadMenu(filteredItems);
}

// Sort Items
function sortItems() {
    let sortBy = document.getElementById("sort").value;
    let sortedItems = [...foodItems];

    if (sortBy === "low-high") {
        sortedItems.sort((a, b) => a.price - b.price);
    } else if (sortBy === "high-low") {
        sortedItems.sort((a, b) => b.price - a.price);
    }

    loadMenu(sortedItems);
}

// Load Menu on Page Load
document.addEventListener("DOMContentLoaded", () => loadMenu());
