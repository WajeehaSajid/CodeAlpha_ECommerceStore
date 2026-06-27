const express = require('express');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ---- Cloudinary config ----
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---- Multer + Cloudinary storage ----
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'novashop-products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'jfif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|avif|jfif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  if (ext) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// GET /api/products  (filters, search, sort, pagination)
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 12, 1);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products  (admin)
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      // Cloudinary returns full URL in req.file.path
      image: req.file ? req.file.path : '',
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/products/:id  (admin)
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, category, stock } = req.body;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;

    // If new image uploaded, use Cloudinary URL
    if (req.file) product.image = req.file.path;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/products/:id  (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products/:id/reviews  (protected)
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const already = product.ratings.find(
      (r) => r.user && r.user.toString() === req.user._id.toString()
    );
    if (already) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    product.ratings.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      review: review || '',
    });

    product.computeAvgRating();
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;