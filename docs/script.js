/*
  script.js
  ✅ Fixed image blinking & fallback
  ✅ Works inside /docs folder
  ✅ Uses raw GitHub URLs (permanent)
  ✅ Includes lazy-loading
*/

const allFoods = [
  {"id":"f1","name":"Chicken Biryani","price":250,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/chicken-hyderabadi-biryani-01.jpg","description":"Spicy Hyderabadi Biryani","category":"Non-Veg"},
  {"id":"f2","name":"Paneer Butter Masala","price":200,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/download%20(1).jpeg","description":"Creamy paneer curry","category":"Veg"},
  {"id":"f3","name":"Mutton Rogan Josh","price":350,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/Mutton%20Rogan%20Josh%20Recipe.JPG","description":"Rich and flavorful Kashmiri mutton dish","category":"Non-Veg"},
  {"id":"f4","name":"Masala Dosa","price":120,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/masala%20dosa.jpg","description":"Crispy South Indian dosa with potato filling","category":"Veg"},
  {"id":"f5","name":"Butter Naan","price":50,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/butter-naan-recipe1.webp","description":"Soft Indian bread with butter","category":"Veg"},
  {"id":"f6","name":"Tandoori Chicken","price":300,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/fs-tandoori-chicken.jpg","description":"Smoky and spicy grilled chicken","category":"Non-Veg"},
  {"id":"f7","name":"Palak Paneer","price":220,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/pallak-Paneer-.jpg","description":"Healthy spinach and paneer curry","category":"Veg"},
  {"id":"f8","name":"Veg Pulao","price":180,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/Veg-Pulao.jpg","description":"Aromatic basmati rice with vegetables","category":"Veg"},
  {"id":"f9","name":"Dal Tadka","price":160,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/Dal-tadka.jpg","description":"Lentils tempered with spices","category":"Veg"},
  {"id":"f10","name":"Fish Curry","price":280,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/fish%20curry.jpg","description":"Spicy and tangy coastal fish curry","category":"Non-Veg"},
  {"id":"f11","name":"Chole Bhature","price":150,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/chole-bhature-recipe.jpg","description":"Spicy chickpea curry with fried bread","category":"Veg"},
  {"id":"f12","name":"Gulab Jamun","price":100,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/gulab%20jamun.jpeg","description":"Sweet deep-fried dumplings soaked in syrup","category":"Dessert"},
  {"id":"f13","name":"Rasgulla","price":110,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/Rasgulla.jpg","description":"Soft spongy cheese balls soaked in sugar syrup","category":"Dessert"},
  {"id":"f14","name":"Paneer Tikka","price":230,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/paneer%20tikka.jpg","description":"Grilled paneer cubes marinated in spices","category":"Veg"},
  {"id":"f15","name":"Mango Lassi","price":80,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/mango%20lassi.jpeg","description":"Refreshing mango yogurt drink","category":"Beverage"},
  {"id":"f16","name":"Veg Manchurian","price":190,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/veg%20manchuria.jpeg","description":"Crispy veggie balls in spicy sauce","category":"Veg"},
  {"id":"f17","name":"Egg Curry","price":210,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/Egg-Masala-Curry.webp","description":"Boiled eggs in a rich tomato-based gravy","category":"Non-Veg"},
  {"id":"f18","name":"Mixed Fruit Salad","price":130,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/mixed%20fruit%20salad.jpeg","description":"A refreshing mix of seasonal fruits","category":"Dessert"},
  {"id":"f19","name":"Cold Coffee","price":90,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/cold%20coffee.jpeg","description":"Chilled coffee with milk and sugar","category":"Beverage"},
  {"id":"f20","name":"Chicken Lollipop","price":260,"image":"https://raw.githubusercontent.com/RamanandaSagarBagu/food-menu/main/docs/chicken%20lollipop.jpeg","description":"Spicy deep-fried chicken drumettes","category":"Non-Veg"}
];

// --- CART MANAGEMENT ---
function getCart(){ return JSON.parse(localStorage.getItem('cart')) || []; }
function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); updateCartCount(); }

// --- TOAST MESSAGE ---
function showToast(msg,time=1800){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.style.opacity='1';
  t.style.transform='translateY(0)';
  clearTimeout(t._timeout);
  t._timeout=setTimeout(()=>{t.style.opacity='0';t.style.transform='translateY(10px)';},time);
}

// --- DISPLAY FOODS ---
function displayFoods(foods){
  const container=document.getElementById('foodContainer');
  if(!foods||foods.length===0){container.innerHTML="<p>No items found.</p>";return;}
  container.innerHTML=foods.map(f=>`
    <article class="food-card" data-id="${f.id}">
      <img loading="lazy" src="${f.image}" alt="${f.name}"
           onerror="this.onerror=null;this.src='fallback.png';">
      <h3>${f.name}</h3>
      <div class="price">₹${f.price.toFixed(2)}</div>
      <p>${f.description}</p>
      <button class="btn add-to-cart" data-id="${f.id}">Add to Cart</button>
    </article>
  `).join('');
  attachAddButtons();
}

function attachAddButtons(){
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.id;
      const food=allFoods.find(x=>x.id===id);
      if(!food)return;
      addToCart(food);
      showToast(`${food.name} added to cart`);
    }
  });
}

// --- CART ---
function addToCart(food){
  let cart=getCart();
  let existing=cart.find(i=>i.id===food.id);
  if(existing)existing.quantity=(existing.quantity||1)+1;
  else cart.push({...food,quantity:1});
  saveCart(cart);
}
function updateCartCount(){
  const el=document.getElementById('cart-count');
  const total=getCart().reduce((s,i)=>s+(i.quantity||0),0);
  el.textContent=total;
}

// --- FILTERS ---
function populateCategoryFilter(){
  const set=new Set(allFoods.map(f=>f.category));
  const sel=document.getElementById('categoryFilter');
  sel.innerHTML=`<option value="all">All Categories</option>`+
    [...set].map(c=>`<option value="${c}">${c}</option>`).join('');
}
function getFilteredSortedFoods(){
  const q=document.getElementById('searchBox').value.toLowerCase();
  const cat=document.getElementById('categoryFilter').value;
  const sort=document.getElementById('sortOptions').value;
  let list=allFoods.slice();
  if(cat!=='all')list=list.filter(f=>f.category===cat);
  if(q)list=list.filter(f=>f.name.toLowerCase().includes(q)||f.description.toLowerCase().includes(q));
  if(sort==='price-low')list.sort((a,b)=>a.price-b.price);
  if(sort==='price-high')list.sort((a,b)=>b.price-a.price);
  return list;
}
function onControlsChange(){displayFoods(getFilteredSortedFoods());}
function searchFood(){onControlsChange();}

// --- INIT ---
window.addEventListener('DOMContentLoaded',()=>{
  populateCategoryFilter();
  displayFoods(allFoods);
  updateCartCount();
});
