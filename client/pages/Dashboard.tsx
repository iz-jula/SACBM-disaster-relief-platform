import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";
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
  AchievementsMetrics,
} from "@/services/achievementsService";

const MaputoWeather = lazy(() => import("@/components/MaputoWeather"));
const Alerts = lazy(() => import("@/components/Alerts"));

export default function Dashboard() {
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [achievementsMetrics, setAchievementsMetrics] = useState<AchievementsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [requests, metricsData, achievementsData] = await Promise.all([
          getRecentRequests(5),
          getMetrics(),
          getAchievementsMetrics(),
        ]);
        setRecentRequests(requests);
        setMetrics(metricsData);
        setAchievementsMetrics(achievementsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

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
                  Relief Dashboard
                </h1>
                <p className="text-base sm:text-lg text-slate-600 mt-2 max-w-2xl">
                  Real-time overview of disaster relief operations and community impact
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics - Modern Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Requests Card */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-2xl p-6 border border-blue-200/50 hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/5 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-blue-600/70 text-xs font-semibold uppercase tracking-wider">
                    Total Requests
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">
                    {metrics?.totalRequests || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-3 shadow-lg shadow-blue-200">
                  <BarChart3 size={24} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600">Active relief operations</p>
            </div>
          </div>

          {/* People Assisted Card */}
          <div className="group relative bg-gradient-to-br from-green-50 to-green-50/30 rounded-2xl p-6 border border-green-200/50 hover:border-green-300 transition-all duration-300 hover:shadow-lg hover:shadow-green-100">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:to-green-500/5 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-green-600/70 text-xs font-semibold uppercase tracking-wider">
                    People Assisted
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">
                    {(metrics?.totalPeopleAssisted || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-3 shadow-lg shadow-green-200">
                  <Users size={24} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600">Across all districts</p>
            </div>
          </div>

          {/* Total Value Card */}
          <div className="group relative bg-gradient-to-br from-orange-50 to-orange-50/30 rounded-2xl p-6 border border-orange-200/50 hover:border-orange-300 transition-all duration-300 hover:shadow-lg hover:shadow-orange-100">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/5 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-orange-600/70 text-xs font-semibold uppercase tracking-wider">
                    Total Value
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">
                    {((metrics?.totalValueDeployed || 0) / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-xs text-slate-600 mt-1">MZN</p>
                </div>
                <div className="bg-gradient-to-br from-orange-400 to-primary rounded-xl p-3 shadow-lg shadow-orange-200">
                  <TrendingUp size={24} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600">Total funds deployed</p>
            </div>
          </div>

          {/* Average Per Request Card */}
          <div className="group relative bg-gradient-to-br from-purple-50 to-purple-50/30 rounded-2xl p-6 border border-purple-200/50 hover:border-purple-300 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-purple-600/70 text-xs font-semibold uppercase tracking-wider">
                    Avg. Per Request
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">
                    {((metrics?.averagePerRequest || 0) / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-3 shadow-lg shadow-purple-200">
                  <Activity size={24} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-600">Meticais</p>
            </div>
          </div>
        </div>

        {/* Achievements Summary - Modern Section */}
        {achievementsMetrics && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Community Achievements
                </h2>
                <p className="text-slate-600 mt-2">
                  Member work and contributions beyond relief requests
                </p>
              </div>
              <Link
                to="/achievements"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300"
              >
                View All
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Total Achievements */}
              <div className="group relative bg-gradient-to-br from-indigo-50 to-indigo-50/30 rounded-2xl p-6 border border-indigo-200/50 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100">
                <div className="relative">
                  <p className="text-indigo-600/70 text-xs font-semibold uppercase tracking-wider">Total Achievements</p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">{achievementsMetrics.totalAchievements}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-600">Community work</p>
                    <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg p-2 shadow-lg">
                      <BarChart3 size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* People Impacted */}
              <div className="group relative bg-gradient-to-br from-emerald-50 to-emerald-50/30 rounded-2xl p-6 border border-emerald-200/50 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100">
                <div className="relative">
                  <p className="text-emerald-600/70 text-xs font-semibold uppercase tracking-wider">People Impacted</p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">{(achievementsMetrics.totalPeopleImpacted || 0).toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-600">Direct impact</p>
                    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg p-2 shadow-lg">
                      <Users size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Contribution */}
              <div className="group relative bg-gradient-to-br from-amber-50 to-amber-50/30 rounded-2xl p-6 border border-amber-200/50 hover:border-amber-300 transition-all duration-300 hover:shadow-lg hover:shadow-amber-100">
                <div className="relative">
                  <p className="text-amber-600/70 text-xs font-semibold uppercase tracking-wider">Total Contribution</p>
                  <p className="text-3xl font-bold text-slate-900 mt-3">{((achievementsMetrics.totalContributed || 0) / 1000).toFixed(1)}K</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-600">MZN invested</p>
                    <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg p-2 shadow-lg">
                      <TrendingUp size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* In Progress */}
              <div className="group relative bg-gradient-to-br from-cyan-50 to-cyan-50/30 rounded-2xl p-6 border border-cyan-200/50 hover:border-cyan-300 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-100">
                <div className="relative">
                  <p className="text-cyan-600/70 text-xs font-semibold uppercase tracking-wider">In Progress</p>
                  <p className="text-4xl font-bold text-slate-900 mt-3">{achievementsMetrics.inProgressAchievements}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-slate-600">Ongoing work</p>
                    <div className="bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg p-2 shadow-lg">
                      <Activity size={18} className="text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maputo Weather and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <Suspense
              fallback={
                <div className="bg-white rounded-xl p-6 text-center">
                  Loading weather...
                </div>
              }
            >
              <MaputoWeather />
            </Suspense>
          </div>
          <div>
            <Suspense
              fallback={
                <div className="bg-white rounded-xl p-6 text-center">
                  Loading alerts...
                </div>
              }
            >
              <Alerts />
            </Suspense>
          </div>
        </div>

        {/* Embedded INGD Dashboard */}
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
            <Link
              to="/ingd-dashboard"
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300 whitespace-nowrap"
            >
              View Full
              <span className="transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
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

        {/* Recent Requests - Modern Section */}
        <div className="rounded-2xl bg-white/50 backdrop-blur border border-slate-200/50 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/50 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Recent Relief Requests
                </h2>
                <p className="text-slate-600 mt-1">Latest operations from the field</p>
              </div>
              <Link
                to="/requests"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all duration-300"
              >
                View All
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          <div className="px-8 py-6 space-y-3">
            {isLoading ? (
              <p className="text-slate-600 text-center py-8">
                Loading recent requests...
              </p>
            ) : recentRequests.length > 0 ? (
              recentRequests.map((request) => {
                const timeAgo = request.created_at
                  ? new Date(request.created_at).toLocaleString()
                  : "Unknown";
                const statusText = request.status === true ? "met" : "pending";
                return (
                  <div
                    key={request.id}
                    className="group p-5 rounded-xl border border-slate-200/50 hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-300 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-slate-900 truncate">
                            {request.originator}
                          </p>
                          <span
                            className={`shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              statusText === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : statusText === "met"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {statusText === "pending" ? "⏳" : "✓"} {statusText}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{request.location}</p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-100/80 text-blue-700 backdrop-blur">
                            {request.help_type}
                          </span>
                          {request.partner_organisation && (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-purple-100/80 text-purple-700 backdrop-blur">
                              {request.partner_organisation}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 shrink-0 whitespace-nowrap">{timeAgo}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-600 text-center py-8">
                No recent requests
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
