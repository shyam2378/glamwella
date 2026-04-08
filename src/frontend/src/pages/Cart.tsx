import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useCart } from "../contexts/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface CartProps {
  onNavigate: (path: string) => void;
}

const PLACEHOLDER_GRADIENT = "linear-gradient(135deg, #fce4ec, #f48fb1)";

export function Cart({ onNavigate }: CartProps) {
  const { items, removeItem, updateQuantity, totalINR, totalItems, clearCart } =
    useCart();
  const { identity } = useInternetIdentity();

  const handleCheckout = () => {
    if (!identity) {
      toast.error("Please login to checkout");
      return;
    }
    onNavigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="cart.empty_state"
      >
        <div className="text-6xl mb-4">🛍️</div>
        <h2 className="font-display text-2xl text-foreground mb-2">
          Your cart is empty
        </h2>
        <p className="text-muted-foreground mb-8">
          Add some gorgeous products! ♥
        </p>
        <Button
          data-ocid="cart.primary_button"
          onClick={() => onNavigate("/")}
          className="btn-primary"
        >
          Start Shopping 🛍️
        </Button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="font-display text-2xl font-bold">
            Shopping Cart 🛍️ <span className="text-primary">({totalItems})</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            clearCart();
            toast.success("Cart cleared");
          }}
          data-ocid="cart.delete_button"
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-4" data-ocid="cart.list">
          <AnimatePresence>
            {items.map((item, i) => {
              const price = Number(
                item.discountPriceINR > 0n
                  ? item.discountPriceINR
                  : item.priceINR,
              );
              const atMax = item.quantity >= item.stockQuantity;
              return (
                <motion.div
                  key={item.productId.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  className="card-pink p-4 flex items-center gap-4"
                  data-ocid={`cart.item.${i + 1}`}
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-2xl"
                        style={{ background: PLACEHOLDER_GRADIENT }}
                      >
                        ✨
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm text-foreground truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-primary font-bold">₹{price}</span>
                      {item.discountPriceINR > 0n &&
                        item.discountPriceINR < item.priceINR && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{Number(item.priceINR)}
                          </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (atMax) {
                            toast.error(`Only ${item.stockQuantity} in stock`);
                            return;
                          }
                          updateQuantity(item.productId, item.quantity + 1);
                        }}
                        disabled={atMax}
                        className="w-6 h-6 rounded-full border border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    {atMax && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Max stock reached
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-foreground">
                      ₹{price * item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      data-ocid={`cart.delete_button.${i + 1}`}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="card-pink p-6 h-fit sticky top-24">
          <h2 className="font-display font-bold text-lg mb-4">
            Order Summary ♥
          </h2>
          <div className="space-y-3 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Subtotal ({totalItems} items)
              </span>
              <span>₹{totalINR}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-green-600">Free 🎉</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">₹{totalINR}</span>
            </div>
          </div>
          <Button
            data-ocid="cart.primary_button"
            onClick={handleCheckout}
            className="btn-primary w-full py-3 text-base"
          >
            <ShoppingBag size={16} className="mr-2" /> Proceed to Checkout
          </Button>
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="w-full text-center text-sm text-muted-foreground hover:text-primary mt-3 transition-colors"
          >
            Continue Shopping ♥
          </button>
        </div>
      </div>
    </main>
  );
}
