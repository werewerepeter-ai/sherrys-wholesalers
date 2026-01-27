// Get cart from localStorage or initialize empty
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count in navbar
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

// Add product to cart
function addToCart(product) {
  const existing = cart.find(item => item.name === product.name);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} added to cart!`);
}

// Remove product from cart
function removeFromCart(productName) {
  cart = cart.filter(item => item.name !== productName);
  localStorage.setItem('cart', JSON.stringify(cart));
  displayCart();
  updateCartCount();
}

// Display cart items
function displayCart() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = `
      <p class="text-center text-gray-500 py-8">Your cart is empty</p>
    `;
    totalEl.textContent = 'KSh 0';
    return;
  }
  
  let total = 0;
  
  container.innerHTML = cart.map(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    
    return `
      <div class="flex items-center gap-4 border-b pb-4 mb-4">
        <img src="${item.image}" class="w-20 h-20 object-cover rounded">
        
        <div class="flex-1">
          <h3 class="font-semibold">${item.name}</h3>
          <p class="text-sm text-gray-600">KSh ${item.price.toLocaleString()} × ${item.quantity}</p>
        </div>
        
        <div class="text-right">
          <p class="font-bold text-brandBlue">KSh ${subtotal.toLocaleString()}</p>
          <button 
            onclick="removeFromCart('${item.name}')" 
            class="text-red-600 text-sm hover:underline mt-1"
          >
            Remove
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  totalEl.textContent = `KSh ${total.toLocaleString()}`;
}

// WhatsApp Checkout
function checkoutWhatsApp() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  let message = "Hello! I'd like to order:\n\n";
  let total = 0;
  
  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    message += `• ${item.name}\n  Qty: ${item.quantity} × KSh ${item.price.toLocaleString()} = KSh ${subtotal.toLocaleString()}\n\n`;
  });
  
  message += `*Total: KSh ${total.toLocaleString()}*`;
  
  const phone = "254710553678"; // Your WhatsApp number
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  
  window.open(url, '_blank');
}

// Initialize
updateCartCount();
if (document.getElementById('cart-items')) {
  displayCart();
}

const checkoutBtn = document.getElementById('whatsapp-checkout');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', checkoutWhatsApp);
}