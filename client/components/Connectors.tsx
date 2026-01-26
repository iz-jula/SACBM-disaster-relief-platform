import { useState } from "react";
import { Plus, X, CheckCircle, AlertCircle, Loader, Github, Cloud, Code, Database } from "lucide-react";

interface Connector {
  id: string;
  name: string;
  type: "api" | "github" | "google-drive" | "database";
  status: "connected" | "disconnected" | "pending";
  lastSync?: string;
}

interface ConnectorFormData {
  name: string;
  type: "api" | "github" | "google-drive" | "database";
  credentials: Record<string, string>;
}

export default function Connectors() {
  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: "1",
      name: "INGD API",
      type: "api",
      status: "connected",
      lastSync: "2024-01-26 10:30 AM",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ConnectorFormData>({
    name: "",
    type: "api",
    credentials: {},
  });

  const getConnectorIcon = (type: string) => {
    switch (type) {
      case "api":
        return <Code size={24} className="text-blue-600" />;
      case "github":
        return <Github size={24} className="text-slate-800" />;
      case "google-drive":
        return <Cloud size={24} className="text-blue-600" />;
      case "database":
        return <Database size={24} className="text-purple-600" />;
      default:
        return <Code size={24} className="text-slate-600" />;
    }
  };

  const getConnectorLabel = (type: string) => {
    switch (type) {
      case "api":
        return "REST API";
      case "github":
        return "GitHub";
      case "google-drive":
        return "Google Drive";
      case "database":
        return "Database";
      default:
        return type;
    }
  };

  const getFormFields = (type: string) => {
    switch (type) {
      case "api":
        return [
          { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://api.example.com" },
          { key: "apiKey", label: "API Key", type: "password", placeholder: "Your API key" },
          { key: "endpoint", label: "Requests Endpoint", type: "text", placeholder: "/api/requests" },
        ];
      case "github":
        return [
          { key: "repo", label: "Repository", type: "text", placeholder: "owner/repo" },
          { key: "token", label: "Personal Access Token", type: "password", placeholder: "github_pat_..." },
          { key: "branch", label: "Branch", type: "text", placeholder: "main" },
        ];
      case "google-drive":
        return [
          { key: "clientId", label: "Client ID", type: "text", placeholder: "Your Google Client ID" },
          { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Your Client Secret" },
          { key: "folderId", label: "Folder ID", type: "text", placeholder: "Google Drive Folder ID" },
        ];
      case "database":
        return [
          { key: "host", label: "Host", type: "text", placeholder: "localhost" },
          { key: "port", label: "Port", type: "text", placeholder: "5432" },
          { key: "database", label: "Database", type: "text", placeholder: "disaster_relief" },
          { key: "user", label: "Username", type: "text", placeholder: "postgres" },
          { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
        ];
      default:
        return [];
    }
  };

  const handleAddConnector = async () => {
    if (!formData.name || !formData.type) return;

    setIsLoading(true);
    try {
      // Simulate API call to test connection
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newConnector: Connector = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type,
        status: "connected",
        lastSync: new Date().toLocaleString(),
      };

      setConnectors([...connectors, newConnector]);
      setFormData({ name: "", type: "api", credentials: {} });
      setShowForm(false);
    } catch (error) {
      console.error("Error adding connector:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConnectors(
        connectors.map((c) =>
          c.id === id ? { ...c, status: "connected", lastSync: new Date().toLocaleString() } : c
        )
      );
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteConnector = (id: string) => {
    setConnectors(connectors.filter((c) => c.id !== id));
  };

  const handleFormChange = (key: string, value: string) => {
    if (key === "type") {
      setFormData({
        ...formData,
        type: value as any,
        credentials: {},
      });
    } else if (key === "name") {
      setFormData({ ...formData, name: value });
    } else {
      setFormData({
        ...formData,
        credentials: { ...formData.credentials, [key]: value },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Connectors List */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Data Connectors</h3>
            <p className="text-sm text-slate-600">Manage integrations with external data sources</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            New Connector
          </button>
        </div>

        <div className="space-y-3 p-6">
          {connectors.length > 0 ? (
            connectors.map((connector) => (
              <div key={connector.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-slate-50">
                    {getConnectorIcon(connector.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{connector.name}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          connector.status === "connected"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {connector.status === "connected" ? (
                          <CheckCircle size={14} />
                        ) : (
                          <AlertCircle size={14} />
                        )}
                        {connector.status === "connected" ? "Connected" : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{getConnectorLabel(connector.type)}</p>
                    {connector.lastSync && (
                      <p className="text-xs text-slate-500 mt-2">Last synced: {connector.lastSync}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTestConnection(connector.id)}
                      disabled={testingId === connector.id}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      {testingId === connector.id ? (
                        <>
                          <Loader size={14} className="animate-spin" />
                          Testing
                        </>
                      ) : (
                        "Test"
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteConnector(connector.id)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">No connectors configured yet</p>
              <p className="text-sm text-slate-500 mt-1">Add your first connector to sync data</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Connector Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Add New Connector</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Connector Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Connector Type *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(["api", "github", "google-drive", "database"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleFormChange("type", type)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.type === type
                        ? "border-primary bg-orange-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {getConnectorIcon(type)}
                    <span className="text-xs font-medium text-slate-900">{getConnectorLabel(type)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Connector Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="e.g., Production API, GitHub Staging"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Dynamic Form Fields */}
            <div className="space-y-4">
              {getFormFields(formData.type).map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {field.label} *
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData.credentials[field.key] || ""}
                    onChange={(e) => handleFormChange(field.key, e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddConnector}
                disabled={isLoading || !formData.name || !formData.type}
                className="flex-1 bg-primary hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  "Add Connector"
                )}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supported Integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Code size={20} />
            REST API
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            Connect to any REST API endpoint to sync relief request data in real-time.
          </p>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✓ Custom authentication (API Keys, OAuth)</li>
            <li>✓ Automatic data sync</li>
            <li>✓ Request mapping and transformation</li>
          </ul>
        </div>

        <div className="bg-slate-100 border border-slate-300 rounded-xl p-6">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Github size={20} />
            GitHub
          </h4>
          <p className="text-sm text-slate-700 mb-3">
            Store relief request data in GitHub repositories with version control.
          </p>
          <ul className="space-y-1 text-sm text-slate-700">
            <li>✓ Repository management</li>
            <li>✓ CSV/JSON file storage</li>
            <li>✓ Automatic backups</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Cloud size={20} />
            Google Drive
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            Sync data with Google Sheets and Docs for collaborative editing.
          </p>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>✓ Google Sheets integration</li>
            <li>✓ Google Docs templates</li>
            <li>✓ Real-time collaboration</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <Database size={20} />
            Databases
          </h4>
          <p className="text-sm text-purple-800 mb-3">
            Connect directly to PostgreSQL, MySQL, or other databases.
          </p>
          <ul className="space-y-1 text-sm text-purple-800">
            <li>✓ PostgreSQL, MySQL, SQLite</li>
            <li>✓ Direct query execution</li>
            <li>✓ Transaction support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
