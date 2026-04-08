import { Check, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend";
import { useCart } from "../contexts/CartContext";

interface ProductCardProps {
  id: bigint;
  product: Product;
  onNavigate: (path: string) => void;
  index?: number;
}

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #fce4ec, #f48fb1)",
  "linear-gradient(135deg, #e8eaf6, #ce93d8)",
  "linear-gradient(135deg, #fce4ec, #ef9a9a)",
  "linear-gradient(135deg, #fff9c4, #f8bbd0)",
];

export function ProductCard({
  id,
  product,
  onNavigate,
  index = 0,
}: ProductCardProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const [showViewCart, setShowViewCart] = useState(false);

  const stockQty = Number(product.stockQuantity);
  const inStock = stockQty > 0;
  const cartItem = items.find((i) => i.productId === id);
  const cartQty = cartItem?.quantity ?? 0;
  const canAdd = cartQty < stockQty;

  const hasDiscount =
    product.discountPriceINR > 0n &&
    product.discountPriceINR < product.priceINR;
  const discountPct = hasDiscount
    ? Math.round(
        (1 - Number(product.discountPriceINR) / Number(product.priceINR)) * 100,
      )
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      productId: id,
      name: product.name,
      quantity: 1,
      priceINR: product.priceINR,
      discountPriceINR: product.discountPriceINR,
      imageUrl: product.imageUrl,
      stockQuantity: stockQty,
    });
    setAdded(true);
    setShowViewCart(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="card-pink cursor-pointer group overflow-hidden"
      onClick={() => onNavigate(`/product/${id.toString()}`)}
      data-ocid={`product.item.${index + 1}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-secondary rounded-t-2xl">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{
              background:
                PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length],
            }}
          >
            ✨
          </div>
        )}
        {hasDiscount && (
          <div className="discount-badge">{discountPct}% OFF</div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
        <h3 className="font-display font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            {hasDiscount ? (
              <>
                <span className="font-bold text-primary">
                  ₹{Number(product.discountPriceINR)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  ₹{Number(product.priceINR)}
                </span>
              </>
            ) : (
              <span className="font-bold text-foreground">
                ₹{Number(product.priceINR)}
              </span>
            )}
          </div>
          {inStock && canAdd && (
            <motion.button
              type="button"
              onClick={handleAddToCart}
              whileTap={{ scale: 0.85 }}
              animate={added ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              data-ocid={`product.primary_button.${index + 1}`}
              className="p-2 rounded-full text-xs transition-colors duration-300"
              style={{
                backgroundColor: added ? "#22c55e" : "",
                color: added ? "white" : "",
              }}
              aria-label="Add to cart"
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, rotate: -30 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    <Check size={14} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block btn-primary p-0 rounded-full"
                    style={{ padding: 0, background: "transparent" }}
                  >
                    <ShoppingCart
                      size={14}
                      className="text-primary-foreground"
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </div>

        {/* View Cart link */}
        <AnimatePresence>
          {showViewCart && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.25 }}
              className="mt-2"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewCart(false);
                  onNavigate("/cart");
                }}
                data-ocid={`product.secondary_button.${index + 1}`}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                View Cart →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
