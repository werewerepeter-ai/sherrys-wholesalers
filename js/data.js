// API Configuration
const API_URL = 'https://sherrys-backend.onrender.com/api';

// Global products array (will be populated from API)
let products = [];
let categories = [];

// Fetch products from API
async function loadProducts() {
  try {
    console.log('📦 Loading products from API...');
    const response = await fetch(`${API_URL}/products`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const apiProducts = await response.json();
    
    // Transform API data to match existing format
    products = apiProducts.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory || '',
      price: item.price,
      oldPrice: item.old_price || Math.round(item.price * 1.1), // Calculate 10% higher if no old price
      image: item.main_image_url || item.image_url || '',
      details: {
        description: item.description || `${item.name} - High quality product from Sherry's Wholesalers.`,
        features: Array.isArray(item.features) ? item.features : [],
        specifications: item.specifications || {}
      }
    }));
    
    // Update categories
    categories = [...new Set(products.map(p => p.category))];
    
    console.log(`✅ Loaded ${products.length} products from API`);
    console.log(`📊 Categories: ${categories.join(', ')}`);
    
    return products;
    
  } catch (error) {
    console.error('❌ Error loading products from API:', error);
    
    // Fallback to original hardcoded data if API fails
    console.log('🔄 Using fallback data...');
    return getFallbackProducts();
  }
}

// Original hardcoded products as fallback (keeping as backup)
function getFallbackProducts() {
  const fallbackProducts = [
    {
      id: 1,
      name: "Samsung Double Door Fridge 380L",
      category: "Home Appliances",
      subcategory: "Refrigerators",
      price: 85000,
      oldPrice: 95000,
      image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400",
      details: {
        description: "Premium Samsung double door refrigerator with advanced cooling technology and energy-efficient design. Perfect for families who need reliable food storage.",
        features: [
          "380L total capacity",
          "Multi Air Flow cooling system",
          "Energy efficient - saves on electricity bills",
          "Adjustable shelves for flexible storage",
          "Frost-free technology",
          "Vegetable crisper drawer",
          "LED interior lighting"
        ],
        specifications: {
          "Capacity": "380 Liters",
          "Type": "Double Door",
          "Energy Rating": "A+",
          "Dimensions": "170cm x 70cm x 65cm",
          "Warranty": "1 Year Manufacturer Warranty",
          "Color": "Silver"
        }
      }
    },
    {
      id: 2,
      name: "LG Single Door Fridge 220L",
      category: "Home Appliances",
      subcategory: "Refrigerators",
      price: 45000,
      oldPrice: 52000,
      image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400"
    }
    // ... (you can keep your other 58 products here as backup)
  ];
  
  products = fallbackProducts;
  categories = [...new Set(products.map(p => p.category))];
  return products;
}

// Get unique categories
function getCategories() {
  return categories;
}

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
      p.subcategory.toLowerCase().includes(term) ||
      (p.details.description && p.details.description.toLowerCase().includes(term))
    );
  }
  
  return filtered;
}

// Get featured products (for homepage)
function getFeaturedProducts(count = 8) {
  // Return newest products or random selection
  return products.slice(0, Math.min(count, products.length));
}

// Get deals (products with discount)
function getDealProducts(count = 6) {
  const deals = products.filter(p => p.oldPrice > p.price);
  return deals.slice(0, Math.min(count, deals.length));
}

// Initialize products on page load
async function initializeProducts() {
  await loadProducts();
  
  // Trigger any page-specific initialization if function exists
  if (typeof window.onProductsLoaded === 'function') {
    window.onProductsLoaded();
  }
  
  // If on homepage, display products
  if (window.location.pathname.includes('index.html') || 
      window.location.pathname === '/') {
    displayHomepageProducts();
  }
}

// Display products on homepage (if needed)
function displayHomepageProducts() {
  // This function can be called by homepage scripts
  const featuredContainer = document.getElementById('featured-products');
  const dealsContainer = document.getElementById('deal-products');
  
  if (featuredContainer) {
    const featured = getFeaturedProducts(8);
    // Add your homepage display logic here
  }
  
  if (dealsContainer) {
    const deals = getDealProducts(6);
    // Add your deals display logic here
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProducts);
} else {
  initializeProducts();
}

// Export functions for other scripts
window.productsData = {
  products,
  categories,
  loadProducts,
  getCategories,
  getSubcategories,
  filterProducts,
  getFeaturedProducts,
  getDealProducts
};