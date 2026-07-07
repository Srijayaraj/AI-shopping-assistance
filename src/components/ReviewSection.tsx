import React, { useState } from 'react';
import { Review, Product } from '../types';
import { Star, ThumbsUp, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReviewSectionProps {
  product: Product;
  onHelpfulClick: (reviewId: string) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ product, onHelpfulClick }) => {
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [photoOnly, setPhotoOnly] = useState(false);
  const [votedReviews, setVotedReviews] = useState<string[]>([]);

  // Calculate rating distributions
  const totalReviews = product.reviews.length || 1;
  const dist = product.ratingDistribution || { 5: 70, 4: 20, 3: 5, 2: 3, 1: 2 };

  // Generate some high quality sample customer review images if they do not exist
  const reviewImages = [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80'
  ];

  const handleVote = (id: string) => {
    if (votedReviews.includes(id)) return;
    setVotedReviews((prev) => [...prev, id]);
    onHelpfulClick(id);
  };

  const filteredReviews = product.reviews.filter((review) => {
    if (ratingFilter !== null && review.rating !== ratingFilter) return false;
    if (photoOnly && !review.images) return false; // if filtering photo reviews only
    return true;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
        Customer Ratings & Reviews
      </h3>

      {/* Summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
        {/* Left Col: Star score */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center bg-zinc-50 dark:bg-zinc-950/50 p-6 rounded-2xl">
          <span className="text-5xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
            {product.rating}
          </span>
          <div className="flex gap-1 text-amber-400 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= Math.round(product.rating) ? 'fill-current text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Based on {product.reviews.length} ratings
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            94% of customers recommend this
          </span>
        </div>

        {/* Right Col: Star distribution chart */}
        <div className="md:col-span-8 flex flex-col justify-center gap-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const pct = dist[star] || 0;
            return (
              <button
                id={`dist-star-row-${star}`}
                key={star}
                onClick={() => setRatingFilter(ratingFilter === star ? null : star)}
                className={`flex items-center gap-3 w-full hover:bg-zinc-50 dark:hover:bg-zinc-800/40 p-1.5 rounded-lg transition-colors text-left group ${
                  ratingFilter === star ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                }`}
              >
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 w-3 shrink-0">
                  {star}
                </span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />
                <div className="flex-grow h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 group-hover:bg-amber-500 transition-all rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 w-8 text-right shrink-0">
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Photo/Video reviews bar */}
      <div className="mb-6">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block mb-3">
          Photos shared by customers
        </span>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {reviewImages.map((img, i) => (
            <div
              key={i}
              className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
              onClick={() => setPhotoOnly(!photoOnly)}
            >
              <img src={img} alt="customer review pic" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
              {i === 2 && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-white text-[11px] font-bold">
                  +12
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Filters & Active Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="filter-review-all"
            onClick={() => {
              setRatingFilter(null);
              setPhotoOnly(false);
            }}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
              ratingFilter === null && !photoOnly
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-150 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            All Reviews
          </button>

          {[5, 4, 3].map((star) => (
            <button
              id={`filter-review-${star}-star`}
              key={star}
              onClick={() => setRatingFilter(star)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors ${
                ratingFilter === star
                  ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                  : 'text-zinc-600 hover:bg-zinc-150 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {star}★ Reviews
            </button>
          ))}

          <button
            id="filter-review-photo"
            onClick={() => setPhotoOnly(!photoOnly)}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-colors flex items-center gap-1 ${
              photoOnly
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'text-zinc-600 hover:bg-zinc-150 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            With Photos
          </button>
        </div>

        {/* Clear filter indicator */}
        {(ratingFilter !== null || photoOnly) && (
          <button
            id="clear-review-filters"
            onClick={() => {
              setRatingFilter(null);
              setPhotoOnly(false);
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Review list */}
      <div className="flex flex-col gap-5">
        <AnimatePresence mode="popLayout">
          {filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-zinc-500 text-sm"
            >
              No reviews match the active filter criteria. Try choosing another star rating.
            </motion.div>
          ) : (
            filteredReviews.map((review) => {
              const hasVoted = votedReviews.includes(review.id);
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key={review.id}
                  className="pb-5 border-b border-zinc-100 dark:border-zinc-800/80 last:border-0 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {review.reviewerName}
                      </span>
                      {review.verified && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 fill-current" />
                          Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">{review.date}</span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-0.5 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating ? 'fill-current' : 'text-zinc-200 dark:text-zinc-800'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {review.text}
                  </p>

                  {/* Inline helpful feedback */}
                  <div className="flex items-center gap-4 mt-1">
                    <button
                      id={`helpful-btn-${review.id}`}
                      onClick={() => handleVote(review.id)}
                      disabled={hasVoted}
                      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        hasVoted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasVoted ? 'fill-current' : ''}`} />
                      Helpful ({review.helpfulCount + (hasVoted ? 1 : 0)})
                    </button>
                    <span className="text-[11px] text-zinc-400">
                      Report abuse
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
