import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShoppingCart,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Review } from "../backend";
import { useCart } from "../contexts/CartContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProducts } from "../hooks/useQueries";

interface ProductDetailProps {
  onNavigate: (path: string) => void;
  productId: string;
}

function StarRating({
  rating,
  onRate,
}: { rating: number; onRate?: (r: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onRate?.(s)}
          onMouseEnter={() => onRate && setHovered(s)}
          onMouseLeave={() => onRate && setHovered(0)}
          className={`text-xl transition-colors ${
            s <= (hovered || rating) ? "text-yellow-400" : "text-gray-300"
          } ${onRate ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          disabled={!onRate}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ProductDetail({ onNavigate, productId }: ProductDetailProps) {
  const { data: products, isLoading } = useProducts();
  const { addItem } = useCart();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showViewCart, setShowViewCart] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const entry = products?.find(([pid]) => pid.toString() === productId);
  const product = entry?.[1];
  const id = entry?.[0];

  const inStock = product ? Number(product.stockQuantity) > 0 : false;
  const stockQty = product ? Number(product.stockQuantity) : 0;

  const hasDiscount =
    product &&
    product.discountPriceINR > 0n &&
    product.discountPriceINR < product.priceINR;
  const discountPct = hasDiscount
    ? Math.round(
        (1 - Number(product.discountPriceINR) / Number(product.priceINR)) * 100,
      )
    : 0;
  const displayPrice = product
    ? hasDiscount
      ? Number(product.discountPriceINR)
      : Number(product.priceINR)
    : 0;

  useEffect(() => {
    if (!actor || !productId) return;
    setReviewsLoading(true);
    actor
      .getApprovedReviewsForProduct(BigInt(productId))
      .then((r) => setReviews(r))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [actor, productId]);

  const handleAddToCart = () => {
    if (!product || !id) return;
    addItem({
      productId: id,
      name: product.name,
      quantity,
      priceINR: product.priceINR,
      discountPriceINR: product.discountPriceINR,
      imageUrl: product.imageUrl,
      stockQuantity: stockQty,
    });
    setAdded(true);
    setShowViewCart(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !comment.trim()) return;
    setSubmitting(true);
    try {
      const result = await actor.submitReview(
        BigInt(productId),
        BigInt(rating),
        comment.trim(),
      );
      if (result.__kind__ === "ok") {
        setSubmitted(true);
        setComment("");
        setRating(5);
      } else {
        console.error(result.err);
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="font-display text-2xl text-foreground mb-4">
          Product not found
        </h2>
        <button
          type="button"
          onClick={() => onNavigate("/")}
          className="btn-primary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 pb-16">
      <button
        type="button"
        onClick={() => onNavigate("/")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative aspect-square rounded-3xl overflow-hidden bg-secondary"
        >
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-8xl"
              style={{
                background: "linear-gradient(135deg, #fce4ec, #f48fb1)",
              }}
            >
              ✨
            </div>
          )}
          {hasDiscount && (
            <div className="discount-badge text-sm px-3 py-1.5">
              {discountPct}% OFF
            </div>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-black/60 px-4 py-2 rounded-full">
                Sold Out
              </span>
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {!inStock && (
              <Badge variant="destructive" className="text-xs">
                Sold Out
              </Badge>
            )}
            {inStock && (
              <Badge className="text-xs bg-green-100 text-green-700 border-0">
                In Stock ({Number(product.stockQuantity)})
              </Badge>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground">
            {product.name}
          </h1>

          {/* Stars */}
          <div className="flex items-center gap-1">
            <span className="text-accent text-lg">★★★★★</span>
            <span className="text-xs text-muted-foreground ml-1">
              ({reviews.length} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="font-display text-3xl font-bold text-primary">
                  ₹{Number(product.discountPriceINR)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  ₹{Number(product.priceINR)}
                </span>
                <Badge className="bg-primary text-primary-foreground">
                  Save {discountPct}%
                </Badge>
              </>
            ) : (
              <span className="font-display text-3xl font-bold text-foreground">
                ₹{Number(product.priceINR)}
              </span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description ||
              "Premium quality beauty product crafted with love just for you. ♥"}
          </p>

          {/* Quantity */}
          {inStock && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2 border border-border rounded-full px-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 hover:text-primary transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stockQty, q + 1))}
                  className="p-1.5 hover:text-primary transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Total */}
          {inStock && (
            <div className="p-4 bg-secondary rounded-2xl">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-foreground">
                  ₹{displayPrice * quantity}
                </span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3">
            {inStock ? (
              <>
                <motion.button
                  type="button"
                  data-ocid="product.primary_button"
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.96 }}
                  animate={added ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 py-3 text-base rounded-full font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
                  style={{
                    backgroundColor: added ? "#22c55e" : "",
                    color: added ? "white" : "",
                    border: added ? "none" : "",
                  }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {added ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2"
                      >
                        <Check size={16} /> Added! ✓
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 btn-primary px-4 py-1.5 rounded-full w-full justify-center"
                        style={{ display: "flex" }}
                      >
                        <ShoppingCart size={16} /> Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <Button
                  data-ocid="product.secondary_button"
                  onClick={() => {
                    handleAddToCart();
                    onNavigate("/cart");
                  }}
                  variant="outline"
                  className="flex-1 py-3 text-base border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Buy Now ♥
                </Button>
              </>
            ) : (
              <Button disabled className="flex-1 py-3">
                Sold Out
              </Button>
            )}
          </div>

          {/* View Cart */}
          <AnimatePresence>
            {showViewCart && (
              <motion.button
                type="button"
                key="view-cart"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  setShowViewCart(false);
                  onNavigate("/cart");
                }}
                data-ocid="product.secondary_button"
                className="w-full py-2.5 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                View Cart →
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Reviews Section */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">
          Customer Reviews 💬
        </h2>

        {/* Approved reviews */}
        {reviewsLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div
            className="card-pink p-8 text-center text-muted-foreground mb-8"
            data-ocid="reviews.empty_state"
          >
            <div className="text-3xl mb-2">💖</div>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {reviews.map((review) => (
              <motion.div
                key={`${review.productId.toString()}-${review.createdAt.toString()}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-pink p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <StarRating rating={Number(review.rating)} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(
                      Number(review.createdAt) / 1_000_000,
                    ).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-sm text-foreground">{review.comment}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Submit review form */}
        {identity ? (
          submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-pink p-6 text-center"
              data-ocid="reviews.success_state"
            >
              <div className="text-3xl mb-2">💖</div>
              <p className="font-semibold text-foreground">
                Your review has been submitted for approval 💖
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                It will appear here once approved by our team.
              </p>
            </motion.div>
          ) : (
            <div className="card-pink p-6">
              <h3 className="font-display font-semibold text-lg mb-4">
                Write a Review ✍️
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Your Rating
                  </Label>
                  <StarRating rating={rating} onRate={setRating} />
                </div>
                <div>
                  <Label
                    htmlFor="review-comment"
                    className="text-sm font-medium mb-2 block"
                  >
                    Your Review
                  </Label>
                  <Textarea
                    id="review-comment"
                    data-ocid="reviews.textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="rounded-xl"
                    rows={3}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  data-ocid="reviews.submit_button"
                  disabled={submitting || !comment.trim()}
                  className="btn-primary"
                >
                  {submitting ? (
                    <>
                      <Star size={14} className="mr-1 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review 💖"
                  )}
                </Button>
              </form>
            </div>
          )
        ) : (
          <div className="card-pink p-6 text-center text-muted-foreground">
            <p className="text-sm">
              Please{" "}
              <button
                type="button"
                onClick={() => onNavigate("/")}
                className="text-primary font-semibold hover:underline"
              >
                log in
              </button>{" "}
              to leave a review.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
