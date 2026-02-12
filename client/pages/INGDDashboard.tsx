import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { getIngdRequests } from "@/services/supabaseService";
import type { IngdRequest } from "@/services/supabaseService";

// Format numbers with . for thousands and , for decimals (European format)
const formatNumber = (value: number, decimals: number = 0): string => {
  const fixed = value.toFixed(decimals);
  const [integer, decimal] = fixed.split('.');

  // Add thousands separator with dots
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Combine with comma as decimal separator
  return decimal ? `${withThousands},${decimal}` : withThousands;
};

// Extract item name and quantity from format like "Arroz (25Kg)"
const parseItem = (item: string): { name: string; quantity: string } => {
  const match = item?.match(/^(.*?)\s*\((.+?)\)$/);
  if (match) {
    return { name: match[1].trim(), quantity: match[2] };
  }
  return { name: item || "", quantity: "" };
};

function getStatusStyles(status: boolean) {
  return status
    ? "bg-green-100 text-green-700 border border-green-300"
    : "bg-blue-100 text-blue-700 border border-blue-300";
}

function getStatusLabel(status: boolean) {
  return status ? "✓ Met" : "⏳ Pending";
}

export default function INGDDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "requests">("dashboard");
  const [ingdRequests, setIngdRequests] = useState<IngdRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<IngdRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    // Load INGD requests when requests tab is selected
    const loadIngdRequests = async () => {
      if (activeTab === "requests") {
        setIsLoading(true);
        try {
          const requests = await getIngdRequests();
          setIngdRequests(requests);
          // Apply filter
          if (selectedCategory === "all") {
            setFilteredRequests(requests);
          } else {
            setFilteredRequests(requests.filter(r => r.category === selectedCategory));
          }
        } catch (error) {
          console.error("Error loading INGD requests:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadIngdRequests();
  }, [activeTab]);

  // Handle category filter change
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredRequests(ingdRequests);
    } else {
      setFilteredRequests(ingdRequests.filter(r => r.category === selectedCategory));
    }
  }, [selectedCategory, ingdRequests]);

  useEffect(() => {
    // Set up Tableau visualization with responsive dimensions
    const resizeDashboard = () => {
      const divElement = document.getElementById("viz1769532767397");
      if (divElement) {
        const vizElement = divElement.getElementsByTagName("object")[0];
        if (vizElement) {
          // Original dimensions: 1400x937
          // Calculate responsive width (use available width, max 1400px)
          const container =
            divElement.closest(".overflow-x-auto") || divElement.parentElement;
          let width = 1400;
          let height = 937;

          if (container) {
            const availableWidth = container.clientWidth - 20; // Account for padding
            if (availableWidth < 1400) {
              // Scale proportionally if less space available
              const scale = availableWidth / 1400;
              width = availableWidth;
              height = Math.round(937 * scale);
            }
          }

          vizElement.style.width = width + "px";
          vizElement.style.height = height + "px";
        }
      }
    };

    // Initial sizing
    resizeDashboard();

    // Resize on window resize
    window.addEventListener("resize", resizeDashboard);

    // Load Tableau API script
    const script = document.createElement("script");
    script.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    script.async = true;
    script.type = "text/javascript";

    const divElement = document.getElementById("viz1769532767397");
    if (divElement) {
      const vizElement = divElement.getElementsByTagName("object")[0];
      if (vizElement && vizElement.parentNode) {
        vizElement.parentNode.insertBefore(script, vizElement);
      }
    }

    return () => {
      // Cleanup
      window.removeEventListener("resize", resizeDashboard);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              INGD Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Real-time data from INGD's official disaster impact dashboard
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "dashboard"
                ? "text-primary border-primary"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "requests"
                ? "text-primary border-primary"
                : "text-slate-600 border-transparent hover:text-slate-900"
            }`}
          >
            INGD Relief Requests
          </button>
        </div>

        {/* Embedded Tableau Dashboard - Only show when dashboard tab is active */}
        {activeTab === "dashboard" && (
        <>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <p className="text-sm text-slate-600">
              Last updated: {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div
            className="w-full bg-white overflow-x-auto"
            style={{ minHeight: "1000px" }}
          >
            <div
              className="tableauPlaceholder"
              id="viz1769532767397"
              style={{ position: "relative" }}
            >
              <noscript>
                <a href="#">
                  <img
                    alt="Dashboard"
                    src="https://public.tableau.com/static/images/DA/DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard/1_rss.png"
                    style={{ border: "none" }}
                  />
                </a>
              </noscript>
              <object className="tableauViz" style={{ display: "none" }}>
                <param
                  name="host_url"
                  value="https%3A%2F%2Fpublic.tableau.com%2F"
                />
                <param name="embed_code_version" value="3" />
                <param name="site_root" value="" />
                <param
                  name="name"
                  value="DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard"
                />
                <param name="tabs" value="no" />
                <param name="toolbar" value="yes" />
                <param
                  name="static_image"
                  value="https://public.tableau.com/static/images/DA/DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard/1.png"
                />
                <param name="animate_transition" value="yes" />
                <param name="display_static_image" value="yes" />
                <param name="display_spinner" value="yes" />
                <param name="display_overlay" value="yes" />
                <param name="display_count" value="yes" />
                <param name="language" value="en-US" />
              </object>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2">About INGD</h3>
            <p className="text-sm text-blue-800">
              The National Institute for Disaster Management (INGD) provides
              official disaster impact statistics and coordination for disaster
              relief efforts in Mozambique.
            </p>
          </div>

          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <h3 className="font-bold text-orange-900 mb-2">
              Data Synchronization
            </h3>
            <p className="text-sm text-orange-800">
              This dashboard displays live data from INGD's official systems.
              Refresh the page to see the latest updates.
            </p>
          </div>
        </div>
        </>
        )}

        {/* INGD Relief Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <h2 className="text-lg font-bold text-slate-900">INGD Relief Requests</h2>
              <p className="text-sm text-slate-600 mt-1">
                {filteredRequests.length} of {ingdRequests.length} request{ingdRequests.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Category Filter */}
            <div className="px-6 py-4 border-b border-slate-200 bg-white">
              <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Category:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All Categories
                </button>
                {Array.from(new Set(ingdRequests.map(r => r.category).filter(Boolean))).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-6 text-center text-slate-600">Loading INGD requests...</div>
              ) : filteredRequests.length > 0 ? (
                <table className="w-full text-sm md:text-base">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">#</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Company</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Category</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Item</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700">Qty</th>
                      <th className="px-2 md:px-4 py-3 text-center text-xs md:text-sm font-semibold text-slate-700 hidden lg:table-cell">Maputo</th>
                      <th className="px-2 md:px-4 py-3 text-center text-xs md:text-sm font-semibold text-slate-700 hidden lg:table-cell">Gaza</th>
                      <th className="px-2 md:px-4 py-3 text-center text-xs md:text-sm font-semibold text-slate-700 hidden lg:table-cell">Sofala</th>
                      <th className="px-2 md:px-4 py-3 text-center text-xs md:text-sm font-semibold text-slate-700 hidden lg:table-cell">Zambézia</th>
                      <th className="px-2 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-slate-700">Total</th>
                      <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-semibold text-slate-700 hidden sm:table-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request, index) => {
                      const { name, quantity } = parseItem(request.Item || "");
                      return (
                        <tr
                          key={request.id}
                          className={`border-b border-slate-200 transition-colors hover:bg-blue-50 ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50"
                          }`}
                        >
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm font-medium text-slate-600">#{request.id}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-700 font-medium">{request.company_name}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {request.category}
                            </span>
                          </td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-600">{name}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-slate-600 whitespace-nowrap">{quantity}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-center text-slate-600 hidden lg:table-cell">{formatNumber(request.Maputo || 0)}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-center text-slate-600 hidden lg:table-cell">{formatNumber(request.Gaza || 0)}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-center text-slate-600 hidden lg:table-cell">{formatNumber(request.Sofala || 0)}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-center text-slate-600 hidden lg:table-cell">{formatNumber(request.Zambezia || 0)}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm text-right font-semibold text-primary">{formatNumber(request.Total || 0)}</td>
                          <td className="px-2 md:px-4 py-3 text-xs md:text-sm hidden sm:table-cell">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                              ⏳ Pending
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-slate-600">
                  {ingdRequests.length === 0 ? "No INGD relief requests found" : "No requests match the selected category"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
