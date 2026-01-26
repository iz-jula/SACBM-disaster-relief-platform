import { useState } from "react";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface UploadedRequest {
  company: string;
  location: string;
  helpType: string;
  evacuationType: string;
  peopleInvolved: number;
  amountSpent: number;
  source: "INGD" | "Chamber";
}

export default function UploadRequests() {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedRequest[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");

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
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type === "text/csv") {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  const parseCSV = (csvFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const data: UploadedRequest[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === "") continue;

          const values = lines[i].split(",").map((v) => v.trim());
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index];
          });

          if (row.company && row.location) {
            data.push({
              company: row.company || "Unknown",
              location: row.location || "Unknown",
              helpType: row.helptype || "Materials",
              evacuationType: row.evacuationtype || "Other",
              peopleInvolved: parseInt(row.people) || 0,
              amountSpent: parseInt(row.amount) || 0,
              source: row.source === "INGD" ? "INGD" : "Chamber",
            });
          }
        }

        setUploadedData(data);
        setUploadStatus("success");
        setTimeout(() => setUploadStatus("idle"), 3000);
      } catch (error) {
        setUploadStatus("error");
        setTimeout(() => setUploadStatus("idle"), 3000);
      }
    };
    reader.readAsText(csvFile);
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Upload Requests</h1>
          <p className="text-slate-600 mt-1">Bulk upload relief requests via CSV</p>
        </div>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive
              ? "border-primary bg-orange-50"
              : "border-slate-300 bg-slate-50 hover:bg-slate-100"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload
            size={48}
            className={`mx-auto mb-4 ${dragActive ? "text-primary" : "text-slate-400"}`}
          />
          <p className="text-xl font-semibold text-slate-900 mb-2">
            {file ? file.name : "Drag and drop your CSV file here"}
          </p>
          <p className="text-slate-600 mb-4">or</p>
          <label className="inline-block">
            <input
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
            />
            <button
              onClick={() => document.querySelector('input[type="file"]')?.click()}
              className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer"
            >
              Browse Files
            </button>
          </label>
          <p className="text-sm text-slate-500 mt-4">CSV files only (max 10MB)</p>
        </div>

        {/* Status Messages */}
        {uploadStatus === "success" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <FileCheck className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-900">Upload Successful!</p>
              <p className="text-sm text-green-800 mt-1">
                {uploadedData.length} request(s) ready to import
              </p>
            </div>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-red-900">Upload Failed</p>
              <p className="text-sm text-red-800 mt-1">
                Please ensure your file is a valid CSV format
              </p>
            </div>
          </div>
        )}

        {/* CSV Format Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-bold text-blue-900 mb-4">CSV Format Guide</h2>
          <p className="text-sm text-blue-800 mb-4">
            Your CSV file should include the following columns (in any order):
          </p>
          <div className="bg-white rounded border border-blue-200 p-4 font-mono text-sm text-blue-900 overflow-x-auto mb-4">
            <div>Company,Location,HelpType,EvacuationType,People,Amount,Source</div>
            <div className="mt-2 text-slate-500">
              Local Hospital,District 1 Village A,Materials,By boat,150,45000,INGD
            </div>
            <div className="text-slate-500">
              Community Center,District 2 Village B,Food,By tractor,320,125000,Chamber
            </div>
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Column Details:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>
                <span className="font-medium">HelpType:</span> Food, Clothing, Materials, or Medical
              </li>
              <li>
                <span className="font-medium">EvacuationType:</span> By boat, By tractor, By helicopter, or Other
              </li>
              <li>
                <span className="font-medium">People:</span> Number of people involved (numeric)
              </li>
              <li>
                <span className="font-medium">Amount:</span> Value in meticais (numeric)
              </li>
              <li>
                <span className="font-medium">Source:</span> INGD or Chamber
              </li>
            </ul>
          </div>
        </div>

        {/* Preview Table */}
        {uploadedData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <h2 className="text-lg font-bold text-slate-900">
                Preview ({uploadedData.length} requests)
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
                  {uploadedData.slice(0, 5).map((request, index) => (
                    <tr
                      key={index}
                      className={`border-b border-slate-200 ${
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

            {uploadedData.length > 5 && (
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-center text-sm text-slate-600">
                Showing 5 of {uploadedData.length} requests
              </div>
            )}

            <div className="px-6 py-4 border-t border-slate-200 flex gap-4">
              <button
                onClick={() => {
                  setFile(null);
                  setUploadedData([]);
                }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
              <button className="flex-1 bg-primary hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors">
                Import Requests
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
