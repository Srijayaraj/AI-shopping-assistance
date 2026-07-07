import React from 'react';
import { FilterState } from '../types';
import { Search, RotateCcw, SlidersHorizontal, Check, X } from 'lucide-react';

interface FilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableBrands: string[];
  onClearAll: () => void;
  resultCount: number;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  availableBrands,
  onClearAll,
  resultCount,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
}) => {
  const handleBrandChange = (brand: string) => {
    setFilters((prev) => {
      const isSelected = prev.brands.includes(brand);
      return {
        ...prev,
        brands: isSelected
          ? prev.brands.filter((b) => b !== brand)
          : [...prev.brands, brand],
      };
    });
  };

  const handleSpecToggle = (type: 'ram' | 'rom' | 'processor' | 'size' | 'color', value: string) => {
    setFilters((prev) => {
      const currentList = prev[type] || [];
      const isSelected = currentList.includes(value);
      return {
        ...prev,
        [type]: isSelected
          ? currentList.filter((item) => item !== value)
          : [...currentList, value],
      };
    });
  };

  const handleCategoryChange = (cat: string) => {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === cat ? '' : cat,
      // Clear subcategories when category changes
      subCategories: [],
    }));
  };

  const ratingsList = [4, 3, 2];
  const discountOptions = [10, 20, 30];

  const categories = ['Mobiles', 'Laptops', 'Fashion', 'Home Appliances', 'Footwear'];

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-zinc-100 dark:border-slate-800 shadow-xs p-5 flex flex-col gap-6 sticky top-24">
      {/* Header with Results Count & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Filters</h2>
        </div>
        <button
          id="clear-filters-btn"
          onClick={onClearAll}
          className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Clear All
        </button>
      </div>

      {/* Result Count Badge */}
      <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
        <span>Showing {resultCount} matching items</span>
        <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px]">
          Live Count
        </span>
      </div>

      {/* Search Input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Search Within
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            id="search-filter-input"
            type="text"
            placeholder="Type brand, model, features..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-slate-950 border border-zinc-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 text-zinc-800 dark:text-slate-100"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Category
        </label>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isSelected = filters.category === cat;
            return (
              <button
                id={`cat-filter-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all duration-150 ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500 dark:border-indigo-500'
                    : 'bg-zinc-50 border-zinc-100 text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800/85'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Price Budget
          </label>
          <span className="text-[11px] text-zinc-400 font-semibold">
            ₹{filters.minPrice.toLocaleString('en-IN')} - ₹{filters.maxPrice.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <input
            id="price-range-slider"
            type="range"
            min="0"
            max="150000"
            step="5000"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))}
            className="w-full accent-indigo-600 dark:accent-indigo-500 cursor-pointer h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Min (₹)</span>
              <input
                id="price-min-input"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: Math.max(0, Number(e.target.value)) }))}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
              />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block mb-1">Max (₹)</span>
              <input
                id="price-max-input"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Math.max(0, Number(e.target.value)) }))}
                className="w-full px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brands Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Brand Selection
        </label>
        <div className="max-h-40 overflow-y-auto flex flex-col gap-1.5 pr-2 custom-scrollbar">
          {availableBrands.map((brand) => {
            const isChecked = filters.brands.includes(brand);
            return (
              <label
                id={`brand-label-${brand.toLowerCase()}`}
                key={brand}
                className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 py-0.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    id={`brand-checkbox-${brand.toLowerCase()}`}
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandChange(brand)}
                    className="w-3.5 h-3.5 rounded-sm border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{brand}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Specifications Filtering (Dynamic based on Category) */}
      {(filters.category === 'Mobiles' || filters.category === 'Laptops') && (
        <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Technical Specs
          </h3>

          {/* RAM spec */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-500">RAM Capacity</span>
            <div className="flex flex-wrap gap-1">
              {['6GB', '8GB', '16GB'].map((ram) => {
                const active = filters.ram.includes(ram);
                return (
                  <button
                    id={`ram-spec-btn-${ram}`}
                    key={ram}
                    onClick={() => handleSpecToggle('ram', ram)}
                    className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                      active
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-400 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {ram}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage spec */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-500">Storage (ROM)</span>
            <div className="flex flex-wrap gap-1">
              {['128GB', '256GB', '512GB SSD', '1TB Gen4 SSD'].map((rom) => {
                const active = filters.rom.includes(rom);
                return (
                  <button
                    id={`rom-spec-btn-${rom.replace(/\s+/g, '-')}`}
                    key={rom}
                    onClick={() => handleSpecToggle('rom', rom)}
                    className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                      active
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600 dark:bg-indigo-950/40 dark:border-indigo-400 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {rom.replace(' SSD', '').replace(' Gen4 SSD', '')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {filters.category === 'Fashion' && (
        <div className="flex flex-col gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            Fashion Specs
          </h3>

          {/* Size Filter */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-zinc-500">Size</span>
            <div className="flex gap-1.5">
              {['S', 'M', 'L', 'XL'].map((s) => {
                const active = filters.size.includes(s);
                return (
                  <button
                    id={`size-filter-btn-${s}`}
                    key={s}
                    onClick={() => handleSpecToggle('size', s)}
                    className={`w-7 h-7 flex items-center justify-center text-[10px] rounded-lg border transition-all font-bold ${
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500 dark:border-indigo-500'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Customer Rating */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Customer Rating
        </label>
        <div className="flex flex-col gap-1.5">
          {ratingsList.map((rating) => (
            <label
              id={`rating-filter-label-${rating}`}
              key={rating}
              className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-indigo-600"
            >
              <input
                id={`rating-filter-radio-${rating}`}
                type="radio"
                name="rating_filter"
                checked={filters.rating === rating}
                onChange={() => setFilters((prev) => ({ ...prev, rating }))}
                className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{rating}★ & Above</span>
            </label>
          ))}
          <label
            id="rating-filter-any"
            className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-indigo-600"
          >
            <input
              id="rating-filter-any-radio"
              type="radio"
              name="rating_filter"
              checked={filters.rating === null}
              onChange={() => setFilters((prev) => ({ ...prev, rating: null }))}
              className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show All Ratings</span>
          </label>
        </div>
      </div>

      {/* Discounts */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Deals & Discounts
        </label>
        <div className="flex flex-col gap-1.5">
          {discountOptions.map((disc) => (
            <label
              id={`discount-filter-label-${disc}`}
              key={disc}
              className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-indigo-600"
            >
              <input
                id={`discount-filter-radio-${disc}`}
                type="radio"
                name="discount_filter"
                checked={filters.discount === disc}
                onChange={() => setFilters((prev) => ({ ...prev, discount: disc }))}
                className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
              />
              <span>{disc}% Off or more</span>
            </label>
          ))}
          <label
            id="discount-filter-any"
            className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer hover:text-indigo-600"
          >
            <input
              id="discount-filter-any-radio"
              type="radio"
              name="discount_filter"
              checked={filters.discount === null}
              onChange={() => setFilters((prev) => ({ ...prev, discount: null }))}
              className="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show All Discounts</span>
          </label>
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Exclude Out of Stock
        </span>
        <button
          id="toggle-stock-filter"
          type="button"
          onClick={() => setFilters((prev) => ({ ...prev, inStockOnly: !prev.inStockOnly }))}
          className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
            filters.inStockOnly ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-800'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              filters.inStockOnly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};
