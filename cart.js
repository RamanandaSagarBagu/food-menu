let cart = JSON.parse(localStorage.getItem("cart")) || [];

function displayCart() {
  const cartContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const cartCount = document.getElementById("cart-count");
  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0.00";
    cartCount.textContent = "0";
    return;
  }

  let totalAmount = 0;
  let totalItems = 0;

  cart.forEach((item, index) => {
    if (!item || !item.name || !item.price) return;

    const quantity = item.quantity || 1;
    totalItems += quantity;
    totalAmount += item.price * quantity;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
      <img src="${item.image}" class="cart-img" alt="${item.name}" onerror="this.src='fallback.jpg';" />
      <div class="cart-details">
        <h4>${item.name} (x${quantity})</h4>
        <p>₹${(item.price * quantity).toFixed(2)}</p>
        <button onclick="updateQuantity(${index}, 1)">+</button>
        <button onclick="updateQuantity(${index}, -1)">-</button>
        <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;
    cartContainer.appendChild(cartItem);
  });

  cartTotal.textContent = totalAmount.toFixed(2);
  cartCount.textContent = totalItems;
}

function updateQuantity(index, change) {
  if (cart[index]) {
    cart[index].quantity = (cart[index].quantity || 1) + change;
    if (cart[index].quantity <= 0) {
      removeFromCart(index);
    } else {
      saveCart();
    }
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function proceedToPayment() {
  alert("Redirecting to Razorpay/UPI Payment...");
  // Razorpay/UPI integration logic goes here
}

window.onload = displayCart;
