// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

// Find product
const product = products.find(p => p.id === productId);

if (!product) {
  window.location.href = 'index.html';
}

// Calculate discount
function getDiscount(oldPrice, newPrice) {
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
}

const discount = getDiscount(product.oldPrice, product.price);
const savings = product.oldPrice - product.price;

// Update page
document.title = `${product.name} | Sherry's Wholesalers`;

// Breadcrumb
document.getElementById('breadcrumb').innerHTML = `
  <a href="index.html" class="hover:text-brandGold">Home</a> / 
  <a href="category.html?category=${encodeURIComponent(product.category)}" class="hover:text-brandGold">${product.category}</a> / 
  <span class="text-gray-900 font-semibold">${product.name}</span>
`;

// Product details
document.getElementById('product-image').src = product.image;
document.getElementById('product-image').alt = product.name;
document.getElementById('product-category').textContent = product.category;
document.getElementById('product-name').textContent = product.name;
document.getElementById('product-price').textContent = `KSh ${product.price.toLocaleString()}`;
document.getElementById('product-old-price').textContent = `KSh ${product.oldPrice.toLocaleString()}`;
document.getElementById('discount-badge').textContent = `-${discount}% OFF`;
document.getElementById('savings').querySelector('p').textContent = `💰 You save KSh ${savings.toLocaleString()} on this product!`;
document.getElementById('detail-category').textContent = product.category;
document.getElementById('detail-subcategory').textContent = product.subcategory;
document.getElementById('detail-id').textContent = product.id;

// Display product details if available
if (product.details) {
  // Description
  if (product.details.description) {
    document.getElementById('description-section').classList.remove('hidden');
    document.getElementById('product-description').textContent = product.details.description;
  }
  
  // Features
  if (product.details.features && product.details.features.length > 0) {
    document.getElementById('features-section').classList.remove('hidden');
    const featuresList = document.getElementById('product-features');
    featuresList.innerHTML = product.details.features.map(f => `<li>${f}</li>`).join('');
  }
  
  // Specifications
  if (product.details.specifications && Object.keys(product.details.specifications).length > 0) {
    document.getElementById('specs-section').classList.remove('hidden');
    const specsDiv = document.getElementById('product-specs');
    specsDiv.innerHTML = Object.entries(product.details.specifications)
      .map(([key, value]) => `
        <div class="flex justify-between border-b pb-2">
          <span class="font-semibold">${key}:</span>
          <span class="text-gray-700">${value}</span>
        </div>
      `).join('');
  }
}

// Quantity controls
const qtyInput = document.getElementById('quantity');

document.getElementById('decrease-qty').addEventListener('click', () => {
  if (qtyInput.value > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
  }
});

document.getElementById('increase-qty').addEventListener('click', () => {
  qtyInput.value = parseInt(qtyInput.value) + 1;
});

// Add to cart
document.getElementById('add-to-cart-btn').addEventListener('click', () => {
  const quantity = parseInt(qtyInput.value);
  for (let i = 0; i < quantity; i++) {
    addToCart(product);
  }
});

// Buy now
document.getElementById('buy-now-btn').addEventListener('click', () => {
  const quantity = parseInt(qtyInput.value);
  const total = product.price * quantity;
  
  const message = `Hello! I'd like to order:\n\n• ${product.name}\n  Qty: ${quantity} × KSh ${product.price.toLocaleString()} = KSh ${total.toLocaleString()}\n\n*Total: KSh ${total.toLocaleString()}*`;
  
  const phone = "254710553678";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  
  window.open(url, '_blank');
});

// Related products (same category)
const relatedProducts = products
  .filter(p => p.category === product.category && p.id !== product.id)
  .slice(0, 4);

const relatedContainer = document.getElementById('related-products');

relatedProducts.forEach(p => {
  const disc = getDiscount(p.oldPrice, p.price);
  const div = document.createElement('div');
  div.className = 'bg-white border rounded shadow hover:shadow-lg transition cursor-pointer relative';
  div.innerHTML = `
    <span class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
      -${disc}%
    </span>
    <img src="${p.image}" class="h-32 w-full object-cover rounded-t">
    <div class="p-3">
      <h3 class="text-sm font-semibold line-clamp-2 h-10">${p.name}</h3>
      <p class="text-brandBlue font-bold mt-2">KSh ${p.price.toLocaleString()}</p>
      <p class="text-xs line-through text-gray-400">KSh ${p.oldPrice.toLocaleString()}</p>
    </div>
  `;
  div.addEventListener('click', () => {
    window.location.href = `product.html?id=${p.id}`;
  });
  relatedContainer.appendChild(div);
});

// Update cart count
updateCartCount();

// Search
document.getElementById('search-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = e.target.value.trim();
    if (query) {
      window.location.href = `category.html?search=${encodeURIComponent(query)}`;
    }
  }
});

// Sign in
const signInBtn = document.getElementById('sign-in-btn');
if (signInBtn) {
  signInBtn.addEventListener('click', () => {
    alert('Sign in feature coming soon! For now, browse and order via WhatsApp.');
  });
}