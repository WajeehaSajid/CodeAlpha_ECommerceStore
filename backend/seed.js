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
  {
   name: 'Yonex Badminton Racket Set',
   description: 'Yonex professional badminton rackets set with 3 shuttlecocks. Lightweight carbon frame, perfect grip, ideal for beginners and intermediate players. Great for indoor and outdoor play.',
   price: 3499,
   category: 'Sports',
   stock: 30,
   image: '',
   ratings: [
     { name: 'Hamza Ali', rating: 5, review: "Best badminton set I've ever bought! Quality is top-notch.", createdAt: new Date('2025-04-10') },
     { name: 'Sana Malik', rating: 4, review: 'Rackets are light and sturdy. Shuttlecocks included are a bonus!', createdAt: new Date('2025-05-02') },
     { name: 'Usman Farooq', rating: 5, review: 'Perfect for evening sessions. Highly recommended.', createdAt: new Date('2025-05-20') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'Cute Cloud Plush Keychain',
   description: 'Adorable fluffy cloud-shaped plush keychain with a smiley face and gold-tone clip. Perfect gift for friends and bag charm lovers. Soft, lightweight, and super cute!',
   price: 349,
   category: 'Accessories',
   stock: 100,
   image: '',
   ratings: [
     { name: 'Zara Hassan', rating: 5, review: 'So cute and fluffy! My friends loved it as a gift.', createdAt: new Date('2025-03-15') },
     { name: 'Nida Rehman', rating: 4, review: 'Very soft and good quality. Exactly as shown in picture.', createdAt: new Date('2025-04-18') },
     { name: 'Laiba Khan', rating: 5, review: 'Bought 5 of these for gifting. Everyone loved them!', createdAt: new Date('2025-05-10') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'Classic Quartz Wrist Watch',
   description: 'Elegant stainless steel quartz watch with a black dial and silver bracelet band. Minimalist design perfect for both casual and formal wear. Water-resistant with precise timekeeping.',
   price: 1899,
   category: 'Accessories',
   stock: 50,
   image: '',
   ratings: [
     { name: 'Ahmed Raza', rating: 5, review: 'Looks very premium for this price. Gets lots of compliments.', createdAt: new Date('2025-02-25') },
     { name: 'Fatima Zahra', rating: 4, review: 'Beautiful watch, packaging was nice. Battery still going strong.', createdAt: new Date('2025-04-05') },
     { name: 'Bilal Sheikh', rating: 5, review: 'Exactly what I wanted. Very stylish and lightweight.', createdAt: new Date('2025-05-12') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'Brown Aesthetic Hair Bands Set (7pcs)',
   description: 'Set of 7 trendy brown aesthetic hair accessories including scrunchies, bow ties, floral bands, and a cute bear charm. Perfect for daily styling or gifting.',
   price: 599,
   category: 'Accessories',
   stock: 80,
   image: '',
   ratings: [
     { name: 'Ayesha Tariq', rating: 5, review: 'So pretty! The brown tones are perfect for everyday use.', createdAt: new Date('2025-03-20') },
     { name: 'Maryam Ali', rating: 4, review: 'Good quality scrunchies. The bow one is my favourite.', createdAt: new Date('2025-04-22') },
     { name: 'Hira Butt', rating: 5, review: 'Loved the whole set. Great value for money!', createdAt: new Date('2025-05-18') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'Act of Oblivion — Robert Harris',
   description: 'A gripping historical thriller by bestselling author Robert Harris. Two men killed the King — now they must flee across America. A breathtaking chase across 17th-century New England. Author of Fatherland and Munich.',
   price: 1299,
   category: 'Books',
   stock: 40,
   image: '',
   ratings: [
     { name: 'Sara Imran', rating: 5, review: "Couldn't put it down! Harris at his absolute best.", createdAt: new Date('2025-02-14') },
     { name: 'Omar Siddiqui', rating: 4, review: 'Brilliant historical fiction. Very well researched and gripping.', createdAt: new Date('2025-03-30') },
     { name: 'Rabia Noor', rating: 5, review: 'Finished in two sittings. A masterpiece of historical thriller.', createdAt: new Date('2025-05-08') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'White Bee Embroidery Sneakers',
   description: 'Stylish white lace-up sneakers with green-red stripe detailing and gold bee embroidery. Lightweight, comfortable sole perfect for everyday wear. Unisex design suitable for all occasions.',
   price: 2499,
   category: 'Clothing',
   stock: 45,
   image: '',
   ratings: [
     { name: 'Hassan Ali', rating: 5, review: 'Very comfortable and look amazing. True to size.', createdAt: new Date('2025-03-12') },
     { name: 'Zainab Khan', rating: 4, review: 'Great quality for the price. Gets lots of compliments.', createdAt: new Date('2025-04-28') },
     { name: 'Faisal Mahmood', rating: 5, review: 'Wore them to college and everyone asked where I got them!', createdAt: new Date('2025-05-22') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'Cat Print Graphic T-Shirt',
   description: 'Cute oversized white T-shirt with a waving cartoon cat graphic print. Soft cotton fabric, round neck, short sleeves. Perfect for casual daily wear. Available in multiple sizes.',
   price: 899,
   category: 'Clothing',
   stock: 60,
   image: '',
   ratings: [
     { name: 'Amna Rafique', rating: 5, review: 'So soft and adorable! The print quality is excellent.', createdAt: new Date('2025-04-01') },
     { name: 'Iqra Shahid', rating: 4, review: 'Love the oversized fit. Washed it 3 times and print is still perfect.', createdAt: new Date('2025-04-25') },
     { name: 'Noor Fatima', rating: 5, review: 'Best casual tee I own. Ordered 2 more in different sizes!', createdAt: new Date('2025-05-30') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'Xiaomi Mini Power Bank 10000mAh',
   description: 'Xiaomi compact mini power bank with built-in USB-C cable. Sleek cream design, 10000mAh capacity, 4-dot LED indicator. Fast charging support. Perfect travel companion.',
   price: 3299,
   category: 'Electronics',
   stock: 35,
   image: '',
   ratings: [
     { name: 'Tariq Hussain', rating: 5, review: 'Charges my phone fully twice. The built-in cable is genius!', createdAt: new Date('2025-03-08') },
     { name: 'Sobia Aslam', rating: 4, review: 'Very compact and stylish. Fits easily in my purse.', createdAt: new Date('2025-04-14') },
     { name: 'Kamran Baig', rating: 5, review: 'Xiaomi never disappoints. Fast charging and beautiful design.', createdAt: new Date('2025-05-25') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'Cat Ear LED Wireless Headphones',
   description: 'Adorable wireless Bluetooth headphones with glowing RGB cat ears and paw print design. Built-in microphone, soft cushioned ear cups, foldable design. Perfect gift for music lovers and gamers.',
   price: 4499,
   category: 'Electronics',
   stock: 25,
   image: '',
   ratings: [
     { name: 'Aliya Raza', rating: 5, review: 'Oh my God these are so cute! Sound quality is surprisingly good too.', createdAt: new Date('2025-03-22') },
     { name: 'Mahnoor Javed', rating: 4, review: 'My daughter absolutely loves these. The lights are so pretty.', createdAt: new Date('2025-04-30') },
     { name: 'Dua Fatima', rating: 5, review: 'Best gift I ever gave myself. Comfort and style both!', createdAt: new Date('2025-06-01') },
   ],
   avgRating: 4.7,
  },
  {
   name: 'Mini Portable USB Fan',
   description: 'Compact portable mini USB fan with 3 speed settings and quiet motor. Flexible neck design, works with power bank or laptop. Ideal for travel, office desk, and home use.',
   price: 799,
   category: 'Electronics',
   stock: 70,
   image: '',
   ratings: [
     { name: 'Asma Bibi', rating: 5, review: 'Silent and powerful for such a tiny fan. Love it!', createdAt: new Date('2025-04-08') },
     { name: 'Waqas Ahmed', rating: 4, review: 'Works great with my power bank. Very handy in summer.', createdAt: new Date('2025-05-05') },
     { name: 'Huma Shafiq', rating: 5, review: 'Bought for office desk. Colleagues keep asking about it!', createdAt: new Date('2025-05-28') },
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
