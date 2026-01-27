import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

export default function INGDDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Load Tableau API script
    const script = document.createElement("script");
    script.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
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
            <h1 className="text-3xl font-bold text-slate-900">INGD Dashboard</h1>
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

        {/* Embedded Tableau Dashboard */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <p className="text-sm text-slate-600">
              Last updated: {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="w-full bg-white overflow-x-auto">
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

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-bold text-blue-900 mb-2">About INGD</h3>
            <p className="text-sm text-blue-800">
              The National Institute for Disaster Management (INGD) provides official
              disaster impact statistics and coordination for disaster relief efforts
              in Mozambique.
            </p>
          </div>

          <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
            <h3 className="font-bold text-orange-900 mb-2">Data Synchronization</h3>
            <p className="text-sm text-orange-800">
              This dashboard displays live data from INGD's official systems. Refresh
              the page to see the latest updates.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
