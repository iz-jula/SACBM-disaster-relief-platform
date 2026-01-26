import { useState } from "react";
import { Plus, X } from "lucide-react";

interface RelieRequest {
  id: string;
  company: string;
  location: string;
  helpType: string;
  evacuationType: string;
  peopleInvolved: number;
  amountSpent: number;
  source: "INGD" | "Chamber";
}

export default function Index() {
  const [requests, setRequests] = useState<RelieRequest[]>([
    {
      id: "1",
      company: "Local Hospital",
      location: "District 1, Village A",
      helpType: "Materials",
      evacuationType: "By boat",
      peopleInvolved: 150,
      amountSpent: 45000,
      source: "INGD",
    },
    {
      id: "2",
      company: "Community Center",
      location: "District 2, Village B",
      helpType: "Food",
      evacuationType: "By tractor",
      peopleInvolved: 320,
      amountSpent: 125000,
      source: "Chamber",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    location: "",
    helpType: "",
    evacuationType: "",
    peopleInvolved: "",
    amountSpent: "",
    source: "INGD" as "INGD" | "Chamber",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "peopleInvolved" || name === "amountSpent"
          ? value
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRequest: RelieRequest = {
      id: (requests.length + 1).toString(),
      company: formData.company,
      location: formData.location,
      helpType: formData.helpType,
      evacuationType: formData.evacuationType,
      peopleInvolved: parseInt(formData.peopleInvolved) || 0,
      amountSpent: parseInt(formData.amountSpent) || 0,
      source: formData.source,
    };

    setRequests([...requests, newRequest]);
    setFormData({
      company: "",
      location: "",
      helpType: "",
      evacuationType: "",
      peopleInvolved: "",
      amountSpent: "",
      source: "INGD",
    });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">SABCM Disaster Relief</h1>
              <p className="text-slate-600 mt-1">Relief Request Management Platform</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              New Request
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
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
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter company name"
                  />
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
                    <option value="Other">Other means</option>
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
                    Request Source *
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="INGD">INGD</option>
                    <option value="Chamber">Chamber Members</option>
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

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <h2 className="text-xl font-bold text-slate-900">
              Relief Requests ({requests.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Help Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                    Evacuation
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    People
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                    Value (MZN)
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                    Source
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
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {request.company}
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
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          request.source === "INGD"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {request.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {requests.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-500 text-lg">No relief requests yet.</p>
              <p className="text-slate-400 mt-2">
                Click "New Request" to add your first relief request.
              </p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-primary mt-2">{requests.length}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Total People Assisted</p>
              <p className="text-3xl font-bold text-secondary mt-2">
                {requests.reduce((sum, r) => sum + r.peopleInvolved, 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <p className="text-slate-600 text-sm font-medium">Total Value Spent</p>
              <p className="text-3xl font-bold text-accent mt-2">
                {requests.reduce((sum, r) => sum + r.amountSpent, 0).toLocaleString()} MZN
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
