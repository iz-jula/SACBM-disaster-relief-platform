import { BarChart3, Users, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import WeatherForecast from "@/components/WeatherForecast";

// Sample data for demonstration
const monthlyData = [
  { month: "Jan", requests: 4, people: 240, value: 180000 },
  { month: "Feb", requests: 6, people: 380, value: 250000 },
  { month: "Mar", requests: 5, people: 220, value: 190000 },
  { month: "Apr", requests: 8, people: 520, value: 380000 },
  { month: "May", requests: 12, people: 890, value: 650000 },
  { month: "Jun", requests: 10, people: 670, value: 520000 },
];

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
  const totalRequests = 129;
  const totalPeople = 3920;
  const totalValue = 2770000;
  const avgValue = Math.round(totalValue / totalRequests);

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
            <p className="text-xs text-slate-500 mt-3">Total investment</p>
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

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Monthly Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8800" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#FF8800" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #64748b",
                    borderRadius: "8px",
                    color: "#f1f5f9",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#FF8800"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Help Type Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Help Types</h2>
            <div className="space-y-4">
              {helpTypeStats.map((stat) => (
                <div key={stat.type}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-slate-700">{stat.type}</p>
                    <p className="text-sm font-bold text-slate-900">{stat.count}</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stat.percentage}% of total</p>
                </div>
              ))}
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
