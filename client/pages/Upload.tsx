import { useState } from "react";
import { Upload as UploadIcon, FileCheck, AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface SubmittedRequest {
  company: string;
  location: string;
  helpType: string;
  evacuationType: string;
  peopleInvolved: string;
  amountSpent: string;
  attachments: File[];
}

export default function Upload() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company: "",
    location: "",
    helpType: "",
    evacuationType: "",
    peopleInvolved: "",
    amountSpent: "",
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      addFiles(Array.from(files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    setAttachments((prev) => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.company ||
      !formData.location ||
      !formData.helpType ||
      !formData.evacuationType ||
      !formData.peopleInvolved ||
      !formData.amountSpent
    ) {
      setSubmitStatus("error");
      setTimeout(() => setSubmitStatus("idle"), 3000);
      return;
    }

    // Simulate submission
    console.log("Submitting request:", {
      ...formData,
      attachments: attachments.map((f) => f.name),
    });

    setSubmitStatus("success");
    setTimeout(() => {
      setFormData({
        company: "",
        location: "",
        helpType: "",
        evacuationType: "",
        peopleInvolved: "",
        amountSpent: "",
      });
      setAttachments([]);
      setSubmitStatus("idle");
    }, 2000);
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
                Your relief request has been recorded in the system.
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
                Please fill in all required fields before submitting.
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
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name of Company / Organization *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
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
              </div>
            </div>

            {/* Relief Details Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Relief Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type of Help */}
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
                    <option value="Medical">Medical Supplies</option>
                    <option value="Shelter">Shelter</option>
                    <option value="Water">Water & Sanitation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Type of Evacuation */}
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
                    <option value="By vehicle">By vehicle</option>
                    <option value="On foot">On foot</option>
                    <option value="Other">Other means</option>
                  </select>
                </div>
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
                    name="peopleInvolved"
                    value={formData.peopleInvolved}
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
                    name="amountSpent"
                    value={formData.amountSpent}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter approximate amount spent"
                  />
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6">Attachments</h2>
              <p className="text-sm text-slate-600 mb-4">
                Upload supporting documents or images (Optional). Maximum 5 files.
              </p>

              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all mb-4 ${
                  dragActive
                    ? "border-primary bg-orange-50"
                    : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadIcon
                  size={48}
                  className={`mx-auto mb-4 ${dragActive ? "text-primary" : "text-slate-400"}`}
                />
                <p className="text-lg font-semibold text-slate-900 mb-2">
                  Drag and drop files here
                </p>
                <p className="text-slate-600 mb-4">or</p>
                <label className="inline-block">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <button
                    type="button"
                    onClick={() => document.querySelector('input[type="file"]')?.click()}
                    className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    Browse Files
                  </button>
                </label>
                <p className="text-sm text-slate-500 mt-4">
                  Accepted formats: Images, PDF, Word documents (Max 5 files, 10MB each)
                </p>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Attached Files ({attachments.length}/5)
                  </p>
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded p-3 border border-slate-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <UploadIcon size={18} className="text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                className="flex-1 bg-primary hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-medium transition-colors"
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
