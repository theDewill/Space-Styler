import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, Search, User, ShoppingCart, LampWallUp } from "lucide-react";
import AuthModal from "./AuthModal";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          isScrolled ? "blur-backdrop py-3" : "py-6",
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <LampWallUp className="h-7 w-7 text-accent-gold mr-2 animate-subtle-rotate" />
              <span className="font-playfair text-xl font-bold">Space Styler</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {[
              { name: "Home", href: "/" },
              { name: "Collections", href: "#collections" },

              { name: "Inspiration", href: "#inspiration" },
              { name: "About Us", href: "#about" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="font-montserrat text-sm font-medium relative animated-underline pb-1"
              >
                {item.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-5">
            <button onClick={() => setIsAuthModalOpen(true)}>
              <User className="h-5 w-5" />
            </button>
            <Link
              to="/cart"
              className="flex items-center bg-deep-indigo bg-opacity-10 rounded-full px-3 py-1"
            >
              <ShoppingCart className="h-4 w-4 mr-1 text-accent-gold" />
              <span className="text-sm font-medium">{cartCount}</span>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden blur-backdrop">
            <div className="px-4 pt-2 pb-4 space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Collections", href: "#collections" },

                { name: "Inspiration", href: "#inspiration" },
                { name: "About Us", href: "#about" },
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 font-montserrat text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex items-center space-x-4 px-3 py-2">
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="h-5 w-5" />
                </button>
                <Link
                  to="/cart"
                  className="flex items-center bg-deep-indigo bg-opacity-10 rounded-full px-3 py-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-1 text-accent-gold" />
                  <span className="text-sm font-medium">{cartCount}</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Navbar;
