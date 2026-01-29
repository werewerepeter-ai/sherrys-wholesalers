// API Configuration
const API_URL = 'https://sherrys-backend.onrender.com/api';
// ADMIN CREDENTIALS
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

let allProducts = [];

// LOGIN
document.getElementById('login-btn').addEventListener('click', function() {
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadProducts();
    loadCategories();
  } else {
    alert('Invalid username or password!');
  }
});

document.getElementById('admin-password').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    document.getElementById('login-btn').click();
  }
});

// LOGOUT
document.getElementById('logout-btn').addEventListener('click', function() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-dashboard').classList.add('hidden');
  document.getElementById('admin-username').value = '';
  document.getElementById('admin-password').value = '';
});

// TAB SWITCHING
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const tab = this.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('border-b-2', 'border-brandGold', 'font-semibold', 'active');
    });
    this.classList.add('border-b-2', 'border-brandGold', 'font-semibold', 'active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    document.getElementById(tab + '-tab').classList.remove('hidden');
  });
});

// IMAGE PREVIEW
document.querySelector('input[name="image"]').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('image-preview');
      preview.classList.remove('hidden');
      preview.querySelector('img').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ADD SPECIFICATION ROW
document.getElementById('add-spec-btn').addEventListener('click', function() {
  const container = document.getElementById('specs-container');
  const row = document.createElement('div');
  row.className = 'grid grid-cols-2 gap-3';
  row.innerHTML = `
    <input type="text" placeholder="Spec name" class="spec-name border rounded px-4 py-2 text-sm" />
    <div class="flex gap-2">
      <input type="text" placeholder="Spec value" class="spec-value border rounded px-4 py-2 text-sm flex-1" />
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-red-600 text-white px-3 rounded hover:bg-red-700">×</button>
    </div>
  `;
  container.appendChild(row);
});

document.getElementById('edit-add-spec-btn').addEventListener('click', function() {
  const container = document.getElementById('edit-specs-container');
  const row = document.createElement('div');
  row.className = 'grid grid-cols-2 gap-3';
  row.innerHTML = `
    <input type="text" placeholder="Spec name" class="edit-spec-name border rounded px-4 py-2 text-sm" />
    <div class="flex gap-2">
      <input type="text" placeholder="Spec value" class="edit-spec-value border rounded px-4 py-2 text-sm flex-1" />
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-red-600 text-white px-3 rounded hover:bg-red-700">×</button>
    </div>
  `;
  container.appendChild(row);
});

// LOAD PRODUCTS
async function loadProducts() {
  try {
    const response = await fetch(API_URL + '/products');
    allProducts = await response.json();
    displayProducts(allProducts);
    updateProductCount();
    loadCategoryFilter();
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Failed to load products. Make sure backend is running on http://localhost:5000');
  }
}

function displayProducts(products) {
  const tbody = document.getElementById('products-table-body');
  
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No products found</td></tr>';
    return;
  }
  
  tbody.innerHTML = products.map(p => `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-4 py-3 text-sm">${p.id}</td>
      <td class="px-4 py-3">
        <img src="${p.image_url}" class="h-12 w-12 object-cover rounded">
      </td>
      <td class="px-4 py-3 text-sm font-semibold">${p.name}</td>
      <td class="px-4 py-3 text-sm">${p.category}</td>
      <td class="px-4 py-3 text-sm font-bold text-green-600">KSh ${parseInt(p.price).toLocaleString()}</td>
      <td class="px-4 py-3">
        <button onclick="editProduct(${p.id})" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 mr-2">
          Edit
        </button>
        <button onclick="deleteProduct(${p.id})" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
          Delete
        </button>
      </td>
    </tr>
  `).join('');
}

function updateProductCount() {
  document.getElementById('product-count').textContent = allProducts.length;
}

function loadCategoryFilter() {
  const select = document.getElementById('filter-category');
  const categories = [...new Set(allProducts.map(p => p.category))];
  
  select.innerHTML = '<option value="">All Categories</option>' + 
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// SEARCH AND FILTER
document.getElementById('search-products').addEventListener('input', filterProducts);
document.getElementById('filter-category').addEventListener('change', filterProducts);

function filterProducts() {
  const searchTerm = document.getElementById('search-products').value.toLowerCase();
  const category = document.getElementById('filter-category').value;
  
  let filtered = allProducts;
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm)
    );
  }
  
  displayProducts(filtered);
}

// ADD PRODUCT
document.getElementById('add-product-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  
  // Get specifications
  const specs = {};
  const specNames = document.querySelectorAll('.spec-name');
  const specValues = document.querySelectorAll('.spec-value');
  specNames.forEach((nameInput, i) => {
    if (nameInput.value && specValues[i].value) {
      specs[nameInput.value] = specValues[i].value;
    }
  });
  
  // Get features
  const featuresText = formData.get('features');
  const features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : [];
  
  // Prepare form data
  const submitData = new FormData();
  submitData.append('name', formData.get('name'));
  submitData.append('category', formData.get('category'));
  submitData.append('subcategory', formData.get('subcategory'));
  submitData.append('price', formData.get('price'));
  submitData.append('old_price', formData.get('old_price'));
  submitData.append('image', formData.get('image'));
  submitData.append('description', formData.get('description') || '');
  submitData.append('features', JSON.stringify(features));
  submitData.append('specifications', JSON.stringify(specs));
  
  try {
    document.getElementById('upload-progress').classList.remove('hidden');
    
    const response = await fetch(API_URL + '/products', {
      method: 'POST',
      body: submitData
    });
    
    if (!response.ok) {
      throw new Error('Failed to add product');
    }
    
    alert('✅ Product added successfully!');
    this.reset();
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('specs-container').innerHTML = `
      <div class="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Spec name" class="spec-name border rounded px-4 py-2 text-sm" />
        <input type="text" placeholder="Spec value" class="spec-value border rounded px-4 py-2 text-sm" />
      </div>
    `;
    
    document.querySelector('[data-tab="products"]').click();
    loadProducts();
  } catch (error) {
    console.error('Error adding product:', error);
    alert('❌ Failed to add product. Check console for details.');
  } finally {
    document.getElementById('upload-progress').classList.add('hidden');
  }
});

// EDIT PRODUCT
async function editProduct(id) {
  try {
    const response = await fetch(API_URL + '/products/' + id);
    const product = await response.json();
    
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-subcategory').value = product.subcategory;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-old-price').value = product.old_price;
    document.getElementById('edit-current-image').src = product.image_url;
    document.getElementById('edit-description').value = product.description || '';
    document.getElementById('edit-features').value = product.features ? product.features.join('\n') : '';
    
    // Load specifications
    const specsContainer = document.getElementById('edit-specs-container');
    specsContainer.innerHTML = '';
    
    if (product.specifications) {
      Object.entries(product.specifications).forEach(([name, value]) => {
        const row = document.createElement('div');
        row.className = 'grid grid-cols-2 gap-3';
        row.innerHTML = `
          <input type="text" value="${name}" class="edit-spec-name border rounded px-4 py-2 text-sm" />
          <div class="flex gap-2">
            <input type="text" value="${value}" class="edit-spec-value border rounded px-4 py-2 text-sm flex-1" />
            <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-red-600 text-white px-3 rounded hover:bg-red-700">×</button>
          </div>
        `;
        specsContainer.appendChild(row);
      });
    }
    
    document.getElementById('edit-modal').classList.remove('hidden');
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Failed to load product details');
  }
}

document.getElementById('close-edit-modal').addEventListener('click', function() {
  document.getElementById('edit-modal').classList.add('hidden');
});

document.getElementById('edit-product-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const id = formData.get('id');
  
  // Get specifications
  const specs = {};
  const specNames = document.querySelectorAll('.edit-spec-name');
  const specValues = document.querySelectorAll('.edit-spec-value');
  specNames.forEach((nameInput, i) => {
    if (nameInput.value && specValues[i].value) {
      specs[nameInput.value] = specValues[i].value;
    }
  });
  
  // Get features
  const featuresText = formData.get('features');
  const features = featuresText ? featuresText.split('\n').filter(f => f.trim()) : [];
  
  // Prepare form data
  const submitData = new FormData();
  submitData.append('name', formData.get('name'));
  submitData.append('category', formData.get('category'));
  submitData.append('subcategory', formData.get('subcategory'));
  submitData.append('price', formData.get('price'));
  submitData.append('old_price', formData.get('old_price'));
  if (formData.get('image').size > 0) {
    submitData.append('image', formData.get('image'));
  }
  submitData.append('description', formData.get('description') || '');
  submitData.append('features', JSON.stringify(features));
  submitData.append('specifications', JSON.stringify(specs));
  
  try {
    const response = await fetch(API_URL + '/products/' + id, {
      method: 'PUT',
      body: submitData
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    
    alert('✅ Product updated successfully!');
    document.getElementById('edit-modal').classList.add('hidden');
    loadProducts();
  } catch (error) {
    console.error('Error updating product:', error);
    alert('❌ Failed to update product');
  }
});

// DELETE PRODUCT
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }
  
  try {
    const response = await fetch(API_URL + '/products/' + id, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
    
    alert('✅ Product deleted successfully!');
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('❌ Failed to delete product');
  }
}

// LOAD CATEGORIES
async function loadCategories() {
  try {
    const response = await fetch(API_URL + '/categories');
    const categories = await response.json();
    
    const grid = document.getElementById('categories-grid');
    const categoryStats = {};
    
    allProducts.forEach(p => {
      if (!categoryStats[p.category]) {
        categoryStats[p.category] = 0;
      }
      categoryStats[p.category]++;
    });
    
    grid.innerHTML = Object.entries(categoryStats).map(([cat, count]) => `
      <div class="bg-white p-6 rounded shadow text-center border-l-4 border-brandGold">
        <h3 class="font-bold text-lg text-brandBlue mb-2">${cat}</h3>
        <p class="text-4xl font-bold text-brandGold">${count}</p>
        <p class="text-sm text-gray-600 mt-1">products</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}