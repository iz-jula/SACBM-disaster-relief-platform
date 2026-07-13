import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogIn, ChevronDown, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImpactDropdownOpen, setIsImpactDropdownOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/" },
    { label: "Events", href: "/events" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2Fb6df1f14bb5a44b792b09b4e7cb119ad?format=webp&width=200"
              alt="SACBM Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Dashboard Link */}
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>

            {/* Our Impact Dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground flex items-center gap-1">
                Our Impact
                <ChevronDown className="h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  to="/gallery"
                  className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-slate-50 hover:text-foreground rounded-t-lg first:rounded-t-lg"
                >
                  Gallery
                </Link>
                <Link
                  to="/our-members"
                  className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-slate-50 hover:text-foreground rounded-b-lg last:rounded-b-lg"
                >
                  Per Member
                </Link>
              </div>
            </div>

            {/* Events Link */}
            <Link
              to="/events"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Events
            </Link>

            <Link
              to="/mandela-day"
              className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-yellow-300"
            >
              <HeartHandshake className="h-4 w-4" />
              Mandela Day
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/members">
              <Button size="sm" className="hidden sm:inline-flex bg-emerald-700 hover:bg-emerald-800 text-white">
                <LogIn className="h-4 w-4 mr-2" />
                Member Section
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
              {/* Dashboard Link */}
              <Link
                to="/"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>

              {/* Mobile Our Impact Dropdown */}
              <div>
                <button
                  onClick={() => setIsImpactDropdownOpen(!isImpactDropdownOpen)}
                  className="w-full text-left rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground flex items-center justify-between"
                >
                  Our Impact
                  <ChevronDown className={`h-4 w-4 transition-transform ${isImpactDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isImpactDropdownOpen && (
                  <div className="pl-4 space-y-1">
                    <Link
                      to="/gallery"
                      className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        setIsOpen(false);
                        setIsImpactDropdownOpen(false);
                      }}
                    >
                      Gallery
                    </Link>
                    <Link
                      to="/our-members"
                      className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() => {
                        setIsOpen(false);
                        setIsImpactDropdownOpen(false);
                      }}
                    >
                      Per Member
                    </Link>
                  </div>
                )}
              </div>

              {/* Events Link */}
              <Link
                to="/events"
                className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>

              <Link
                to="/mandela-day"
                className="flex items-center gap-2 rounded-lg bg-yellow-100 px-3 py-2 text-base font-semibold text-slate-900 hover:bg-yellow-200"
                onClick={() => setIsOpen(false)}
              >
                <HeartHandshake className="h-4 w-4 text-emerald-700" />
                Mandela Day
              </Link>

              <Link
                to="/members"
                className="block rounded-lg px-3 py-2 text-base font-medium text-emerald-700 hover:bg-emerald-50"
                onClick={() => setIsOpen(false)}
              >
                Member Section
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
