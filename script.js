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
            <button class="add-to-cart" onclick="addToCart('${food.name}', ${food.price})">Add to Cart</button>
        </div>
    `).join('');
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
    let item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCart();
}

function toggleCart() {
    let cartModal = document.getElementById("cart-modal");
    cartModal.style.display = cartModal.style.display === "block" ? "none" : "block";
}
