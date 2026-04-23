import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Our Impact", href: "/impact" },
    { label: "Actions Gallery", href: "/gallery" },
    { label: "About", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
            <span className="hidden font-semibold text-foreground sm:inline">
              Chamber Social<br className="hidden sm:block" /> Responsibility
            </span>
            <span className="sm:hidden font-semibold text-foreground">CSR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                <LogIn className="h-4 w-4 mr-2" />
                Member Login
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="border-t bg-white md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                className="block rounded-lg px-3 py-2 text-base font-medium text-orange-600 hover:bg-orange-50"
                onClick={() => setIsOpen(false)}
              >
                Member Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
