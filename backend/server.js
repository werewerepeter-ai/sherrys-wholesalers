require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// 1. MIDDLEWARE SETUP
// ============================================
app.use(cors({
  origin: [
    'https://sherrys-wholesalers.com',
    'https://www.sherrys-wholesalers.com',
    'http://localhost:3000',
    'http://localhost:5173' // For Vite dev server
  ],
  credentials: true
}));

app.use(express.json());

// ============================================
// 2. DATABASE CONNECTION
// ============================================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Test query on startup
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// ============================================
// 3. CLOUDINARY & FILE UPLOAD SETUP
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️  Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING'
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sherrys-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    resource_type: 'auto'
  }
});

// Single upload for compatibility
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Multiple upload for new feature
const uploadMultiple = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Max 5 files
  }
});

// ============================================
// 4. HEALTH CHECK & TEST ROUTES
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sherry\'s Wholesalers API is running!',
    version: '1.0',
    endpoints: [
      '/api/products - GET/POST',
      '/api/products/:id - GET/PUT/DELETE',
      '/api/health - Health check',
      '/api/check-db-schema - Database check'
    ]
  });
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy',
      database: 'connected',
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'missing',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    });
  }
});

// ============================================
// 5. DATABASE SCHEMA MANAGEMENT
// ============================================
app.get('/api/check-db-schema', async (req, res) => {
  try {
    console.log('🔍 Checking database schema...');
    
    const schemaCheck = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'products'
      ORDER BY ordinal_position
    `);
    
    const columns = schemaCheck.rows;
    console.log('📊 Found columns:', columns.map(c => c.column_name));
    
    const requiredColumns = ['features', 'specifications'];
    const missingColumns = requiredColumns.filter(col => 
      !columns.some(c => c.column_name === col)
    );
    
    if (missingColumns.length > 0) {
      res.json({
        status: 'missing_columns',
        existing_columns: columns.map(c => c.column_name),
        missing_columns: missingColumns,
        message: 'Run /api/fix-db-schema to add missing columns',
        sql: missingColumns.map(col => {
          if (col === 'features') return "ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[];";
          if (col === 'specifications') return "ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;";
          return "";
        }).filter(sql => sql)
      });
    } else {
      res.json({
        status: 'complete',
        columns: columns,
        message: 'All required columns exist'
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    res.status(500).json({ 
      error: 'Failed to check schema', 
      details: error.message 
    });
  }
});

app.post('/api/fix-db-schema', async (req, res) => {
  try {
    console.log('🔧 Fixing database schema...');
    
    const queries = [
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[]`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image_url TEXT`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS additional_images TEXT[]`
    ];
    
    for (const query of queries) {
      try {
        await pool.query(query);
        console.log(`✅ Executed: ${query.split('ADD COLUMN')[1]?.split(' ')[2] || query}`);
      } catch (err) {
        console.warn(`⚠️ Could not execute: ${err.message}`);
      }
    }
    
    // Update existing records
    await pool.query(`
      UPDATE products 
      SET main_image_url = image_url 
      WHERE main_image_url IS NULL
    `);
    
    console.log('✅ Database schema updated successfully');
    res.json({ 
      success: true, 
      message: 'Database schema updated successfully',
      actions: ['Added features column', 'Added specifications column', 'Updated existing records']
    });
    
  } catch (error) {
    console.error('❌ Error fixing schema:', error.message);
    res.status(500).json({ 
      error: 'Failed to fix schema', 
      details: error.message 
    });
  }
});

// ============================================
// 6. PRODUCT ENDPOINTS
// ============================================

// GET all products (Enhanced for admin)
app.get('/api/products', async (req, res) => {
  try {
    const { category, subcategory, search, admin = 'false' } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const values = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      values.push(category);
    }

    if (subcategory) {
      paramCount++;
      query += ` AND subcategory = $${paramCount}`;
      values.push(subcategory);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    // Always order by newest first for admin
    if (admin === 'true') {
      query += ' ORDER BY created_at DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    console.log(`📋 Fetching products with query:`, { category, subcategory, search });
    const result = await pool.query(query, values);
    
    // Format response
    const products = result.rows.map(product => ({
      ...product,
      features: product.features || [],
      specifications: product.specifications || {},
      main_image: product.main_image_url || product.image_url,
      additional_images: product.additional_images || []
    }));
    
    console.log(`✅ Found ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch products', 
      details: error.message 
    });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching product ID: ${id}`);
    
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Product ${id} not found`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = result.rows[0];
    console.log(`✅ Found product: ${product.name}`);
    
    // Format response
    const formattedProduct = {
      ...product,
      features: product.features || [],
      specifications: product.specifications || {},
      main_image: product.main_image_url || product.image_url,
      additional_images: product.additional_images || []
    };
    
    res.json(formattedProduct);
  } catch (error) {
    console.error(`❌ Error fetching product ${req.params.id}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to fetch product', 
      details: error.message 
    });
  }
});

// POST add new product (SINGLE IMAGE - Current)
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    console.log('='.repeat(50));
    console.log('🆕 ADD PRODUCT REQUEST RECEIVED');
    console.log('='.repeat(50));
    
    // Log request details
    console.log('📝 Request body:', JSON.stringify(req.body, null, 2));
    console.log('📸 File uploaded:', req.file ? {
      originalname: req.file.originalname,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      mimetype: req.file.mimetype
    } : 'NO FILE');
    
    const { 
      name, 
      category, 
      subcategory, 
      price, 
      old_price, 
      description, 
      features, 
      specifications 
    } = req.body;
    
    // Validation
    if (!req.file) {
      console.error('❌ VALIDATION FAILED: No image uploaded');
      return res.status(400).json({ 
        error: 'Image is required',
        field: 'image'
      });
    }
    
    if (!name || !category || !price) {
      console.error('❌ VALIDATION FAILED: Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'category', 'price'],
        received: { name, category, price }
      });
    }
    
    const imageUrl = req.file.path;
    console.log('✅ Image uploaded to Cloudinary:', imageUrl);
    
    // ============================================
    // PARSE FEATURES (NEW: Handle bulk text paste)
    // ============================================
    let featuresArray = [];
    console.log('📋 Raw features input:', features);
    
    if (features) {
      try {
        // Method 1: Already a JSON array
        if (features.startsWith('[') && features.endsWith(']')) {
          featuresArray = JSON.parse(features);
          console.log('✅ Parsed features as JSON array');
        }
        // Method 2: Bulk text with newlines
        else if (features.includes('\n')) {
          featuresArray = features.split('\n')
            .map(item => item.trim())
            .filter(item => {
              // Remove empty lines and common bullet characters
              return item.length > 0 && 
                     !item.match(/^[•\-*\s]+$/);
            })
            .map(item => item.replace(/^[•\-*\s]+/, '')); // Remove leading bullets
          console.log('✅ Parsed features from text (newlines)');
        }
        // Method 3: Comma separated
        else if (features.includes(',')) {
          featuresArray = features.split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);
          console.log('✅ Parsed features from text (commas)');
        }
        // Method 4: Single feature
        else if (features.trim().length > 0) {
          featuresArray = [features.trim()];
          console.log('✅ Treated as single feature');
        }
      } catch (parseError) {
        console.warn('⚠️ Features parse error, using empty array:', parseError.message);
        featuresArray = [];
      }
    }
    
    console.log(`🎯 Features parsed: ${featuresArray.length} items`);
    if (featuresArray.length > 0) {
      console.log('📝 Features list:', featuresArray.slice(0, 3), 
                  featuresArray.length > 3 ? `... and ${featuresArray.length - 3} more` : '');
    }
    
    // ============================================
    // PARSE SPECIFICATIONS
    // ============================================
    let specsObject = {};
    console.log('📋 Raw specs input:', specifications);
    
    if (specifications) {
      try {
        // Try to parse as JSON
        if (specifications.startsWith('{') && specifications.endsWith('}')) {
          specsObject = JSON.parse(specifications);
          console.log('✅ Parsed specs as JSON object');
        } else {
          // Try to create object from key:value pairs
          const lines = specifications.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0 && line.includes(':'));
          
          specsObject = {};
          lines.forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
              specsObject[key.trim()] = valueParts.join(':').trim();
            }
          });
          
          if (Object.keys(specsObject).length > 0) {
            console.log('✅ Created specs object from text');
          } else {
            // Last resort: store as text
            specsObject = { note: specifications };
            console.log('✅ Stored specs as text note');
          }
        }
      } catch (parseError) {
        console.warn('⚠️ Specs parse error, using empty object:', parseError.message);
        specsObject = {};
      }
    }
    
    console.log('🎯 Specs parsed:', Object.keys(specsObject).length > 0 ? specsObject : 'Empty');
    
    // ============================================
    // DATABASE INSERT
    // ============================================
    console.log('💾 Attempting database insert...');
    
    const insertQuery = `
      INSERT INTO products (
        name, category, subcategory, price, old_price, 
        image_url, description, features, specifications,
        main_image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const insertValues = [
      name.trim(),
      category.trim(),
      subcategory ? subcategory.trim() : '',
      parseFloat(price) || 0,
      old_price ? parseFloat(old_price) : null,
      imageUrl,
      description ? description.trim() : '',
      featuresArray.length > 0 ? featuresArray : null,
      Object.keys(specsObject).length > 0 ? specsObject : null,
      imageUrl // Also set as main_image_url
    ];
    
    console.log('📊 Insert values prepared');
    
    const result = await pool.query(insertQuery, insertValues);
    
    const newProduct = result.rows[0];
    console.log('='.repeat(50));
    console.log('✅ PRODUCT ADDED SUCCESSFULLY!');
    console.log(`   ID: ${newProduct.id}`);
    console.log(`   Name: ${newProduct.name}`);
    console.log(`   Category: ${newProduct.category}`);
    console.log(`   Price: $${newProduct.price}`);
    console.log(`   Features: ${newProduct.features?.length || 0} items`);
    console.log('='.repeat(50));
    
    // Format response
    const responseProduct = {
      ...newProduct,
      features: newProduct.features || [],
      specifications: newProduct.specifications || {},
      main_image: newProduct.main_image_url || newProduct.image_url
    };
    
    res.status(201).json(responseProduct);
    
  } catch (error) {
    console.error('='.repeat(50));
    console.error('❌❌❌ PRODUCT ADD FAILED ❌❌❌');
    console.error('='.repeat(50));
    
    console.error('📝 REQUEST DETAILS:');
    console.error('   Body:', JSON.stringify(req.body, null, 2));
    console.error('   File:', req.file ? 'Present' : 'Missing');
    
    console.error('🔧 ERROR DETAILS:');
    console.error('   Message:', error.message);
    console.error('   Name:', error.name);
    console.error('   Code:', error.code);
    console.error('   Detail:', error.detail);
    console.error('   Table:', error.table);
    console.error('   Column:', error.column);
    console.error('   Constraint:', error.constraint);
    
    console.error('📋 STACK TRACE:');
    console.error(error.stack);
    console.error('='.repeat(50));
    
    // User-friendly error messages
    let userMessage = 'Failed to add product';
    let errorDetails = error.message;
    
    if (error.code === '42703') {
      userMessage = 'Database column missing. Please run schema fix.';
      errorDetails = `Column "${error.column}" doesn't exist in database`;
    } else if (error.code === '23502') {
      userMessage = 'Missing required field';
      errorDetails = `Field "${error.column}" cannot be empty`;
    } else if (error.code === '23505') {
      userMessage = 'Duplicate product';
      errorDetails = 'A product with similar details already exists';
    } else if (error.code === '22P02') {
      userMessage = 'Invalid data format';
      errorDetails = 'Check price fields for invalid numbers';
    }
    
    res.status(500).json({ 
      error: userMessage, 
      details: errorDetails,
      type: error.name,
      code: error.code,
      suggestion: error.code === '42703' ? 'Visit /api/fix-db-schema endpoint' : null
    });
  }
});

// POST add new product with MULTIPLE IMAGES (NEW)
app.post('/api/products/multiple', uploadMultiple.array('images', 5), async (req, res) => {
  try {
    console.log('='.repeat(50));
    console.log('🖼️  ADD PRODUCT WITH MULTIPLE IMAGES');
    console.log('='.repeat(50));
    
    console.log(`📸 Received ${req.files?.length || 0} images`);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }
    
    const { name, category, subcategory, price, old_price, description, features, specifications } = req.body;
    
    // Process images
    const mainImageUrl = req.files[0].path;
    const additionalImages = req.files.slice(1).map(file => file.path);
    const allImages = req.files.map(file => file.path);
    
    console.log('✅ Images uploaded:');
    console.log('   Main:', mainImageUrl);
    console.log('   Additional:', additionalImages.length);
    
    // Use the same parsing logic as single image endpoint
    let featuresArray = [];
    let specsObject = {};
    
    // (Same parsing logic as above - reuse from single image endpoint)
    
    // Insert with multiple images support
    const result = await pool.query(
      `INSERT INTO products (
        name, category, subcategory, price, old_price, 
        image_url, main_image_url, additional_images,
        description, features, specifications
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        name, category, subcategory, 
        parseFloat(price) || 0, 
        old_price ? parseFloat(old_price) : null,
        allImages.join(','), // Store all in image_url for compatibility
        mainImageUrl,
        additionalImages.length > 0 ? additionalImages : null,
        description || '',
        featuresArray.length > 0 ? featuresArray : null,
        Object.keys(specsObject).length > 0 ? specsObject : null
      ]
    );
    
    console.log(`✅ Product added with ${req.files.length} images! ID: ${result.rows[0].id}`);
    
    res.status(201).json({
      ...result.rows[0],
      images: allImages,
      main_image: mainImageUrl,
      additional_images: additionalImages
    });
    
  } catch (error) {
    console.error('❌ Error adding product with multiple images:', error.message);
    res.status(500).json({ 
      error: 'Failed to add product', 
      details: error.message 
    });
  }
});

// PUT update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️  Updating product ID: ${id}`);
    
    const { name, category, subcategory, price, old_price, description, features, specifications } = req.body;
    
    let imageUrl;
    if (req.file) {
      imageUrl = req.file.path;
      console.log('✅ New image uploaded:', imageUrl);
    } else {
      const existing = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
      imageUrl = existing.rows[0]?.image_url;
      console.log('ℹ️ Keeping existing image');
    }
    
    // Parse features and specs
    let featuresArray = [];
    let specsObject = {};
    
    // (Same parsing logic as POST endpoint)
    
    const result = await pool.query(
      `UPDATE products 
       SET name = $1, category = $2, subcategory = $3, price = $4, old_price = $5, 
           image_url = $6, description = $7, features = $8, specifications = $9, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        name, category, subcategory, 
        parseFloat(price) || 0, 
        old_price ? parseFloat(old_price) : null, 
        imageUrl, 
        description || '',
        featuresArray.length > 0 ? featuresArray : null,
        Object.keys(specsObject).length > 0 ? specsObject : null,
        id
      ]
    );
    
    if (result.rows.length === 0) {
      console.log(`❌ Product ${id} not found for update`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log(`✅ Product ${id} updated successfully`);
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error(`❌ Error updating product ${req.params.id}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to update product', 
      details: error.message 
    });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Deleting product ID: ${id}`);
    
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      console.log(`❌ Product ${id} not found for deletion`);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log(`✅ Product ${id} deleted: ${result.rows[0].name}`);
    res.json({ 
      success: true, 
      message: 'Product deleted successfully',
      product: result.rows[0].name
    });
    
  } catch (error) {
    console.error(`❌ Error deleting product ${req.params.id}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to delete product', 
      details: error.message 
    });
  }
});

// ============================================
// 7. CATEGORY ENDPOINTS
// ============================================
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category, COUNT(*) as product_count
      FROM products 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category 
      ORDER BY category
    `);
    
    const categories = result.rows.map(row => ({
      name: row.category,
      count: parseInt(row.product_count)
    }));
    
    console.log(`📊 Found ${categories.length} categories`);
    res.json(categories);
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch categories', 
      details: error.message 
    });
  }
});

app.get('/api/subcategories/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const result = await pool.query(
      `SELECT DISTINCT subcategory, COUNT(*) as product_count
       FROM products 
       WHERE category = $1 AND subcategory IS NOT NULL AND subcategory != ''
       GROUP BY subcategory 
       ORDER BY subcategory`,
      [category]
    );
    
    const subcategories = result.rows.map(row => ({
      name: row.subcategory,
      count: parseInt(row.product_count)
    }));
    
    console.log(`📊 Found ${subcategories.length} subcategories for ${category}`);
    res.json(subcategories);
    
  } catch (error) {
    console.error(`❌ Error fetching subcategories for ${req.params.category}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to fetch subcategories', 
      details: error.message 
    });
  }
});

// ============================================
// 8. DATABASE INITIALIZATION
// ============================================
app.get('/api/init-db', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Try to find database.sql
    const sqlPath = path.join(__dirname, 'database.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.log('ℹ️ No database.sql file found, creating basic schema...');
      
      // Create basic schema
      const basicSchema = `
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          subcategory VARCHAR(100),
          price DECIMAL(10,2) NOT NULL,
          old_price DECIMAL(10,2),
          image_url TEXT NOT NULL,
          main_image_url TEXT,
          additional_images TEXT[],
          description TEXT,
          features TEXT[],
          specifications JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
        CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory);
        CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
      `;
      
      await pool.query(basicSchema);
      console.log('✅ Created basic database schema');
      
      return res.json({ 
        success: true, 
        message: 'Created basic database schema',
        tables: ['products']
      });
    }
    
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('✅ Database initialized from database.sql');
    
    res.json({ 
      success: true, 
      message: 'Database initialized successfully',
      source: 'database.sql'
    });
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to initialize database', 
      details: error.message 
    });
  }
});

// ============================================
// 9. ERROR HANDLING MIDDLEWARE
// ============================================
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.path,
    method: req.method 
  });
});

app.use((error, req, res, next) => {
  console.error('🔥 Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// ============================================
// 10. START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Missing URL'}`);
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Ready' : 'Not configured'}`);
  console.log('='.repeat(50));
  console.log('\n📋 Available endpoints:');
  console.log('   GET  /api/health           - Health check');
  console.log('   GET  /api/check-db-schema  - Check database schema');
  console.log('   POST /api/fix-db-schema    - Fix database schema');
  console.log('   GET  /api/products         - Get all products');
  console.log('   POST /api/products         - Add product (single image)');
  console.log('   POST /api/products/multiple- Add product (multiple images)');
  console.log('='.repeat(50));
});