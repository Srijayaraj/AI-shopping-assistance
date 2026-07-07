import React from 'react';
import { Product } from '../types';
import { Star, Heart, ShoppingCart, ArrowRightLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onNavigate: (productId: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  isWishlisted: boolean;
  onAddToCompare: (product: Product, e: React.MouseEvent) => void;
  isComparing: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onAddToCompare,
  isComparing,
}) => {
  return (
    <motion.div
      id={`product-card-${product.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-slate-900/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg border border-zinc-100 dark:border-slate-800 hover:border-indigo-500/50 transition-all duration-300 flex flex-col h-full group"
    >
      {/* Image Gallery */}
      <div className="relative aspect-square w-full bg-zinc-50 dark:bg-slate-800/40 overflow-hidden cursor-pointer" onClick={() => onNavigate(product.id)}>
        <img
          src={product.images[0]}
          alt={product.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.discountPercentage > 15 && (
            <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {product.discountPercentage}% OFF
            </span>
          )}
          {product.trending && (
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Trending
            </span>
          )}
          {product.featured && (
            <span className="bg-teal-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              AI Choice
            </span>
          )}
        </div>

        {/* Action Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            id={`wishlist-btn-${product.id}`}
            onClick={(e) => onToggleWishlist(product.id, e)}
            className={`p-2 rounded-full transition-colors duration-200 shadow-md ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                : 'bg-white/80 backdrop-blur-xs text-zinc-600 hover:text-rose-500 hover:bg-white'
            }`}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <button
            id={`compare-btn-${product.id}`}
            onClick={(e) => onAddToCompare(product, e)}
            className={`p-2 rounded-full transition-colors duration-200 shadow-md ${
              isComparing
                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                : 'bg-white/80 backdrop-blur-xs text-zinc-600 hover:text-indigo-600 hover:bg-white'
            }`}
            title={isComparing ? "Remove from Compare" : "Add to Compare"}
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Alert */}
        {product.stock <= 8 && (
          <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-[10px] font-medium text-center py-1 backdrop-blur-xs">
            Only {product.stock} units left!
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1">
          {product.brand} • {product.subCategory}
        </span>
        <h3
          onClick={() => onNavigate(product.id)}
          className="text-sm font-medium text-zinc-800 dark:text-zinc-150 line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-150 mb-2 cursor-pointer min-h-[40px]"
        >
          {product.title}
        </h3>

        {/* Reviews Summary */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {product.rating}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            ({product.reviews.length} reviews)
          </span>
        </div>

        {/* Specifications Snippet */}
        <div className="mt-auto border-t border-zinc-100 dark:border-slate-800 pt-3 mb-3">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {product.specs.ram && (
              <span className="truncate">RAM: <b>{product.specs.ram}</b></span>
            )}
            {product.specs.rom && (
              <span className="truncate">Storage: <b>{product.specs.rom}</b></span>
            )}
            {product.specs.processor && (
              <span className="col-span-2 truncate">CPU: <b>{product.specs.processor}</b></span>
            )}
            {product.specs.capacity && (
              <span className="col-span-2 truncate">Cap: <b>{product.specs.capacity}</b></span>
            )}
          </div>
        </div>

        {/* Price & Buy Button */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.discountPercentage > 0 && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Free Delivery
            </span>
          </div>

          <motion.button
            id={`add-to-cart-btn-${product.id}`}
            whileTap={{ scale: 0.94 }}
            onClick={(e) => onAddToCart(product, e)}
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white p-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200"
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
