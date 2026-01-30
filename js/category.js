// API Configuration
const API_URL = 'https://sherrys-backend.onrender.com/api';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async function() {

  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get('category');
  const selectedSubcategory = params.get('subcategory');
  const searchQuery = params.get('search');

  let currentProducts = [];

  // Load products from API
  async function loadProductsFromAPI() {
    try {
      console.log('📦 Loading products from API for category page...');
      const response = await fetch(`${API_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const apiProducts = await response.json();
      
      // Transform API data to match existing format
      return apiProducts.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory || '',
        price: item.price,
        oldPrice: item.old_price || Math.round(item.price * 1.1),
        image: item.main_image_url || (item.image_url ? item.image_url.split(',')[0] : ''),
        details: {
          description: item.description || `${item.name} - High quality product from Sherry's Wholesalers.`,
          features: Array.isArray(item.features) ? item.features : [],
          specifications: item.specifications || {}
        }
      }));
      
    } catch (error) {
      console.error('❌ Error loading products from API:', error);
      
      // Fallback to global products if available
      if (typeof products !== 'undefined' && products && products.length > 0) {
        console.log('🔄 Using global products data as fallback');
        return products;
      }
      
      return [];
    }
  }

  // Check if products exist
  const products = await loadProductsFromAPI();
  
  if (!products || products.length === 0) {
    document.getElementById('products').innerHTML = '<p class="col-span-full text-center text-red-600">No products available at the moment. Please check back later.</p>';
    document.getElementById('product-count').textContent = '0 products found';
    return;
  }

  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (searchQuery) {
    pageTitle.textContent = `Search: "${searchQuery}"`;
  } else if (selectedSubcategory) {
    pageTitle.textContent = `${selectedCategory} > ${selectedSubcategory}`;
  } else if (selectedCategory) {
    pageTitle.textContent = selectedCategory;
  } else {
    pageTitle.textContent = 'All Products';
  }

  // Filter products
  function filterProducts() {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.subcategory === selectedSubcategory);
    }

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.subcategory.toLowerCase().includes(term) ||
        (p.details.description && p.details.description.toLowerCase().includes(term))
      );
    }

    return filtered;
  }

  // Display subcategories if category is selected
  function displaySubcategories() {
    const subcategoriesDiv = document.getElementById('subcategories');
    
    if (!selectedCategory) {
      subcategoriesDiv.innerHTML = '';
      return;
    }

    const subcats = [...new Set(products.filter(p => p.category === selectedCategory).map(p => p.subcategory))].filter(Boolean);
    
    if (subcats.length === 0) {
      subcategoriesDiv.innerHTML = '';
      return;
    }

    subcategoriesDiv.innerHTML = `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-bold mb-3 text-lg">Subcategories</h3>
        <ul class="space-y-2">
          <li>
            <a href="category.html?category=${encodeURIComponent(selectedCategory)}" 
               class="hover:text-brandGold block ${!selectedSubcategory ? 'text-brandGold font-semibold' : 'text-gray-700'}">
              All ${selectedCategory}
            </a>
          </li>
          ${subcats.map(sub => `
            <li>
              <a href="category.html?category=${encodeURIComponent(selectedCategory)}&subcategory=${encodeURIComponent(sub)}" 
                 class="hover:text-brandGold block ${sub === selectedSubcategory ? 'text-brandGold font-semibold' : 'text-gray-700'}">
                ${sub}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // Calculate discount percentage
  function calculateDiscount(oldPrice, price) {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  // Render products
  function renderProducts(productsToShow) {
    const container = document.getElementById('products');
    const productCount = document.getElementById('product-count');
    const noResults = document.getElementById('no-results');

    currentProducts = productsToShow;

    // Update count
    productCount.textContent = `${productsToShow.length} ${productsToShow.length === 1 ? 'product' : 'products'} found`;

    if (productsToShow.length === 0) {
      container.innerHTML = '';
      noResults.classList.remove('hidden');
      noResults.innerHTML = `
        <div class="text-center py-12">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
          <p class="text-gray-500">Try adjusting your search or filter criteria.</p>
          <a href="category.html" class="inline-block mt-4 bg-brandGold text-white px-4 py-2 rounded hover:bg-yellow-600">
            Browse All Products
          </a>
        </div>
      `;
      return;
    }

    noResults.classList.add('hidden');
    container.innerHTML = '';

    productsToShow.forEach(p => {
      const discount = calculateDiscount(p.oldPrice, p.price);
      const hasDiscount = discount > 0;
      
      const productCard = document.createElement('div');
      productCard.className = 'bg-white p-4 rounded-lg shadow hover:shadow-xl transition-all duration-300 relative border';
      productCard.innerHTML = `
        ${hasDiscount ? `
          <span class="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold z-10">
            -${discount}% OFF
          </span>
        ` : ''}
        
        <a href="product.html?id=${p.id}" class="block">
          <div class="relative overflow-hidden rounded mb-3">
            <img src="${p.image || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400'}" 
                 alt="${p.name}"
                 class="h-48 w-full object-cover hover:scale-105 transition-transform duration-300">
            ${hasDiscount ? `
              <div class="absolute bottom-0 left-0 bg-red-600 text-white text-xs px-2 py-1">
                SAVE KSh ${(p.oldPrice - p.price).toLocaleString()}
              </div>
            ` : ''}
          </div>
          
          <div class="space-y-2">
            <h3 class="font-semibold text-gray-800 line-clamp-2 h-12 hover:text-brandBlue transition-colors">
              ${p.name}
            </h3>
            
            <div class="flex items-center justify-between">
              <div>
                <p class="text-lg font-bold text-brandBlue">KSh ${p.price.toLocaleString()}</p>
                ${hasDiscount ? `
                  <p class="text-sm line-through text-gray-400">KSh ${p.oldPrice.toLocaleString()}</p>
                ` : ''}
              </div>
              
              ${p.details.features && p.details.features.length > 0 ? `
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ${p.details.features.length} features
                </span>
              ` : ''}
            </div>
            
            ${p.details.description ? `
              <p class="text-sm text-gray-600 line-clamp-2">${p.details.description}</p>
            ` : ''}
            
            <div class="pt-2 flex gap-2">
              <button 
                class="add-to-cart-btn flex-1 bg-brandGold hover:bg-yellow-600 text-white py-2 px-4 rounded transition text-sm font-medium"
                data-product='${JSON.stringify(p).replace(/'/g, "\\'")}'
              >
                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add to Cart
              </button>
              
              <a href="product.html?id=${p.id}" 
                 class="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded transition text-sm font-medium inline-flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                View
              </a>
            </div>
          </div>
        </a>
      `;
      container.appendChild(productCard);
    });

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        try {
          const product = JSON.parse(this.getAttribute('data-product'));
          addToCart(product);
          updateCartCount();
          
          // Show success feedback
          const originalText = this.innerHTML;
          this.innerHTML = `
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Added!
          `;
          this.classList.remove('bg-brandGold', 'hover:bg-yellow-600');
          this.classList.add('bg-green-600', 'hover:bg-green-700');
          
          setTimeout(() => {
            this.innerHTML = originalText;
            this.classList.remove('bg-green-600', 'hover:bg-green-700');
            this.classList.add('bg-brandGold', 'hover:bg-yellow-600');
          }, 2000);
          
        } catch (error) {
          console.error('Error adding to cart:', error);
          alert('Error adding product to cart');
        }
      });
    });
  }

  // Sort products
  function sortProducts(productsArray, sortType) {
    const sorted = [...productsArray];
    
    switch(sortType) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'discount':
        return sorted.sort((a, b) => {
          const discountA = calculateDiscount(a.oldPrice, a.price);
          const discountB = calculateDiscount(b.oldPrice, b.price);
          return discountB - discountA;
        });
      default:
        return sorted;
    }
  }

  // Display categories sidebar
  function displayCategoriesSidebar() {
    const categoriesDiv = document.getElementById('categories-sidebar');
    if (!categoriesDiv) return;
    
    const allCategories = [...new Set(products.map(p => p.category))].filter(Boolean);
    
    categoriesDiv.innerHTML = `
      <div class="bg-white p-4 rounded shadow">
        <h3 class="font-bold mb-3 text-lg">Categories</h3>
        <ul class="space-y-2">
          <li>
            <a href="category.html" 
               class="hover:text-brandGold block ${!selectedCategory ? 'text-brandGold font-semibold' : 'text-gray-700'}">
              All Products
            </a>
          </li>
          ${allCategories.map(cat => `
            <li>
              <a href="category.html?category=${encodeURIComponent(cat)}" 
                 class="hover:text-brandGold block ${cat === selectedCategory ? 'text-brandGold font-semibold' : 'text-gray-700'}">
                ${cat}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  // Search functionality
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = searchQuery || '';
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `category.html?search=${encodeURIComponent(query)}`;
        } else {
          window.location.href = 'category.html';
        }
      }
    });
  }

  // Sort functionality
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      const sorted = sortProducts(currentProducts, e.target.value);
      renderProducts(sorted);
    });
  }

  // Initialize page
  displayCategoriesSidebar();
  displaySubcategories();
  const filtered = filterProducts();
  const initialSort = sortSelect ? sortSelect.value : 'default';
  const sorted = sortProducts(filtered, initialSort);
  renderProducts(sorted);

  // Update cart count
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  }

  // Mobile filter toggle
  const mobileFilterBtn = document.getElementById('mobile-filter-btn');
  const filterSidebar = document.getElementById('filter-sidebar');
  
  if (mobileFilterBtn && filterSidebar) {
    mobileFilterBtn.addEventListener('click', () => {
      filterSidebar.classList.toggle('hidden');
    });
  }

});