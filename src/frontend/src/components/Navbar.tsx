import glamwellaLogo from "@/assets/glamwella-logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavbarProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export function Navbar({ onNavigate, currentPath }: NavbarProps) {
  const { totalItems } = useCart();
  const { identity, login, clear, isLoggingIn, loginStatus } =
    useInternetIdentity();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "👁️ Eye", path: "/category/Eye Collection" },
    { label: "💄 Lips", path: "/category/Lips Collection" },
    { label: "✨ Face", path: "/category/Face Collection" },
    { label: "💅 Nails", path: "/category/Nail Collection" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            type="button"
            data-ocid="nav.link"
            onClick={() => onNavigate("/")}
            className="flex-shrink-0"
          >
            <img
              src={glamwellaLogo}
              alt="GLAMWELLA"
              className="h-16 w-auto object-contain"
            />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.path}
                data-ocid="nav.link"
                onClick={() => onNavigate(link.path)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  currentPath === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:text-primary hover:bg-secondary"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden md:flex items-center">
              <AnimatePresence>
                {showSearch && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="overflow-hidden"
                  >
                    <Input
                      data-ocid="nav.search_input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="h-8 text-sm rounded-full border-primary/30 focus:border-primary"
                      autoFocus
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-full hover:bg-secondary text-foreground hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Cart */}
            <button
              type="button"
              data-ocid="nav.link"
              onClick={() => onNavigate("/cart")}
              className="relative p-2 rounded-full hover:bg-secondary text-foreground hover:text-primary transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth */}
            {identity ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  data-ocid="nav.link"
                  onClick={() => onNavigate("/profile")}
                  className="p-2 rounded-full hover:bg-secondary text-foreground hover:text-primary transition-colors"
                  aria-label="Profile"
                >
                  <User size={18} />
                </button>
                <button
                  type="button"
                  data-ocid="nav.link"
                  onClick={() => onNavigate("/orders")}
                  className="hidden md:block px-3 py-1.5 rounded-full text-xs font-medium text-foreground hover:text-primary hover:bg-secondary transition-colors"
                >
                  My Orders
                </button>
                <button
                  type="button"
                  data-ocid="nav.link"
                  onClick={() => {
                    clear();
                  }}
                  className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Button
                data-ocid="nav.primary_button"
                onClick={() => login()}
                disabled={isLoggingIn}
                size="sm"
                className="btn-primary text-xs rounded-full"
              >
                {isLoggingIn
                  ? "Logging in..."
                  : loginStatus === "loginError"
                    ? "Try Again"
                    : "Login 💕"}
              </Button>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              data-ocid="nav.search_input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="h-8 text-sm rounded-full border-primary/30"
            />
            <Button
              type="submit"
              size="sm"
              className="btn-primary rounded-full h-8 px-3"
            >
              <Search size={14} />
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-card overflow-hidden"
          >
            <div className="container px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  type="button"
                  key={link.path}
                  onClick={() => {
                    onNavigate(link.path);
                    setMobileOpen(false);
                  }}
                  className="text-left px-4 py-2 rounded-lg hover:bg-secondary text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
              {identity && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate("/orders");
                      setMobileOpen(false);
                    }}
                    className="text-left px-4 py-2 rounded-lg hover:bg-secondary text-sm font-medium"
                  >
                    My Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate("/profile");
                      setMobileOpen(false);
                    }}
                    className="text-left px-4 py-2 rounded-lg hover:bg-secondary text-sm font-medium"
                  >
                    Profile
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
