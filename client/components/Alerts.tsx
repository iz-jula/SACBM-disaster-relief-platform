import { AlertCircle, Cloud, MapPin, TrendingUp } from "lucide-react";

interface Alert {
  id: string;
  type: "weather" | "state";
  severity: "high" | "medium" | "low";
  title: string;
  location: string;
  description: string;
  time: string;
}

export default function Alerts() {
  const alerts: Alert[] = [
    {
      id: "1",
      type: "weather",
      severity: "high",
      title: "Heavy Rainfall Expected",
      location: "Sofala Province",
      description: "Heavy rainfall warning for the Sofala province. Scattered showers expected from 2 PM today.",
      time: "2 hours ago",
    },
    {
      id: "2",
      type: "weather",
      severity: "medium",
      title: "Thunderstorm Alert",
      location: "Inhambane District",
      description: "Isolated thunderstorms possible in the Inhambane district throughout the afternoon.",
      time: "1 hour ago",
    },
    {
      id: "3",
      type: "state",
      severity: "high",
      title: "Flood Risk Alert",
      location: "Gaza Province",
      description: "Water levels rising in Gaza province. Emergency teams have been mobilized.",
      time: "30 minutes ago",
    },
    {
      id: "4",
      type: "weather",
      severity: "low",
      title: "Wind Advisory",
      location: "Coastal Areas",
      description: "Strong winds expected along the coastal areas. Speed up to 35 km/h.",
      time: "20 minutes ago",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200 text-red-900";
      case "medium":
        return "bg-orange-50 border-orange-200 text-orange-900";
      case "low":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      default:
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-orange-100 text-orange-700";
      case "low":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getIcon = (type: string) => {
    return type === "weather" ? <Cloud size={20} /> : <AlertCircle size={20} />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-red-50">
        <div className="flex items-center gap-2">
          <AlertCircle size={24} className="text-red-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">System Alerts</h2>
            <p className="text-sm text-slate-600">Weather and operational alerts</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 p-6">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${getSeverityBadgeColor(alert.severity)}`}>
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold truncate">{alert.title}</p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getSeverityBadgeColor(alert.severity)}`}
                    >
                      {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm opacity-75 flex items-center gap-1 mb-2">
                    <MapPin size={14} />
                    {alert.location}
                  </p>
                  <p className="text-sm opacity-90 mb-2">{alert.description}</p>
                  <p className="text-xs opacity-70">{alert.time}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <TrendingUp size={32} className="mx-auto text-green-600 mb-2 opacity-50" />
            <p className="text-slate-600">No active alerts at this time</p>
          </div>
        )}
      </div>
    </div>
  );
}
