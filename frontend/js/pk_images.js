/* ========================================================================
   product_images.js — product image mapping using Unsplash photos
   ======================================================================== */

const PRODUCT_IMAGE_MAP = [
  // Electronics
  { keywords: ['airpods', 'earbuds', 'earphones'], url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80' },
  { keywords: ['galaxy s24', 'samsung galaxy', 'smartphone', 'phone'], url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80' },
  { keywords: ['sony wh', 'headphones', 'headphone'], url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
  // Clothing
  { keywords: ['graphic tee', 't-shirt', 'tee', 'tshirt', 'shirt'], url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80' },
  { keywords: ['cargo', 'trousers', 'pants'], url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80' },
  { keywords: ['boots', 'ankle boots'], url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&q=80' },
  { keywords: ['sneakers', 'new balance', 'shoes', 'trainer'], url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80' },
  // Accessories
  { keywords: ['bow', 'hair clip', 'hair', 'clip'], url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80' },
  { keywords: ['sunglasses', 'sunglass', 'glasses', 'tinted'], url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80' },
  { keywords: ['keychain', 'key chain', 'mushroom', 'enamel'], url: 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=500&q=80' },
  { keywords: ['wallet', 'leather wallet'], url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80' },
  { keywords: ['watch', 'smartwatch'], url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' },
  { keywords: ['camera', 'gopro', 'action camera'], url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500&q=80' },
  { keywords: ['book', 'novel'], url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80' },
  { keywords: ['cricket', 'sports kit'], url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500&q=80' },
  { keywords: ['yoga', 'mat'], url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&q=80' },
];

const CATEGORY_FALLBACK = {
  'Electronics': 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&q=80',
  'Clothing':    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&q=80',
  'Books':       'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
  'Sports':      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&q=80',
};

function getPKProductImage(product) {
  const nameLower = (product.name || '').toLowerCase();
  for (const entry of PRODUCT_IMAGE_MAP) {
    if (entry.keywords.some(k => nameLower.includes(k))) {
      return entry.url;
    }
  }
  return CATEGORY_FALLBACK[product.category] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80';
}
