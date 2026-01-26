import { useEffect, useState } from "react";
import { AlertCircle, Cloud, MapPin, TrendingUp } from "lucide-react";
import { getGoogleCalendarAlerts, getStoredGoogleUser, GoogleAlert } from "@/services/googleService";

interface FallbackAlert {
  id: string;
  type: "weather" | "state";
  severity: "high" | "medium" | "low";
  title: string;
  location: string;
  description: string;
  time: string;
}

// Fallback alerts when Google Calendar is not connected
const FALLBACK_ALERTS: FallbackAlert[] = [
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

export default function Alerts() {
  const [alerts, setAlerts] = useState<GoogleAlert[] | FallbackAlert[]>(FALLBACK_ALERTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const googleUser = getStoredGoogleUser();

    if (googleUser?.accessToken) {
      setIsConnected(true);
      setIsLoading(true);
      try {
        const googleAlerts = await getGoogleCalendarAlerts(googleUser.accessToken);
        if (googleAlerts.length > 0) {
          setAlerts(googleAlerts);
        } else {
          // If no Google Calendar events, use fallback
          setAlerts(FALLBACK_ALERTS);
        }
      } catch (error) {
        console.error("Error loading Google Calendar alerts:", error);
        setAlerts(FALLBACK_ALERTS);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsConnected(false);
      setAlerts(FALLBACK_ALERTS);
    }
  };

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
    if (type === "weather" || "start" in alerts[0]!) {
      return <Cloud size={20} />;
    }
    return <AlertCircle size={20} />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">System Alerts</h2>
              <p className="text-sm text-slate-600">
                {isConnected ? "Synced from Google Calendar" : "Sample alerts"}
              </p>
            </div>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              Syncing...
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 p-6">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const isFallback = !("start" in alert);
            const severity = "severity" in alert ? alert.severity : "medium";

            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${getSeverityColor(severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${getSeverityBadgeColor(severity)}`}>
                    {isFallback && "type" in alert && alert.type === "weather" ? (
                      <Cloud size={20} />
                    ) : (
                      <AlertCircle size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold truncate">{"title" in alert ? alert.title : alert.summary}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getSeverityBadgeColor(severity)}`}>
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </span>
                    </div>

                    {isFallback && "location" in alert && (
                      <p className="text-sm opacity-75 flex items-center gap-1 mb-2">
                        <MapPin size={14} />
                        {alert.location}
                      </p>
                    )}

                    <p className="text-sm opacity-90 mb-2">
                      {"description" in alert ? alert.description : alert.description}
                    </p>

                    <p className="text-xs opacity-70">
                      {isFallback && "time" in alert ? alert.time : new Date(alert.start).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <TrendingUp size={32} className="mx-auto text-green-600 mb-2 opacity-50" />
            <p className="text-slate-600">No active alerts at this time</p>
          </div>
        )}
      </div>

      {isConnected && (
        <div className="px-6 py-3 border-t border-slate-200 bg-green-50 text-xs text-green-700">
          ✓ Connected to Google Calendar - Alerts will sync automatically
        </div>
      )}
    </div>
  );
}
