// ADMIN CREDENTIALS
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

let adminProducts = JSON.parse(JSON.stringify(products));

// LOGIN
document.getElementById('login-btn').addEventListener('click', function() {
  const username = document.getElementById('admin-username').value;
  const password = document.getElementById('admin-password').value;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadProductsTable();
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

// LOAD PRODUCTS TABLE
function loadProductsTable(filterCat = '', searchTerm = '') {
  const tbody = document.getElementById('products-table-body');
  
  let filtered = adminProducts;
  
  if (filterCat) {
    filtered = filtered.filter(p => p.category === filterCat);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    );
  }
  
  document.getElementById('product-count').textContent = adminProducts.length;
  
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">No products found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filtered.map(p => `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-4 py-3 text-sm">${p.id}</td>
      <td class="px-4 py-3">
        <img src="${p.image}" class="h-12 w-12 object-cover rounded">
      </td>
      <td class="px-4 py-3 text-sm font-semibold">${p.name}</td>
      <td class="px-4 py-3 text-sm">${p.category}</td>
      <td class="px-4 py-3 text-sm font-bold text-green-600">KSh ${p.price.toLocaleString()}</td>
      <td class="px-4 py-3 text-sm">
        ${p.details ? '<span class="text-green-600">✓ Has details</span>' : '<span class="text-gray-400">No details</span>'}
      </td>
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

document.getElementById('search-products').addEventListener('input', function() {
  const searchTerm = this.value;
  const category = document.getElementById('filter-category').value;
  loadProductsTable(category, searchTerm);
});

document.getElementById('filter-category').addEventListener('change', function() {
  const category = this.value;
  const searchTerm = document.getElementById('search-products').value;
  loadProductsTable(category, searchTerm);
});

// ADD PRODUCT
document.getElementById('add-product-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const specs = {};
  const specNames = document.querySelectorAll('.spec-name');
  const specValues = document.querySelectorAll('.spec-value');
  specNames.forEach((nameInput, i) => {
    if (nameInput.value && specValues[i].value) {
      specs[nameInput.value] = specValues[i].value;
    }
  });
  
  const featuresText = document.getElementById('new-features').value;
  const features = featuresText.split('\n').filter(f => f.trim()).map(f => f.trim());
  
  const newProduct = {
    id: adminProducts.length > 0 ? Math.max(...adminProducts.map(p => p.id)) + 1 : 1,
    name: document.getElementById('new-name').value,
    category: document.getElementById('new-category').value,
    subcategory: document.getElementById('new-subcategory').value,
    price: parseInt(document.getElementById('new-price').value),
    oldPrice: parseInt(document.getElementById('new-oldPrice').value),
    image: document.getElementById('new-image').value
  };
  
  const description = document.getElementById('new-description').value;
  if (description || features.length > 0 || Object.keys(specs).length > 0) {
    newProduct.details = {
      description: description,
      features: features,
      specifications: specs
    };
  }
  
  adminProducts.push(newProduct);
  showUpdatedCode();
  
  this.reset();
  document.getElementById('specs-container').innerHTML = `
    <div class="grid grid-cols-2 gap-3">
      <input type="text" placeholder="Spec name (e.g., Capacity)" class="spec-name border rounded px-4 py-2 text-sm" />
      <input type="text" placeholder="Spec value (e.g., 380 Liters)" class="spec-value border rounded px-4 py-2 text-sm" />
    </div>
  `;
  
  alert('Product added! Copy the code to update data.js');
  document.querySelector('[data-tab="products"]').click();
  loadProductsTable();
});

// EDIT PRODUCT
function editProduct(id) {
  const product = adminProducts.find(p => p.id === id);
  
  document.getElementById('edit-product-id').value = product.id;
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-category').value = product.category;
  document.getElementById('edit-subcategory').value = product.subcategory;
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-oldPrice').value = product.oldPrice;
  document.getElementById('edit-image').value = product.image;
  
  if (product.details) {
    document.getElementById('edit-description').value = product.details.description || '';
    document.getElementById('edit-features').value = (product.details.features || []).join('\n');
    
    const specsContainer = document.getElementById('edit-specs-container');
    specsContainer.innerHTML = '';
    
    if (product.details.specifications) {
      Object.entries(product.details.specifications).forEach(([name, value]) => {
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
  } else {
    document.getElementById('edit-description').value = '';
    document.getElementById('edit-features').value = '';
    document.getElementById('edit-specs-container').innerHTML = '';
  }
  
  document.getElementById('edit-modal').classList.remove('hidden');
}

document.getElementById('close-edit-modal').addEventListener('click', function() {
  document.getElementById('edit-modal').classList.add('hidden');
});

document.getElementById('edit-product-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const id = parseInt(document.getElementById('edit-product-id').value);
  const index = adminProducts.findIndex(p => p.id === id);
  
  const specs = {};
  const specNames = document.querySelectorAll('.edit-spec-name');
  const specValues = document.querySelectorAll('.edit-spec-value');
  specNames.forEach((nameInput, i) => {
    if (nameInput.value && specValues[i].value) {
      specs[nameInput.value] = specValues[i].value;
    }
  });
  
  const featuresText = document.getElementById('edit-features').value;
  const features = featuresText.split('\n').filter(f => f.trim()).map(f => f.trim());
  
  adminProducts[index] = {
    id: id,
    name: document.getElementById('edit-name').value,
    category: document.getElementById('edit-category').value,
    subcategory: document.getElementById('edit-subcategory').value,
    price: parseInt(document.getElementById('edit-price').value),
    oldPrice: parseInt(document.getElementById('edit-oldPrice').value),
    image: document.getElementById('edit-image').value
  };
  
  const description = document.getElementById('edit-description').value;
  if (description || features.length > 0 || Object.keys(specs).length > 0) {
    adminProducts[index].details = {
      description: description,
      features: features,
      specifications: specs
    };
  }
  
  showUpdatedCode();
  loadProductsTable();
  document.getElementById('edit-modal').classList.add('hidden');
  alert('Product updated! Copy the code to update data.js');
});

// DELETE PRODUCT
function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    adminProducts = adminProducts.filter(p => p.id !== id);
    showUpdatedCode();
    loadProductsTable();
    alert('Product deleted! Copy the code to update data.js');
  }
}

// SHOW UPDATED CODE
function showUpdatedCode() {
  const dataCode = `const products = ${JSON.stringify(adminProducts, null, 2)};

// Get unique categories
const categories = [...new Set(products.map(p => p.category))];

// Get subcategories by category
function getSubcategories(category) {
  return [...new Set(products.filter(p => p.category === category).map(p => p.subcategory))];
}

// Filter products
function filterProducts(category = null, subcategory = null, searchTerm = null) {
  let filtered = products;
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (subcategory) {
    filtered = filtered.filter(p => p.subcategory === subcategory);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.subcategory.toLowerCase().includes(term)
    );
  }
  
  return filtered;
}`;

  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold mb-4">📋 Updated Product Data</h2>
      <p class="mb-4 text-sm text-gray-700">Copy this code and replace <strong>EVERYTHING</strong> in <strong>js/data.js</strong></p>
      <textarea id="code-to-copy" readonly class="w-full h-96 border rounded p-4 font-mono text-xs mb-4">${dataCode}</textarea>
      <div class="flex gap-3">
        <button onclick="copyCode()" class="bg-brandGold text-white px-6 py-2 rounded hover:bg-yellow-600">
          📋 Copy to Clipboard
        </button>
        <button onclick="this.closest('.fixed').remove()" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
          Close
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function copyCode() {
  const textarea = document.getElementById('code-to-copy');
  textarea.select();
  document.execCommand('copy');
  alert('✓ Code copied! Now paste it into js/data.js');
}

// LOAD CATEGORIES
function loadCategories() {
  const grid = document.getElementById('categories-grid');
  const categoryStats = {};
  
  adminProducts.forEach(p => {
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
}