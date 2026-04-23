import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Heart } from "lucide-react";

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Chamber</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Uniting businesses in social responsibility and community care.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Navigation</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-muted-foreground hover:text-foreground">
                  Actions Gallery
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-sm text-muted-foreground hover:text-foreground">
                  Our Impact
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Members */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">For Members</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                  Login
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Submit Action
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  View Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Code of Conduct
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Chamber of Commerce. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Made with <Heart className="h-4 w-4 text-red-500" /> for our community
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
