const express = require('express');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const SHIPPING_THRESHOLD = 5000;
const SHIPPING_FEE = 300;

// POST /api/orders  - place order from cart
router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    if (
      !shippingAddress ||
      !shippingAddress.name ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.country ||
      !shippingAddress.zip
    ) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const validItems = cart.items.filter((i) => i.product);

    const items = validItems.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      image: i.product.image,
      quantity: i.quantity,
      priceAtPurchase: i.product.price,
    }));

    const subtotal = items.reduce(
      (acc, i) => acc + i.priceAtPurchase * i.quantity,
      0
    );
    const shipping = subtotal >= SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
    const totalAmount = Math.round((subtotal + shipping) * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      status: 'pending',
    });

    // Clear the cart after placing the order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders  (admin) - all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status  (admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'shipped', 'delivered'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
