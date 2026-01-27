// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {

  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get('category');
  const selectedSubcategory = params.get('subcategory');
  const searchQuery = params.get('search');

  let currentProducts = [];

  // Check if products exist
  if (typeof products === 'undefined' || !products || products.length === 0) {
    document.getElementById('products').innerHTML = '<p class="col-span-full text-center text-red-600">Error: Products not loaded</p>';
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
        p.subcategory.toLowerCase().includes(term)
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

    const subcats = [...new Set(products.filter(p => p.category === selectedCategory).map(p => p.subcategory))];
    
    if (subcats.length === 0) {
      subcategoriesDiv.innerHTML = '';
      return;
    }

    subcategoriesDiv.innerHTML = `
      <h3 class="font-bold mb-3">Subcategories</h3>
      <ul class="space-y-2 text-sm">
        ${subcats.map(sub => `
          <li>
            <a href="category.html?category=${encodeURIComponent(selectedCategory)}&subcategory=${encodeURIComponent(sub)}" 
               class="hover:text-brandGold block ${sub === selectedSubcategory ? 'text-brandGold font-semibold' : ''}">
              ${sub}
            </a>
          </li>
        `).join('')}
      </ul>
    `;
  }

  // Render products
  function renderProducts(productsToShow) {
    const container = document.getElementById('products');
    const productCount = document.getElementById('product-count');
    const noResults = document.getElementById('no-results');

    currentProducts = productsToShow;

    // Update count
    productCount.textContent = `${productsToShow.length} products found`;

    if (productsToShow.length === 0) {
      container.innerHTML = '';
      noResults.classList.remove('hidden');
      return;
    }

    noResults.classList.add('hidden');
    container.innerHTML = '';

    productsToShow.forEach(p => {
      const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
      
      const productCard = document.createElement('div');
      productCard.className = 'bg-white p-3 rounded shadow hover:shadow-lg transition relative';
      productCard.innerHTML = `
        <span class="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold">
          -${discount}%
        </span>
        <a href="product.html?id=${p.id}">
          <img src="${p.image}" class="h-32 w-full object-cover mb-2 rounded cursor-pointer hover:opacity-90">
          <h3 class="text-sm font-semibold line-clamp-2 h-10 cursor-pointer hover:text-brandBlue">${p.name}</h3>
        </a>
        <p class="text-brandBlue font-bold mt-1">KSh ${p.price.toLocaleString()}</p>
        <p class="text-xs line-through text-gray-400">KSh ${p.oldPrice.toLocaleString()}</p>
        <button 
          class="add-to-cart-btn mt-2 w-full bg-brandGold hover:bg-yellow-600 text-white py-1 rounded transition text-sm"
          data-product='${JSON.stringify(p)}'
        >
          Add to Cart
        </button>
      `;
      container.appendChild(productCard);
    });

    // Add to cart functionality
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const product = JSON.parse(this.getAttribute('data-product'));
        addToCart(product);
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
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
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
  displaySubcategories();
  const filtered = filterProducts();
  renderProducts(filtered);

  // Update cart count
  if (typeof updateCartCount === 'function') {
    updateCartCount();
  }

});