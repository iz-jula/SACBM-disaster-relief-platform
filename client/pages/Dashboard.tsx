import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import MaputoWeather from "@/components/MaputoWeather";
import Alerts from "@/components/Alerts";

// Sample data for demonstration
const recentRequests = [
  {
    id: "1",
    company: "Local Hospital",
    location: "District 1, Village A",
    helpType: "Materials",
    source: "INGD" as const,
    time: "2 hours ago",
  },
  {
    id: "2",
    company: "Community Center",
    location: "District 2, Village B",
    helpType: "Food",
    source: "Chamber" as const,
    time: "5 hours ago",
  },
  {
    id: "3",
    company: "School Building",
    location: "District 3, Village C",
    helpType: "Medical",
    source: "INGD" as const,
    time: "1 day ago",
  },
];

const helpTypeStats = [
  { type: "Food", count: 45, percentage: 35 },
  { type: "Clothing", count: 32, percentage: 25 },
  { type: "Materials", count: 38, percentage: 30 },
  { type: "Medical", count: 14, percentage: 10 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const totalRequests = 129;
  const totalPeople = 3920;
  const totalValue = 2770000;
  const avgValue = Math.round(totalValue / totalRequests);

  useEffect(() => {
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
                <p className="text-3xl font-bold text-slate-900 mt-2">{totalRequests}</p>
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
                  {totalPeople.toLocaleString()}
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
                  {(totalValue / 1000000).toFixed(1)}M MZN
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
                  {(avgValue / 1000).toFixed(0)}K
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
            <MaputoWeather />
          </div>
          <div>
            <Alerts />
          </div>
        </div>

        {/* Embedded INGD Dashboard */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">INGD Dashboard</h2>
              <p className="text-sm text-slate-600">Real-time disaster impact data</p>
              <p className="text-xs text-slate-500 mt-2">
                Last updated: {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="w-full bg-white rounded-lg overflow-hidden">
            <div
              className="tableauPlaceholder"
              id="viz1769418246220"
              style={{ width: "100%", height: "600px", position: "relative" }}
            >
              <noscript>
                <a href="https://public.tableau.com">
                  <img
                    alt="Dashboard"
                    src="https://public.tableau.com/static/images/DA/DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard/1.png"
                  />
                </a>
              </noscript>
              <object
                className="tableauViz"
                style={{
                  display: "none",
                }}
              >
                <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
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

          <div className="px-6 py-4 border-t border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
            <Link
              to="/ingd-dashboard"
              className="text-primary hover:text-orange-600 font-medium transition-colors"
            >
              View full INGD Dashboard →
            </Link>
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
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-blue-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{request.company}</p>
                  <p className="text-sm text-slate-600 mt-1">{request.location}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      {request.helpType}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        request.source === "INGD"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {request.source}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-500">{request.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
