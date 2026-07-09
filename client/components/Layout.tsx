import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Top Header with Logo and Navigation */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="px-6 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2Fb6df1f14bb5a44b792b09b4e7cb119ad?format=webp&width=200"
              alt="SACBM Logo"
              className="h-10 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 leading-tight">
                Admin Panel
              </p>
              <p className="text-xs text-slate-500 leading-tight">
                SACBM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Go Back to Site Button */}
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-center px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition-colors text-sm"
              title="View public website"
            >
              <ExternalLink size={16} />
              <span className="ml-2 hidden sm:inline">Back to Site</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="flex items-center justify-center px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors text-sm"
              title="Logout"
            >
              <LogOut size={16} />
              <span className="ml-2 hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
