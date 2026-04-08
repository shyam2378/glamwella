import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useProductsByCategory } from "../hooks/useQueries";

interface CategoryProps {
  onNavigate: (path: string) => void;
  categoryName: string;
}

const CATEGORY_META: Record<string, { emoji: string; banner: string }> = {
  "Eye Collection": {
    emoji: "👁️",
    banner: "linear-gradient(135deg, #fce4ec, #e1bee7)",
  },
  "Lips Collection": {
    emoji: "💄",
    banner: "linear-gradient(135deg, #fce4ec, #ffcdd2)",
  },
  "Face Collection": {
    emoji: "✨",
    banner: "linear-gradient(135deg, #fff3e0, #fce4ec)",
  },
  "Nail Collection": {
    emoji: "💅",
    banner: "linear-gradient(135deg, #e8f5e9, #fce4ec)",
  },
};

export function Category({ onNavigate, categoryName }: CategoryProps) {
  const { data: products, isLoading } = useProductsByCategory(categoryName);
  const meta = CATEGORY_META[categoryName] ?? {
    emoji: "✨",
    banner: "linear-gradient(135deg, #fce4ec, #f8bbd0)",
  };

  return (
    <main className="pb-16">
      {/* Banner */}
      <div className="py-12" style={{ background: meta.banner }}>
        <div className="container mx-auto px-4">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Home
          </button>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{meta.emoji}</span>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {categoryName}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isLoading
                  ? "Loading..."
                  : `${products?.length ?? 0} products ✨`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sparkle-divider">
        <span>✦</span>
        <span className="text-primary">♥</span>
        <span>✦</span>
      </div>

      <div className="container mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
              <div key={k} className="card-pink overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : !products || products.length === 0 ? (
          <div className="text-center py-20" data-ocid="category.empty_state">
            <div className="text-6xl mb-4">{meta.emoji}</div>
            <h2 className="font-display text-xl text-muted-foreground">
              No products yet in {categoryName}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon! 💕
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {products.map(([id, product], i) => (
              <ProductCard
                key={id.toString()}
                id={id}
                product={product}
                onNavigate={onNavigate}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
}
