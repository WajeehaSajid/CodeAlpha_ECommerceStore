require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const products = [
  {
    name: 'Apple AirPods Pro (2nd Gen)',
    description:
      'Active noise cancellation, Adaptive Transparency, and Personalized Spatial Audio. Up to 30 hours battery with case. USB-C charging. The most popular earbuds right now.',
    price: 52999,
    category: 'Electronics',
    stock: 40,
    image: '',
    ratings: [
      { name: 'Sara Ahmed', rating: 5, review: 'Amazing sound quality, totally worth every rupee!', createdAt: new Date('2025-03-10') },
      { name: 'Bilal Khan', rating: 5, review: 'ANC is phenomenal. Delivery was super fast too.', createdAt: new Date('2025-04-02') },
      { name: 'Hania Mirza', rating: 4, review: 'Battery life is insane. Case could be smaller though.', createdAt: new Date('2025-05-15') },
    ],
    avgRating: 4.7,
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description:
      'The ultimate flagship with a built-in S Pen, 200MP camera, and 6.8" Dynamic AMOLED display. Snapdragon 8 Gen 3, 12GB RAM, 256GB storage.',
    price: 289999,
    category: 'Electronics',
    stock: 15,
    image: '',
    ratings: [
      { name: 'Zaid Rehman', rating: 5, review: 'Camera is absolutely unreal. Worth every paisa.', createdAt: new Date('2025-02-20') },
      { name: 'Fatima Noor', rating: 5, review: 'S Pen makes note-taking so easy. Love this phone.', createdAt: new Date('2025-03-18') },
      { name: 'Omar Siddiqui', rating: 4, review: 'Performance is top-notch. Gets warm with heavy gaming.', createdAt: new Date('2025-04-30') },
    ],
    avgRating: 4.7,
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description:
      'Industry-leading noise cancellation with crystal-clear call quality, 30-hour battery, and ultra-comfortable design. The go-to headphones for audiophiles.',
    price: 55999,
    category: 'Electronics',
    stock: 25,
    image: '',
    ratings: [
      { name: 'Ayesha Tariq', rating: 5, review: 'Best headphones I have ever owned. Noise cancellation is magical.', createdAt: new Date('2025-01-14') },
      { name: 'Hassan Malik', rating: 4, review: 'Sound is brilliant. Slightly expensive but worth it.', createdAt: new Date('2025-03-05') },
    ],
    avgRating: 4.5,
  },
  {
    name: 'Oversized Graphic Tee',
    description:
      'Ultra-soft 100% cotton oversized tee with a minimalist vintage graphic print. Relaxed drop-shoulder fit — perfect for casual streetwear styling.',
    price: 1800,
    category: 'Clothing',
    stock: 100,
    image: '',
    ratings: [
      { name: 'Mahnoor Ali', rating: 5, review: 'Super soft fabric and the fit is perfect. Already ordered two more!', createdAt: new Date('2025-04-11') },
      { name: 'Usman Ghani', rating: 4, review: 'Great quality for the price. Washes well too.', createdAt: new Date('2025-05-02') },
    ],
    avgRating: 4.5,
  },
  {
    name: 'High-Waist Cargo Trousers',
    description:
      'On-trend high-waist cargo trousers with utility pockets and an adjustable waistband. Available in olive, black, and beige. Streetwear staple of the season.',
    price: 3500,
    category: 'Clothing',
    stock: 75,
    image: '',
    ratings: [
      { name: 'Nimra Sheikh', rating: 5, review: 'Obsessed with these! The olive colour is stunning in person.', createdAt: new Date('2025-03-22') },
      { name: 'Hamza Riaz', rating: 4, review: 'Fit is really good and pockets are actually useful.', createdAt: new Date('2025-04-14') },
      { name: 'Sana Butt', rating: 4, review: 'Great trousers. Sizing runs slightly large so order one size down.', createdAt: new Date('2025-05-20') },
    ],
    avgRating: 4.3,
  },
  {
    name: 'Chunky Lug-Sole Ankle Boots',
    description:
      'Bold lug-sole ankle boots in genuine leather with a side zip. Pairs effortlessly with jeans, skirts, or wide-leg trousers. Trending this season.',
    price: 8500,
    category: 'Clothing',
    stock: 50,
    image: '',
    ratings: [
      { name: 'Amna Farooq', rating: 5, review: 'These boots are EVERYTHING. So comfortable and stylish.', createdAt: new Date('2025-02-08') },
      { name: 'Rida Awan', rating: 5, review: 'Genuine leather quality is amazing. Got so many compliments.', createdAt: new Date('2025-03-30') },
      { name: 'Talha Javed', rating: 4, review: 'Bought for my sister. She loves them. Good packaging too.', createdAt: new Date('2025-04-25') },
    ],
    avgRating: 4.7,
  },
  {
    name: 'Coquette Bow Hair Clips (Set of 6)',
    description:
      'Aesthetic satin ribbon bow clips in pastel tones — vanilla, dusty rose, and lilac. The cutest hair accessory trending on every fashion feed right now.',
    price: 650,
    category: 'Accessories',
    stock: 200,
    image: '',
    ratings: [
      { name: 'Iqra Hussain', rating: 5, review: 'So adorable! The colours are exactly like the pictures.', createdAt: new Date('2025-04-03') },
      { name: 'Laiba Zafar', rating: 5, review: 'Got these as a gift and they are perfect. Everyone loved them!', createdAt: new Date('2025-04-29') },
      { name: 'Mariam Shah', rating: 5, review: 'Super cute and great value for money. Will buy again.', createdAt: new Date('2025-05-12') },
    ],
    avgRating: 5.0,
  },
  {
    name: 'Y2K Tinted Oval Sunglasses',
    description:
      'Retro Y2K-inspired oval frames with gradient tinted lenses and thin metal arms. UV400 protection. The sunglasses everyone is wearing this summer.',
    price: 1200,
    category: 'Accessories',
    stock: 90,
    image: '',
    ratings: [
      { name: 'Dua Chaudhry', rating: 4, review: 'Really cute glasses. The tint is a beautiful peachy gradient.', createdAt: new Date('2025-03-16') },
      { name: 'Ali Hassan', rating: 4, review: 'Good quality for the price. Looks exactly like the photo.', createdAt: new Date('2025-04-08') },
      { name: 'Sadia Khan', rating: 5, review: 'Absolutely love them! Got stopped on the street for where I got them.', createdAt: new Date('2025-05-01') },
    ],
    avgRating: 4.3,
  },
  {
    name: 'Cute Mushroom Enamel Keychain',
    description:
      'Adorable cottagecore mushroom enamel keychain with a gold-plated ring and a tiny star charm. Makes the perfect bag accessory or gift.',
    price: 450,
    category: 'Accessories',
    stock: 300,
    image: '',
    ratings: [
      { name: 'Zara Malik', rating: 5, review: 'The cutest thing ever! Packaging was so pretty too.', createdAt: new Date('2025-02-14') },
      { name: 'Noor Fatima', rating: 5, review: 'Bought as a gift and my friend absolutely loved it. Will order more.', createdAt: new Date('2025-03-28') },
      { name: 'Emaan Qureshi', rating: 5, review: 'Exactly as described. The gold detailing is beautiful.', createdAt: new Date('2025-05-05') },
    ],
    avgRating: 5.0,
  },
  {
    name: 'New Balance 574 Sneakers',
    description:
      'Iconic suede and mesh upper with the classic NB 574 silhouette. Cushioned midsole for all-day comfort. A timeless trainer that goes with everything.',
    price: 18500,
    category: 'Sports',
    stock: 60,
    image: '',
    ratings: [
      { name: 'Saad Akhtar', rating: 5, review: 'So comfortable right out of the box. No break-in period needed.', createdAt: new Date('2025-01-30') },
      { name: 'Kiran Baig', rating: 5, review: 'Classic look, great cushioning. Wear them every day.', createdAt: new Date('2025-03-12') },
      { name: 'Faisal Mehmood', rating: 4, review: 'Quality is excellent. Sizing is true to size.', createdAt: new Date('2025-04-22') },
    ],
    avgRating: 4.7,
  },
];

const run = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
    ]);

    console.log('Creating admin user...');
    await User.create({
      name: 'Store Admin',
      email: 'admin@store.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('Creating demo user...');
    await User.create({
      name: 'Demo Customer',
      email: 'user@store.com',
      password: 'user123',
      role: 'user',
    });

    console.log('Inserting products with sample reviews...');
    await Product.insertMany(products);

    console.log('\nSeed complete!');
    console.log('Admin login: admin@store.com / admin123');
    console.log('User login:  user@store.com / user123');
    console.log(`Products inserted: ${products.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

run();
