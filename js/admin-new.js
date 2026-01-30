// API Configuration
const API_URL = 'https://sherrys-backend.onrender.com/api';

// ADMIN CREDENTIALS
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

let allProducts = [];

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
    });
  });

  /* ================= IMAGE PREVIEW ================= */
  const imageInput = document.querySelector('input[name="image"]');
  if (imageInput) {
    imageInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const preview = document.getElementById('image-preview');
        if (!preview) return;
        preview.classList.remove('hidden');
        preview.querySelector('img').src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ================= ADD SPEC ROWS ================= */
  const addSpecBtn = document.getElementById('add-spec-btn');
  if (addSpecBtn) {
    addSpecBtn.addEventListener('click', () => {
      const container = document.getElementById('specs-container');
      if (!container) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-2 gap-3';
      row.innerHTML = `
        <input type="text" placeholder="Spec name" class="spec-name border rounded px-4 py-2 text-sm" />
        <div class="flex gap-2">
          <input type="text" placeholder="Spec value" class="spec-value border rounded px-4 py-2 text-sm flex-1" />
          <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-red-600 text-white px-3 rounded">×</button>
        </div>
      `;
      container.appendChild(row);
    });
  }

  const editAddSpecBtn = document.getElementById('edit-add-spec-btn');
  if (editAddSpecBtn) {
    editAddSpecBtn.addEventListener('click', () => {
      const container = document.getElementById('edit-specs-container');
      if (!container) return;
      const row = document.createElement('div');
      row.className = 'grid grid-cols-2 gap-3';
      row.innerHTML = `
        <input type="text" class="edit-spec-name border rounded px-4 py-2 text-sm" />
        <div class="flex gap-2">
          <input type="text" class="edit-spec-value border rounded px-4 py-2 text-sm flex-1" />
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
  if (closeEdit) closeEdit.addEventListener('click', () => {
    document.getElementById('edit-modal').classList.add('hidden');
  });

  /* ================= ADD PRODUCT FORM ================= */
  const addForm = document.getElementById('add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(addForm);

      // Specs
      const specs = {};
      document.querySelectorAll('.spec-name').forEach((name, i) => {
        const value = document.querySelectorAll('.spec-value')[i];
        if (name.value && value.value) specs[name.value] = value.value;
      });

      // Features
      const features = formData.get('features')?.split('\n').filter(f => f.trim()) || [];

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
        const res = await fetch(API_URL + '/products', { method: 'POST', body: submitData });
        if (!res.ok) throw new Error('Failed to add product');
        alert('✅ Product added successfully!');
        addForm.reset();
        document.getElementById('image-preview').classList.add('hidden');
        document.getElementById('specs-container').innerHTML = `
          <div class="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Spec name" class="spec-name border rounded px-4 py-2 text-sm" />
            <input type="text" placeholder="Spec value" class="spec-value border rounded px-4 py-2 text-sm" />
          </div>
        `;
        document.querySelector('[data-tab="products"]').click();
        loadProducts();
      } catch (err) {
        console.error(err);
        alert('❌ Failed to add product');
      }
    });
  }

  /* ================= EDIT PRODUCT FORM ================= */
  const editForm = document.getElementById('edit-product-form');
  if (editForm) {
    editForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(editForm);
      const id = formData.get('id');

      const specs = {};
      document.querySelectorAll('.edit-spec-name').forEach((name, i) => {
        const value = document.querySelectorAll('.edit-spec-value')[i];
        if (name.value && value.value) specs[name.value] = value.value;
      });

      const features = formData.get('features')?.split('\n').filter(f => f.trim()) || [];

      const submitData = new FormData();
      submitData.append('name', formData.get('name'));
      submitData.append('category', formData.get('category'));
      submitData.append('subcategory', formData.get('subcategory'));
      submitData.append('price', formData.get('price'));
      submitData.append('old_price', formData.get('old_price'));
      if (formData.get('image')?.size > 0) submitData.append('image', formData.get('image'));
      submitData.append('description', formData.get('description') || '');
      submitData.append('features', JSON.stringify(features));
      submitData.append('specifications', JSON.stringify(specs));

      try {
        const res = await fetch(API_URL + '/products/' + id, { method: 'PUT', body: submitData });
        if (!res.ok) throw new Error('Failed to update product');
        alert('✅ Product updated successfully!');
        document.getElementById('edit-modal').classList.add('hidden');
        loadProducts();
      } catch (err) {
        console.error(err);
        alert('❌ Failed to update product');
      }
    });
  }
});

/* ======================================================
   PRODUCTS DISPLAY FUNCTIONS
====================================================== */
async function loadProducts() {
  try {
    const res = await fetch(API_URL + '/products');
    allProducts = await res.json();
    displayProducts(allProducts);
    updateProductCount();
    loadCategoryFilter();
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

function displayProducts(products) {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;
  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8">No products found</td></tr>`;
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr class="border-b">
      <td class="px-4 py-2">${p.id}</td>
      <td class="px-4 py-2"><img src="${p.image_url}" class="h-12 w-12 rounded"></td>
      <td class="px-4 py-2 font-semibold">${p.name}</td>
      <td class="px-4 py-2">${p.category}</td>
      <td class="px-4 py-2 text-green-600 font-bold">KSh ${Number(p.price).toLocaleString()}</td>
      <td class="px-4 py-2">
        <button onclick="editProduct(${p.id})" class="bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
        <button onclick="deleteProduct(${p.id})" class="bg-red-600 text-white px-3 py-1 rounded ml-2">Delete</button>
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
  const categories = [...new Set(allProducts.map(p => p.category))];
  select.innerHTML = `<option value="">All Categories</option>` + categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function filterProducts() {
  const term = document.getElementById('search-products')?.value.toLowerCase() || '';
  const cat = document.getElementById('filter-category')?.value || '';
  let filtered = allProducts;
  if (cat) filtered = filtered.filter(p => p.category === cat);
  if (term) filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
  displayProducts(filtered);
}

/* ======================================================
   EDIT / DELETE FUNCTIONS
====================================================== */
async function editProduct(id) {
  try {
    const res = await fetch(API_URL + '/products/' + id);
    const product = await res.json();
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-category').value = product.category;
    document.getElementById('edit-subcategory').value = product.subcategory;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-old-price').value = product.old_price;
    document.getElementById('edit-current-image').src = product.image_url;
    document.getElementById('edit-description').value = product.description || '';
    document.getElementById('edit-features').value = product.features?.join('\n') || '';

    const container = document.getElementById('edit-specs-container');
    container.innerHTML = '';
    Object.entries(product.specifications || {}).forEach(([name, value]) => {
      const row = document.createElement('div');
      row.className = 'grid grid-cols-2 gap-3';
      row.innerHTML = `
        <input type="text" value="${name}" class="edit-spec-name border rounded px-4 py-2 text-sm" />
        <div class="flex gap-2">
          <input type="text" value="${value}" class="edit-spec-value border rounded px-4 py-2 text-sm flex-1" />
          <button type="button" onclick="this.parentElement.parentElement.remove()" class="bg-red-600 text-white px-3 rounded">×</button>
        </div>
      `;
      container.appendChild(row);
    });

    document.getElementById('edit-modal').classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('❌ Failed to load product for editing');
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    const res = await fetch(API_URL + '/products/' + id, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete');
    alert('✅ Product deleted successfully!');
    loadProducts();
  } catch (err) {
    console.error(err);
    alert('❌ Failed to delete product');
  }
}

/* ======================================================
   CATEGORIES DISPLAY
====================================================== */
async function loadCategories() {
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  const stats = {};
  allProducts.forEach(p => stats[p.category] = (stats[p.category] || 0) + 1);
  grid.innerHTML = Object.entries(stats).map(([cat, count]) => `
    <div class="bg-white p-6 rounded shadow text-center border-l-4 border-brandGold">
      <h3 class="font-bold text-lg">${cat}</h3>
      <p class="text-4xl font-bold text-brandGold">${count}</p>
      <p class="text-sm text-gray-500">products</p>
    </div>
  `).join('');
}
