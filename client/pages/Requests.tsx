import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface RelieRequest {
  id: string;
  originator: string;
  location: string;
  helpType: string;
  evacuationType: string;
  peopleInvolved: number;
  amountSpent: number;
  category: "Category 1" | "Category 2" | "Category 3";
  status: "pending" | "met" | "partially_met";
}

function getCategoryStyles(category: "Category 1" | "Category 2" | "Category 3") {
  switch (category) {
    case "Category 1":
      return "bg-red-100 text-red-700";
    case "Category 2":
      return "bg-orange-100 text-orange-700";
    case "Category 3":
      return "bg-yellow-100 text-yellow-700";
  }
}

function getStatusStyles(status: "pending" | "met" | "partially_met") {
  switch (status) {
    case "met":
      return "bg-green-100 text-green-700 border border-green-300";
    case "partially_met":
      return "bg-yellow-100 text-yellow-700 border border-yellow-300";
    case "pending":
      return "bg-blue-100 text-blue-700 border border-blue-300";
  }
}

function getStatusLabel(status: "pending" | "met" | "partially_met") {
  switch (status) {
    case "met":
      return "✓ Met";
    case "partially_met":
      return "◐ Partially Met";
    case "pending":
      return "⏳ Pending";
  }
}

function RequestsTable({ requests }: { requests: RelieRequest[] }) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Originator
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Help Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Evacuation Type
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                People
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                Value (MZN)
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr
                key={request.id}
                className={`border-b border-slate-200 transition-colors hover:bg-blue-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                }`}
              >
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getCategoryStyles(request.category)}`}>
                    {request.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {request.originator}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {request.location}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {request.helpType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {request.evacuationType}
                </td>
                <td className="px-6 py-4 text-sm text-center text-slate-900 font-medium">
                  {request.peopleInvolved}
                </td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-primary">
                  {request.amountSpent.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {requests.map((request) => (
          <div key={request.id} className="px-6 py-6 hover:bg-blue-50 transition-colors">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Originator</p>
                  <p className="text-base font-bold text-slate-900 mt-1 break-words">{request.originator}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex-shrink-0 ${getCategoryStyles(request.category)}`}>
                  {request.category}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</p>
                <p className="text-sm text-slate-700 mt-1 break-words">{request.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Help Type</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                    {request.helpType}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mt-1 ${getStatusStyles(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Evacuation Type</p>
                <p className="text-sm text-slate-700 mt-1 break-words">{request.evacuationType}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">People</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{request.peopleInvolved}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Value (MZN)</p>
                  <p className="text-lg font-bold text-primary mt-1">{request.amountSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Requests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RelieRequest[]>([
    {
      id: "1",
      originator: "Ministry of Health",
      location: "District 1, Village A",
      helpType: "Materials",
      evacuationType: "By boat",
      peopleInvolved: 150,
      amountSpent: 45000,
      category: "Category 2",
      status: "met",
    },
    {
      id: "2",
      originator: "Local Government",
      location: "District 2, Village B",
      helpType: "Food",
      evacuationType: "By tractor",
      peopleInvolved: 320,
      amountSpent: 125000,
      category: "Category 1",
      status: "pending",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    originator: "",
    location: "",
    helpType: "",
    evacuationType: "",
    peopleInvolved: "",
    amountSpent: "",
    category: "Category 1" as "Category 1" | "Category 2" | "Category 3",
    status: "pending" as "pending" | "met" | "partially_met",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRequest: RelieRequest = {
      id: (requests.length + 1).toString(),
      originator: formData.originator,
      location: formData.location,
      helpType: formData.helpType,
      evacuationType: formData.evacuationType,
      peopleInvolved: parseInt(formData.peopleInvolved) || 0,
      amountSpent: parseInt(formData.amountSpent) || 0,
      category: formData.category,
      status: formData.status,
    };

    setRequests([...requests, newRequest]);
    setFormData({
      originator: "",
      location: "",
      helpType: "",
      evacuationType: "",
      peopleInvolved: "",
      amountSpent: "",
      category: "Category 1",
      status: "pending",
    });
    setShowForm(false);
  };

  // Group and sort requests
  const pendingRequests = requests.filter((r) => r.status === "pending").sort((a, b) => {
    // Category 1 first
    if (a.category === "Category 1" && b.category !== "Category 1") return -1;
    if (a.category !== "Category 1" && b.category === "Category 1") return 1;
    return 0;
  });

  const partiallyMetRequests = requests.filter((r) => r.status === "partially_met").sort((a, b) => {
    if (a.category === "Category 1" && b.category !== "Category 1") return -1;
    if (a.category !== "Category 1" && b.category === "Category 1") return 1;
    return 0;
  });

  const metRequests = requests.filter((r) => r.status === "met").sort((a, b) => {
    if (a.category === "Category 1" && b.category !== "Category 1") return -1;
    if (a.category !== "Category 1" && b.category === "Category 1") return 1;
    return 0;
  });

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Relief Requests</h1>
            <p className="text-slate-600 mt-1">Manage all disaster relief requests</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              New Request
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Add New Relief Request</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Originator of Request *
                  </label>
                  <input
                    type="text"
                    name="originator"
                    value={formData.originator}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Ministry of Health, Local Government"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Category 1">Member of the SACBM (Category 1)</option>
                    <option value="Category 2">INGD (Category 2)</option>
                    <option value="Category 3">Others (Category 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., District 1, Village A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type of Help *
                  </label>
                  <select
                    name="helpType"
                    value={formData.helpType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select type of help</option>
                    <option value="Food">Food</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Materials">Materials</option>
                    <option value="Medical">Medical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type of Evacuation *
                  </label>
                  <select
                    name="evacuationType"
                    value={formData.evacuationType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select evacuation type</option>
                    <option value="By boat">By boat</option>
                    <option value="By tractor">By tractor</option>
                    <option value="By helicopter">By helicopter</option>
                    <option value="Other means">Other means</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of People Involved *
                  </label>
                  <input
                    type="number"
                    name="peopleInvolved"
                    value={formData.peopleInvolved}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter number of people"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Value Spent (MZN) *
                  </label>
                  <input
                    type="number"
                    name="amountSpent"
                    value={formData.amountSpent}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter amount in meticais"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Request Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="partially_met">Partially Met</option>
                    <option value="met">Met</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Add Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-xl font-bold text-slate-900">
                ⏳ Pending Requests ({pendingRequests.length})
              </h2>
            </div>
            <RequestsTable requests={pendingRequests} />
          </div>
        )}

        {/* Partially Met Requests Section */}
        {partiallyMetRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
              <h2 className="text-xl font-bold text-slate-900">
                ◐ Partially Met Requests ({partiallyMetRequests.length})
              </h2>
            </div>
            <RequestsTable requests={partiallyMetRequests} />
          </div>
        )}

        {/* Completed Requests Section */}
        {metRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-green-50 to-green-100">
              <h2 className="text-xl font-bold text-slate-900">
                ✓ Completed Requests ({metRequests.length})
              </h2>
            </div>
            <RequestsTable requests={metRequests} />
          </div>
        )}

        {requests.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 px-6 py-12 text-center">
            <p className="text-slate-500 text-lg">No relief requests yet.</p>
            <p className="text-slate-400 mt-2">
              Click "New Request" to add your first relief request.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
