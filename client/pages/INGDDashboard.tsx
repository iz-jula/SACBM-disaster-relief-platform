import Layout from "@/components/Layout";

export default function INGDDashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">INGD Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Real-time data from INGD's official disaster impact dashboard
          </p>
        </div>

        {/* Embedded Tableau Dashboard */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <p className="text-sm text-slate-600">
              Last updated: {new Date().toLocaleDateString()} at{" "}
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="w-full" style={{ height: "900px" }}>
            <iframe
              src="https://public.tableau.com/app/profile/cenoe/viz/DASHBOARD_IMPACTO_INGD_EXTERNO_17418596149660/Dashboard"
              width="100%"
              height="100%"
              style={{ border: "none" }}
              allowFullScreen
            />
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
