require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Allow your domain
app.use(cors({
  origin: ['https://sherrys-wholesalers.com', 'https://www.sherrys-wholesalers.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection error:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING'
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sherrys-products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Sherry\'s Wholesalers API is running!' });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, subcategory, search } = req.query;
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
      query += ` AND (name ILIKE $${paramCount} OR category ILIKE $${paramCount} OR subcategory ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ error: 'Failed to fetch products', details: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error.message);
    res.status(500).json({ error: 'Failed to fetch product', details: error.message });
  }
});

// Add new product with image upload
app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    console.log('📝 Received product data:', req.body);
    console.log('📸 Received file:', req.file ? 'Yes' : 'No');
    
    const { name, category, subcategory, price, old_price, description, features, specifications } = req.body;
    
    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ error: 'Image is required' });
    }

    const imageUrl = req.file.path;
    console.log('✅ Image uploaded to:', imageUrl);
    
    // Parse features and specs safely
    let featuresArray = [];
    let specsObject = {};
    
    try {
      featuresArray = features ? JSON.parse(features) : [];
    } catch (e) {
      console.warn('⚠️ Error parsing features:', e.message);
      featuresArray = [];
    }
    
    try {
      specsObject = specifications ? JSON.parse(specifications) : {};
    } catch (e) {
      console.warn('⚠️ Error parsing specifications:', e.message);
      specsObject = {};
    }

    console.log('💾 Inserting into database...');

    const result = await pool.query(
      `INSERT INTO products (name, category, subcategory, price, old_price, image_url, description, features, specifications)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, category, subcategory, price, old_price, imageUrl, description, featuresArray, specsObject]
    );

    console.log('✅ Product added successfully:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error adding product:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to add product', 
      details: error.message 
    });
  }
});

// Update product
app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
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

    const featuresArray = features ? JSON.parse(features) : [];
    const specsObject = specifications ? JSON.parse(specifications) : {};

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, category = $2, subcategory = $3, price = $4, old_price = $5, 
           image_url = $6, description = $7, features = $8, specifications = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, category, subcategory, price, old_price, imageUrl, description, featuresArray, specsObject, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('✅ Product updated:', id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error updating product:', error.message);
    res.status(500).json({ error: 'Failed to update product', details: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('✅ Product deleted:', id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error.message);
    res.status(500).json({ error: 'Failed to delete product', details: error.message });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    const categories = result.rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
});

// Get subcategories by category
app.get('/api/subcategories/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const result = await pool.query(
      'SELECT DISTINCT subcategory FROM products WHERE category = $1 ORDER BY subcategory',
      [category]
    );
    const subcategories = result.rows.map(row => row.subcategory);
    res.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error.message);
    res.status(500).json({ error: 'Failed to fetch subcategories', details: error.message });
  }
});

// Initialize database
app.get('/api/init-db', async (req, res) => {
  try {
    const fs = require('fs');
    const sql = fs.readFileSync(__dirname + '/database.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Database initialized');
    res.json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    res.status(500).json({ error: 'Failed to initialize database', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Database connected`);
  console.log(`☁️  Cloudinary configured`);
});