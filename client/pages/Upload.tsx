import { useState } from "react";
import { FileCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { createRequest } from "@/services/requestsService";

export default function Upload() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    originator: "",
    email: "",
    full_name: "",
    location: "",
    help_type: "",
    evacuation_type: "",
    people: "",
    value: "",
  });

  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Remove all non-digit characters
    const numbersOnly = value.replace(/\D/g, '');
    // Format with commas
    const formatted = numbersOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setFormData((prev) => ({
      ...prev,
      value: formatted,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");
    setErrorMessage("");

    // Validate required fields
    if (
      !formData.originator ||
      !formData.email ||
      !formData.full_name ||
      !formData.location ||
      !formData.help_type ||
      !formData.people ||
      !formData.value
    ) {
      setSubmitStatus("error");
      setErrorMessage("Please fill in all required fields");
      setTimeout(() => setSubmitStatus("idle"), 3000);
      return;
    }

    // Validate evacuation type if evacuation is selected as help type
    if (formData.help_type === "Evacuation" && !formData.evacuation_type) {
      setSubmitStatus("error");
      setErrorMessage("Please select evacuation method");
      setTimeout(() => setSubmitStatus("idle"), 3000);
      return;
    }

    try {
      // Save to Supabase
      const newRequest = await createRequest({
        originator: formData.originator,
        email: formData.email,
        full_name: formData.full_name,
        location: formData.location,
        help_type: formData.help_type,
        evacuation_type: formData.evacuation_type,
        people: formData.people,
        value: formData.value,
        status: false, // New requests start as pending
      });

      if (newRequest) {
        setSubmitStatus("success");
        setFormData({
          originator: "",
          email: "",
          full_name: "",
          location: "",
          help_type: "",
          evacuation_type: "",
          people: "",
          value: "",
        });

        // Redirect to requests page after 2 seconds
        setTimeout(() => {
          navigate("/requests");
        }, 2000);
      } else {
        throw new Error("Failed to create request");
      }
    } catch (error) {
      setSubmitStatus("error");
      const msg = error instanceof Error ? error.message : "Failed to submit request. Please try again.";
      setErrorMessage(msg);
      console.error("Submit error:", error);
      setTimeout(() => setSubmitStatus("idle"), 4000);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Submit Relief Request</h1>
            <p className="text-slate-600 mt-1">
              Report a new disaster relief operation or request
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Status Messages */}
        {submitStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <FileCheck className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-900">Request Submitted Successfully!</p>
              <p className="text-sm text-green-800 mt-1">
                Your relief request has been saved to the system. Redirecting...
              </p>
            </div>
          </div>
        )}

        {submitStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-900">Error Submitting Request</p>
              <p className="text-sm text-red-800 mt-1">
                {errorMessage || "Please try again."}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Originator / Company Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name of Company / Organization *
                  </label>
                  <input
                    type="text"
                    name="originator"
                    value={formData.originator}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Local Hospital, Community Center"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location (District, Village, Locality) *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Inhambane District, Maxixe"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name of Originator *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., john@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Relief Details Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Relief Details</h2>
              <div className="space-y-6">
                {/* Type of Help */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type of Help *
                  </label>
                  <select
                    name="help_type"
                    value={formData.help_type}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Clear evacuation type if help type is not evacuation
                      if (e.target.value !== "Evacuation") {
                        setFormData((prev) => ({
                          ...prev,
                          evacuation_type: "",
                        }));
                      }
                    }}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select type of help</option>
                    <option value="Food">Food</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Materials">Materials</option>
                    <option value="Medical">Medical Supplies</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Water">Water & Sanitation</option>
                    <option value="Evacuation">Evacuation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Evacuation Method - Only shows if Evacuation is selected */}
                {formData.help_type === "Evacuation" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Evacuation Method *
                    </label>
                    <select
                      name="evacuation_type"
                      value={formData.evacuation_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select evacuation method</option>
                      <option value="Boat">Boat</option>
                      <option value="Tractor">Tractor</option>
                      <option value="Helicopter">Helicopter</option>
                      <option value="Vehicle">Vehicle</option>
                      <option value="On foot">On foot</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Numbers Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Impact & Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Number of People */}
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
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter number of people"
                  />
                </div>

                {/* Amount Spent */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Value Spent in Meticais (MZN) *
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter approximate amount spent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={submitStatus === "loading"}
                className="flex-1 bg-primary hover:bg-orange-600 disabled:bg-orange-400 text-white py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                {submitStatus === "loading" ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitStatus === "loading"}
                className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-800 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Note:</span> All relief requests submitted through
            this form are recorded in the system and made available to authorized users. Ensure
            you provide accurate information about the relief operation.
          </p>
        </div>
      </div>
    </Layout>
  );
}
