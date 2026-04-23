import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Heart } from "lucide-react";

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-sm font-semibold text-white">SACBM</h3>
            <p className="mt-4 text-sm text-slate-300">
              Uniting South African businesses in Mozambique through social responsibility and community care.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61553919611189"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-300 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-300 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/south-african-chamber-of-business-in-mozambique/about/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white">Navigation</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-sm text-slate-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-sm text-slate-300 hover:text-white">
                  Actions Gallery
                </Link>
              </li>
              <li>
                <Link to="/impact" className="text-sm text-slate-300 hover:text-white">
                  Our Impact
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-slate-300 hover:text-white">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Members */}
          <div>
            <h3 className="text-sm font-semibold text-white">For Members</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/login" className="text-sm text-slate-300 hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-300 hover:text-white">
                  Submit Action
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-300 hover:text-white">
                  View Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-300 hover:text-white">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-slate-300 hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-300 hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-300 hover:text-white">
                  Code of Conduct
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-slate-300 hover:text-white">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-300">
              &copy; {currentYear} South African Chamber of Business in Mozambique. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              Made with <Heart className="h-4 w-4 text-yellow-400" /> for our community
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
