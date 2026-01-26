import { useState } from "react";
import { Settings, Users, BarChart3, Database, LogOut, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import GoogleConnector from "@/components/GoogleConnector";
import Connectors from "@/components/Connectors";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "viewer";
  lastLogin: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "requests" | "users" | "settings">("dashboard");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: "1",
      name: "Admin User",
      email: "admin@sabcm.org",
      role: "admin",
      lastLogin: "2024-01-26 10:30 AM",
    },
    {
      id: "2",
      name: "Manager User",
      email: "manager@sabcm.org",
      role: "manager",
      lastLogin: "2024-01-25 3:15 PM",
    },
  ]);

  // Admin Statistics
  const stats = [
    { label: "Total Requests", value: "129", icon: BarChart3, color: "blue" },
    { label: "Met Requests", value: "45", icon: Lock, color: "green" },
    { label: "Pending Requests", value: "64", icon: Settings, color: "yellow" },
    { label: "Partially Met", value: "20", icon: Users, color: "orange" },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage SABCM disaster relief operations</p>
            {user && <p className="text-xs text-slate-500 mt-2">Logged in as: {user.name}</p>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              ← Back
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "requests", label: "All Requests", icon: Database },
              { id: "users", label: "Users", icon: Users },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 font-medium flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                const colorClasses: Record<string, string> = {
                  blue: "bg-blue-100 text-blue-600",
                  green: "bg-green-100 text-green-600",
                  yellow: "bg-yellow-100 text-yellow-600",
                  orange: "bg-orange-100 text-orange-600",
                };
                return (
                  <div key={idx} className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`rounded-lg p-3 ${colorClasses[stat.color]}`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Data Connection Status */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <p className="text-lg font-semibold text-yellow-900 mb-2">📊 Backend Configuration</p>
              <p className="text-yellow-800 mb-4">
                The admin dashboard is ready for backend integration. You can now connect it to:
              </p>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>✓ Supabase PostgreSQL database</li>
                <li>✓ REST API endpoints for requests data</li>
                <li>✓ Real-time data synchronization</li>
                <li>✓ User authentication and permissions</li>
              </ul>
              <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-300">
                <p className="text-xs font-mono text-slate-600">
                  Backend connection points are prepared for:
                  <br />• GET /api/requests - List all requests
                  <br />• POST /api/requests - Create new request
                  <br />• PUT /api/requests/:id - Update request
                  <br />• DELETE /api/requests/:id - Delete request
                  <br />• GET /api/users - List admin users
                </p>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Request Status Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-slate-700">Met</p>
                      <p className="text-sm font-bold text-green-600">35%</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "35%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-slate-700">Pending</p>
                      <p className="text-sm font-bold text-blue-600">50%</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "50%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-slate-700">Partially Met</p>
                      <p className="text-sm font-bold text-yellow-600">15%</p>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "15%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Data Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <p className="text-slate-600">Total People Assisted</p>
                    <p className="font-bold text-slate-900">3,920</p>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <p className="text-slate-600">Total Funds Deployed</p>
                    <p className="font-bold text-slate-900">2.77M MZN</p>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <p className="text-slate-600">Average per Request</p>
                    <p className="font-bold text-slate-900">21K MZN</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <p className="text-slate-600">Active Regions</p>
                    <p className="font-bold text-slate-900">11</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">All Relief Requests</h3>
            <p className="text-slate-600 mb-6">
              This section will display all requests from the database. Backend connection required to fetch live data.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Backend Ready:</strong> This component is prepared to receive request data from your API. Connect your backend and this table will automatically populate.
              </p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                <h3 className="text-lg font-bold text-slate-900">Admin Users</h3>
                <p className="text-sm text-slate-600 mt-1">Manage user access and permissions</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Last Login</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-200 hover:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-700"
                                : user.role === "manager"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.lastLogin}</td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-primary hover:text-orange-600 font-medium transition-colors">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-lg font-semibold text-blue-900 mb-2">👥 User Management</p>
              <p className="text-blue-800">
                Backend connection will enable: user authentication, role-based access control (RBAC), activity logging, and permission management.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Google Connector - Prominent */}
            <GoogleConnector />

            {/* Other Data Connectors */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Additional Integrations</h3>
              <Connectors />
            </div>

            {/* System Configuration */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">System Configuration</h3>

              <div className="space-y-6">
                {/* Database Configuration */}
                <div className="p-6 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Database size={20} />
                    Database Configuration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Database Type</label>
                      <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>Not Connected</option>
                        <option>Supabase</option>
                        <option>PostgreSQL</option>
                        <option>Firebase</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Connection String</label>
                      <input
                        type="password"
                        placeholder="Paste your database connection string here"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                      Test Connection
                    </button>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="p-6 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Lock size={20} />
                    API Configuration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">API Base URL</label>
                      <input
                        type="text"
                        placeholder="https://api.yourdomain.com"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">API Key</label>
                      <input
                        type="password"
                        placeholder="Paste your API key here"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                      Verify API
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div className="p-6 border border-slate-200 rounded-lg">
                  <h4 className="font-semibold text-slate-900 mb-3">Data Management</h4>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                      Export All Data
                    </button>
                    <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                      Backup Database
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="text-lg font-semibold text-green-900 mb-2">✓ Ready for Backend Integration</p>
              <p className="text-green-800 mb-4">
                All admin settings are prepared for backend configuration. You can connect integrations with Google Drive, APIs, databases, and more.
              </p>
              <ul className="space-y-1 text-sm text-green-800">
                <li>✓ Google Drive for automatic file sync</li>
                <li>✓ Custom APIs and webhooks</li>
                <li>✓ Direct database connections</li>
                <li>✓ GitHub repositories for data storage</li>
                <li>✓ Data export and reporting</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
