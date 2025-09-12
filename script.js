/* script.js
   Foods are embedded here to avoid external fetch issues.
   Handles display, search, filter, sort, cart add, and badge update.
*/

// ---------- Data: all foods ----------
const allFoods = [
  {"id":"f1","name":"Chicken Biryani","price":250,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/chicken-hyderabadi-biryani-01.jpg?raw=true","description":"Spicy Hyderabadi Biryani","category":"Non-Veg"},
  {"id":"f2","name":"Paneer Butter Masala","price":200,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/download%20(1).jpeg?raw=true","description":"Creamy paneer curry","category":"Veg"},
  {"id":"f3","name":"Mutton Rogan Josh","price":350,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/Mutton%20Rogan%20Josh%20Recipe.JPG?raw=true","description":"Rich and flavorful Kashmiri mutton dish","category":"Non-Veg"},
  {"id":"f4","name":"Masala Dosa","price":120,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/masala%20dosa.jpg?raw=true","description":"Crispy South Indian dosa with potato filling","category":"Veg"},
  {"id":"f5","name":"Butter Naan","price":50,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/refs/heads/main/butter-naan-recipe1.webp","description":"Soft Indian bread with butter","category":"Veg"},
  {"id":"f6","name":"Tandoori Chicken","price":300,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/fs-tandoori-chicken.jpg?raw=true","description":"Smoky and spicy grilled chicken","category":"Non-Veg"},
  {"id":"f7","name":"Palak Paneer","price":220,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/pallak-Paneer-.jpg?raw=true","description":"Healthy spinach and paneer curry","category":"Veg"},
  {"id":"f8","name":"Veg Pulao","price":180,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/Veg-Pulao.jpg?raw=true","description":"Aromatic basmati rice with vegetables","category":"Veg"},
  {"id":"f9","name":"Dal Tadka","price":160,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/Dal-tadka.jpg?raw=true","description":"Lentils tempered with spices","category":"Veg"},
  {"id":"f10","name":"Fish Curry","price":280,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/fish%20curry.jpg?raw=true","description":"Spicy and tangy coastal fish curry","category":"Non-Veg"},
  {"id":"f11","name":"Chole Bhature","price":150,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/chole-bhature-recipe.jpg?raw=true","description":"Spicy chickpea curry with fried bread","category":"Veg"},
  {"id":"f12","name":"Gulab Jamun","price":100,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/gulab%20jamun.jpeg?raw=true","description":"Sweet deep-fried dumplings soaked in syrup","category":"Dessert"},
  {"id":"f13","name":"Rasgulla","price":110,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/Rasgulla.jpg?raw=true","description":"Soft spongy cheese balls soaked in sugar syrup","category":"Dessert"},
  {"id":"f14","name":"Paneer Tikka","price":230,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/paneer%20tikka.jpg?raw=true","description":"Grilled paneer cubes marinated in spices","category":"Veg"},
  {"id":"f15","name":"Mango Lassi","price":80,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/mango%20lassi.jpeg?raw=true","description":"Refreshing mango yogurt drink","category":"Beverage"},
  {"id":"f16","name":"Veg Manchurian","price":190,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/veg%20manchuria.jpeg?raw=true","description":"Crispy veggie balls in spicy sauce","category":"Veg"},
  {"id":"f17","name":"Egg Curry","price":210,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/refs/heads/main/Egg-Masala-Curry.webp","description":"Boiled eggs in a rich tomato-based gravy","category":"Non-Veg"},
  {"id":"f18","name":"Mixed Fruit Salad","price":130,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/mixed%20fruit%20salad.jpeg?raw=true","description":"A refreshing mix of seasonal fruits","category":"Dessert"},
  {"id":"f19","name":"Cold Coffee","price":90,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/cold%20coffee.jpeg?raw=true","description":"Chilled coffee with milk and sugar","category":"Beverage"},
  {"id":"f20","name":"Chicken Lollipop","price":260,"image":"https://github.com/RamanandaSagarBagu/food-menu/blob/main/chicken%20lollipop.jpeg?raw=true","description":"Spicy deep-fried chicken drumettes","category":"Non-Veg"}
];

// ---------- Cart stored in localStorage ----------
function getCart(){ return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); updateCartCount(); }

// Toast helper
function showToast(msg, time=1800){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  t.setAttribute('aria-hidden','false');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(()=>{ t.style.opacity='0'; t.style.transform='translateY(10px)'; t.setAttribute('aria-hidden','true') }, time);
}

// ---------- Rendering ----------
function displayFoods(foods){
  const container = document.getElementById('foodContainer');
  if(!foods || foods.length===0){ container.innerHTML = "<p>No items found.</p>"; return; }
  container.innerHTML = foods.map(f => `
    <article class="food-card" data-id="${f.id}">
      <img loading="lazy" src="${f.image}" alt="${f.name}" onerror="this.src='fallback.jpg'">
      <h3>${f.name}</h3>
      <div class="price">₹${Number(f.price).toFixed(2)}</div>
      <p>${f.description}</p>
      <button class="btn add-to-cart" data-id="${f.id}">Add to Cart</button>
    </article>
  `).join('');
  attachAddButtons();
}

function attachAddButtons(){
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', ()=> {
      const id = btn.dataset.id;
      const food = allFoods.find(x=>x.id===id);
      if(!food) return;
      addToCart(food);
      showToast(`${food.name} added to cart`);
    });
  });
}

// ---------- Cart operations ----------
function addToCart(food){
  let cart = getCart();
  let existing = cart.find(i=>i.id===food.id);
  if(existing) existing.quantity = (existing.quantity||1) + 1;
  else cart.push({ id:food.id, name:food.name, price:food.price, image:food.image, quantity:1 });
  saveCart(cart);
}

function updateCartCount(){
  const countEl = document.getElementById('cart-count');
  const cart = getCart();
  const total = cart.reduce((s,i)=> s + (i.quantity || 0), 0);
  countEl.textContent = total;
}

// ---------- Controls: search, filter, sort ----------
function populateCategoryFilter(){
  const catSet = new Set(allFoods.map(f=>f.category));
  const sel = document.getElementById('categoryFilter');
  sel.innerHTML = `<option value="all">All Categories</option>` + [...catSet].map(c=>`<option value="${c}">${c}</option>`).join('');
}

function getFilteredSortedFoods(){
  const query = document.getElementById('searchBox').value.trim().toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const sort = document.getElementById('sortOptions').value;

  let list = allFoods.slice();

  if(category && category !== 'all') list = list.filter(f => f.category === category);
  if(query) list = list.filter(f => f.name.toLowerCase().includes(query) || f.description.toLowerCase().includes(query));

  if(sort === 'price-low') list.sort((a,b)=> a.price - b.price);
  if(sort === 'price-high') list.sort((a,b)=> b.price - a.price);

  return list;
}

function onControlsChange(){
  const foods = getFilteredSortedFoods();
  displayFoods(foods);
}

// Search helper
function searchFood(){ onControlsChange(); }

// ---------- Init ----------
window.addEventListener('DOMContentLoaded', ()=>{
  populateCategoryFilter();
  displayFoods(allFoods);
  updateCartCount();
});
