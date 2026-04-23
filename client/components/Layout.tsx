import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronLeft,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation items removed - admin panel is streamlined
  // Users access specific features via tabs in Admin.tsx

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:static left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-lg md:shadow-none transform transition-all duration-300 z-40 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${sidebarCollapsed ? "md:w-20" : ""}`}
      >
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={`p-6 ${sidebarCollapsed ? "md:p-3" : ""}`}>
            {/* Logo */}
            <div className="flex flex-col items-center gap-2 mb-8">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2Fb6df1f14bb5a44b792b09b4e7cb119ad?format=webp&width=200"
                alt="SACBM Logo"
                className={`flex-shrink-0 ${sidebarCollapsed ? "md:h-8" : "h-14"}`}
              />
              {!sidebarCollapsed && (
                <div className="text-center">
                  <h1 className="text-sm font-bold text-slate-900 leading-tight">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-slate-500 leading-tight">
                    SACBM
                  </p>
                </div>
              )}
            </div>

            {/* Navigation removed - admin features accessed via tabs */}
          </div>
        </div>

        {/* Bottom Actions - Bottom of Sidebar */}
        <div className={`border-t border-slate-200 space-y-2 p-4 ${sidebarCollapsed ? "md:p-2" : ""}`}>
          {/* Back to Public Site */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition-colors text-sm"
            title="View public website"
          >
            <ExternalLink size={16} />
            {!sidebarCollapsed && <span className="ml-2">Public Site</span>}
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
            className="flex items-center justify-center w-full px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-colors text-sm"
            title="Logout"
          >
            <LogOut size={16} />
            {!sidebarCollapsed && <span className="ml-2">Logout</span>}
          </button>

          {/* Collapse Button - Desktop only */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center justify-center w-full px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors text-sm"
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft
              size={16}
              className={`transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`}
            />
            {!sidebarCollapsed && <span className="ml-2">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div
              className="flex items-center gap-2 flex-1"
              title="SACBM Admin Panel"
            >
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
                  Management
                </p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
