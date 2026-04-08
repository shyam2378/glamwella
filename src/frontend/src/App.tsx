import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { WelcomeBanner } from "./components/WelcomeBanner";
import { CartProvider } from "./contexts/CartContext";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useMyProfile } from "./hooks/useQueries";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminLogin } from "./pages/AdminLogin";
import { Cart } from "./pages/Cart";
import { Category } from "./pages/Category";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { MyOrders } from "./pages/MyOrders";
import { ProductDetail } from "./pages/ProductDetail";
import { Profile } from "./pages/Profile";
import { SearchResults } from "./pages/SearchResults";

function parseHash(hash: string): {
  path: string;
  params: Record<string, string>;
} {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const [pathPart, queryPart] = raw.split("?");
  const path = pathPart || "/";
  const params: Record<string, string> = {};
  if (queryPart) {
    for (const pair of queryPart.split("&")) {
      const [k, v] = pair.split("=");
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? "");
    }
  }
  return { path, params };
}

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const [currentHash, setCurrentHash] = useState(window.location.hash || "#/");

  const { path, params } = parseHash(currentHash);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handler = () => {
      setCurrentHash(window.location.hash || "#/");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Profile check after login
  const { data: profile, isLoading: profileLoading } = useMyProfile();

  useEffect(() => {
    if (!identity || profileLoading || isInitializing || actorFetching) return;
    if (path.startsWith("/admin")) return;
    if (profile === null || (profile && !profile.profileComplete)) {
      if (path !== "/profile") {
        navigate("/profile");
      }
    }
  }, [
    identity,
    profile,
    profileLoading,
    isInitializing,
    actorFetching,
    path,
    navigate,
  ]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={40}
            className="animate-spin text-primary mx-auto mb-4"
          />
          <p className="font-display text-muted-foreground">
            Loading GLAMWELLA 🎀
          </p>
        </div>
      </div>
    );
  }

  // Admin routes - no navbar/footer
  if (path === "/admin") {
    return <AdminLogin onNavigate={navigate} />;
  }
  if (path === "/admin/dashboard") {
    return <AdminDashboard onNavigate={navigate} />;
  }

  // Determine which page to render
  let page: React.ReactNode;

  if (path === "/") {
    page = <Home onNavigate={navigate} />;
  } else if (path.startsWith("/category/")) {
    const categoryName = decodeURIComponent(path.replace("/category/", ""));
    page = <Category onNavigate={navigate} categoryName={categoryName} />;
  } else if (path === "/search") {
    page = <SearchResults onNavigate={navigate} query={params.q ?? ""} />;
  } else if (path.startsWith("/product/")) {
    const productId = path.replace("/product/", "");
    page = <ProductDetail onNavigate={navigate} productId={productId} />;
  } else if (path === "/cart") {
    page = <Cart onNavigate={navigate} />;
  } else if (path === "/checkout") {
    page = <Checkout onNavigate={navigate} />;
  } else if (path === "/profile") {
    const isFirstLogin =
      identity !== undefined &&
      identity !== null &&
      (profile === null || (profile && !profile.profileComplete));
    page = <Profile onNavigate={navigate} isFirstLogin={isFirstLogin} />;
  } else if (path === "/orders") {
    page = <MyOrders onNavigate={navigate} />;
  } else {
    page = <Home onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={navigate} currentPath={path} />
      <WelcomeBanner />
      <div className="flex-1">{page}</div>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
      <Toaster richColors position="top-right" />
    </CartProvider>
  );
}
