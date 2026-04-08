import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CartItem {
  productId: bigint;
  name: string;
  quantity: number;
  priceINR: bigint;
  discountPriceINR: bigint;
  imageUrl: string;
  stockQuantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: bigint) => void;
  updateQuantity: (productId: bigint, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalINR: number;
}

const CartContext = createContext<CartContextType | null>(null);

function serializeCart(items: CartItem[]): string {
  return JSON.stringify(
    items.map((i) => ({
      ...i,
      productId: i.productId.toString(),
      priceINR: i.priceINR.toString(),
      discountPriceINR: i.discountPriceINR.toString(),
    })),
  );
}

function deserializeCart(raw: string): CartItem[] {
  try {
    const parsed = JSON.parse(raw);
    return parsed.map(
      (i: {
        productId: string;
        priceINR: string;
        discountPriceINR: string;
        name: string;
        quantity: number;
        imageUrl: string;
        stockQuantity?: number;
      }) => ({
        ...i,
        productId: BigInt(i.productId),
        priceINR: BigInt(i.priceINR),
        discountPriceINR: BigInt(i.discountPriceINR),
        stockQuantity: i.stockQuantity ?? 99,
      }),
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("glamwella_cart");
    return stored ? deserializeCart(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("glamwella_cart", serializeCart(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        const newQty = Math.min(
          existing.quantity + item.quantity,
          item.stockQuantity,
        );
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: newQty, stockQuantity: item.stockQuantity }
            : i,
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (productId: bigint) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: bigint, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
          : i,
      ),
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalINR = items.reduce((sum, i) => {
    const price = Number(
      i.discountPriceINR > 0n ? i.discountPriceINR : i.priceINR,
    );
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalINR,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
