// API Configuration
const API_URL = 'https://sherrys-backend.onrender.com/api';

// ADMIN CREDENTIALS
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

let allProducts = [];
let featuresList = [];
let specsList = {};
let selectedImages = [];

/* ======================================================
   FEATURES MANAGEMENT FUNCTIONS
====================================================== */
function parseBulkFeatures() {
  const bulkText = document.getElementById('features-bulk');
  if (!bulkText) return;
  
  const text = bulkText.value.trim();
  if (!text) return;
  
  // Parse from text: newlines, commas, or bullets
  const parsed = text
    .split(/\n|,|•|-\s*/)
    .map(item => item.trim())
    .filter(item => item.length > 0 && !item.match(/^[•\-*\s]+$/))
    .map(item => item.replace(/^[•\-*\s]+/, ''));
  
  // Add to features list, remove duplicates
  parsed.forEach(feature => {
    if (!featuresList.includes(feature)) {
      featuresList.push(feature);
    }
  });
  
  updateFeaturesDisplay();
  bulkText.value = ''; // Clear after parsing
  alert(`✅ Added ${parsed.length} features!`);
}

function addSingleFeature() {
  const input = document.getElementById('single-feature');
  if (!input) return;
  
  const feature = input.value.trim();
  if (!feature) return;
  
  if (!featuresList.includes(feature)) {
    featuresList.push(feature);
    updateFeaturesDisplay();
    input.value = '';
    input.focus();
  } else {
    alert('Feature already exists!');
  }
}

function removeFeature(index) {
  if (index >= 0 && index < featuresList.length) {
    featuresList.splice(index, 1);
    updateFeaturesDisplay();
  }
}

function updateFeaturesDisplay() {
  const display = document.getElementById('features-display');
  const count = document.getElementById('features-count');
  const jsonField = document.getElementById('features-json');
  
  if (!display || !count || !jsonField) return;
  
  // Update count
  count.textContent = featuresList.length;
  
  // Update display
  if (featuresList.length === 0) {
    display.innerHTML = '<div class="text-gray-400 italic">No features added yet</div>';
  } else {
    display.innerHTML = featuresList.map((feature, index) => `
      <div class="flex justify-between items-center py-1 border-b last:border-b-0">
        <span class="text-sm">• ${feature}</span>
        <button 
          type="button" 
          onclick="removeFeature(${index})" 
          class="text-red-500 hover:text-red-700 text-xs px-2"
        >
          Remove
        </button>
      </div>
    `).join('');
  }
  
  // Update hidden JSON field
  jsonField.value = JSON.stringify(featuresList);
}

/* ======================================================
   SPECS MANAGEMENT FUNCTIONS
====================================================== */
function parseBulkSpecs() {
  const bulkText = document.getElementById('specs-bulk');
  if (!bulkText) return;
  
  const text = bulkText.value.trim();
  if (!text) return;
  
  let parsedCount = 0;
  
  // Parse from text: each line as "key: value"
  const lines = text.split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    
    // Try to split by colon
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      // Try by dash or equals
      const dashIndex = trimmed.indexOf('-');
      const equalsIndex = trimmed.indexOf('=');
      const separatorIndex = Math.max(dashIndex, equalsIndex);
      
      if (separatorIndex !== -1) {
        const key = trimmed.substring(0, separatorIndex).trim();
        const value = trimmed.substring(separatorIndex + 1).trim();
        if (key && value) {
          specsList[key] = value;
          parsedCount++;
        }
      }
    } else {
      const key = trimmed.substring(0, colonIndex).trim();
      const value = trimmed.substring(colonIndex + 1).trim();
      if (key && value) {
        specsList[key] = value;
        parsedCount++;
      }
    }
  });
  
  updateSpecsDisplay();
  bulkText.value = ''; // Clear after parsing
  alert(`✅ Added ${parsedCount} specs!`);
}

function addSingleSpec() {
  const nameInput = document.getElementById('spec-name-input');
  const valueInput = document.getElementById('spec-value-input');
  
  if (!nameInput || !valueInput) return;
  
  const name = nameInput.value.trim();
  const value = valueInput.value.trim();
  
  if (!name || !value) {
    alert('Please enter both spec name and value!');
    return;
  }
  
  specsList[name] = value;
  updateSpecsDisplay();
  
  // Clear inputs
  nameInput.value = '';
  valueInput.value = '';
  nameInput.focus();
}

function removeSpec(key) {
  if (specsList.hasOwnProperty(key)) {
    delete specsList[key];
    updateSpecsDisplay();
  }
}

function updateSpecsDisplay() {
  const display = document.getElementById('specs-display');
  const count = document.getElementById('specs-count');
  const jsonField = document.getElementById('specs-json');
  
  if (!display || !count || !jsonField) return;
  
  // Update count
  const specCount = Object.keys(specsList).length;
  count.textContent = specCount;
  
  // Update display
  if (specCount === 0) {
    display.innerHTML = '<div class="text-gray-400 italic">No specs added yet</div>';
  } else {
    display.innerHTML = Object.entries(specsList).map(([key, value]) => `
      <div class="flex justify-between items-center py-1 border-b last:border-b-0">
        <div class="text-sm">
          <span class="font-medium">${key}:</span> 
          <span class="text-gray-600">${value}</span>
        </div>
        <button 
          type="button" 
          onclick="removeSpec('${key.replace(/'/g, "\\'")}')" 
          class="text-red-500 hover:text-red-700 text-xs px-2"
        >
          Remove
        </button>
      </div>
    `).join('');
  }
  
  // Update hidden JSON field
  jsonField.value = JSON.stringify(specsList);
}

/* ======================================================
   MULTIPLE IMAGES MANAGEMENT FUNCTIONS
====================================================== */
function handleImageSelection() {
  const input = document.getElementById('images-input');
  if (!input) return;
  
  const files = Array.from(input.files);
  
  // Limit to 5 images
  if (files.length > 5) {
    alert('Maximum 5 images allowed. Selecting first 5 images.');
    files.splice(5);
  }
  
  selectedImages = files;
  updateImagesPreview();
}

function updateImagesPreview() {
  const container = document.getElementById('images-preview-container');
  const preview = document.getElementById('images-preview');
  const count = document.getElementById('images-count');
  
  if (!container || !preview || !count) return;
  
  count.textContent = selectedImages.length;
  
  if (selectedImages.length === 0) {
    container.classList.add('hidden');
    return;
  }
  
  container.classList.remove('hidden');
  preview.innerHTML = '';
  
  selectedImages.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const div = document.createElement('div');
      div.className = 'relative border rounded overflow-hidden';
      div.innerHTML = `
        <img src="${e.target.result}" alt="Preview ${index + 1}" class="h-24 w-full object-cover">
        <div class="absolute top-0 left-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1">
          ${index === 0 ? 'MAIN' : index + 1}
        </div>
        <button 
          type="button" 
          onclick="removeImage(${index})" 
          class="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-1 hover:bg-red-700"
        >
          ✕
        </button>
      `;
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removeImage(index) {
  selectedImages.splice(index, 1);
  
  // Update file input
  const input = document.getElementById('images-input');
  const dataTransfer = new DataTransfer();
  selectedImages.forEach(file => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
  
  updateImagesPreview();
}

/* ======================================================
   DOM READY
====================================================== */
document.addEventListener('DOMContentLoaded', () => {

  /* ================= LOGIN ================= */
  const loginBtn = document.getElementById('login-btn');
  const passwordInput = document.getElementById('admin-password');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const username = document.getElementById('admin-username').value;
      const password = passwordInput.value;

      if (username === ADMIN_USER && password === ADMIN_PASS) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        loadProducts();
        loadCategories();
      } else {
        alert('Invalid username or password!');
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') loginBtn.click();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      document.getElementById('login-screen').classList.remove('hidden');
      document.getElementById('admin-dashboard').classList.add('hidden');
      document.getElementById('admin-username').value = '';
      document.getElementById('admin-password').value = '';
      // Reset all data
      featuresList = [];
      specsList = {};
      selectedImages = [];
    });
  }

  /* ================= TAB SWITCHING ================= */
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const tab = this.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b =>
        b.classList.remove('border-b-2', 'border-brandGold', 'font-semibold', 'active')
      );
      this.classList.add('border-b-2', 'border-brandGold', 'font-semibold', 'active');

      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      const activeTab = document.getElementById(tab + '-tab');
      if (activeTab) activeTab.classList.remove('hidden');
      
      // Reset form when switching to add product tab
      if (tab === 'add-product') {
        featuresList = [];
        specsList = {};
        selectedImages = [];
        updateFeaturesDisplay();
        updateSpecsDisplay();
        updateImagesPreview();
      }
    });
  });

  /* ================= MULTIPLE IMAGES INPUT ================= */
  const imagesInput = document.getElementById('images-input');
  if (imagesInput) {
    imagesInput.addEventListener('change', handleImageSelection);
  }

  /* ================= ADD SPEC ROWS (for edit modal) ================= */
  const editAddSpecBtn = document.getElementById('edit-add-spec-btn');
  if (editAddSpecBtn) {
    editAddSpecBtn.addEventListener('click', () => {
      const container = document.getElementById('edit-specs-container');
      if (!container) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-2 gap-3 mb-2';
      row.innerHTML = `
        <input type="text" class="edit-spec-name border rounded px-4 py-2 text-sm" placeholder="Spec name" />
        <div class="flex gap-2">
          <input type="text" class="edit-spec-value border rounded px-4 py-2 text-sm flex-1" placeholder="Spec value" />
          <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-red-600 text-white px-3 rounded">×</button>
        </div>
      `;
      container.appendChild(row);
    });
  }

  /* ================= SEARCH / FILTER ================= */
  const search = document.getElementById('search-products');
  const filter = document.getElementById('filter-category');
  if (search) search.addEventListener('input', filterProducts);
  if (filter) filter.addEventListener('change', filterProducts);

  /* ================= EDIT MODAL ================= */
  const closeEdit = document.getElementById('close-edit-modal');
  if (closeEdit) {
    closeEdit.addEventListener('click', () => {
      document.getElementById('edit-modal').classList.add('hidden');
    });
  }
  
  const closeEdit2 = document.getElementById('close-edit-modal-2');
  if (closeEdit2) {
    closeEdit2.addEventListener('click', () => {
      document.getElementById('edit-modal').classList.add('hidden');
    });
  }

  /* ================= ADD PRODUCT FORM ================= */
  const addForm = document.getElementById('add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', async e => {
      e.preventDefault();
      
      // Show loading state
      const submitBtn = addForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Adding...';
      submitBtn.disabled = true;
      
      try {
        const formData = new FormData(addForm);

        // Features - use featuresList if available
        let features = [];
        if (featuresList.length > 0) {
          features = featuresList;
        } else {
          const featuresText = document.getElementById('features-json')?.value;
          if (featuresText) {
            try {
              features = JSON.parse(featuresText);
            } catch (e) {
              features = [];
            }
          }
        }

        // Specs - use specsList if available
        let specs = {};
        if (Object.keys(specsList).length > 0) {
          specs = specsList;
        } else {
          const specsText = document.getElementById('specs-json')?.value;
          if (specsText) {
            try {
              specs = JSON.parse(specsText);
            } catch (e) {
              specs = {};
            }
          }
        }

        // Prepare FormData for API
        const submitData = new FormData();
        submitData.append('name', formData.get('name')?.trim() || '');
        submitData.append('category', formData.get('category')?.trim() || '');
        submitData.append('subcategory', formData.get('subcategory')?.trim() || '');
        submitData.append('price', formData.get('price')?.trim() || '0');
        submitData.append('old_price', formData.get('old_price')?.trim() || '');
        submitData.append('description', formData.get('description')?.trim() || '');
        
        // Append features and specs as JSON
        submitData.append('features', JSON.stringify(features));
        submitData.append('specifications', JSON.stringify(specs));
        
        // Check if we have images
        if (selectedImages.length === 0) {
          alert('❌ Please select at least one image!');
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          return;
        }
        
        // Append all images
        selectedImages.forEach((image, index) => {
          submitData.append('images', image);
        });

        console.log('Submitting product with:', {
          name: submitData.get('name'),
          category: submitData.get('category'),
          images: selectedImages.length,
          features: features.length,
          specs: Object.keys(specs).length
        });

        // Send to MULTIPLE images endpoint
        const res = await fetch(API_URL + '/products/multiple', {
          method: 'POST',
          body: submitData
        });

        const result = await res.json();
        
        if (!res.ok) {
          throw new Error(result.details || result.error || 'Failed to add product');
        }

        alert(`✅ Product added successfully with ${selectedImages.length} images!`);
        
        // Reset form
        addForm.reset();
        featuresList = [];
        specsList = {};
        selectedImages = [];
        updateFeaturesDisplay();
        updateSpecsDisplay();
        updateImagesPreview();
        
        // Switch to products tab
        document.querySelector('[data-tab="products"]').click();
        loadProducts();
        
      } catch (err) {
        console.error('Add product error:', err);
        alert('❌ Failed to add product: ' + err.message);
      } finally {
        // Restore button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  /* ================= EDIT PRODUCT FORM ================= */
  const editForm = document.getElementById('edit-product-form');
  if (editForm) {
    editForm.addEventListener('submit', async e => {
      e.preventDefault();
      
      const submitBtn = editForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Updating...';
      submitBtn.disabled = true;
      
      try {
        const formData = new FormData(editForm);
        const id = formData.get('id');

        // Get specs from dynamic inputs
        const specs = {};
        document.querySelectorAll('.edit-spec-name').forEach((nameInput, i) => {
          const valueInputs = document.querySelectorAll('.edit-spec-value');
          if (valueInputs[i]) {
            const name = nameInput.value.trim();
            const value = valueInputs[i].value.trim();
            if (name && value) {
              specs[name] = value;
            }
          }
        });

        // Features from textarea
        const featuresText = document.getElementById('edit-features').value;
        const features = featuresText.split('\n').filter(f => f.trim());

        const submitData = new FormData();
        submitData.append('name', formData.get('name'));
        submitData.append('category', formData.get('category'));
        submitData.append('subcategory', formData.get('subcategory'));
        submitData.append('price', formData.get('price'));
        submitData.append('old_price', formData.get('old_price'));
        submitData.append('description', formData.get('description') || '');
        submitData.append('features', JSON.stringify(features));
        submitData.append('specifications', JSON.stringify(specs));
        
        // Append new image if selected
        const imageInput = editForm.querySelector('input[name="image"]');
        if (imageInput?.files[0]) {
          submitData.append('image', imageInput.files[0]);
        }

        const res = await fetch(API_URL + '/products/' + id, {
          method: 'PUT',
          body: submitData
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.details || error.error || 'Failed to update product');
        }
        
        alert('✅ Product updated successfully!');
        document.getElementById('edit-modal').classList.add('hidden');
        loadProducts();
        
      } catch (err) {
        console.error('Update product error:', err);
        alert('❌ Failed to update product: ' + err.message);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

/* ======================================================
   PRODUCTS DISPLAY FUNCTIONS
====================================================== */
async function loadProducts() {
  try {
    const tbody = document.getElementById('products-table-body');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8">Loading products...</td></tr>`;
    }
    
    const res = await fetch(API_URL + '/products');
    allProducts = await res.json();
    displayProducts(allProducts);
    updateProductCount();
    loadCategoryFilter();
    loadCategories(); // Update categories tab too
  } catch (err) {
    console.error('Error loading products:', err);
    const tbody = document.getElementById('products-table-body');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-600">Error loading products: ${err.message}</td></tr>`;
    }
  }
}

function displayProducts(products) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;
  
  if (!products || products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">No products found</td></tr>`;
    return;
  }
  
  tbody.innerHTML = products.map(p => `
    <tr class="border-b hover:bg-gray-50">
      <td class="px-4 py-3 text-sm">${p.id}</td>
      <td class="px-4 py-3">
        <img src="${p.image_url}" alt="${p.name}" class="h-12 w-12 object-cover rounded">
        ${p.additional_images?.length > 0 ? 
          `<div class="text-xs text-gray-500 mt-1">+${p.additional_images.length} more</div>` : 
          ''}
      </td>
      <td class="px-4 py-3 font-semibold">
        <div class="text-sm">${p.name}</div>
        <div class="text-xs text-gray-500 mt-1">
          ${(p.features || []).length} features • 
          ${Object.keys(p.specifications || {}).length} specs
        </div>
      </td>
      <td class="px-4 py-3 text-sm">
        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${p.category}</span>
        ${p.subcategory ? `<div class="text-xs text-gray-500 mt-1">${p.subcategory}</div>` : ''}
      </td>
      <td class="px-4 py-3">
        <div class="text-green-600 font-bold">KSh ${Number(p.price).toLocaleString()}</div>
        ${p.old_price ? `<div class="text-xs text-gray-500 line-through">KSh ${Number(p.old_price).toLocaleString()}</div>` : ''}
      </td>
      <td class="px-4 py-3">
        <button onclick="editProduct(${p.id})" class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Edit</button>
        <button onclick="deleteProduct(${p.id})" class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 ml-2">Delete</button>
      </td>
    </tr>
  `).join('');
}

function updateProductCount() {
  const el = document.getElementById('product-count');
  if (el) el.textContent = allProducts.length;
}

function loadCategoryFilter() {
  const select = document.getElementById('filter-category');
  if (!select) return;
  
  const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  select.innerHTML = `<option value="">All Categories</option>` + 
    categories.sort().map(c => `<option value="${c}">${c} (${allProducts.filter(p => p.category === c).length})</option>`).join('');
}

function filterProducts() {
  const searchInput = document.getElementById('search-products');
  const filterSelect = document.getElementById('filter-category');
  
  if (!searchInput || !filterSelect) return;
  
  const term = searchInput.value.toLowerCase();
  const cat = filterSelect.value;
  
  let filtered = allProducts;
  
  if (cat) {
    filtered = filtered.filter(p => p.category === cat);
  }
  
  if (term) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.description && p.description.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  }
  
  displayProducts(filtered);
}

/* ======================================================
   EDIT / DELETE FUNCTIONS
====================================================== */
async function editProduct(id) {
  try {
    const res = await fetch(API_URL + '/products/' + id);
    if (!res.ok) throw new Error('Failed to load product');
    
    const product = await res.json();
    
    // Fill form fields
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-subcategory').value = product.subcategory || '';
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-old-price').value = product.old_price || '';
    document.getElementById('edit-current-image').src = product.image_url;
    document.getElementById('edit-description').value = product.description || '';
    
    // Fill features
    const featuresText = Array.isArray(product.features) 
      ? product.features.join('\n') 
      : (product.features || '');
    document.getElementById('edit-features').value = featuresText;
    
    // Fill specs
    const container = document.getElementById('edit-specs-container');
    container.innerHTML = '';
    
    const specs = product.specifications || {};
    if (Object.keys(specs).length === 0) {
      // Add one empty row
      const row = document.createElement('div');
      row.className = 'grid grid-cols-2 gap-3 mb-2';
      row.innerHTML = `
        <input type="text" class="edit-spec-name border rounded px-4 py-2 text-sm" placeholder="Spec name" />
        <div class="flex gap-2">
          <input type="text" class="edit-spec-value border rounded px-4 py-2 text-sm flex-1" placeholder="Spec value" />
          <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-red-600 text-white px-3 rounded">×</button>
        </div>
      `;
      container.appendChild(row);
    } else {
      Object.entries(specs).forEach(([name, value]) => {
        const row = document.createElement('div');
        row.className = 'grid grid-cols-2 gap-3 mb-2';
        row.innerHTML = `
          <input type="text" value="${name}" class="edit-spec-name border rounded px-4 py-2 text-sm" />
          <div class="flex gap-2">
            <input type="text" value="${value}" class="edit-spec-value border rounded px-4 py-2 text-sm flex-1" />
            <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-red-600 text-white px-3 rounded">×</button>
          </div>
        `;
        container.appendChild(row);
      });
    }
    
    // Show modal
    document.getElementById('edit-modal').classList.remove('hidden');
    
  } catch (err) {
    console.error('Edit product error:', err);
    alert('❌ Failed to load product for editing: ' + err.message);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?\nThis action cannot be undone.')) {
    return;
  }
  
  try {
    const res = await fetch(API_URL + '/products/' + id, { method: 'DELETE' });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.details || error.error || 'Failed to delete product');
    }
    
    alert('✅ Product deleted successfully!');
    loadProducts();
    
  } catch (err) {
    console.error('Delete product error:', err);
    alert('❌ Failed to delete product: ' + err.message);
  }
}

/* ======================================================
   CATEGORIES DISPLAY
====================================================== */
function loadCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  
  const stats = {};
  allProducts.forEach(p => {
    if (p.category) {
      stats[p.category] = (stats[p.category] || 0) + 1;
    }
  });
  
  if (Object.keys(stats).length === 0) {
    grid.innerHTML = '<div class="text-gray-500 text-center col-span-3 py-8">No categories found</div>';
    return;
  }
  
  // Sort by product count descending
  const sortedCategories = Object.entries(stats)
    .sort((a, b) => b[1] - a[1]);
  
  grid.innerHTML = sortedCategories.map(([cat, count]) => `
    <div class="bg-white p-6 rounded-lg shadow border-l-4 border-brandGold hover:shadow-md transition-shadow">
      <h3 class="font-bold text-lg text-gray-800 mb-2">${cat}</h3>
      <p class="text-4xl font-bold text-brandGold">${count}</p>
      <p class="text-sm text-gray-500 mt-1">${count === 1 ? 'product' : 'products'}</p>
      <button 
        onclick="document.getElementById('filter-category').value='${cat}'; filterProducts(); document.querySelector('[data-tab=\"products\"]').click();" 
        class="text-sm text-blue-600 hover:text-blue-800 mt-3"
      >
        View Products →
      </button>
    </div>
  `).join('');
}