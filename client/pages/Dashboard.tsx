import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import Layout from "@/components/Layout";
import { getRecentRequests, getMetrics, Metrics } from "@/services/requestsService";

const MaputoWeather = lazy(() => import("@/components/MaputoWeather"));
const Alerts = lazy(() => import("@/components/Alerts"));

export default function Dashboard() {
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data from API
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [requests, metricsData] = await Promise.all([
          getRecentRequests(5),
          getMetrics(),
        ]);
        setRecentRequests(requests);
        setMetrics(metricsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Load Tableau API script for INGD dashboard
    const script = document.createElement("script");
    script.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of disaster relief operations</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Requests</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {metrics?.totalRequests || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3">
                <BarChart3 size={24} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Active relief operations</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">People Assisted</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {(metrics?.totalPeopleAssisted || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 rounded-lg p-3">
                <Users size={24} className="text-green-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Across all districts</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {((metrics?.totalValueDeployed || 0) / 1000000).toFixed(1)}M MZN
                </p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3">
                <TrendingUp size={24} className="text-primary" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Total funds deployed</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">Avg. Per Request</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {((metrics?.averagePerRequest || 0) / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3">
                <Activity size={24} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Meticais</p>
          </div>
        </div>

        {/* Maputo Weather and Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="bg-white rounded-xl p-6 text-center">Loading weather...</div>}>
              <MaputoWeather />
            </Suspense>
          </div>
          <div>
            <Suspense fallback={<div className="bg-white rounded-xl p-6 text-center">Loading alerts...</div>}>
              <Alerts />
            </Suspense>
          </div>
        </div>

        {/* Embedded INGD Dashboard */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">INGD Disaster Impact</h2>
              <p className="text-xs text-slate-600 mt-1">Real-time impact data from INGD</p>
            </div>
            <Link
              to="/ingd-dashboard"
              className="text-primary hover:text-orange-600 text-sm font-medium transition-colors whitespace-nowrap ml-4"
            >
              View Full →
            </Link>
          </div>

          <div className="w-full bg-white overflow-x-auto" style={{ minHeight: "400px" }}>
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
                <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
                <param name="embed_code_version" value="3" />
                <param name="site_root" value="" />
                <param name="name" value="DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard" />
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

        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Requests</h2>
            <Link
              to="/requests"
              className="text-primary hover:text-orange-600 text-sm font-medium transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-slate-600 text-center py-8">Loading recent requests...</p>
            ) : recentRequests.length > 0 ? (
              recentRequests.map((request) => {
                const timeAgo = request.created_at
                  ? new Date(request.created_at).toLocaleString()
                  : "Unknown";
                const statusText = request.status === true ? "met" : "pending";
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{request.originator}</p>
                      <p className="text-sm text-slate-600 mt-1">{request.location}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {request.help_type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            statusText === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : statusText === "met"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {statusText}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">{timeAgo}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-600 text-center py-8">No recent requests</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
