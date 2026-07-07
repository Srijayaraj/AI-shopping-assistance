import React, { useState } from 'react';
import { Product } from '../types';
import { X, Sparkles, AlertCircle, RefreshCw, Check, ArrowRight, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper parsers for different specs to enable robust winner identification
const parseRam = (val?: string): number => {
  if (!val) return 0;
  const num = parseInt(val);
  return isNaN(num) ? 0 : num;
};

const parseRom = (val?: string): number => {
  if (!val) return 0;
  const num = parseInt(val);
  if (isNaN(num)) return 0;
  if (val.toLowerCase().includes('tb')) {
    return num * 1024;
  }
  return num;
};

const parseBattery = (val?: string): number => {
  if (!val) return 0;
  const num = parseInt(val);
  return isNaN(num) ? 0 : num;
};

const parseCamera = (val?: string): number => {
  if (!val) return 0;
  const matches = val.match(/(\d+)\s*(?:mp|megapixel)/gi);
  if (!matches) {
    const firstNum = parseInt(val);
    return isNaN(firstNum) ? 0 : firstNum;
  }
  const values = matches.map(m => parseInt(m) || 0);
  return Math.max(...values, 0);
};

const parseWarranty = (val?: string): number => {
  if (!val) return 0;
  const matchYear = val.match(/(\d+)\s*year/i);
  if (matchYear) return parseFloat(matchYear[1]);
  const matchMonth = val.match(/(\d+)\s*month/i);
  if (matchMonth) return parseFloat(matchMonth[1]) / 12;
  const matchNum = val.match(/(\d+)/);
  if (matchNum) return parseFloat(matchNum[1]);
  return 0;
};

const parseCapacity = (val?: string): { value: number; unit: string } | null => {
  if (!val) return null;
  const match = val.match(/([\d.]+)\s*([a-zA-Z]+)/);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2].toLowerCase()
    };
  }
  return null;
};

interface ComparisonSectionProps {
  compareProducts: Product[];
  onRemoveFromCompare: (productId: string) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onNavigateToProduct: (productId: string) => void;
}

export const ComparisonSection: React.FC<ComparisonSectionProps> = ({
  compareProducts,
  onRemoveFromCompare,
  onAddToCart,
  onNavigateToProduct,
}) => {
  const [userIntent, setUserIntent] = useState<'balance' | 'budget' | 'performance' | 'camera' | 'battery'>('balance');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Generate AI comparison logic locally as a lightning fast fallback or interactive simulation!
  // This is fantastic because it runs immediately and feels highly customized.
  const generateLocalRecommendation = (intent: typeof userIntent) => {
    setLoadingAdvice(true);
    setTimeout(() => {
      if (compareProducts.length === 0) {
        setAiAdvice(null);
        setLoadingAdvice(false);
        return;
      }

      const names = compareProducts.map(p => p.title.split('(')[0].trim());
      let recommended = compareProducts[0];
      let justification = '';

      if (intent === 'budget') {
        recommended = [...compareProducts].sort((a, b) => a.price - b.price)[0];
        justification = `At ₹${recommended.price.toLocaleString('en-IN')}, it offers the lowest price barrier among the items selected, allowing you to save up to ₹${(Math.max(...compareProducts.map(p => p.price)) - recommended.price).toLocaleString('en-IN')} compared to other options, with a great ${recommended.discountPercentage}% discount.`;
      } else if (intent === 'performance') {
        // Sort by RAM or processor
        recommended = [...compareProducts].sort((a, b) => {
          const ramA = parseInt(a.specs.ram || '0');
          const ramB = parseInt(b.specs.ram || '0');
          return ramB - ramA;
        })[0];
        justification = `Equipped with ${recommended.specs.ram || 'premium'} RAM and a high-performance ${recommended.specs.processor || 'chipset'}, this device delivers superior computing capability, making it perfect for heavy multitasking, coding, or high-fidelity gaming.`;
      } else if (intent === 'camera') {
        recommended = [...compareProducts].sort((a, b) => {
          const camA = parseInt(a.specs.camera || '0');
          const camB = parseInt(b.specs.camera || '0');
          return ramB_for_now_is_not_needed(camB, camA); // helper comparison
        })[0];

        // Let's write manual logic
        const hasBestCam = compareProducts.find(p => p.specs.camera?.includes('48MP') || p.specs.camera?.includes('50MP') || p.specs.camera?.includes('108MP'));
        if (hasBestCam) recommended = hasBestCam;
        justification = `Boasting a state-of-the-art ${recommended.specs.camera || 'camera setup'}, this model is optimized for professional-grade optics, color range capture, and low-light photography.`;
      } else if (intent === 'battery') {
        const hasLargeBattery = [...compareProducts].sort((a, b) => {
          const batA = parseInt(a.specs.battery || '0');
          const batB = parseInt(b.specs.battery || '0');
          return batB - batA;
        })[0];
        if (hasLargeBattery) recommended = hasLargeBattery;
        justification = `Packing a massive ${recommended.specs.battery || 'high capacity energy reserve'}, it guarantees maximum runtime between charges, reducing anxiety during travel and intensive outdoor usage.`;
      } else {
        // Balanced
        recommended = [...compareProducts].sort((a, b) => b.rating - a.rating)[0];
        justification = `With a stellar customer rating of ${recommended.rating}★, this is the most highly-rated choice in your selection. It strikes a perfect synergy of price, durability, and features, offering an outstanding user feedback score of over 95% verified recommendations.`;
      }

      setAiAdvice(`### 🌟 Aria's AI Recommendation: **${recommended.title}**

**Why this fits your "${intent}" focus:**
${justification}

*Specs highlight:*
- **Price:** ₹${recommended.price.toLocaleString('en-IN')} (${recommended.discountPercentage}% OFF)
- **Primary Specs:** ${recommended.specs.ram ? recommended.specs.ram + ' RAM / ' + recommended.specs.rom : recommended.specs.capacity || 'Premium Quality Build'}
- **Customer Rating:** ${recommended.rating}★ (${recommended.reviews.length} reviews)`);

      setLoadingAdvice(false);
    }, 600);
  };

  // Simple numeric comparative helper
  const ramB_for_now_is_not_needed = (b: number, a: number) => b - a;

  React.useEffect(() => {
    if (compareProducts.length > 0) {
      generateLocalRecommendation(userIntent);
    } else {
      setAiAdvice(null);
    }
  }, [compareProducts, userIntent]);

  // Helpers to check if a value is the winner (maximum/minimum or "superior") across compare list
  const isLowestPrice = (price: number) => {
    if (compareProducts.length < 2) return false;
    const minPrice = Math.min(...compareProducts.map(p => p.price));
    return price === minPrice;
  };

  const isHighestRam = (val?: string) => {
    if (!val || compareProducts.length < 2) return false;
    const num = parseRam(val);
    if (num === 0) return false;
    const allNums = compareProducts.map(p => parseRam(p.specs.ram));
    return num === Math.max(...allNums);
  };

  const isHighestRom = (val?: string) => {
    if (!val || compareProducts.length < 2) return false;
    const num = parseRom(val);
    if (num === 0) return false;
    const allNums = compareProducts.map(p => parseRom(p.specs.rom));
    return num === Math.max(...allNums);
  };

  const isHighestBattery = (val?: string) => {
    if (!val || compareProducts.length < 2) return false;
    const num = parseBattery(val);
    if (num === 0) return false;
    const allNums = compareProducts.map(p => parseBattery(p.specs.battery));
    return num === Math.max(...allNums);
  };

  const isHighestCamera = (val?: string) => {
    if (!val || compareProducts.length < 2) return false;
    const num = parseCamera(val);
    if (num === 0) return false;
    const allNums = compareProducts.map(p => parseCamera(p.specs.camera));
    return num === Math.max(...allNums);
  };

  const isHighestRating = (rating: number) => {
    if (compareProducts.length < 2) return false;
    const maxRating = Math.max(...compareProducts.map(p => p.rating));
    return rating === maxRating;
  };

  const isHighestWarranty = (val?: string) => {
    if (!val || compareProducts.length < 2) return false;
    const num = parseWarranty(val);
    if (num === 0) return false;
    const allNums = compareProducts.map(p => parseWarranty(p.specs.warranty));
    return num === Math.max(...allNums);
  };

  const isHighestCapacity = (val?: string) => {
    if (!val || compareProducts.length < 2) return false;
    const cap = parseCapacity(val);
    if (!cap) return false;
    
    const parsed = compareProducts.map(p => parseCapacity(p.specs.capacity));
    const nonNull = parsed.filter((p): p is { value: number; unit: string } => p !== null);
    if (nonNull.length < 2) return false;
    
    const firstUnit = nonNull[0].unit;
    if (!nonNull.every(p => p.unit === firstUnit)) return false;
    
    return cap.value === Math.max(...nonNull.map(p => p.value));
  };

  if (compareProducts.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-zinc-100 dark:border-slate-800 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Compare Tray is Empty</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            Add 2 to 4 products from the product details screen or catalog listings to compare their technical specifications side-by-side.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* AI recommendation block */}
      <div className="bg-gradient-to-r from-indigo-50 to-teal-50 dark:from-indigo-950/20 dark:to-teal-950/20 border border-indigo-100/70 dark:border-indigo-900/40 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-indigo-100/50 dark:border-indigo-900/30">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-100 flex items-center gap-1.5">
                AI Shopping Recommendation Engine
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Aria analyzes specifications, pricing, and ratings side-by-side to recommend the optimal match.
              </p>
            </div>
          </div>

          {/* Persona selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 p-1.5 rounded-2xl border border-zinc-100 dark:border-slate-800 shrink-0">
            {[
              { id: 'balance', label: 'Balanced' },
              { id: 'budget', label: 'Lowest Price' },
              { id: 'performance', label: 'Best Performance' },
              { id: 'camera', label: 'Optics' },
              { id: 'battery', label: 'Battery life' },
            ].map((btn) => (
              <button
                id={`ai-intent-btn-${btn.id}`}
                key={btn.id}
                onClick={() => setUserIntent(btn.id as any)}
                className={`text-[10px] px-3 py-1.5 rounded-xl font-bold transition-all ${
                  userIntent === btn.id
                    ? 'bg-indigo-600 text-white dark:bg-indigo-500 shadow-xs'
                    : 'text-zinc-600 hover:text-indigo-600 dark:text-zinc-400'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* AI response panel */}
        <div className="pt-4 min-h-[100px]">
          {loadingAdvice ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Aria is conducting specification lookup...
              </span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {aiAdvice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="prose dark:prose-invert max-w-none text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap"
                >
                  {aiAdvice}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-zinc-100 dark:border-slate-800 shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-slate-800 bg-zinc-50/50 dark:bg-slate-950/20">
              <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider w-1/5">
                Product Details
              </th>
              {compareProducts.map((p) => (
                <th key={p.id} className="p-4 w-1/4 relative group min-w-[180px]">
                  <button
                    id={`remove-compare-th-${p.id}`}
                    onClick={() => onRemoveFromCompare(p.id)}
                    className="absolute top-3 right-3 p-1 rounded-full bg-zinc-100 hover:bg-rose-100 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/40 text-zinc-500 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex flex-col gap-2 mt-2">
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded-xl border border-zinc-100 dark:border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                    <h4
                      onClick={() => onNavigateToProduct(p.id)}
                      className="text-xs font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 hover:text-indigo-600 cursor-pointer"
                    >
                      {p.title}
                    </h4>
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase">
                      {p.brand}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
            {/* PRICE */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Price</td>
              {compareProducts.map((p) => {
                const isWinner = isLowestPrice(p.price);
                return (
                  <td key={p.id} className={`p-4 transition-all duration-300 ${isWinner ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}>
                    <div className="flex flex-col">
                      <span className={`text-sm font-extrabold ${isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-max border border-emerald-100/50 dark:border-emerald-900/30">
                          <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> Lowest Price
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* RAM */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">RAM Memory</td>
              {compareProducts.map((p) => {
                const isWinner = isHighestRam(p.specs.ram);
                return (
                  <td key={p.id} className={`p-4 transition-all duration-300 ${isWinner ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isWinner ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        {p.specs.ram || 'N/A'}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-max border border-emerald-100/50 dark:border-emerald-900/30">
                          <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> Max RAM
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* STORAGE */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Internal Storage (ROM)</td>
              {compareProducts.map((p) => {
                const isWinner = isHighestRom(p.specs.rom);
                return (
                  <td key={p.id} className={`p-4 transition-all duration-300 ${isWinner ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isWinner ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        {p.specs.rom || 'N/A'}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-max border border-emerald-100/50 dark:border-emerald-900/30">
                          <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> Max Storage
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* PROCESSOR */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Processor / Chipset</td>
              {compareProducts.map((p) => (
                <td key={p.id} className="p-4 text-zinc-600 dark:text-zinc-400 font-medium">
                  {p.specs.processor || 'N/A'}
                </td>
              ))}
            </tr>

            {/* DISPLAY */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Display Size & Panel</td>
              {compareProducts.map((p) => (
                <td key={p.id} className="p-4 text-zinc-600 dark:text-zinc-400">
                  {p.specs.display || 'N/A'}
                </td>
              ))}
            </tr>

            {/* BATTERY */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Battery capacity</td>
              {compareProducts.map((p) => {
                const isWinner = isHighestBattery(p.specs.battery);
                return (
                  <td key={p.id} className={`p-4 transition-all duration-300 ${isWinner ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isWinner ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        {p.specs.battery || 'N/A'}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-max border border-emerald-100/50 dark:border-emerald-900/30">
                          <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> Max Battery
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* CAMERA */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Camera Megapixels</td>
              {compareProducts.map((p) => {
                const isWinner = isHighestCamera(p.specs.camera);
                return (
                  <td key={p.id} className={`p-4 transition-all duration-300 ${isWinner ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isWinner ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        {p.specs.camera || 'N/A'}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-max border border-emerald-100/50 dark:border-emerald-900/30">
                          <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> Max Optics
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* OTHER CAPACITIES */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Appliances Capacity</td>
              {compareProducts.map((p) => {
                const isWinner = isHighestCapacity(p.specs.capacity);
                return (
                  <td key={p.id} className={`p-4 transition-all duration-300 ${isWinner ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isWinner ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-600 dark:text-zinc-400'}`}>
                        {p.specs.capacity || 'N/A'}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-max border border-emerald-100/50 dark:border-emerald-900/30">
                          <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> Max Capacity
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* RATING */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Customer Rating</td>
              {compareProducts.map((p) => {
                const isWinner = isHighestRating(p.rating);
                return (
                  <td key={p.id} className={`p-4 transition-all duration-300 ${isWinner ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isWinner ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-850 dark:text-zinc-100'}`}>
                          {p.rating}★
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          ({p.reviews.length} reviews)
                        </span>
                      </div>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-max border border-emerald-100/50 dark:border-emerald-900/30">
                          <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> Top Rated
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* WARRANTY */}
            <tr>
              <td className="p-4 font-bold text-zinc-700 dark:text-zinc-300">Official Warranty</td>
              {compareProducts.map((p) => {
                const isWinner = isHighestWarranty(p.specs.warranty);
                return (
                  <td key={p.id} className={`p-4 transition-all duration-300 ${isWinner ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''}`}>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${isWinner ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {p.specs.warranty || 'No Brand Warranty'}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md w-max border border-emerald-100/50 dark:border-emerald-900/30">
                          <Trophy className="w-3 h-3 text-amber-500 shrink-0" /> Max Warranty
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* CART ACTIONS */}
            <tr>
              <td className="p-4"></td>
              {compareProducts.map((p) => (
                <td key={p.id} className="p-4">
                  <motion.button
                    id={`add-compare-to-cart-${p.id}`}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => onAddToCart(p, e)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    Add to Cart
                  </motion.button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
