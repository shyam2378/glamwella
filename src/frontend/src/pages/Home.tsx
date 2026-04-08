import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Star } from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useQueries";

interface HomeProps {
  onNavigate: (path: string) => void;
}

const CATEGORIES = [
  {
    name: "Eye Collection",
    emoji: "👁️",
    desc: "Lashes, liners & palettes",
    bg: "linear-gradient(135deg, #fce4ec, #e1bee7)",
    path: "/category/Eye Collection",
  },
  {
    name: "Lips Collection",
    emoji: "💄",
    desc: "Lipsticks, glosses & liners",
    bg: "linear-gradient(135deg, #fce4ec, #ffcdd2)",
    path: "/category/Lips Collection",
  },
  {
    name: "Face Collection",
    emoji: "✨",
    desc: "Foundation, blush & more",
    bg: "linear-gradient(135deg, #fff3e0, #fce4ec)",
    path: "/category/Face Collection",
  },
  {
    name: "Nail Collection",
    emoji: "💅",
    desc: "Polish, nail art & kits",
    bg: "linear-gradient(135deg, #e8f5e9, #fce4ec)",
    path: "/category/Nail Collection",
  },
];

export function Home({ onNavigate }: HomeProps) {
  const { data: products, isLoading } = useProducts();
  const featured = products?.slice(0, 8) ?? [];

  return (
    <main>
      {/* Hero */}
      <section className="gradient-hero py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-4xl mb-3">🎀 ♥ ✨</div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
              Welcome to{" "}
              <span style={{ color: "oklch(0.55 0.22 350)" }}>GLAMWELLA</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Discover luxury beauty products curated just for you. From bold
              eyes to glowing skin — find your perfect look. ♥
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                type="button"
                data-ocid="hero.primary_button"
                onClick={() => onNavigate("/category/Face Collection")}
                className="btn-primary px-8 py-3 text-base"
              >
                Shop Now 🛍️
              </button>
              <button
                type="button"
                data-ocid="hero.secondary_button"
                onClick={() => onNavigate("/category/Lips Collection")}
                className="btn-gold px-8 py-3 text-base"
              >
                Explore Lips 💄
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sparkle Divider */}
      <div className="sparkle-divider">
        <span>✦</span>
        <span className="text-primary">♥</span>
        <span>✦</span>
        <span className="font-display text-sm text-muted-foreground">
          Our Collections
        </span>
        <span>✦</span>
        <span className="text-primary">♥</span>
        <span>✦</span>
      </div>

      {/* Categories */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.button
              type="button"
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              onClick={() => onNavigate(cat.path)}
              data-ocid={`category.item.${i + 1}`}
              className="card-pink p-6 flex flex-col items-center gap-3 group text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                style={{ background: cat.bg }}
              >
                {cat.emoji}
              </div>
              <div>
                <p className="font-display font-semibold text-sm text-foreground">
                  {cat.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cat.desc}
                </p>
              </div>
              <ChevronRight
                size={14}
                className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Sparkle Divider */}
      <div className="sparkle-divider">
        <span>✦</span>
        <span className="text-primary">♥</span>
        <span>✦</span>
        <span className="font-display text-sm text-muted-foreground">
          Featured Products
        </span>
        <span>✦</span>
        <span className="text-primary">♥</span>
        <span>✦</span>
      </div>

      {/* Featured Products */}
      <section className="container mx-auto px-4 pb-16">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["a", "b", "c", "d", "e", "f", "g", "h"].map((k) => (
              <div key={k} className="card-pink overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16" data-ocid="product.empty_state">
            <div className="text-5xl mb-4">💄</div>
            <p className="font-display text-lg text-muted-foreground">
              Products coming soon! ✨
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map(([id, product], i) => (
              <ProductCard
                key={id.toString()}
                id={id}
                product={product}
                onNavigate={onNavigate}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="container mx-auto px-4 pb-16">
        <div
          className="rounded-3xl p-8 md:p-12 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.22 350), oklch(0.45 0.20 350))",
          }}
        >
          <div className="text-4xl mb-4">🎀 ♦ ♥ ✦ 🎀</div>
          <h2 className="font-display text-3xl font-bold text-white mb-3">
            Exclusive Beauty Deals!
          </h2>
          <p className="text-white/80 mb-6">
            Get up to 40% off on select products. Limited time offer!
          </p>
          <div className="flex items-center justify-center gap-1 text-yellow-300 mb-6">
            {["s1", "s2", "s3", "s4", "s5"].map((k) => (
              <Star key={k} size={18} fill="currentColor" />
            ))}
          </div>
          <button
            type="button"
            onClick={() => onNavigate("/category/Face Collection")}
            className="bg-white text-primary font-bold rounded-full px-8 py-3 transition-all hover:scale-105"
          >
            Shop Sale ✨
          </button>
        </div>
      </section>
    </main>
  );
}
