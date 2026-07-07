import React, { useState, useEffect } from 'react';
import { Product, CartItem, Order, FilterState, UserProfile, OrderStatus } from './types';
import { MOCK_PRODUCTS, MOCK_USER, MOCK_ORDERS, MOCK_COUPONS, POPULAR_BRANDS } from './data';
import { ProductCard } from './components/ProductCard';
import { FilterPanel } from './components/FilterPanel';
import { ReviewSection } from './components/ReviewSection';
import { ComparisonSection } from './components/ComparisonSection';
import { ChatBot } from './components/ChatBot';
import GoogleChatSection from './components/GoogleChatSection';
import GmailSection from './components/GmailSection';
import {
  Sparkles,
  Search,
  Mic,
  ShoppingCart,
  Heart,
  User,
  Clock,
  ChevronRight,
  TrendingUp,
  Tag,
  MapPin,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  Sun,
  Moon,
  Laptop,
  Tv,
  Footprints,
  Shirt,
  Smartphone,
  Check,
  Bell,
  Trash2,
  Plus,
  Minus,
  Briefcase,
  Star,
  X,
  ArrowRightLeft,
  Home,
  ShoppingBag,
  MessageSquare,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation / Screens
  const [activeScreen, setActiveScreen] = useState<'splash' | 'onboarding' | 'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'wishlist' | 'orders' | 'profile' | 'google-chat' | 'gmail'>('splash');
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Core Data State (with standard local storage backup)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('ai_shop_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('ai_shop_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('ai_shop_orders');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(MOCK_USER);

  // Selected entities
  const [selectedProductId, setSelectedProductId] = useState<string>('p1');
  const [selectedProductImgIdx, setSelectedProductImgIdx] = useState(0);

  // Search, Filtering & Sorting State
  const initialFilterState: FilterState = {
    searchQuery: '',
    category: '',
    subCategories: [],
    brands: [],
    minPrice: 0,
    maxPrice: 150000,
    rating: null,
    discount: null,
    inStockOnly: false,
    ram: [],
    rom: [],
    processor: [],
    size: [],
    color: [],
  };
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [searchFocused, setSearchFocused] = useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);
  const [voiceSearchText, setVoiceSearchText] = useState('');

  // Coupon, Checkout & Preferences
  const [selectedCoupon, setSelectedCoupon] = useState<string>('');
  const [selectedAddressId, setSelectedAddressId] = useState<string>('a1');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('pay1');
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ai_shop_dark');
    return saved === 'true' || saved === null;
  });

  // Countdown timer state
  const [countdown, setCountdown] = useState({ hrs: 2, mins: 14, secs: 45 });

  // Update localStorage when lists change
  useEffect(() => {
    localStorage.setItem('ai_shop_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ai_shop_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('ai_shop_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('ai_shop_dark', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Flash Sale Countdown Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) {
          return { ...prev, secs: prev.secs - 1 };
        } else if (prev.mins > 0) {
          return { ...prev, mins: prev.mins - 1, secs: 59 };
        } else if (prev.hrs > 0) {
          return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        } else {
          return { hrs: 3, mins: 0, secs: 0 }; // Restart countdown
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync current active product on detail screen
  const currentProduct = MOCK_PRODUCTS.find((p) => p.id === selectedProductId) || MOCK_PRODUCTS[0];

  // Voice Search Mocking
  const triggerVoiceSearch = () => {
    setIsVoiceSearching(true);
    setVoiceSearchText('Aria is listening...');

    // Simulate speech transcription steps
    setTimeout(() => {
      setVoiceSearchText('"running shoes under 5000"');
    }, 1500);

    setTimeout(() => {
      setVoiceSearchText('"applying filters for Footwear..."');
    }, 3000);

    setTimeout(() => {
      setIsVoiceSearching(false);
      // Actually apply filters based on transcription
      setFilters((prev) => ({
        ...prev,
        category: 'Footwear',
        maxPrice: 5000,
        searchQuery: '',
      }));
      setActiveScreen('products');
    }, 4200);
  };

  // Chat Actions parser (derived from Aria responses)
  const handleChatActionTriggered = (actionType: string, payload: any) => {
    if (!payload) return;

    if (actionType === 'navigate') {
      const screen = payload.screen;
      if (screen === 'product' && payload.productId) {
        setSelectedProductId(payload.productId);
        setSelectedProductImgIdx(0);
        setActiveScreen('product-detail');
      } else if (screen === 'cart') {
        setActiveScreen('cart');
      } else if (screen === 'orders') {
        setActiveScreen('orders');
      } else if (screen === 'products') {
        setActiveScreen('products');
      } else if (screen === 'profile') {
        setActiveScreen('profile');
      } else if (screen === 'wishlist') {
        setActiveScreen('wishlist');
      } else if (screen === 'comparison') {
        // Find if we have payload productIds
        if (payload.productIds && payload.productIds.length > 0) {
          const list = MOCK_PRODUCTS.filter((p) => payload.productIds.includes(p.id));
          setCompareList(list);
        }
        // Force screen comparison
        // We'll show the comparison section inside home or listing, or as a detail tab. Let's handle comparison tray viewing below!
        setActiveScreen('home');
        // Scroll to compare tray
        setTimeout(() => {
          document.getElementById('compare-tray-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    } else if (actionType === 'apply_filter') {
      setFilters((prev) => ({
        ...prev,
        category: payload.category || prev.category,
        maxPrice: payload.maxPrice || prev.maxPrice,
        brands: payload.brands || prev.brands,
      }));
      setActiveScreen('products');
    } else if (actionType === 'add_to_cart') {
      const prod = MOCK_PRODUCTS.find((p) => p.id === payload.productId);
      if (prod) {
        handleAddToCart(prod);
      }
    } else if (actionType === 'compare_products') {
      if (payload.productIds && payload.productIds.length > 0) {
        const list = MOCK_PRODUCTS.filter((p) => payload.productIds.includes(p.id));
        setCompareList(list);
        // Navigate
        setActiveScreen('home');
        setTimeout(() => {
          document.getElementById('compare-tray-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  };

  // Helper Cart Handlers
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    // Provide visual trigger: fly-to-cart animation representation (short banner)
    const alertId = 'cart-toast-' + Date.now();
    const alertBox = document.createElement('div');
    alertBox.id = alertId;
    alertBox.className = 'fixed top-6 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold text-xs py-2.5 px-5 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce';
    alertBox.innerHTML = `🛒 Added "${product.title.split('(')[0]}" to Cart!`;
    document.body.appendChild(alertBox);
    setTimeout(() => {
      document.getElementById(alertId)?.remove();
    }, 2000);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Helper Wishlist Handlers
  const handleToggleWishlist = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Compare List Handlers
  const handleAddToCompare = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare a maximum of 4 products side by side.');
        return prev;
      }
      return [...prev, product];
    });
  };

  // Review Upvote helpful count hook
  const handleReviewHelpful = (reviewId: string) => {
    // We increment count in active selectedProduct local specs review state representation
    const updatedProducts = MOCK_PRODUCTS.map((p) => {
      const idx = p.reviews.findIndex((r) => r.id === reviewId);
      if (idx !== -1) {
        const copyReviews = [...p.reviews];
        copyReviews[idx] = { ...copyReviews[idx], helpfulCount: copyReviews[idx].helpfulCount + 1 };
        return { ...p, reviews: copyReviews };
      }
      return p;
    });
    // This maintains reactive upvotes on details view!
  };

  // Checkout Placement
  const handlePlaceOrder = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const activeCoupon = MOCK_COUPONS.find((c) => c.code === selectedCoupon);
    let discount = 0;
    if (activeCoupon) {
      discount = activeCoupon.discountType === 'percentage' ? (subtotal * activeCoupon.value) / 100 : activeCoupon.value;
    }
    const deliveryFee = subtotal > 5000 || selectedCoupon === 'FREESHIP' ? 0 : 40;
    const tax = Math.round((subtotal - discount) * 0.18);
    const total = subtotal - discount + deliveryFee + tax;

    const newOrder: Order = {
      id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: cart.map((item) => ({
        productId: item.product.id,
        productTitle: item.product.title,
        productImage: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
      })),
      subtotal,
      discount,
      deliveryFee,
      tax,
      total,
      address: userProfile.addresses.find((a) => a.id === selectedAddressId)?.street + ', Hyderabad',
      paymentMethod: userProfile.savedPaymentMethods.find((p) => p.id === selectedPaymentMethod)?.type + ' (' + userProfile.savedPaymentMethods.find((p) => p.id === selectedPaymentMethod)?.details + ')',
      status: 'Placed',
      statusTimeline: [
        { status: 'Placed', date: 'Just Now', completed: true },
        { status: 'Packed', date: 'Pending', completed: false },
        { status: 'Shipped', date: 'Pending', completed: false },
        { status: 'Out for delivery', date: 'Pending', completed: false },
        { status: 'Delivered', date: 'Pending', completed: false },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setSelectedCoupon('');
    setOrderSuccessId(newOrder.id);
  };

  // Master product filtering selector logic
  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    // Search Query (title or description or brand or category)
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const inTitle = product.title.toLowerCase().includes(q);
      const inDesc = product.description.toLowerCase().includes(q);
      const inBrand = product.brand.toLowerCase().includes(q);
      const inCat = product.category.toLowerCase().includes(q);
      if (!inTitle && !inDesc && !inBrand && !inCat) return false;
    }

    // Category
    if (filters.category && product.category !== filters.category) return false;

    // Price
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;

    // Brands List
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;

    // Customer Rating
    if (filters.rating !== null && product.rating < filters.rating) return false;

    // Discount percentage
    if (filters.discount !== null && product.discountPercentage < filters.discount) return false;

    // In Stock
    if (filters.inStockOnly && product.stock <= 0) return false;

    // Specifications (RAM, ROM, size)
    if (filters.ram.length > 0 && (!product.specs.ram || !filters.ram.includes(product.specs.ram))) return false;
    if (filters.rom.length > 0 && (!product.specs.rom || !filters.rom.includes(product.specs.rom))) return false;
    if (filters.size.length > 0 && (!product.specs.size || !filters.size.split?.(',').some(s => filters.size.includes(s.trim())))) {
      // Handle array or CSV checking for size
      const pSizes = product.specs.size ? product.specs.size.split(',').map(s => s.trim()) : [];
      const matches = pSizes.some(s => filters.size.includes(s));
      if (filters.size.length > 0 && !matches) return false;
    }

    return true;
  });

  // Master product sorting lookup logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
    if (sortBy === 'newest') return b.originalPrice - a.originalPrice; // Mocking newest with higher orig price for dynamic look
    return b.rating - a.rating; // Default 'popular'
  });

  // Calculate distinct brand list for current filters to populate FilterPanel
  const availableBrands = Array.from(new Set(MOCK_PRODUCTS.map((p) => p.brand)));

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'bg-[#020617] text-slate-100 dark' : 'bg-zinc-50 text-zinc-900'}`}>
      
      {/* 1. HEADER & BAR NAVIGATION */}
      {activeScreen !== 'splash' && (
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#020617]/95 backdrop-blur-md border-b border-zinc-150 dark:border-slate-800/80 py-3.5 px-4 sm:px-6 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* App Branding */}
            <div
              id="app-branding-header"
              onClick={() => { setActiveScreen('home'); setFilters(initialFilterState); }}
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-linear-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent">
                AI Shopping Assistant
              </h1>
            </div>

            {/* Smart Center Search Engine */}
            <div className="hidden md:flex flex-grow max-w-xl relative">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-zinc-400" />
                <input
                  id="header-catalog-search-input"
                  type="text"
                  placeholder="Ask Aria or search brands, laptops, smartphones..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs rounded-full bg-zinc-50 dark:bg-slate-900 border border-zinc-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 text-zinc-850 dark:text-slate-100 font-medium transition-all shadow-inner"
                />
                
                {/* Voice Search mic button */}
                <button
                  id="mic-search-trigger-btn"
                  onClick={triggerVoiceSearch}
                  className="absolute right-2.5 top-2 p-1 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-lg"
                  title="Search with Voice"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Autocomplete Overlay */}
              {searchFocused && filters.searchQuery && (
                <div className="absolute top-11 left-0 right-0 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 shadow-2xl rounded-2xl p-2 z-50 max-h-60 overflow-y-auto">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider p-2 block">
                    Product suggestions
                  </span>
                  {MOCK_PRODUCTS.filter((p) => p.title.toLowerCase().includes(filters.searchQuery.toLowerCase()))
                    .slice(0, 5)
                    .map((p) => (
                      <div
                        id={`autocomplete-item-${p.id}`}
                        key={p.id}
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setSelectedProductImgIdx(0);
                          setActiveScreen('product-detail');
                        }}
                        className="flex items-center gap-2.5 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-950 rounded-xl cursor-pointer"
                      >
                        <img src={p.images[0]} alt={p.title} className="w-8 h-8 object-cover rounded-md" referrerPolicy="no-referrer" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{p.title}</p>
                          <span className="text-[10px] text-zinc-400">{p.brand} • ₹{p.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Header Interactions */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              
              {/* Wallet Info (Design mockup style) */}
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black leading-tight">Wallet</span>
                <span className="text-xs sm:text-sm font-semibold font-mono text-zinc-800 dark:text-slate-100">₹1,45,200.00</span>
              </div>

              {/* Notification Bell (Design mockup style) */}
              <button
                className="relative p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white transition-all hover:bg-zinc-50 dark:hover:bg-slate-800/60"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white dark:border-[#020617]" />
              </button>
              
              {/* Dark Mode Switch */}
              <button
                id="dark-mode-toggle-header"
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
              </button>

              {/* Wishlist Link */}
              <button
                id="wishlist-header-link"
                onClick={() => setActiveScreen('wishlist')}
                className={`p-2 rounded-xl relative transition-colors ${
                  activeScreen === 'wishlist'
                    ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/45'
                    : 'text-zinc-500 hover:text-rose-500 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
              >
                <Heart className="w-4.5 h-4.5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart Basket Link */}
              <button
                id="cart-header-link"
                onClick={() => setActiveScreen('cart')}
                className={`p-2 rounded-xl relative transition-colors ${
                  activeScreen === 'cart'
                    ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/45'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 dark:bg-indigo-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Orders Link */}
              <button
                id="orders-header-link"
                onClick={() => setActiveScreen('orders')}
                className={`p-2 rounded-xl relative transition-colors ${
                  activeScreen === 'orders'
                    ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/45'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
                title="Your Orders"
              >
                <Clock className="w-4.5 h-4.5" />
              </button>

              {/* Google Chat Link */}
              <button
                id="google-chat-header-link"
                onClick={() => setActiveScreen('google-chat')}
                className={`p-2 rounded-xl relative transition-colors ${
                  activeScreen === 'google-chat'
                    ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/45'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
                title="Google Chat Team Workspace"
              >
                <MessageSquare className="w-4.5 h-4.5" />
              </button>

              {/* Gmail Link */}
              <button
                id="gmail-header-link"
                onClick={() => setActiveScreen('gmail')}
                className={`p-2 rounded-xl relative transition-colors ${
                  activeScreen === 'gmail'
                    ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/45'
                    : 'text-zinc-500 hover:text-indigo-600 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
                title="Gmail Workspace"
              >
                <Mail className="w-4.5 h-4.5" />
              </button>

              {/* Profile Screen */}
              <button
                id="profile-header-link"
                onClick={() => setActiveScreen('profile')}
                className={`p-2 rounded-xl transition-colors ${
                  activeScreen === 'profile'
                    ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/45'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                }`}
              >
                <User className="w-4.5 h-4.5" />
              </button>
            </div>

          </div>
        </header>
      )}

      {/* VOICE SEARCH MIC DIALOG OVERLAY */}
      <AnimatePresence>
        {isVoiceSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center text-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-sm w-full border border-zinc-100 dark:border-zinc-800 shadow-2xl flex flex-col items-center gap-6"
            >
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-indigo-600/20 animate-ping" />
                <div className="bg-indigo-600 text-white p-6 rounded-full shadow-lg relative">
                  <Mic className="w-8 h-8" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">AI Voice Assistant Listening</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Speak clearly into your microphone...</p>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-950 px-5 py-3 rounded-2xl w-full">
                <span className="text-sm font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {voiceSearchText}
                </span>
              </div>
              <button
                onClick={() => setIsVoiceSearching(false)}
                className="text-xs font-bold text-rose-500 hover:underline mt-2"
              >
                Cancel Voice Search
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. CORE SCREEN VIEWER PORTAL */}
      <div className="flex flex-grow relative overflow-hidden flex-row">
        {activeScreen !== 'splash' && activeScreen !== 'onboarding' && (
          <aside className="hidden md:flex w-20 border-r border-slate-200/85 dark:border-slate-800/80 flex-col items-center py-6 gap-8 bg-white dark:bg-[#020617] shrink-0 sticky top-20 h-[calc(100vh-80px)] z-20">
            {/* Logo / Branding */}
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveScreen('home')}>
              <span className="font-bold text-xl text-white">AI</span>
            </div>
            
            {/* Navigation Items */}
            <nav className="flex flex-col gap-6">
              <button
                onClick={() => setActiveScreen('home')}
                className={`p-3 rounded-xl transition-all ${activeScreen === 'home' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                title="Home"
              >
                <Home className="w-5.5 h-5.5" />
              </button>
              <button
                onClick={() => { setFilters(initialFilterState); setActiveScreen('products'); }}
                className={`p-3 rounded-xl transition-all ${activeScreen === 'products' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                title="Catalog"
              >
                <ShoppingBag className="w-5.5 h-5.5" />
              </button>
              <button
                onClick={() => setActiveScreen('cart')}
                className={`p-3 rounded-xl relative transition-all ${activeScreen === 'cart' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                title="Cart"
              >
                <ShoppingCart className="w-5.5 h-5.5" />
                {cart.length > 0 && (
                  <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveScreen('wishlist')}
                className={`p-3 rounded-xl relative transition-all ${activeScreen === 'wishlist' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                title="Wishlist"
              >
                <Heart className="w-5.5 h-5.5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveScreen('orders')}
                className={`p-3 rounded-xl transition-all ${activeScreen === 'orders' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                title="Orders"
              >
                <Clock className="w-5.5 h-5.5" />
              </button>
              <button
                onClick={() => setActiveScreen('google-chat')}
                className={`p-3 rounded-xl transition-all ${activeScreen === 'google-chat' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                title="Google Chat Team Workspace"
              >
                <MessageSquare className="w-5.5 h-5.5" />
              </button>
              <button
                onClick={() => setActiveScreen('gmail')}
                className={`p-3 rounded-xl transition-all ${activeScreen === 'gmail' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                title="Gmail Workspace"
              >
                <Mail className="w-5.5 h-5.5" />
              </button>
              <button
                onClick={() => setActiveScreen('profile')}
                className={`p-3 rounded-xl transition-all ${activeScreen === 'profile' ? 'bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
                title="Profile"
              >
                <User className="w-5.5 h-5.5" />
              </button>
            </nav>

            {/* Profile Avatar */}
            <div className="mt-auto mb-2 cursor-pointer group" onClick={() => setActiveScreen('profile')} title="View Profile">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-indigo-500 overflow-hidden transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
              </div>
            </div>
          </aside>
        )}

        <div className="flex-grow flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950/40">
          <main className="flex-grow">
            <AnimatePresence mode="wait">
          
          {/* --- A. SPLASH SCREEN --- */}
          {activeScreen === 'splash' && (
            <motion.div
              key="splash-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-linear-to-br from-indigo-950 via-zinc-950 to-zinc-900 text-white flex flex-col justify-between p-6 overflow-hidden relative"
            >
              {/* Background gradient lights */}
              <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-500/15 filter blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-teal-500/10 filter blur-3xl" />

              {/* Top details */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-bold font-mono tracking-wider text-indigo-300 uppercase">
                    Aria Intelligent Retail v3.5
                  </span>
                </div>
                <button
                  onClick={() => setActiveScreen('home')}
                  className="text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-800 px-3 py-1 rounded-full backdrop-blur-xs transition-colors"
                >
                  Skip to Shop
                </button>
              </div>

              {/* Middle core branding */}
              <div className="flex flex-col items-center justify-center text-center max-w-xl mx-auto z-10 gap-6 my-auto">
                <motion.div
                  initial={{ scale: 0.8, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                  className="bg-indigo-600 text-white p-5 rounded-3xl shadow-2xl shadow-indigo-500/20"
                >
                  <Sparkles className="w-12 h-12 text-amber-300 fill-current" />
                </motion.div>

                <div>
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display"
                  >
                    AI Shopping Assistant
                  </motion.h2>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-zinc-400 mt-3 max-w-md mx-auto leading-relaxed"
                  >
                    Experience the future of personalized e-commerce. Chat with Aria to look up, compare, and buy products in real-time.
                  </motion.p>
                </div>

                <motion.button
                  id="splash-get-started-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveScreen('onboarding')}
                  className="bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-black text-xs px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 tracking-wider uppercase mt-4 flex items-center gap-2 cursor-pointer"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Bottom footer specs */}
              <div className="text-center text-[10px] text-zinc-500 font-mono z-10">
                AI SHOPPING ASSISTANT INC. • PRIVACY POLICY • SECURED VIA SSL
              </div>
            </motion.div>
          )}

          {/* --- B. ONBOARDING SCREEN --- */}
          {activeScreen === 'onboarding' && (
            <motion.div
              key="onboarding-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen bg-zinc-900 text-white flex flex-col justify-between p-6"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold font-mono tracking-wider text-indigo-400 uppercase">
                  Step {onboardingIndex + 1} of 3
                </span>
                <button
                  onClick={() => setActiveScreen('home')}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Skip
                </button>
              </div>

              <div className="max-w-md mx-auto my-auto text-center flex flex-col items-center gap-6">
                <AnimatePresence mode="wait">
                  {onboardingIndex === 0 && (
                    <motion.div
                      key="slide0"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-indigo-400 fill-current" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-display">Conversational AI</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Aria helps you find exactly what you need. Just ask questions about camera quality, specifications, review summaries, or tracking details.
                      </p>
                    </motion.div>
                  )}

                  {onboardingIndex === 1 && (
                    <motion.div
                      key="slide1"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="w-20 h-20 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-3xl flex items-center justify-center">
                        <ArrowRightLeft className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-display">Side-by-Side Comparison</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Compare up to 4 items in our interactive comparative layout. Easily see the superior specs highlighted and read Aria's dynamic recommendations.
                      </p>
                    </motion.div>
                  )}

                  {onboardingIndex === 2 && (
                    <motion.div
                      key="slide2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center">
                        <Tag className="w-10 h-10" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold font-display">Best Deals & Coupons</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        We feature exclusive coupon discounts, custom-bundled accessories, and daily flash sales. Save big with automated coupon calculations at checkout.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="flex gap-2 justify-center mt-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        onboardingIndex === i ? 'w-6 bg-indigo-500' : 'w-1.5 bg-zinc-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center max-w-md w-full mx-auto">
                {onboardingIndex > 0 ? (
                  <button
                    onClick={() => setOnboardingIndex(onboardingIndex - 1)}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  id="onboarding-next-btn"
                  onClick={() => {
                    if (onboardingIndex < 2) {
                      setOnboardingIndex(onboardingIndex + 1);
                    } else {
                      setActiveScreen('home');
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  {onboardingIndex === 2 ? 'Let\'s Shop' : 'Next'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* --- C. HOME SCREEN --- */}
          {activeScreen === 'home' && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8"
            >
              {/* Home search bar (Mobile only) */}
              <div className="flex md:hidden relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input
                  id="home-search-mobile"
                  type="text"
                  placeholder="Search products or talk to Aria..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  onFocus={() => { setActiveScreen('products'); }}
                  className="w-full pl-9 pr-10 py-1.5 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200"
                />
                <button onClick={triggerVoiceSearch} className="absolute right-2.5 top-2 text-indigo-600">
                  <Mic className="w-4 h-4" />
                </button>
              </div>

              {/* Categories Navigation Bar */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { name: 'Mobiles', icon: Smartphone, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400' },
                  { name: 'Laptops', icon: Laptop, color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400' },
                  { name: 'Fashion', icon: Shirt, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' },
                  { name: 'Home Appliances', icon: Tv, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' },
                  { name: 'Footwear', icon: Footprints, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' }
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      id={`cat-shortcut-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                      key={cat.name}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, category: cat.name }));
                        setActiveScreen('products');
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all border border-zinc-150/40 dark:border-zinc-850 hover:scale-[1.02] cursor-pointer ${cat.color}`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Flash Deals countdown timer banner */}
              <div className="bg-linear-to-r from-amber-500 via-orange-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
                
                <div className="flex flex-col gap-1 z-10 text-center md:text-left">
                  <span className="bg-white/25 text-white font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-full w-max mx-auto md:mx-0">
                    Mega AI Flash Sale
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight mt-1.5">
                    Premium Tech & Wearables at up to 40% OFF
                  </h3>
                  <p className="text-xs text-white/85 max-w-sm mt-1">
                    Powered by Aria, configure your target specs in chat to get customized coupon reductions instantly!
                  </p>
                </div>

                {/* Countdown Box */}
                <div className="flex items-center gap-4 bg-black/35 backdrop-blur-md p-4 rounded-2xl border border-white/10 z-10 shrink-0">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black">{String(countdown.hrs).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-60 font-medium">Hours</span>
                  </div>
                  <span className="text-lg font-black animate-pulse">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black">{String(countdown.mins).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-60 font-medium">Mins</span>
                  </div>
                  <span className="text-lg font-black animate-pulse">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black">{String(countdown.secs).padStart(2, '0')}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-60 font-medium">Secs</span>
                  </div>
                </div>
              </div>

              {/* Compare List Tray Section (If active items) */}
              <div id="compare-tray-section" className="scroll-mt-24">
                {compareList.length > 0 && (
                  <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/40 rounded-3xl p-6 flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                        <div>
                          <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
                            Comparison Tray ({compareList.length} / 4)
                          </h3>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            Compare specifications and view Aria's AI recommendations.
                          </p>
                        </div>
                      </div>
                      <button
                        id="clear-compare-tray-btn"
                        onClick={() => setCompareList([])}
                        className="text-xs font-semibold text-rose-500 hover:underline"
                      >
                        Reset Tray
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {compareList.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 bg-white dark:bg-slate-900/50 p-2.5 rounded-xl border border-zinc-150 dark:border-slate-800 shadow-xs relative"
                        >
                          <img src={p.images[0]} alt={p.title} className="w-10 h-10 object-cover rounded-lg shrink-0" referrerPolicy="no-referrer" />
                          <div className="min-w-0 flex-grow">
                            <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{p.title}</h4>
                            <span className="text-[10px] text-indigo-600 font-bold">₹{p.price.toLocaleString('en-IN')}</span>
                          </div>
                          <button
                            id={`remove-compare-tray-btn-${p.id}`}
                            onClick={() => handleAddToCompare(p)}
                            className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-zinc-100 hover:bg-rose-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {compareList.length >= 2 && (
                      <div className="pt-2 border-t border-indigo-100/50 dark:border-indigo-900/30">
                        <ComparisonSection
                          compareProducts={compareList}
                          onRemoveFromCompare={(id) => setCompareList(prev => prev.filter(x => x.id !== id))}
                          onAddToCart={handleAddToCart}
                          onNavigateToProduct={(id) => { setSelectedProductId(id); setSelectedProductImgIdx(0); setActiveScreen('product-detail'); }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recommended Row */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-black font-display tracking-tight">Recommended For You</h3>
                  </div>
                  <button
                    onClick={() => { setFilters(initialFilterState); setActiveScreen('products'); }}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    View Catalog <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_PRODUCTS.filter((p) => p.featured)
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onNavigate={(id) => { setSelectedProductId(id); setSelectedProductImgIdx(0); setActiveScreen('product-detail'); }}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                        onAddToCompare={handleAddToCompare}
                        isComparing={compareList.some((x) => x.id === product.id)}
                      />
                    ))}
                </div>
              </div>

              {/* Trending Row */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-base font-black font-display tracking-tight">Trending Now</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_PRODUCTS.filter((p) => p.trending)
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onNavigate={(id) => { setSelectedProductId(id); setSelectedProductImgIdx(0); setActiveScreen('product-detail'); }}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                        onAddToCompare={handleAddToCompare}
                        isComparing={compareList.some((x) => x.id === product.id)}
                      />
                    ))}
                </div>
              </div>

              {/* Top Brands Showcase */}
              <div className="flex flex-col gap-4 pt-4 border-t border-zinc-100 dark:border-slate-800">
                <h3 className="text-base font-black font-display tracking-tight">Shop by Brand</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {POPULAR_BRANDS.map((brand) => (
                    <button
                      id={`brand-showcase-btn-${brand.name.toLowerCase().replace(/\s+/g, '-')}`}
                      key={brand.name}
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, brands: [brand.name] }));
                        setActiveScreen('products');
                      }}
                      className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900/50 border border-zinc-150 dark:border-slate-800 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer text-center"
                    >
                      <span className="text-sm font-black font-display tracking-wider text-indigo-600 dark:text-indigo-400">
                        {brand.logo}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500 mt-1">
                        {brand.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* --- D. PRODUCT LISTING SCREEN --- */}
          {activeScreen === 'products' && (
            <motion.div
              key="products-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Filters Sidebar */}
                <div className="lg:col-span-3">
                  <FilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    availableBrands={availableBrands}
                    onClearAll={() => setFilters(initialFilterState)}
                    resultCount={sortedProducts.length}
                    viewMode="grid"
                    setViewMode={() => {}}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                  />
                </div>

                {/* Listing Results */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                  
                  {/* Sorting Header */}
                  <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-2xl p-4 shadow-xs">
                    <div className="text-xs text-zinc-500 font-semibold">
                      {filters.category ? `Category: ${filters.category}` : 'All Products'}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-500">Sort By</span>
                      <select
                        id="sort-products-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 font-medium focus:outline-hidden"
                      >
                        <option value="popular">Popularity</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Average Rating</option>
                        <option value="discount">Biggest Discount</option>
                        <option value="newest">New Arrivals</option>
                      </select>
                    </div>
                  </div>

                  {/* Products Grid */}
                  {sortedProducts.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center gap-3">
                      <p className="text-sm font-semibold text-zinc-500">No matching products found.</p>
                      <button
                        id="listing-reset-filters-btn"
                        onClick={() => setFilters(initialFilterState)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl"
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onNavigate={(id) => { setSelectedProductId(id); setSelectedProductImgIdx(0); setActiveScreen('product-detail'); }}
                          onAddToCart={handleAddToCart}
                          onToggleWishlist={handleToggleWishlist}
                          isWishlisted={wishlist.includes(product.id)}
                          onAddToCompare={handleAddToCompare}
                          isComparing={compareList.some((x) => x.id === product.id)}
                        />
                      ))}
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* --- E. PRODUCT DETAIL SCREEN --- */}
          {activeScreen === 'product-detail' && (
            <motion.div
              key="product-detail-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-8"
            >
              {/* Back breadcrumb */}
              <div>
                <button
                  id="back-to-catalog-btn"
                  onClick={() => setActiveScreen('home')}
                  className="text-xs font-bold text-zinc-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Home
                </button>
              </div>

              {/* Core Detail Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Image Gallery & Carousel */}
                <div className="md:col-span-5 flex flex-col gap-4">
                  <div className="aspect-square w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 overflow-hidden relative shadow-sm">
                    <img
                      src={currentProduct.images[selectedProductImgIdx] || currentProduct.images[0]}
                      alt={currentProduct.title}
                      className="object-cover w-full h-full"
                      referrerPolicy="no-referrer"
                    />

                    {/* Badge */}
                    {currentProduct.discountPercentage > 15 && (
                      <span className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-black px-3 py-1 rounded-full">
                        {currentProduct.discountPercentage}% OFF Deal
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {currentProduct.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {currentProduct.images.map((img, i) => (
                        <button
                          id={`img-thumb-${i}`}
                          key={i}
                          onClick={() => setSelectedProductImgIdx(i)}
                          className={`w-16 h-16 rounded-xl border-2 overflow-hidden bg-white shrink-0 ${
                            selectedProductImgIdx === i ? 'border-indigo-600' : 'border-transparent opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="thumb" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Title, pricing, features, cart adds */}
                <div className="md:col-span-7 flex flex-col gap-5">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1.5 block">
                      {currentProduct.brand} • {currentProduct.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                      {currentProduct.title}
                    </h2>
                  </div>

                  {/* Stars summary */}
                  <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {currentProduct.rating}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      ({currentProduct.reviews.length} customer ratings)
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      In Stock ({currentProduct.stock} available)
                    </span>
                  </div>

                  {/* Pricing details */}
                  <div className="flex flex-col bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850/60">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100">
                        ₹{currentProduct.price.toLocaleString('en-IN')}
                      </span>
                      {currentProduct.discountPercentage > 0 && (
                        <span className="text-sm text-zinc-400 line-through">
                          ₹{currentProduct.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1.5">
                      EMI starts at ₹{Math.round(currentProduct.price / 12).toLocaleString('en-IN')}/month. No cost EMI available.
                    </span>
                  </div>

                  {/* Quick features specs layout */}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Brief Specifications
                    </h4>
                    <div className="grid grid-cols-2 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-150 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-450">
                      {currentProduct.specs.ram && (
                        <span>RAM: <strong className="text-zinc-800 dark:text-zinc-200">{currentProduct.specs.ram}</strong></span>
                      )}
                      {currentProduct.specs.rom && (
                        <span>Storage: <strong className="text-zinc-800 dark:text-zinc-200">{currentProduct.specs.rom}</strong></span>
                      )}
                      {currentProduct.specs.processor && (
                        <span className="col-span-2">CPU: <strong className="text-zinc-800 dark:text-zinc-200">{currentProduct.specs.processor}</strong></span>
                      )}
                      {currentProduct.specs.display && (
                        <span className="col-span-2">Display: <strong className="text-zinc-800 dark:text-zinc-200">{currentProduct.specs.display}</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Button row */}
                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <motion.button
                      id="details-add-to-cart"
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleAddToCart(currentProduct, e)}
                      className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-black uppercase px-6 py-3.5 rounded-2xl flex-grow shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" /> Add to Cart
                    </motion.button>

                    <button
                      id="details-add-to-compare"
                      onClick={() => handleAddToCompare(currentProduct)}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        compareList.some(x => x.id === currentProduct.id)
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-400 dark:text-indigo-400 font-bold'
                          : 'border-zinc-200 text-zinc-600 dark:border-zinc-800 hover:bg-zinc-50'
                      }`}
                      title="Compare specs side-by-side"
                    >
                      <ArrowRightLeft className="w-4.5 h-4.5" />
                    </button>

                    <button
                      id="details-add-to-wishlist"
                      onClick={() => handleToggleWishlist(currentProduct.id)}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        wishlist.includes(currentProduct.id)
                          ? 'bg-rose-50 border-rose-300 text-rose-500 dark:bg-rose-950/40 dark:border-rose-900'
                          : 'border-zinc-200 text-zinc-600 dark:border-zinc-800 hover:bg-zinc-50'
                      }`}
                      title="Save to wishlist"
                    >
                      <Heart className={`w-4.5 h-4.5 ${wishlist.includes(currentProduct.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Ask AI Trigger */}
                  <div className="bg-indigo-500/10 dark:bg-indigo-500/5 p-4 rounded-3xl border border-indigo-500/15 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-150">Ask Aria about this product</h4>
                        <p className="text-[10px] text-zinc-500">Get review summaries, performance analysis, or size help conversationally.</p>
                      </div>
                    </div>
                    <button
                      id="details-ask-aria-btn"
                      onClick={() => {
                        // Triggers floating chatbot toggle
                        const el = document.getElementById('chatbot-toggle-floating-btn');
                        if (el) el.click();
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl cursor-pointer shrink-0"
                    >
                      Chat Now
                    </button>
                  </div>

                </div>

              </div>

              {/* Frequently Bought Together Bundle */}
              <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl p-6 border border-zinc-150 dark:border-zinc-800/80">
                <h3 className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 tracking-wider mb-4">
                  Frequently Bought Together
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-zinc-100">
                      <img src={currentProduct.images[0]} alt="p1" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                    </div>
                    <span className="font-extrabold text-zinc-450">+</span>
                    {/* Bundle item - let's pair with Sony headphones (id: p17) or casual shirt depending on category */}
                    {(() => {
                      const bundleItem = currentProduct.category === 'Mobiles' || currentProduct.category === 'Laptops'
                        ? MOCK_PRODUCTS.find(p => p.id === 'p17') || MOCK_PRODUCTS[5]
                        : MOCK_PRODUCTS.find(p => p.id === 'p10') || MOCK_PRODUCTS[3];
                      
                      return (
                        <>
                          <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-zinc-100">
                            <img src={bundleItem.images[0]} alt="bundle" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              Accessory Bundle ({currentProduct.brand} Premium Companion)
                            </h4>
                            <p className="text-[10px] text-zinc-500">Includes {currentProduct.title.split('(')[0].trim()} + {bundleItem.title.split('(')[0].trim()}</p>
                          </div>
                          <div className="md:ml-auto text-center md:text-right shrink-0">
                            <div className="flex items-baseline gap-1.5 justify-center md:justify-end">
                              <span className="text-sm font-black text-zinc-950 dark:text-zinc-50">
                                ₹{(currentProduct.price + bundleItem.price - 2000).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-zinc-450 line-through">
                                ₹{(currentProduct.price + bundleItem.price).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <button
                              id={`add-bundle-btn-${currentProduct.id}`}
                              onClick={() => {
                                handleAddToCart(currentProduct);
                                handleAddToCart(bundleItem);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl mt-1"
                            >
                              Add Bundle to Cart
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Specifications Table Detail */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-150 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  Full Technical Specifications
                </h3>
                <table className="w-full text-left text-xs divide-y divide-zinc-100 dark:divide-zinc-800">
                  <tbody>
                    {Object.entries(currentProduct.specs).map(([key, val]) => (
                      <tr key={key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20">
                        <td className="py-3 px-2 font-semibold text-zinc-500 w-1/3 uppercase tracking-wider text-[10px]">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </td>
                        <td className="py-3 px-2 font-bold text-zinc-800 dark:text-zinc-200">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Reviews Summary Section */}
              <ReviewSection
                product={currentProduct}
                onHelpfulClick={handleReviewHelpful}
              />

              {/* Related/Similar row */}
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-black font-display tracking-tight">Similar Products You May Like</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_PRODUCTS.filter((p) => p.category === currentProduct.category && p.id !== currentProduct.id)
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onNavigate={(id) => { setSelectedProductId(id); setSelectedProductImgIdx(0); setActiveScreen('product-detail'); }}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={handleToggleWishlist}
                        isWishlisted={wishlist.includes(product.id)}
                        onAddToCompare={handleAddToCompare}
                        isComparing={compareList.some((x) => x.id === product.id)}
                      />
                    ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* --- F. CART SCREEN --- */}
          {activeScreen === 'cart' && (
            <motion.div
              key="cart-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
            >
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                Shopping Cart
                <span className="text-xs font-semibold text-zinc-400">
                  ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
                </span>
              </h2>

              {cart.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 rounded-full flex items-center justify-center text-zinc-400">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Your shopping cart is empty</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Looks like you haven't added anything here yet.</p>
                  </div>
                  <button
                    id="cart-continue-shopping"
                    onClick={() => setActiveScreen('home')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Cart Item list */}
                  <div className="lg:col-span-8 flex flex-col gap-4">
                    {cart.map((item) => (
                      <div
                        id={`cart-item-row-${item.product.id}`}
                        key={item.product.id}
                        className="flex gap-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 p-4 rounded-2xl shadow-xs"
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded-xl border border-zinc-100"
                          referrerPolicy="no-referrer"
                        />
                        
                        <div className="flex-grow min-w-0">
                          <h4
                            onClick={() => { setSelectedProductId(item.product.id); setSelectedProductImgIdx(0); setActiveScreen('product-detail'); }}
                            className="text-xs sm:text-sm font-bold text-zinc-850 dark:text-zinc-150 truncate hover:text-indigo-600 cursor-pointer"
                          >
                            {item.product.title}
                          </h4>
                          <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                            {item.product.brand}
                          </span>

                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-800 dark:text-zinc-100">
                            <span className="font-bold">₹{item.product.price.toLocaleString('en-IN')}</span>
                            {item.product.discountPercentage > 0 && (
                              <span className="text-[10px] text-zinc-400 line-through">
                                ₹{item.product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity, Delete, actions */}
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <button
                            id={`delete-cart-row-btn-${item.product.id}`}
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="p-1.5 rounded-lg text-zinc-450 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="flex items-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1">
                            <button
                              id={`minus-qty-btn-${item.product.id}`}
                              onClick={() => handleUpdateCartQuantity(item.product.id, -1)}
                              className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-zinc-800 dark:text-zinc-100">
                              {item.quantity}
                            </span>
                            <button
                              id={`plus-qty-btn-${item.product.id}`}
                              onClick={() => handleUpdateCartQuantity(item.product.id, 1)}
                              className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Summary Breakdown panel */}
                  <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col gap-5">
                    <h3 className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-300 tracking-wider">
                      Price Details
                    </h3>

                    {/* Coupons input */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-zinc-400">Apply Promo Coupon</span>
                      <div className="flex gap-2">
                        <select
                          id="coupon-select-dropdown"
                          value={selectedCoupon}
                          onChange={(e) => setSelectedCoupon(e.target.value)}
                          className="flex-grow text-xs px-2.5 py-1.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 rounded-xl"
                        >
                          <option value="">-- Choose Code --</option>
                          {MOCK_COUPONS.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.code} ({c.description})
                            </option>
                          ))}
                        </select>
                        {selectedCoupon && (
                          <button
                            id="reset-coupon-btn"
                            onClick={() => setSelectedCoupon('')}
                            className="text-xs font-bold text-rose-500"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 text-xs pb-3 border-b border-zinc-150 dark:border-zinc-850 text-zinc-650 dark:text-zinc-400">
                      <div className="flex justify-between">
                        <span>Bag Subtotal</span>
                        <span className="font-bold">
                          ₹{cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {selectedCoupon && (
                        <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                          <span>Coupon Discount ({selectedCoupon})</span>
                          <span className="font-bold">
                            -₹{(() => {
                              const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                              const c = MOCK_COUPONS.find(x => x.code === selectedCoupon);
                              if (!c) return 0;
                              return c.discountType === 'percentage' ? (subtotal * c.value) / 100 : c.value;
                            })().toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Estimated Shipping</span>
                        <span className="font-bold">
                          {(() => {
                            const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                            return subtotal > 5000 || selectedCoupon === 'FREESHIP' ? (
                              <span className="text-emerald-600 font-bold">FREE</span>
                            ) : (
                              '₹40'
                            );
                          })()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span>GST Tax (18%)</span>
                        <span className="font-bold">
                          ₹{(() => {
                            const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                            const c = MOCK_COUPONS.find(x => x.code === selectedCoupon);
                            const discount = c ? (c.discountType === 'percentage' ? (subtotal * c.value) / 100 : c.value) : 0;
                            return Math.round((subtotal - discount) * 0.18);
                          })().toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-zinc-100">
                      <span>Total Amount</span>
                      <span>
                        ₹{(() => {
                          const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                          const c = MOCK_COUPONS.find(x => x.code === selectedCoupon);
                          const discount = c ? (c.discountType === 'percentage' ? (subtotal * c.value) / 100 : c.value) : 0;
                          const deliveryFee = subtotal > 5000 || selectedCoupon === 'FREESHIP' ? 0 : 40;
                          const tax = Math.round((subtotal - discount) * 0.18);
                          return (subtotal - discount + deliveryFee + tax).toLocaleString('en-IN');
                        })()}
                      </span>
                    </div>

                    <motion.button
                      id="cart-proceed-checkout"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setActiveScreen('checkout')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase py-3.5 rounded-2xl tracking-wider shadow-md w-full mt-2 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Proceed to Checkout
                    </motion.button>
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* --- G. CHECKOUT SCREEN & SUCCESS STATE --- */}
          {activeScreen === 'checkout' && (
            <motion.div
              key="checkout-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
            >
              {orderSuccessId ? (
                // SUCCESS STATE PANEL WITH ANIMATION
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-md mx-auto flex flex-col items-center gap-4 my-8 shadow-2xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 dark:bg-emerald-950/40 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 fill-current" />
                  </motion.div>
                  
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">Order Placed Successfully!</h3>
                    <p className="text-xs text-indigo-600 font-bold mt-1">Reference ID: {orderSuccessId}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
                      Congratulations, your transaction is validated. Aria will notify you as soon as package updates are shipped.
                    </p>
                  </div>

                  <div className="flex gap-2 w-full mt-4">
                    <button
                      id="success-track-btn"
                      onClick={() => { setOrderSuccessId(null); setActiveScreen('orders'); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 rounded-xl flex-grow cursor-pointer"
                    >
                      Track Order
                    </button>
                    <button
                      id="success-shop-btn"
                      onClick={() => { setOrderSuccessId(null); setActiveScreen('home'); }}
                      className="border border-zinc-200 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300 hover:bg-zinc-50 text-xs font-bold py-3.5 rounded-xl flex-grow"
                    >
                      Home Screen
                    </button>
                  </div>
                </motion.div>
              ) : (
                // CORE CHECKOUT INTERFACE
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Checkout inputs */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Delivery address book */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <MapPin className="w-4.5 h-4.5 text-indigo-600" />
                        Select Shipping Address
                      </h3>
                      <div className="flex flex-col gap-3">
                        {userProfile.addresses.map((addr) => (
                          <label
                            id={`addr-label-${addr.id}`}
                            key={addr.id}
                            className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                              selectedAddressId === addr.id
                                ? 'border-indigo-600 bg-indigo-50/20'
                                : 'border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800'
                            }`}
                          >
                            <input
                              id={`addr-radio-${addr.id}`}
                              type="radio"
                              name="checkout_address"
                              checked={selectedAddressId === addr.id}
                              onChange={() => setSelectedAddressId(addr.id)}
                              className="mt-1 text-indigo-600"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-zinc-800 dark:text-zinc-200">{addr.name}</span>
                              <p className="text-zinc-500 dark:text-zinc-400 mt-1">{addr.street}</p>
                              <span className="text-zinc-400 font-semibold">{addr.city}, {addr.state} - {addr.zip}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Payment selections */}
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-xs">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                        <CreditCard className="w-4.5 h-4.5 text-indigo-600" />
                        Choose Payment Method
                      </h3>
                      <div className="flex flex-col gap-3">
                        {userProfile.savedPaymentMethods.map((pay) => (
                          <label
                            id={`pay-label-${pay.id}`}
                            key={pay.id}
                            className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                              selectedPaymentMethod === pay.id
                                ? 'border-indigo-600 bg-indigo-50/20'
                                : 'border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800'
                            }`}
                          >
                            <input
                              id={`pay-radio-${pay.id}`}
                              type="radio"
                              name="checkout_payment"
                              checked={selectedPaymentMethod === pay.id}
                              onChange={() => setSelectedPaymentMethod(pay.id)}
                              className="text-indigo-600"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-zinc-850 dark:text-zinc-150">{pay.type}</span>
                              <span className="text-zinc-400 ml-2 font-mono">{pay.details}</span>
                            </div>
                          </label>
                        ))}
                        <label
                          id="pay-label-cod"
                          className={`p-4 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${
                            selectedPaymentMethod === 'cod'
                              ? 'border-indigo-600 bg-indigo-50/20'
                              : 'border-zinc-100 hover:bg-zinc-50 dark:border-zinc-800'
                          }`}
                        >
                          <input
                            id="pay-radio-cod"
                            type="radio"
                            name="checkout_payment"
                            checked={selectedPaymentMethod === 'cod'}
                            onChange={() => setSelectedPaymentMethod('cod')}
                            className="text-indigo-600"
                          />
                          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-350">
                            Cash on Delivery (COD)
                          </div>
                        </label>
                      </div>
                    </div>

                  </div>

                  {/* Order summary panel */}
                  <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase text-zinc-700 tracking-wider">Order Summary</h3>
                    
                    {/* Cart previews */}
                    <div className="flex flex-col gap-3 max-h-40 overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex gap-2 items-center text-xs justify-between">
                          <span className="truncate flex-grow text-zinc-700 dark:text-zinc-300">{item.product.title.split('(')[0]} <b>x{item.quantity}</b></span>
                          <span className="font-bold shrink-0 text-zinc-800 dark:text-zinc-100">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 flex flex-col gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Delivery Address</span>
                        <span className="font-bold truncate max-w-[120px]">
                          {userProfile.addresses.find(a => a.id === selectedAddressId)?.street}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment</span>
                        <span className="font-bold">
                          {selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Wallet'}
                        </span>
                      </div>
                    </div>

                    <button
                      id="checkout-confirm-btn"
                      onClick={handlePlaceOrder}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase py-4 rounded-xl tracking-wider shadow-md w-full mt-2 cursor-pointer"
                    >
                      Confirm Order Payment
                    </button>
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* --- H. WISHLIST SCREEN --- */}
          {activeScreen === 'wishlist' && (
            <motion.div
              key="wishlist-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6"
            >
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
                Your Wishlist
                <span className="text-xs font-semibold text-zinc-400">
                  ({wishlist.length} saved)
                </span>
              </h2>

              {wishlist.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400">
                    <Heart className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">Wishlist is empty</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Tap the heart badge on product cards to add favorites here.</p>
                  </div>
                  <button
                    onClick={() => setActiveScreen('home')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_PRODUCTS.filter((p) => wishlist.includes(p.id)).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onNavigate={(id) => { setSelectedProductId(id); setSelectedProductImgIdx(0); setActiveScreen('product-detail'); }}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={true}
                      onAddToCompare={handleAddToCompare}
                      isComparing={compareList.some((x) => x.id === product.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* --- I. ORDERS SCREEN (TIMELINE STATUS) --- */}
          {activeScreen === 'orders' && (
            <motion.div
              key="orders-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6"
            >
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
                Purchase Order History
              </h2>

              {orders.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-12 text-center flex flex-col items-center gap-3">
                  <p className="text-sm font-semibold text-zinc-500">No order shipments found.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {orders.map((ord) => (
                    <div
                      id={`order-card-row-${ord.id}`}
                      key={ord.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl shadow-xs flex flex-col gap-5"
                    >
                      {/* Top meta info */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-zinc-900 dark:text-zinc-100">Order ID: {ord.id}</span>
                          <span className="text-zinc-400 font-semibold">{ord.date}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">Total Amount: ₹{ord.total.toLocaleString('en-IN')}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">{ord.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="flex flex-col gap-3">
                        {ord.items.map((it, i) => (
                          <div key={i} className="flex gap-3 items-center">
                            <img src={it.productImage} alt="it" className="w-10 h-10 object-cover rounded-lg border" />
                            <div className="text-xs">
                              <h4 className="font-bold text-zinc-800 dark:text-zinc-200">{it.productTitle}</h4>
                              <span className="text-zinc-400 font-medium">Quantity {it.quantity} • ₹{it.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* STATUS TIMELINE BAR */}
                      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-4">
                          Shipping Status Tracker
                        </span>
                        
                        <div className="grid grid-cols-5 text-center text-[10px] sm:text-xs">
                          {ord.statusTimeline.map((step, idx) => {
                            // Find active matching states
                            const statusesOrder: OrderStatus[] = ['Placed', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'];
                            const activeIdx = statusesOrder.indexOf(ord.status);
                            const completed = idx <= activeIdx;
                            const isCurrent = idx === activeIdx;

                            return (
                              <div key={idx} className="flex flex-col items-center gap-2 relative">
                                {/* Horizontal connector lines */}
                                {idx < 4 && (
                                  <div className={`absolute top-3.5 left-1/2 right-[-50%] h-0.5 z-0 ${
                                    idx < activeIdx ? 'bg-indigo-600' : 'bg-zinc-100 dark:bg-zinc-800'
                                  }`} />
                                )}

                                {/* Node point */}
                                <div className={`w-7.5 h-7.5 rounded-full flex items-center justify-center z-10 border-2 ${
                                  isCurrent
                                    ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse'
                                    : completed
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800'
                                }`}>
                                  {completed && !isCurrent ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                </div>

                                <div className="min-h-[25px]">
                                  <span className={`font-bold block ${completed ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'}`}>
                                    {step.status}
                                  </span>
                                  {step.date !== 'Pending' && (
                                    <span className="text-[9px] text-zinc-450 font-semibold">{step.date}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* --- J. PROFILE / ACCOUNT SCREEN --- */}
          {activeScreen === 'profile' && (
            <motion.div
              key="profile-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 py-6 max-w-2xl"
            >
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
                
                {/* User Info header */}
                <div className="flex items-center gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-850">
                  <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg">
                    MS
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">{userProfile.name}</h3>
                    <span className="text-xs text-zinc-450">{userProfile.email}</span>
                    <span className="text-[10px] text-zinc-400 font-mono font-semibold">{userProfile.phone}</span>
                  </div>
                </div>

                {/* Settings Block */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    App Preferences
                  </h4>

                  {/* Dark Mode toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150/40 dark:border-zinc-850 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Visual Theme</span>
                      <p className="text-[10px] text-zinc-450 mt-0.5">Toggle light or dark modes across screens.</p>
                    </div>
                    <button
                      id="profile-toggle-dark-mode"
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-5.5 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        darkMode ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          darkMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150/40 dark:border-zinc-850 rounded-2xl">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Sale Notifications</span>
                      <p className="text-[10px] text-zinc-450 mt-0.5">Receive alert logs for trending flash coupons.</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-2 py-0.5 rounded-full">
                      Always Enabled
                    </span>
                  </div>
                </div>

                {/* Addresses display */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Stored Shipping Locations
                  </h4>
                  {userProfile.addresses.map((ad) => (
                    <div key={ad.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-150/40 dark:border-zinc-850 text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-100">{ad.name}</span>
                      <p className="text-zinc-500 mt-1">{ad.street}, {ad.city} - {ad.zip}</p>
                    </div>
                  ))}
                </div>

                {/* Stored wallets */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    Saved Wallet Credentials
                  </h4>
                  {userProfile.savedPaymentMethods.map((pm) => (
                    <div key={pm.id} className="p-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-150/40 dark:border-zinc-850 text-xs flex justify-between">
                      <span className="font-bold text-zinc-800 dark:text-zinc-100">{pm.type}</span>
                      <span className="font-mono text-zinc-450">{pm.details}</span>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}

          {/* --- L. GOOGLE CHAT SCREEN --- */}
          {activeScreen === 'google-chat' && (
            <motion.div
              key="google-chat-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GoogleChatSection
                darkMode={darkMode}
                compareList={compareList}
                cart={cart}
                onNavigateToScreen={(screen) => setActiveScreen(screen as any)}
                onSelectProduct={(productId) => {
                  setSelectedProductId(productId);
                  setSelectedProductImgIdx(0);
                  setActiveScreen('product-detail');
                }}
              />
            </motion.div>
          )}

          {/* --- M. GMAIL SCREEN --- */}
          {activeScreen === 'gmail' && (
            <motion.div
              key="gmail-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GmailSection
                darkMode={darkMode}
                compareList={compareList}
                cart={cart}
                onNavigateToScreen={(screen) => setActiveScreen(screen as any)}
                onSelectProduct={(productId) => {
                  setSelectedProductId(productId);
                  setSelectedProductImgIdx(0);
                  setActiveScreen('product-detail');
                }}
              />
            </motion.div>
          )}

            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* --- K. GLOBALLY INJECTED CHATBOT COMPONENT --- */}
      {activeScreen !== 'splash' && (
        <ChatBot
          currentProduct={activeScreen === 'product-detail' ? currentProduct : null}
          cart={cart}
          orders={orders}
          onActionTriggered={handleChatActionTriggered}
          onAddToCartDirect={(p) => handleAddToCart(p)}
          onNavigateDirect={(screen, productId) => {
            if (screen === 'product' && productId) {
              setSelectedProductId(productId);
              setSelectedProductImgIdx(0);
              setActiveScreen('product-detail');
            } else {
              setActiveScreen(screen as any);
            }
          }}
          darkMode={darkMode}
        />
      )}

      {/* 3. APP FOOTER */}
      {activeScreen !== 'splash' && (
        <footer className="bg-zinc-900 text-zinc-400 text-xs py-8 px-4 sm:px-6 border-t border-zinc-800 mt-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-white font-black text-sm">
                <Sparkles className="w-5 h-5 text-indigo-500 fill-current" />
                AI Shopping Assistant
              </div>
              <p className="text-[11px] leading-relaxed max-w-sm">
                A premium conversational e-commerce engine pairing state-of-the-art LLM retrieval with responsive specification comparisons and deal-making.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white font-bold text-xs">Customer Support Hub</span>
              <ul className="text-[11px] flex flex-col gap-1">
                <li>Mock Tracking and Returns</li>
                <li>Secure SSL Gateway</li>
                <li>Aria Live Chat Console Available 24/7</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-white font-bold text-xs">Aria Promo Coupon Hub</span>
              <p className="text-[11px] leading-relaxed">
                Try asking Aria: <b>"Recommend a smartphone under ₹20,000"</b> or <b>"Track order ORD-12345"</b> for instant smart action execution!
              </p>
            </div>

          </div>

          <div className="max-w-7xl mx-auto border-t border-zinc-800 mt-8 pt-4 text-center text-[10px] text-zinc-500">
            © 2026 AI SHOPPING ASSISTANT INC. ALL DEMO RIGHTS RESERVED.
          </div>
        </footer>
      )}

    </div>
  );
}
