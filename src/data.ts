import { Product, UserProfile, Order } from './types';

export const MOCK_PRODUCTS: Product[] = [
  // --- MOBILES ---
  {
    id: 'p1',
    title: 'Apple iPhone 15 (128GB, Black)',
    brand: 'Apple',
    category: 'Mobiles',
    subCategory: 'Smartphones',
    price: 72999,
    originalPrice: 79900,
    discountPercentage: 8,
    rating: 4.6,
    ratingDistribution: { 5: 75, 4: 15, 3: 5, 2: 3, 1: 2 },
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      ram: '6GB',
      rom: '128GB',
      processor: 'A16 Bionic Chip',
      display: '6.1-inch Super Retina XDR OLED',
      battery: '3349 mAh',
      camera: '48MP + 12MP Dual Rear Camera, 12MP Front Camera',
      warranty: '1 Year Apple Warranty',
      color: 'Black'
    },
    description: 'iPhone 15 brings you the Dynamic Island, a 48MP Main camera, and USB-C, all in a durable color-infused glass and aluminum design. It is highly optimized for performance, battery life, and cinematic portrait photography.',
    reviews: [
      {
        id: 'r1_1',
        reviewerName: 'Aarav Sharma',
        rating: 5,
        date: '2026-05-15',
        text: 'The transition to USB-C is fantastic. Camera quality is top-notch, especially portraits in low light. Battery easily lasts a full day of heavy use.',
        verified: true,
        helpfulCount: 42
      },
      {
        id: 'r1_2',
        reviewerName: 'Sneha Patel',
        rating: 4,
        date: '2026-05-28',
        text: 'Super lightweight and the Dynamic Island is actually very helpful. Giving 4 stars because charging speed could be faster.',
        verified: true,
        helpfulCount: 18
      },
      {
        id: 'r1_3',
        reviewerName: 'John Doe',
        rating: 5,
        date: '2026-06-02',
        text: 'Upgraded from iPhone 11 and the difference is massive. Highly recommended!',
        verified: true,
        helpfulCount: 9
      }
    ],
    featured: true,
    trending: true
  },
  {
    id: 'p2',
    title: 'Samsung Galaxy S24 (256GB, Onyx Black)',
    brand: 'Samsung',
    category: 'Mobiles',
    subCategory: 'Smartphones',
    price: 79999,
    originalPrice: 89999,
    discountPercentage: 11,
    rating: 4.7,
    ratingDistribution: { 5: 80, 4: 12, 3: 4, 2: 2, 1: 2 },
    stock: 21,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1610945415295-d9baf0602585?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      ram: '8GB',
      rom: '256GB',
      processor: 'Exynos 2400 / Snapdragon 8 Gen 3',
      display: '6.2-inch Dynamic AMOLED 2X FHD+ (120Hz)',
      battery: '4000 mAh',
      camera: '50MP + 12MP + 10MP Triple Rear, 12MP Front Camera',
      warranty: '1 Year Brand Warranty',
      color: 'Onyx Black'
    },
    description: 'Welcome to the era of mobile AI. With Galaxy S24 in your hands, you can unleash whole new levels of creativity, productivity and possibility starting with the most important device in your life: your smartphone. Featuring Galaxy AI tools like Circle to Search, Live Translate, and Photo Assist.',
    reviews: [
      {
        id: 'r2_1',
        reviewerName: 'Rohan Mehra',
        rating: 5,
        date: '2026-06-10',
        text: 'Galaxy AI is not a gimmick! The circle to search works flawlessly. The 120Hz screen is the best in the market. Absolutely love the size as it fits in hand perfectly.',
        verified: true,
        helpfulCount: 37
      },
      {
        id: 'r2_2',
        reviewerName: 'Ananya Roy',
        rating: 5,
        date: '2026-06-18',
        text: 'Incredible camera zoom. Battery life is much improved compared to the S23.',
        verified: true,
        helpfulCount: 14
      }
    ],
    featured: true
  },
  {
    id: 'p3',
    title: 'OnePlus Nord CE 3 Lite 5G (128GB, Pastel Lime)',
    brand: 'OnePlus',
    category: 'Mobiles',
    subCategory: 'Mid-range Phones',
    price: 17499,
    originalPrice: 19999,
    discountPercentage: 12,
    rating: 4.2,
    ratingDistribution: { 5: 50, 4: 30, 3: 12, 2: 5, 1: 3 },
    stock: 35,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1565849615011-0612ce7c614e?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      ram: '8GB',
      rom: '128GB',
      processor: 'Snapdragon 695 5G',
      display: '6.72-inch IPS LCD, 120Hz',
      battery: '5000 mAh',
      camera: '108MP + 2MP + 2MP Triple Rear, 16MP Front Camera',
      warranty: '1 Year Warranty',
      color: 'Pastel Lime'
    },
    description: 'The OnePlus Nord CE 3 Lite 5G features a large 108MP camera, 67W SUPERVOOC fast charging, a massive 5000mAh battery, and a sleek, modern design that stands out in Pastel Lime color.',
    reviews: [
      {
        id: 'r3_1',
        reviewerName: 'Kabir Das',
        rating: 4,
        date: '2026-05-20',
        text: 'Amazing value for money. 67W charging fills the battery in no time. Camera is good under bright light, but average at night.',
        verified: true,
        helpfulCount: 56
      },
      {
        id: 'r3_2',
        reviewerName: 'Priya Pillai',
        rating: 4,
        date: '2026-06-12',
        text: 'The phone works perfectly, screen is very smooth. Lime color is extremely eye-catching.',
        verified: true,
        helpfulCount: 22
      }
    ],
    trending: true
  },
  {
    id: 'p4',
    title: 'OnePlus 12R (256GB, Cool Blue)',
    brand: 'OnePlus',
    category: 'Mobiles',
    subCategory: 'Performance Phones',
    price: 42999,
    originalPrice: 45999,
    discountPercentage: 6,
    rating: 4.5,
    ratingDistribution: { 5: 68, 4: 20, 3: 8, 2: 2, 1: 2 },
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      ram: '16GB',
      rom: '256GB',
      processor: 'Snapdragon 8 Gen 2',
      display: '6.78-inch AMOLED 120Hz ProXDR',
      battery: '5500 mAh',
      camera: '50MP + 8MP + 2MP Triple Rear, 16MP Front Camera',
      warranty: '1 Year Brand Warranty',
      color: 'Cool Blue'
    },
    description: 'Boasting a Snapdragon 8 Gen 2 chip, 16GB RAM, and a monstrous 5500mAh battery with 100W SUPERVOOC charging, the OnePlus 12R is designed for gamers and heavy multitaskers who want flagship performance at a lower cost.',
    reviews: [
      {
        id: 'r4_1',
        reviewerName: 'Devansh Roy',
        rating: 5,
        date: '2026-06-05',
        text: 'Gaming performance is top tier! Does not heat up at all thanks to the large cooling chamber. Battery backup is unbelievable.',
        verified: true,
        helpfulCount: 45
      }
    ]
  },

  // --- LAPTOPS ---
  {
    id: 'p5',
    title: 'Apple MacBook Air M3 (13-inch, 8GB RAM, 256GB SSD)',
    brand: 'Apple',
    category: 'Laptops',
    subCategory: 'Ultrabooks',
    price: 104900,
    originalPrice: 114900,
    discountPercentage: 9,
    rating: 4.8,
    ratingDistribution: { 5: 85, 4: 10, 3: 3, 2: 1, 1: 1 },
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      ram: '8GB',
      rom: '256GB SSD',
      processor: 'Apple M3 Chip (8-core CPU, 10-core GPU)',
      display: '13.6-inch Liquid Retina Display',
      battery: 'Up to 18 hours battery life',
      camera: '1080p FaceTime HD Camera',
      warranty: '1 Year Apple Warranty',
      color: 'Space Grey'
    },
    description: 'The MacBook Air with the M3 chip is superportable and fast. With up to 18 hours of battery life and a stunning Liquid Retina display, it breezes through work and play.',
    reviews: [
      {
        id: 'r5_1',
        reviewerName: 'Meera Deshmukh',
        rating: 5,
        date: '2026-04-12',
        text: 'Blazing fast, completely silent as it is fanless, and the battery is infinite! I easily get 2 days of office work on a single charge.',
        verified: true,
        helpfulCount: 88
      },
      {
        id: 'r5_2',
        reviewerName: 'Vikram AD',
        rating: 5,
        date: '2026-04-30',
        text: 'The best laptop for developers and students. Lightweight and portable.',
        verified: true,
        helpfulCount: 31
      }
    ],
    featured: true,
    trending: true
  },
  {
    id: 'p6',
    title: 'Dell Inspiron 15 Thin & Light (16GB RAM, 512GB SSD)',
    brand: 'Dell',
    category: 'Laptops',
    subCategory: 'Budget Laptops',
    price: 48999,
    originalPrice: 59999,
    discountPercentage: 18,
    rating: 4.1,
    ratingDistribution: { 5: 45, 4: 35, 3: 10, 2: 6, 1: 4 },
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1496181130204-755241524eab?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      ram: '16GB',
      rom: '512GB SSD',
      processor: 'Intel Core i5-1235U (12th Gen)',
      display: '15.6-inch FHD WVA anti-glare, 120Hz',
      battery: '41 Whr, Fast Charge',
      camera: '720p HD Camera with Privacy Shutter',
      warranty: '1 Year Brand Premium Support',
      color: 'Platinum Silver'
    },
    description: 'The Dell Inspiron 15 is perfect for everyday productivity, featuring a 12th Gen Intel Core i5 processor, 16GB high-speed RAM, and a fast 512GB NVMe SSD. It features narrow borders and ComfortView comfort.',
    reviews: [
      {
        id: 'r6_1',
        reviewerName: 'Harish Kumar',
        rating: 4,
        date: '2026-05-10',
        text: 'Excellent budget friendly laptop. Has ample RAM (16GB) which makes multitasking smooth. Battery is moderate (about 4-5 hours).',
        verified: true,
        helpfulCount: 15
      }
    ]
  },
  {
    id: 'p7',
    title: 'ASUS ROG Zephyrus G14 Gaming Laptop',
    brand: 'ASUS',
    category: 'Laptops',
    subCategory: 'Gaming Laptops',
    price: 124999,
    originalPrice: 145000,
    discountPercentage: 13,
    rating: 4.7,
    ratingDistribution: { 5: 82, 4: 10, 3: 5, 2: 2, 1: 1 },
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      ram: '16GB DDR5',
      rom: '1TB Gen4 SSD',
      processor: 'AMD Ryzen 9 7940HS',
      display: '14-inch QHD+ 165Hz ROG Nebula Display',
      battery: '76 WHr battery',
      camera: '1080p FHD IR Camera (Windows Hello)',
      warranty: '2 Years Asus Warranty',
      color: 'Eclipse Gray'
    },
    description: 'The ultimate compact gaming machine. Armed with AMD Ryzen 9 and Nvidia RTX 4060 graphics, it packs incredible gaming performance into an ultra-portable 1.6kg package with an AniMe Matrix lid display.',
    reviews: [
      {
        id: 'r7_1',
        reviewerName: 'Rahul Verma',
        rating: 5,
        date: '2026-06-15',
        text: 'Incredibly powerful laptop. Plays Cyberpunk on ultra settings with DLSS. The Nebula display is gorgeous, super bright, and colors pop out. Battery is surprisingly decent for a gaming laptop when in Eco mode.',
        verified: true,
        helpfulCount: 64
      }
    ],
    featured: true
  },

  // --- FASHION ---
  {
    id: 'p8',
    title: 'Tommy Hilfiger Slim Fit Polo Shirt',
    brand: 'Tommy Hilfiger',
    category: 'Fashion',
    subCategory: 'Men\'s Wear',
    price: 3499,
    originalPrice: 4999,
    discountPercentage: 30,
    rating: 4.3,
    ratingDistribution: { 5: 60, 4: 25, 3: 10, 2: 3, 1: 2 },
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      size: 'M, L, XL',
      color: 'Navy Blue, Classic White, Tomato Red',
      warranty: 'No Brand Warranty',
      display: '100% Premium Organic Cotton'
    },
    description: 'Crafted from soft organic cotton pique, this Tommy Hilfiger slim fit polo features standard collar detail and the iconic brand flag embroidered on the chest.',
    reviews: [
      {
        id: 'r8_1',
        reviewerName: 'Samir G',
        rating: 5,
        date: '2026-05-02',
        text: 'Fantastic fit! The material feels very premium and stays soft after several washes. Definitely worth the price.',
        verified: true,
        helpfulCount: 29
      }
    ],
    trending: true
  },
  {
    id: 'p9',
    title: 'Levi\'s Men\'s Sherpa Trucker Denim Jacket',
    brand: 'Levi\'s',
    category: 'Fashion',
    subCategory: 'Jackets',
    price: 4899,
    originalPrice: 6999,
    discountPercentage: 30,
    rating: 4.6,
    ratingDistribution: { 5: 70, 4: 20, 3: 7, 2: 2, 1: 1 },
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      size: 'S, M, L, XL',
      color: 'Denim Indigo',
      warranty: 'No Brand Warranty',
      display: '100% Cotton Outer, Cozy Sherpa Lining'
    },
    description: 'The original denim jacket since 1967, upgraded with a warm, plush Sherpa fleece lining. Perfect for cool seasons, blending timeless Americana style with premium warmth.',
    reviews: [
      {
        id: 'r9_1',
        reviewerName: 'Preeti Deshpande',
        rating: 5,
        date: '2026-06-01',
        text: 'Bought this for my brother and he loves it! Fabric is heavy-duty and the inner lining is extremely soft and cozy.',
        verified: true,
        helpfulCount: 14
      }
    ]
  },

  // --- FOOTWEAR ---
  {
    id: 'p10',
    title: 'Nike Air Max 270 Sneakers',
    brand: 'Nike',
    category: 'Footwear',
    subCategory: 'Sports Shoes',
    price: 11999,
    originalPrice: 13995,
    discountPercentage: 14,
    rating: 4.6,
    ratingDistribution: { 5: 72, 4: 18, 3: 6, 2: 3, 1: 1 },
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      size: 'UK 7, UK 8, UK 9, UK 10',
      color: 'Triple Black, Red-Crimson, Volt Green',
      warranty: '6 Months Manufacturer Warranty'
    },
    description: 'Nike\'s first lifestyle Air Max brings you style, comfort and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons, showcasing Nike\'s greatest innovation with its large window and fresh array of colors.',
    reviews: [
      {
        id: 'r10_1',
        reviewerName: 'Deepak Rao',
        rating: 5,
        date: '2026-05-18',
        text: 'Feels like walking on clouds! The large air unit on the heel absorbing impacts perfectly. Extremely comfortable for long hours of walking.',
        verified: true,
        helpfulCount: 52
      },
      {
        id: 'r10_2',
        reviewerName: 'Arjun Sen',
        rating: 4,
        date: '2026-06-20',
        text: 'Super stylish sneakers. Fits perfectly but is slightly narrow. Suggest ordering half a size up.',
        verified: true,
        helpfulCount: 17
      }
    ],
    featured: true,
    trending: true
  },
  {
    id: 'p11',
    title: 'Adidas Ultraboost Light Running Shoes',
    brand: 'Adidas',
    category: 'Footwear',
    subCategory: 'Running Shoes',
    price: 14999,
    originalPrice: 18999,
    discountPercentage: 21,
    rating: 4.7,
    ratingDistribution: { 5: 80, 4: 12, 3: 5, 2: 2, 1: 1 },
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      size: 'UK 8, UK 9, UK 10',
      color: 'Cloud White, Core Black',
      warranty: '3 Months Manufacturer Warranty'
    },
    description: 'Experience epic energy with the new Ultraboost Light, the lightest Ultraboost ever made. The magic lies in the Light BOOST midsole, a new generation of Adidas BOOST with even more energy return.',
    reviews: [
      {
        id: 'r11_1',
        reviewerName: 'Vikram Seth',
        rating: 5,
        date: '2026-05-24',
        text: 'The absolute best running shoes. Unmatched cushion and energy return. Lightweight and breathable upper mesh.',
        verified: true,
        helpfulCount: 39
      }
    ],
    trending: true
  },

  // --- HOME APPLIANCES ---
  {
    id: 'p12',
    title: 'Samsung 322L Double Door Refrigerator',
    brand: 'Samsung',
    category: 'Home Appliances',
    subCategory: 'Refrigerators',
    price: 36990,
    originalPrice: 44900,
    discountPercentage: 17,
    rating: 4.4,
    ratingDistribution: { 5: 62, 4: 25, 3: 8, 2: 3, 1: 2 },
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1571175432247-fe0320b5de80?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      capacity: '322 Litres',
      powerConsumption: '3 Star Energy Efficiency Rating',
      warranty: '1 Year Comprehensive, 10 Years on Compressor',
      color: 'Elegant Inox Silver'
    },
    description: 'Featuring Twin Cooling Plus technology, this Samsung double door convertible refrigerator keeps food fresh up to 2x longer. Converts your freezer into fridge for extra space.',
    reviews: [
      {
        id: 'r12_1',
        reviewerName: 'Karan Malhotra',
        rating: 5,
        date: '2026-03-10',
        text: 'Very quiet and cools extremely fast. The convertible freezer is a lifesaver when hosting guests.',
        verified: true,
        helpfulCount: 20
      },
      {
        id: 'r12_2',
        reviewerName: 'Shalini Sen',
        rating: 4,
        date: '2026-04-18',
        text: 'Looks stylish and spacious. Energy bills are low. Very satisfied with Samsung service.',
        verified: true,
        helpfulCount: 8
      }
    ],
    featured: true
  },
  {
    id: 'p13',
    title: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    brand: 'Dyson',
    category: 'Home Appliances',
    subCategory: 'Vacuum Cleaners',
    price: 59900,
    originalPrice: 65900,
    discountPercentage: 9,
    rating: 4.8,
    ratingDistribution: { 5: 85, 4: 10, 3: 3, 2: 1, 1: 1 },
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      capacity: '0.77L Dustbin Capacity',
      powerConsumption: '240 AW Suction Power',
      warranty: '2 Years Dyson Warranty',
      color: 'Nickel/Yellow-Gold'
    },
    description: 'Dyson\'s most powerful, intelligent cordless vacuum. Features a laser that reveals microscopic dust, counts and measures the size of particles on a dynamic LCD screen, and automatically adjusts suction power.',
    reviews: [
      {
        id: 'r13_1',
        reviewerName: 'Amit Trivedi',
        rating: 5,
        date: '2026-05-12',
        text: 'Yes, it is expensive, but absolutely worth it! The green laser makes dust clearly visible on wooden floors. Clean performance is flawless.',
        verified: true,
        helpfulCount: 44
      }
    ],
    trending: true
  },
  {
    id: 'p14',
    title: 'LG 8kg 5-Star Front Load Washing Machine',
    brand: 'LG',
    category: 'Home Appliances',
    subCategory: 'Washing Machines',
    price: 34990,
    originalPrice: 42990,
    discountPercentage: 18,
    rating: 4.5,
    ratingDistribution: { 5: 70, 4: 18, 3: 8, 2: 2, 1: 2 },
    stock: 11,
    images: [
      'https://images.unsplash.com/photo-1582730149719-6112a4caafc2?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      capacity: '8 kg',
      powerConsumption: '5-Star BEE Efficiency, Direct Drive',
      warranty: '2 Years on Product, 10 Years on Motor',
      color: 'Middle Black'
    },
    description: 'Powered by AI DD (Direct Drive) which detects fabric weight and softness to choose the optimal wash pattern automatically. Built-in Steam wash removes allergens and sanitizes clothes.',
    reviews: [
      {
        id: 'r14_1',
        reviewerName: 'Namrata Patil',
        rating: 5,
        date: '2026-06-11',
        text: 'Awesome washing machine. The steam wash features leaves clothes very soft and completely allergen-free. Absolutely no noise or vibration because of the Direct Drive motor.',
        verified: true,
        helpfulCount: 30
      }
    ]
  },

  // --- BRAND NEW SELECTIONS TO ACHIEVE 18 PRODUCTS ---
  {
    id: 'p15',
    title: 'Apple iPad Air (M2, 11-inch, 128GB)',
    brand: 'Apple',
    category: 'Mobiles',
    subCategory: 'Tablets',
    price: 54900,
    originalPrice: 59900,
    discountPercentage: 8,
    rating: 4.7,
    ratingDistribution: { 5: 80, 4: 15, 3: 3, 2: 1, 1: 1 },
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      ram: '8GB',
      rom: '128GB',
      processor: 'Apple M2 Chip',
      display: '11-inch Liquid Retina Display',
      battery: 'Up to 10 hours battery life',
      warranty: '1 Year Apple Warranty',
      color: 'Space Grey'
    },
    description: 'The redesigned iPad Air is supercharged by the blazing-fast Apple M2 chip. It features a stunning Liquid Retina display, a new landscape camera, and support for Apple Pencil Pro.',
    reviews: [
      {
        id: 'r15_1',
        reviewerName: 'Tanya Sen',
        rating: 5,
        date: '2026-06-02',
        text: 'The best tablet available. M2 chip handles everything like butter. Battery lasts several days of reading and streaming.',
        verified: true,
        helpfulCount: 11
      }
    ]
  },
  {
    id: 'p16',
    title: 'Samsung Galaxy Watch 6 Smartwatch',
    brand: 'Samsung',
    category: 'Home Appliances', // Fits wearable/appliance demo
    subCategory: 'Smart Wearables',
    price: 19999,
    originalPrice: 29999,
    discountPercentage: 33,
    rating: 4.4,
    ratingDistribution: { 5: 65, 4: 20, 3: 10, 2: 3, 1: 2 },
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      display: '1.4-inch Super AMOLED Display',
      battery: '425 mAh, Up to 40 Hours',
      processor: 'Exynos W930 Dual-Core',
      warranty: '1 Year Brand Warranty',
      color: 'Graphite'
    },
    description: 'Track your fitness, analyze your sleep patterns, and stay connected directly from your wrist. Featuring a sleek, lightweight circular bezel, custom watch faces, and ECG/Blood Pressure sensors.',
    reviews: [
      {
        id: 'r16_1',
        reviewerName: 'Kunal Kapoor',
        rating: 4,
        date: '2026-05-22',
        text: 'Great smartwatch, tracks sleep very accurately. Battery life is about 1.5 days which is decent for WearOS.',
        verified: true,
        helpfulCount: 19
      }
    ]
  },
  {
    id: 'p17',
    title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    brand: 'Sony',
    category: 'Home Appliances',
    subCategory: 'Audio Devices',
    price: 29990,
    originalPrice: 34990,
    discountPercentage: 14,
    rating: 4.8,
    ratingDistribution: { 5: 86, 4: 10, 3: 2, 2: 1, 1: 1 },
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      battery: 'Up to 30 Hours with ANC',
      processor: 'V1 Integrated Processor',
      warranty: '1 Year Sony Warranty',
      color: 'Silver-Grey'
    },
    description: 'The industry-leading noise cancellation gets even better. Multi-noise sensor technology, two processors controlling 8 microphones, and Auto NC Optimizer make this the absolute best headphone for travel and call quality.',
    reviews: [
      {
        id: 'r17_1',
        reviewerName: 'Rishabh Pant',
        rating: 5,
        date: '2026-06-14',
        text: 'The active noise cancellation is magic. I do not hear anything when on the subway. Sound signature is balanced and detailed.',
        verified: true,
        helpfulCount: 40
      }
    ],
    featured: true
  },
  {
    id: 'p18',
    title: 'Zara Casual Linen Slim Fit Shirt',
    brand: 'Zara',
    category: 'Fashion',
    subCategory: 'Men\'s Wear',
    price: 2799,
    originalPrice: 3999,
    discountPercentage: 30,
    rating: 4.1,
    ratingDistribution: { 5: 50, 4: 30, 3: 10, 2: 6, 1: 4 },
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
    ],
    specs: {
      size: 'S, M, L, XL',
      color: 'Olive Green, Sand Beige',
      warranty: 'No Brand Warranty'
    },
    description: 'Linen blend slim fit button down shirt. Features a spread collar, button placket, and patch chest pocket. Highly breathable and styled for perfect summer outings.',
    reviews: [
      {
        id: 'r18_1',
        reviewerName: 'Nitin J',
        rating: 4,
        date: '2026-06-15',
        text: 'Very comfortable shirt for warm days. Fabric is light but not too thin. Fits nicely.',
        verified: true,
        helpfulCount: 6
      }
    ]
  }
];

export const MOCK_USER: UserProfile = {
  name: 'Mohana Siva',
  email: 'mohanasiva95@gmail.com',
  phone: '+91 98765 43210',
  addresses: [
    {
      id: 'a1',
      name: 'Mohana Siva (Home)',
      phone: '+91 98765 43210',
      street: 'Flat 402, Sunshine Heights, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      zip: '500033',
      isDefault: true
    },
    {
      id: 'a2',
      name: 'Mohana Siva (Office)',
      phone: '+91 98765 43211',
      street: 'Tower C, Mindspace IT Park, Hitech City',
      city: 'Hyderabad',
      state: 'Telangana',
      zip: '500081',
      isDefault: false
    }
  ],
  savedPaymentMethods: [
    { id: 'pay1', type: 'UPI', details: 'mohanasiva@okhdfcbank' },
    { id: 'pay2', type: 'Credit Card', details: 'HDFC Visa Platinum ending in 4321' }
  ]
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-12345',
    date: '2026-07-01',
    items: [
      {
        productId: 'p3',
        productTitle: 'OnePlus Nord CE 3 Lite 5G (128GB, Pastel Lime)',
        productImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=100&q=80',
        price: 17499,
        quantity: 1,
        selectedColor: 'Pastel Lime'
      }
    ],
    subtotal: 19999,
    discount: 2500,
    deliveryFee: 40,
    tax: 3150,
    total: 20689,
    address: 'Flat 402, Sunshine Heights, Jubilee Hills, Hyderabad, Telangana - 500033',
    paymentMethod: 'UPI (mohanasiva@okhdfcbank)',
    status: 'Shipped',
    statusTimeline: [
      { status: 'Placed', date: '2026-07-01 10:30 AM', completed: true },
      { status: 'Packed', date: '2026-07-02 02:15 PM', completed: true },
      { status: 'Shipped', date: '2026-07-03 09:00 AM', completed: true },
      { status: 'Out for delivery', date: 'Pending', completed: false },
      { status: 'Delivered', date: 'Pending', completed: false }
    ]
  },
  {
    id: 'ORD-54321',
    date: '2026-06-15',
    items: [
      {
        productId: 'p8',
        productTitle: 'Tommy Hilfiger Slim Fit Polo Shirt',
        productImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=100&q=80',
        price: 3499,
        quantity: 2,
        selectedSize: 'L',
        selectedColor: 'Navy Blue'
      }
    ],
    subtotal: 9998,
    discount: 3000,
    deliveryFee: 0,
    tax: 1260,
    total: 8258,
    address: 'Flat 402, Sunshine Heights, Jubilee Hills, Hyderabad, Telangana - 500033',
    paymentMethod: 'Credit Card (HDFC Visa)',
    status: 'Delivered',
    statusTimeline: [
      { status: 'Placed', date: '2026-06-15 04:12 PM', completed: true },
      { status: 'Packed', date: '2026-06-15 08:30 PM', completed: true },
      { status: 'Shipped', date: '2026-06-16 10:00 AM', completed: true },
      { status: 'Out for delivery', date: '2026-06-17 11:30 AM', completed: true },
      { status: 'Delivered', date: '2026-06-17 03:45 PM', completed: true }
    ]
  }
];

export const MOCK_COUPONS = [
  { code: 'SMARTSHOP10', discountType: 'percentage', value: 10, description: '10% OFF on all products' },
  { code: 'AIPOWERED', discountType: 'flat', value: 1000, description: 'Flat ₹1,000 OFF on orders above ₹10,000' },
  { code: 'FREESHIP', discountType: 'flat', value: 40, description: 'Free delivery on your order' }
];

export const POPULAR_BRANDS = [
  { name: 'Apple', logo: '' },
  { name: 'Samsung', logo: 'SAMSUNG' },
  { name: 'OnePlus', logo: 'ONEPLUS' },
  { name: 'Dell', logo: 'DELL' },
  { name: 'Sony', logo: 'SONY' },
  { name: 'Nike', logo: 'NIKE' },
  { name: 'Adidas', logo: 'ADIDAS' },
  { name: 'LG', logo: 'LG' },
  { name: 'Dyson', logo: 'dyson' },
  { name: 'Zara', logo: 'ZARA' },
  { name: 'Levi\'s', logo: 'LEVI\'S' },
  { name: 'Tommy Hilfiger', logo: 'TOMMY' }
];
