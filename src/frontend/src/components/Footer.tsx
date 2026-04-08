import glamwellaLogo from "@/assets/glamwella-logo.png";
import { Instagram, Mail } from "lucide-react";

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-16 border-t border-border"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.92 0.06 350 / 0.4), oklch(0.94 0.04 5 / 0.4))",
      }}
    >
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col items-start gap-3">
            <img
              src={glamwellaLogo}
              alt="GLAMWELLA"
              className="h-12 w-auto object-contain"
            />
            <p className="text-sm text-muted-foreground">
              ✦ Your one-stop beauty destination ✦
            </p>
            <p className="text-xs text-muted-foreground">
              Beauty is power, a smile is its sword 🎀
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-3">
              Collections 💄
            </h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>👁️ Eye Collection</li>
              <li>💋 Lips Collection</li>
              <li>✨ Face Collection</li>
              <li>💅 Nail Collection</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-3">
              Connect With Us ♥
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="mailto:glamwellaa@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail size={15} className="text-primary" />
                glamwellaa@gmail.com
              </a>
              <a
                href="https://www.instagram.com/glamwellaa._"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram size={15} className="text-primary" />
                @glamwellaa._
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <p>© {year} GLAMWELLA. All rights reserved. 🎀</p>
          <button
            type="button"
            onClick={() => onNavigate?.("/admin")}
            className="hover:text-primary transition-colors"
          >
            Admin Login 🔐
          </button>
        </div>
      </div>
    </footer>
  );
}
