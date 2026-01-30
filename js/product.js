// API Configuration
const API_URL = 'https://sherrys-backend.onrender.com/api';

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));

let product = null;
let allProducts = [];

// Load all products for related items
async function loadAllProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error('Failed to load products');
    
    const data = await response.json();
    
    // Transform API data to match existing format
    allProducts = data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || '',
      price: item.price,
      oldPrice: item.old_price || Math.round(item.price * 1.1),
      image: item.main_image_url || item.image_url || item.image || '',
      details: {
        description: item.description || `${item.name} - High quality product from Sherry's Wholesalers.`,
        features: Array.isArray(item.features) ? item.features : [],
        specifications: item.specifications || {}
      }
    }));
    
    return allProducts;
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

// Load specific product details
async function loadProductDetails() {
  if (!productId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/${productId}`);
    
    if (!response.ok) {
      throw new Error('Product not found');
    }
    
    const apiProduct = await response.json();
    
    // Transform to match existing format
    product = {
      id: apiProduct.id,
      name: apiProduct.name,
      category: apiProduct.category,
      subcategory: apiProduct.subcategory || '',
      price: apiProduct.price,
      oldPrice: apiProduct.old_price || Math.round(apiProduct.price * 1.1),
      image: apiProduct.main_image_url || apiProduct.image_url || apiProduct.image || '',
      details: {
        description: apiProduct.description || `${apiProduct.name} - High quality product from Sherry's Wholesalers.`,
        features: Array.isArray(apiProduct.features) ? apiProduct.features : [],
        specifications: apiProduct.specifications || {}
      }
    };
    
    displayProductDetails();
    await loadAllProducts(); // Load for related products
    displayRelatedProducts();
    
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Product not found or error loading. Redirecting to home page.');
    window.location.href = 'index.html';
  }
}

function displayProductDetails() {
  if (!product) return;
  
  // Calculate discount
  function getDiscount(oldPrice, newPrice) {
    if (!oldPrice || oldPrice <= newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  }
  
  const discount = getDiscount(product.oldPrice, product.price);
  const savings = product.oldPrice ? product.oldPrice - product.price : 0;
  
  // Update page
  document.title = `${product.name} | Sherry's Wholesalers`;
  
  // Breadcrumb
  const breadcrumbEl = document.getElementById('breadcrumb');
  if (breadcrumbEl) {
    breadcrumbEl.innerHTML = `
      <a href="index.html" class="hover:text-brandGold">Home</a> / 
      <a href="category.html?category=${encodeURIComponent(product.category)}" class="hover:text-brandGold">${product.category}</a> / 
      <span class="text-gray-900 font-semibold">${product.name}</span>
    `;
  }
  
  // Product details
  const productImageEl = document.getElementById('product-image');
  if (productImageEl) {
    productImageEl.src = product.image;
    productImageEl.alt = product.name;
  }
  
  const categoryEl = document.getElementById('product-category');
  if (categoryEl) categoryEl.textContent = product.category;
  
  const nameEl = document.getElementById('product-name');
  if (nameEl) nameEl.textContent = product.name;
  
  const priceEl = document.getElementById('product-price');
  if (priceEl) priceEl.textContent = `KSh ${product.price.toLocaleString()}`;
  
  const oldPriceEl = document.getElementById('product-old-price');
  if (oldPriceEl) {
    if (product.oldPrice && product.oldPrice > product.price) {
      oldPriceEl.textContent = `KSh ${product.oldPrice.toLocaleString()}`;
      oldPriceEl.classList.remove('hidden');
    } else {
      oldPriceEl.classList.add('hidden');
    }
  }
  
  const discountBadgeEl = document.getElementById('discount-badge');
  if (discountBadgeEl) {
    if (discount > 0) {
      discountBadgeEl.textContent = `-${discount}% OFF`;
      discountBadgeEl.classList.remove('hidden');
    } else {
      discountBadgeEl.classList.add('hidden');
    }
  }
  
  const savingsEl = document.getElementById('savings');
  if (savingsEl && savings > 0) {
    savingsEl.querySelector('p').textContent = `💰 You save KSh ${savings.toLocaleString()} on this product!`;
    savingsEl.classList.remove('hidden');
  } else if (savingsEl) {
    savingsEl.classList.add('hidden');
  }
  
  const detailCategoryEl = document.getElementById('detail-category');
  if (detailCategoryEl) detailCategoryEl.textContent = product.category;
  
  const detailSubcategoryEl = document.getElementById('detail-subcategory');
  if (detailSubcategoryEl) detailSubcategoryEl.textContent = product.subcategory;
  
  const detailIdEl = document.getElementById('detail-id');
  if (detailIdEl) detailIdEl.textContent = product.id;
  
  // Display product details if available
  if (product.details) {
    // Description
    if (product.details.description) {
      const descSection = document.getElementById('description-section');
      const descEl = document.getElementById('product-description');
      if (descSection && descEl) {
        descSection.classList.remove('hidden');
        descEl.textContent = product.details.description;
      }
    }
    
    // Features
    if (product.details.features && product.details.features.length > 0) {
      const featuresSection = document.getElementById('features-section');
      const featuresList = document.getElementById('product-features');
      if (featuresSection && featuresList) {
        featuresSection.classList.remove('hidden');
        featuresList.innerHTML = product.details.features.map(f => `<li>${f}</li>`).join('');
      }
    }
    
    // Specifications
    if (product.details.specifications && Object.keys(product.details.specifications).length > 0) {
      const specsSection = document.getElementById('specs-section');
      const specsDiv = document.getElementById('product-specs');
      if (specsSection && specsDiv) {
        specsSection.classList.remove('hidden');
        specsDiv.innerHTML = Object.entries(product.details.specifications)
          .map(([key, value]) => `
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold">${key}:</span>
              <span class="text-gray-700">${value}</span>
            </div>
          `).join('');
      }
    }
  }
  
  // Quantity controls
  const qtyInput = document.getElementById('quantity');
  const decreaseBtn = document.getElementById('decrease-qty');
  const increaseBtn = document.getElementById('increase-qty');
  
  if (qtyInput && decreaseBtn && increaseBtn) {
    qtyInput.value = 1;
    
    decreaseBtn.addEventListener('click', () => {
      if (qtyInput.value > 1) {
        qtyInput.value = parseInt(qtyInput.value) - 1;
      }
    });
    
    increaseBtn.addEventListener('click', () => {
      qtyInput.value = parseInt(qtyInput.value) + 1;
    });
  }
  
  // Add to cart button
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const quantity = parseInt(qtyInput?.value || 1);
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      updateCartCount();
      alert(`✅ ${quantity} × ${product.name} added to cart!`);
    });
  }
  
  // Buy now button
  const buyNowBtn = document.getElementById('buy-now-btn');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
      const quantity = parseInt(qtyInput?.value || 1);
      const total = product.price * quantity;
      
      const message = `Hello! I'd like to order:\n\n• ${product.name}\n  Qty: ${quantity} × KSh ${product.price.toLocaleString()} = KSh ${(product.price * quantity).toLocaleString()}\n\n*Total: KSh ${total.toLocaleString()}*`;
      
      const phone = "254710553678";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
      
      window.open(url, '_blank');
    });
  }
}

function displayRelatedProducts() {
  if (!product || allProducts.length === 0) return;
  
  const relatedContainer = document.getElementById('related-products');
  if (!relatedContainer) return;
  
  // Get products from same category (excluding current product)
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  
  if (relatedProducts.length === 0) {
    relatedContainer.innerHTML = '<p class="text-center text-gray-500 col-span-4">No related products found</p>';
    return;
  }
  
  relatedContainer.innerHTML = '';
  
  relatedProducts.forEach(p => {
    const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
    
    const div = document.createElement('div');
    div.className = 'bg-white border rounded shadow hover:shadow-lg transition cursor-pointer relative';
    div.innerHTML = `
      ${discount > 0 ? `
        <span class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
          -${discount}%
        </span>
      ` : ''}
      <img src="${p.image}" alt="${p.name}" class="h-32 w-full object-cover rounded-t">
      <div class="p-3">
        <h3 class="text-sm font-semibold line-clamp-2 h-10">${p.name}</h3>
        <p class="text-brandBlue font-bold mt-2">KSh ${p.price.toLocaleString()}</p>
        ${p.oldPrice > p.price ? `
          <p class="text-xs line-through text-gray-400">KSh ${p.oldPrice.toLocaleString()}</p>
        ` : ''}
      </div>
    `;
    
    div.addEventListener('click', () => {
      window.location.href = `product.html?id=${p.id}`;
    });
    
    relatedContainer.appendChild(div);
  });
}

// Search functionality
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query) {
        window.location.href = `category.html?search=${encodeURIComponent(query)}`;
      }
    }
  });
}

// Sign in button
const signInBtn = document.getElementById('sign-in-btn');
if (signInBtn) {
  signInBtn.addEventListener('click', () => {
    alert('Sign in feature coming soon! For now, browse and order via WhatsApp.');
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails();
  updateCartCount();
});