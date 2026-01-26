import { Plus, X, Trash2, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { getRequests, createRequest, updateRequest, deleteRequest } from "@/services/requestsService";
import { RelieRequest } from "@/services/supabaseService";

function getStatusStyles(status: boolean) {
  return status ? "bg-green-100 text-green-700 border border-green-300" : "bg-blue-100 text-blue-700 border border-blue-300";
}

function getStatusLabel(status: boolean) {
  return status ? "✓ Met" : "⏳ Pending";
}

function RequestsTable({ requests, onStatusChange, selectedRequests, onToggleSelect }: { requests: RelieRequest[], onStatusChange: (id: number, newStatus: boolean) => void, selectedRequests: Set<number>, onToggleSelect: (id: number) => void }) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">
                <input type="checkbox" className="w-4 h-4 rounded" disabled />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                #Ref
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
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr
                key={request.id}
                className={`border-b border-slate-200 transition-colors hover:bg-blue-50 cursor-pointer ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50"
                }`}
              >
                <td className="px-6 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedRequests.has(request.id || 0)}
                    onChange={() => onToggleSelect(request.id || 0)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">
                  #{request.id}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {request.originator}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {request.location}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                    {request.help_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {request.evacuation_type}
                </td>
                <td className="px-6 py-4 text-sm text-center text-slate-900 font-medium">
                  {request.people}
                </td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-primary">
                  {parseInt(request.value || '0').toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(request.status)}`}>
                    {getStatusLabel(request.status)}
                  </span>
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
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex-shrink-0 ${getStatusStyles(request.status)}`}>
                  {getStatusLabel(request.status)}
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
                    {request.help_type}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Evacuation Type</p>
                <p className="text-sm text-slate-700 mt-1 break-words">{request.evacuation_type}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">People</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{request.people}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Value (MZN)</p>
                  <p className="text-lg font-bold text-primary mt-1">{parseInt(request.value || '0').toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onStatusChange(request.id || 0, !request.status)}
                  className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                    request.status
                      ? "bg-blue-100 hover:bg-blue-200 text-blue-700"
                      : "bg-green-100 hover:bg-green-200 text-green-700"
                  }`}
                >
                  {request.status ? "Mark Pending" : "Mark Met"}
                </button>
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
  const [requests, setRequests] = useState<RelieRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState<Set<number>>(new Set());
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [formData, setFormData] = useState({
    originator: "",
    email: "",
    full_name: "",
    location: "",
    help_type: "",
    evacuation_type: "",
    people: "",
    value: "",
    status: false, // false = pending, true = met
  });

  // Load requests on mount
  useEffect(() => {
    const loadRequests = async () => {
      setIsLoading(true);
      try {
        const data = await getRequests();
        setRequests(data);
      } catch (error) {
        console.error("Error loading requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSelectRequest = (id: number) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequests(newSelected);
  };

  const handleResolveSelected = async () => {
    for (const id of selectedRequests) {
      await updateRequest(id, { status: true });
    }
    setRequests((prevRequests) =>
      prevRequests.map((req) =>
        selectedRequests.has(req.id!) ? { ...req, status: true } : req
      )
    );
    setSelectedRequests(new Set());
    setShowActionDropdown(false);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedRequests.size} request(s)? This cannot be undone.`)) {
      return;
    }
    for (const id of selectedRequests) {
      await deleteRequest(id);
    }
    setRequests((prevRequests) =>
      prevRequests.filter((req) => !selectedRequests.has(req.id!))
    );
    setSelectedRequests(new Set());
    setShowActionDropdown(false);
  };

  const handleStatusChange = async (id: number, newStatus: boolean) => {
    try {
      const updatedRequest = await updateRequest(id, { status: newStatus });
      if (updatedRequest) {
        // Update the requests list with the new status
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === id ? { ...req, status: newStatus } : req
          )
        );
      }
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newRequest = await createRequest({
        originator: formData.originator,
        email: formData.email || "",
        full_name: formData.full_name || "",
        location: formData.location,
        help_type: formData.help_type,
        evacuation_type: formData.evacuation_type,
        people: formData.people,
        value: formData.value,
        status: formData.status,
      });

      if (newRequest) {
        setRequests([newRequest, ...requests]);
        setFormData({
          originator: "",
          email: "",
          full_name: "",
          location: "",
          help_type: "",
          evacuation_type: "",
          people: "",
          value: "",
          status: false,
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group and sort requests
  const pendingRequests = requests.filter((r) => r.status === false);
  const metRequests = requests.filter((r) => r.status === true);

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
                    name="help_type"
                    value={formData.help_type}
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
                    name="evacuation_type"
                    value={formData.evacuation_type}
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
                    name="people"
                    value={formData.people}
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
                    name="value"
                    value={formData.value}
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
                    value={formData.status ? 'true' : 'false'}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      status: e.target.value === 'true',
                    }))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="false">Pending</option>
                    <option value="true">Met</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-orange-600 disabled:bg-orange-400 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {isSubmitting ? "Adding..." : "Add Request"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-800 py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
            <p className="text-slate-600">Loading requests...</p>
          </div>
        )}

        {/* Pending Requests Section */}
        {!isLoading && pendingRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-xl font-bold text-slate-900">
                ⏳ Pending Requests ({pendingRequests.length})
              </h2>
            </div>
            <RequestsTable requests={pendingRequests} onStatusChange={handleStatusChange} />
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
            <RequestsTable requests={metRequests} onStatusChange={handleStatusChange} />
          </div>
        )}

        {requests.length === 0 && !isLoading && (
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
