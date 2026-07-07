export interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  date: string;
  text: string;
  verified: boolean;
  helpfulCount: number;
  images?: string[];
}

export interface Specifications {
  ram?: string;
  rom?: string;
  processor?: string;
  display?: string;
  battery?: string;
  camera?: string;
  warranty?: string;
  color?: string;
  size?: string;
  capacity?: string; // For home appliances
  powerConsumption?: string;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: 'Mobiles' | 'Laptops' | 'Fashion' | 'Home Appliances' | 'Footwear';
  subCategory: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  ratingDistribution: { [star: number]: number };
  stock: number;
  images: string[];
  specs: Specifications;
  description: string;
  reviews: Review[];
  featured?: boolean;
  trending?: boolean;
}


export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export type OrderStatus = 'Placed' | 'Packed' | 'Shipped' | 'Out for delivery' | 'Delivered';

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  address: string;
  paymentMethod: string;
  status: OrderStatus;
  statusTimeline: { status: OrderStatus; date: string; completed: boolean }[];
}

export interface UserAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  addresses: UserAddress[];
  savedPaymentMethods: { id: string; type: string; details: string }[];
}

export interface FilterState {
  searchQuery: string;
  category: string;
  subCategories: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  rating: number | null;
  discount: number | null;
  inStockOnly: boolean;
  // Category specific specs
  ram: string[];
  rom: string[];
  processor: string[];
  size: string[];
  color: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  products?: Product[]; // Inline products suggested by assistant
  action?: {
    type: 'navigate' | 'apply_filter' | 'add_to_cart' | 'compare_products';
    payload: any;
  };
}
