import { Link } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import Layout from "@/components/Layout";
import {
  getRecentRequests,
  getMetrics,
  Metrics,
} from "@/services/requestsService";
import {
  getAchievementsMetrics,
  Achievement,
  getAchievements,
  AchievementsMetrics,
  Achievement,
} from "@/services/achievementsService";
import { getIngdMetrics, getIngdRequests, IngdRequest, getIngdDocuments, IngdDocument, getIngdActiveSetting } from "@/services/supabaseService";
import { Download } from "lucide-react";

import ActionsImageGrid from "@/components/ActionsImageGrid";
import PdfViewer from "@/components/PdfViewer";

// Format numbers with . for thousands and , for decimals (European format)
const formatNumber = (value: number, decimals: number = 0): string => {
  const fixed = value.toFixed(decimals);
  const [integer, decimal] = fixed.split('.');

  // Add thousands separator with dots
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Combine with comma as decimal separator
  return decimal ? `${withThousands},${decimal}` : withThousands;
};

export default function Dashboard() {
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [achievementsMetrics, setAchievementsMetrics] =
    useState<AchievementsMetrics | null>(null);
  const [ingdMetrics, setIngdMetrics] = useState<any>(null);
  const [recentIngdRequests, setRecentIngdRequests] = useState<IngdRequest[]>([]);
  const [governmentDocument, setGovernmentDocument] = useState<IngdDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [ingdActive, setIngdActive] = useState(true);

  useEffect(() => {
    // Fetch data from API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [requests, metricsData, achievementsData, ingdMetricsData, ingdRecentData, achievementsImages, allDocuments] = await Promise.all([
          getRecentRequests(5),
          getMetrics(),
          getAchievementsMetrics(),
          getIngdMetrics(),
          getIngdRequests(),
          getAchievements(),
          getIngdDocuments(),
        ]);
        setRecentRequests(requests);
        setMetrics(metricsData);
        setAchievementsMetrics(achievementsData);
        setIngdMetrics(ingdMetricsData);
        // Get first 5 INGD requests
        setRecentIngdRequests(ingdRecentData.slice(0, 5));
        setAchievements(achievementsImages || []);

        // Get latest government priority document
        const govDocs = allDocuments?.filter(doc =>
          doc.type === "government_priority" ||
          doc.description?.toLowerCase().includes("government") ||
          doc.description?.toLowerCase().includes("priority")
        ) || [];
        if (govDocs.length > 0) {
          setGovernmentDocument(govDocs[0]); // Get most recent/first one
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Load INGD setting from database
    const loadIngdSetting = async () => {
      const isActive = await getIngdActiveSetting();
      setIngdActive(isActive);
    };

    loadIngdSetting();

    // Poll for changes every 2 seconds
    const interval = setInterval(loadIngdSetting, 2000);

    // Set up Tableau visualization on dashboard with responsive sizing
    const resizeDashboardViz = () => {
      const divElement = document.getElementById("viz1769532767397_dashboard");
      if (divElement) {
        const vizElement = divElement.getElementsByTagName("object")[0];
        if (vizElement) {
          // Responsive sizing for dashboard card
          const container =
            divElement.closest("[style*='minHeight']") ||
            divElement.parentElement;
          let width = 900; // Max width for dashboard
          let height = 500; // Compact height

          if (container) {
            const availableWidth = container.clientWidth - 20;
            if (availableWidth < 900) {
              const scale = availableWidth / 900;
              width = availableWidth;
              height = Math.round(500 * scale);
            }
          }

          vizElement.style.width = width + "px";
          vizElement.style.height = height + "px";
        }
      }
    };

    // Initial sizing
    resizeDashboardViz();
    window.addEventListener("resize", resizeDashboardViz);

    // Load Tableau API script for INGD dashboard
    const script = document.createElement("script");
    script.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    script.async = true;
    script.type = "text/javascript";

    const divElement = document.getElementById("viz1769532767397_dashboard");
    if (divElement) {
      const vizElement = divElement.getElementsByTagName("object")[0];
      if (vizElement && vizElement.parentNode) {
        vizElement.parentNode.insertBefore(script, vizElement);
      }
    }

    return () => {
      window.removeEventListener("resize", resizeDashboardViz);
      clearInterval(interval);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Modern Page Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-blue-500/5 rounded-2xl" />
          <div className="relative px-6 sm:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                  Members Social Impact Actions Dashboard
                </h1>
                <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-2xl">
                  Track and celebrate member contributions to Social Impact efforts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Actions Summary - Modern Section */}
        {achievementsMetrics && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  MEMBERS ACTIONS
                </h2>
                <p className="text-slate-600 mt-2">
                  Member social impact actions and contributions beyond relief request
                </p>
              </div>
              <Link
                to="/actions"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300 whitespace-nowrap"
              >
                View All
                <span className="transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Actions */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/40 rounded-2xl p-6 border border-blue-200/40 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                <div className="relative">
                  <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                    Total Actions
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">
                    {achievementsMetrics.totalAchievements}
                  </p>
                  <p className="text-sm text-slate-600 mt-4">Community work</p>
                </div>
              </div>

              {/* People Impacted */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/40 rounded-2xl p-6 border border-blue-200/40 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                <div className="relative">
                  <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                    People Impacted
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">
                    {formatNumber(achievementsMetrics.totalPeopleImpacted || 0)}
                  </p>
                  <p className="text-sm text-slate-600 mt-4">Direct impact</p>
                </div>
              </div>

              {/* Total Contribution */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/40 rounded-2xl p-6 border border-blue-200/40 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                <div className="relative">
                  <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                    Total Contribution
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-3">
                    {formatNumber((achievementsMetrics.totalContributed || 0) / 1000, 1)}
                    K
                  </p>
                  <p className="text-sm text-slate-600 mt-4">MZN invested</p>
                </div>
              </div>

              {/* Most Active Province */}
              <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/40 rounded-2xl p-6 border border-blue-200/40 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
                <div className="relative">
                  <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                    Most Active Province
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">
                    {(() => {
                      const provinceCounts = achievements.reduce((acc: Record<string, number>, action) => {
                        const province = action.location?.split(",")[0].trim() || "Unknown";
                        acc[province] = (acc[province] || 0) + 1;
                        return acc;
                      }, {});
                      const mostActive = Object.entries(provinceCounts).sort(([,a], [,b]) => b - a)[0];
                      return mostActive ? mostActive[0] : "N/A";
                    })()}
                  </p>
                  <p className="text-sm text-slate-600 mt-4">By actions count</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Relief Requests Summary - Combined with INGD */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                RELIEF REQUESTS
              </h2>
              <p className="text-slate-600 mt-2">
                Combined overview of Social impact and disaster relief operations and INGD relief items
              </p>
            </div>
            <Link
              to="/requests"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300 whitespace-nowrap"
            >
              View All
              <span className="transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Requests Card (Combined) */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/40 rounded-2xl p-6 border border-blue-200/40 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div>
                <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                  Total Requests
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-3">
                  {(metrics?.totalRequests || 0) + (ingdActive ? (ingdMetrics?.totalRequests || 0) : 0)}
                </p>
              </div>
              <p className="text-sm text-slate-600">Active relief operations</p>
            </div>
          </div>

          {/* People to Assist Card */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/40 rounded-2xl p-6 border border-blue-200/40 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div>
                <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                  People to Assist
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-3">
                  {formatNumber(ingdActive ? (ingdMetrics?.totalPeople || 10) : 0)}
                </p>
              </div>
              <p className="text-sm text-slate-600">Requiring assistance</p>
            </div>
          </div>

          {/* Total Value Card (Combined) */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/40 rounded-2xl p-6 border border-blue-200/40 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div>
                <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                  Total Value
                </p>
                <p className="text-4xl font-bold text-slate-900 mt-3">
                  {formatNumber(((metrics?.totalValueDeployed || 0) + (ingdActive ? (ingdMetrics?.totalValue || 0) : 0)) / 1000000, 1)}M
                </p>
                <p className="text-xs text-slate-600 mt-1">MZN</p>
              </div>
            </div>
          </div>

          {/* Average Per Request Card (Combined) */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/40 rounded-2xl p-6 border border-blue-200/40 hover:border-blue-300/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                    Avg. Per Request
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">
                    {formatNumber(
                      (((metrics?.totalValueDeployed || 0) + (ingdActive ? (ingdMetrics?.totalValue || 0) : 0)) /
                        ((metrics?.totalRequests || 1) + (ingdActive ? (ingdMetrics?.totalRequests || 1) : 0))) / 1000,
                      0
                    )}K
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600">MZN</p>
            </div>
          </div>
        </div>
        </div>


        {/* INGD Analytics & Government Priorities Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INGD Dashboard - Left Side */}
          <div className="rounded-2xl bg-white/50 backdrop-blur border border-slate-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-transparent flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  INGD Disaster Impact Analytics
                </h2>
                <p className="text-slate-600 mt-1">
                  Real-time impact data and insights from INGD
                </p>
              </div>
              <a
                href="https://public.tableau.com/app/profile/cenoe/viz/DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300 whitespace-nowrap"
              >
                View Full
                <span className="transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            </div>

            <div
              className="w-full bg-white overflow-x-auto"
              style={{ minHeight: "400px" }}
            >
              <div
                className="tableauPlaceholder"
                id="viz1769532767397_dashboard"
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

          {/* Government Priorities - Right Side */}
          <div className="rounded-2xl bg-white/50 backdrop-blur border border-slate-200/50 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-transparent flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Government Priorities
                </h2>
                <p className="text-slate-600 mt-1">
                  Official disaster response priorities
                </p>
              </div>
              <Link
                to="/government-priorities"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300 whitespace-nowrap"
              >
                View More
                <span className="transform group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>

            <div className="w-full bg-white p-6" style={{ minHeight: "400px" }}>
              {governmentDocument ? (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                  <button
                    onClick={() => setShowPdfViewer(true)}
                    className="flex flex-col items-center justify-center w-full h-full gap-6 hover:opacity-80 transition-opacity"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-3xl">📄</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {governmentDocument.file_name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-4">
                        {governmentDocument.description}
                      </p>
                      <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                        <Download size={18} />
                        Click to View PDF
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <p className="text-slate-500 mb-4">
                      No government priority documents available yet.
                    </p>
                    <Link
                      to="/government-priorities"
                      className="inline-flex items-center gap-2 px-6 py-2 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors"
                    >
                      View Priorities
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Member Actions Gallery */}
        <ActionsImageGrid
          images={achievements
            .filter((action) => action.media)
            .flatMap((action) => {
              try {
                const mediaArray = JSON.parse(action.media as string);
                if (Array.isArray(mediaArray) && mediaArray.length > 0) {
                  return mediaArray.map((img, idx) => ({
                    id: `${action.id}-${idx}`,
                    image: img,
                    title: action.type_action,
                    company: action.company_name,
                  }));
                }
              } catch (e) {
                // Fallback for single image stored as string
                if (action.media) {
                  return [{
                    id: action.id?.toString() || "",
                    image: action.media as string,
                    title: action.type_action,
                    company: action.company_name,
                  }];
                }
              }
              return [];
            })}
        />



      </div>

      {/* PDF Viewer Modal */}
      {governmentDocument && (
        <PdfViewer
          isOpen={showPdfViewer}
          onClose={() => setShowPdfViewer(false)}
          pdfUrl={governmentDocument.file_url}
          fileName={governmentDocument.file_name}
          description={governmentDocument.description}
        />
      )}
    </Layout>
  );
}
