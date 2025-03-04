// Sample food items
const foodItems = [
    { id: 1, name: "Chicken Biryani", price: 250, category: "Biryani", image: "biryani.jpg", description: "Spicy Hyderabadi Biryani" },
    { id: 2, name: "Paneer Butter Masala", price: 200, category: "Curry", image: "paneer.jpg", description: "Creamy paneer curry" },
    { id: 3, name: "Rogan Josh", price: 300, category: "Mutton", image: "rogan.jpg", description: "Kashmiri mutton dish" },
    { id: 4, name: "Masala Dosa", price: 120, category: "South Indian", image: "dosa.jpg", description: "Crispy dosa with potato filling" }
];

let cart = [];

// Display food items
function displayFoodItems(items) {
    const grid = document.getElementById("food-grid");
    grid.innerHTML = "";
    items.forEach(item => {
        grid.innerHTML += `
            <div class="food-card">
                <img src="${item.image}" alt="${item.name}">
                <h3 class="food-title">${item.name}</h3>
                <p class="food-price">₹${item.price}</p>
                <p class="food-description">${item.description}</p>
                <button onclick="addToCart(${item.id})">Add to Cart</button>
            </div>
        `;
    });
}

// Add to Cart
function addToCart(id) {
    let item = foodItems.find(f => f.id === id);
    let found = cart.find(c => c.id === id);
    if (found) {
        found.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
}

// Update Cart UI
function updateCartUI() {
    let cartItems = document.getElementById("cart-items");
    let cartTotal = document.getElementById("cart-total");
    let cartCount = document.getElementById("cart-count");

    cartItems.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        cartItems.innerHTML += `<p>${item.name} (x${item.qty}) - ₹${item.price * item.qty}</p>`;
    });

    cartTotal.innerText = total;
    cartCount.innerText = cart.length;
}

// Open Cart
function openCart() {
    updateCartUI();
    document.getElementById("cart-modal").style.display = "flex";
}

// Close Cart
function closeCart() {
    document.getElementById("cart-modal").style.display = "none";
}

// Hide cart modal on page load
window.onload = function () {
    displayFoodItems(foodItems);
    document.getElementById("cart-modal").style.display = "none";
};
