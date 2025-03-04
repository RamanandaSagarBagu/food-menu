let allFoods = [];
let cart = [];

fetch('foods.json')
    .then(response => response.json())
    .then(foods => {
        allFoods = foods;
        displayFoods(allFoods);
    });

function displayFoods(foods) {
    const foodContainer = document.getElementById('foodContainer');
    foodContainer.innerHTML = foods.map(food => `
        <div class="food-card">
            <img src="${food.image}" alt="${food.name}">
            <h3>${food.name}</h3>
            <p>₹${food.price}</p>
            <p>${food.description}</p>
            <button onclick="addToCart('${food.name}', ${food.price})">Add to Cart</button>
        </div>
    `).join('');
}

function searchFood() {
    let query = document.getElementById('searchBox').value.toLowerCase();
    let filteredFoods = allFoods.filter(food => food.name.toLowerCase().includes(query));
    displayFoods(filteredFoods);
}

function filterFoods() {
    let category = document.getElementById('categoryFilter').value;
    let filteredFoods = allFoods.filter(food => category === 'all' || food.category === category);
    displayFoods(filteredFoods);
}

function sortFoods() {
    let sortBy = document.getElementById('sortOptions').value;
    let sortedFoods = [...allFoods];

    if (sortBy === 'low-to-high') {
        sortedFoods.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'high-to-low') {
        sortedFoods.sort((a, b) => b.price - a.price);
    }

    displayFoods(sortedFoods);
}

function addToCart(name, price) {
    let existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
}

function updateCart() {
    let cartItems = document.getElementById('cartItems');
    let cartTotal = document.getElementById('cartTotal');
    let cartCount = document.getElementById('cartCount');

    cartItems.innerHTML = cart.map(item => `
        <li>${item.name} x${item.quantity} - ₹${item.price * item.quantity}
            <button onclick="removeFromCart('${item.name}')">Remove</button>
        </li>
    `).join('');

    let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.innerText = total;
    cartCount.innerText = cart.length;
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCart();
}

function toggleCart() {
    let cartModal = document.getElementById('cartModal');
    cartModal.style.display = cartModal.style.display === 'none' || cartModal.style.display === '' ? 'block' : 'none';
}

function checkout() {
    alert("Proceeding to checkout!");
    cart = [];
    updateCart();
    toggleCart();
}
