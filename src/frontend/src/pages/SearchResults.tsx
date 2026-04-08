import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useSearchProducts } from "../hooks/useQueries";

interface SearchResultsProps {
  onNavigate: (path: string) => void;
  query: string;
}

export function SearchResults({ onNavigate, query }: SearchResultsProps) {
  const { data: products, isLoading } = useSearchProducts(query);

  return (
    <main className="pb-16">
      <div className="gradient-hero py-10">
        <div className="container mx-auto px-4">
          <button
            type="button"
            onClick={() => onNavigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Search: "{query}"
          </h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Searching..."
              : `${products?.length ?? 0} results found`}
          </p>
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
            {["a", "b", "c", "d"].map((k) => (
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
          <div className="text-center py-20" data-ocid="search.empty_state">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="font-display text-xl text-muted-foreground">
              No products found for "{query}"
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Try a different search term
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
