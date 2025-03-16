// Sample Food Data
const foodItems = [
    { id: 1, name: "Chicken Biryani", category: "biryani", price: 250, img: "biryani.jpg" },
    { id: 2, name: "Veg Pizza", category: "fast-food", price: 180, img: "pizza.jpg" },
    { id: 3, name: "Gulab Jamun", category: "dessert", price: 50, img: "jamun.jpg" }
];

// Cart Array
let cart = [];

// Load Menu Items
function loadMenu() {
    const menu = document.getElementById("food-menu");
    menu.innerHTML = "";
    foodItems.forEach(item => {
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
    document.getElementById("cart-count").innerText = cart.length;
}

// Open Cart
function openCart() {
    let cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";
    let total = 0;
    
    cart.forEach(item => {
        total += item.price;
        cartItems.innerHTML += `<p>${item.name} - ₹${item.price}</p>`;
    });
    
    document.getElementById("cart-total").innerText = total;
    document.getElementById("cart-modal").style.display = "block";
}

// Close Cart
function closeCart() {
    document.getElementById("cart-modal").style.display = "none";
}

// Checkout with Razorpay
function checkout() {
    alert("UPI Payment Integration Coming Soon!");
}

// Search Function
function searchFood() {
    let query = document.getElementById("search").value.toLowerCase();
    document.querySelectorAll(".food-card").forEach(card => {
        let name = card.querySelector("h3").innerText.toLowerCase();
        card.style.display = name.includes(query) ? "block" : "none";
    });
}

// Load Menu on Page Load
document.addEventListener("DOMContentLoaded", loadMenu);
