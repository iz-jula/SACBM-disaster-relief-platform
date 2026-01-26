import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart3, Table2, Map, Upload, Menu, X, Cloud, ChevronLeft, Lock } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/requests", label: "Relief Requests", icon: Table2 },
    { href: "/upload", label: "Upload Requests", icon: Upload },
    { href: "/weather", label: "Weather Forecast", icon: Cloud },
    { href: "/ingd-dashboard", label: "INGD Dashboard", icon: Map },
  ];

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
            <Link
              to="/"
              className="flex items-center gap-3 mb-8"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="bg-gradient-to-br from-primary to-orange-600 rounded-lg p-2 flex-shrink-0">
                <BarChart3 size={24} className="text-white" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-xl font-bold text-slate-900">SABCM</h1>
                  <p className="text-xs text-slate-600">Disaster Relief</p>
                </div>
              )}
            </Link>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = location.pathname === href;
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? label : ""}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!sidebarCollapsed && <span>{label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Collapse Button - Bottom of Sidebar */}
        <div className={`border-t border-slate-200 p-4 ${sidebarCollapsed ? "md:p-2" : ""}`}>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex items-center justify-center w-full px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft
              size={20}
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
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-slate-900">SABCM</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
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
