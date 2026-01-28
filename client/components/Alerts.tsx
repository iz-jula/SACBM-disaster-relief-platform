import { useEffect, useState } from "react";
import {
  AlertCircle,
  Cloud,
  MapPin,
  TrendingUp,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import {
  getNewsAlerts,
  getNewsAlertsLastUpdate,
  NewsAlert,
} from "@/services/weatherService";

interface FallbackAlert {
  id: string;
  type: "weather" | "state";
  severity: "high" | "medium" | "low";
  title: string;
  location: string;
  description: string;
  time: string;
}

type AlertType = NewsAlert | FallbackAlert;

// Fallback alerts when Google Calendar is not connected
const FALLBACK_ALERTS: FallbackAlert[] = [
  {
    id: "1",
    type: "weather",
    severity: "high",
    title: "Heavy Rainfall Expected",
    location: "Sofala Province",
    description:
      "Heavy rainfall warning for the Sofala province. Scattered showers expected from 2 PM today.",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "weather",
    severity: "medium",
    title: "Thunderstorm Alert",
    location: "Inhambane District",
    description:
      "Isolated thunderstorms possible in the Inhambane district throughout the afternoon.",
    time: "1 hour ago",
  },
  {
    id: "3",
    type: "state",
    severity: "high",
    title: "Flood Risk Alert",
    location: "Gaza Province",
    description:
      "Water levels rising in Gaza province. Emergency teams have been mobilized.",
    time: "30 minutes ago",
  },
  {
    id: "4",
    type: "weather",
    severity: "low",
    title: "Wind Advisory",
    location: "Coastal Areas",
    description:
      "Strong winds expected along the coastal areas. Speed up to 35 km/h.",
    time: "20 minutes ago",
  },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    loadAlerts();
    // Refresh alerts every 30 minutes
    const interval = setInterval(loadAlerts, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const newsAlerts = await getNewsAlerts();
      const updateTime = getNewsAlertsLastUpdate();
      setLastUpdate(updateTime);

      setAlerts(newsAlerts);
    } catch (error) {
      console.error("Error loading news alerts:", error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastUpdate = (date: Date | null): string => {
    if (!date) return "Never";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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

  // Helper to safely convert values to strings
  const safeString = (value: any): string => {
    if (typeof value === "string") return value;
    if (!value) return "";
    if (typeof value === "object") {
      // Try to extract English label for EventRegistry objects
      if (value.eng) return value.eng;
      if (value.label?.eng) return value.label.eng;
      // Try any available language
      const firstValue = Object.values(value)[0];
      if (typeof firstValue === "string") return firstValue;
      return "";
    }
    return String(value);
  };

  const getTitle = (alert: AlertType): string => {
    return safeString(alert.title) || "Alert";
  };

  const getDescription = (alert: AlertType): string => {
    return safeString(alert.description) || "";
  };

  const getTime = (alert: AlertType): string => {
    if ("time" in alert) {
      return alert.time;
    }
    if ("publishedAt" in alert) {
      const date = new Date(alert.publishedAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      } else {
        return "Just now";
      }
    }
    return "";
  };

  const getSeverity = (alert: AlertType): "high" | "medium" | "low" => {
    return alert.severity || "medium";
  };

  const getLocation = (alert: AlertType): string => {
    if ("location" in alert) {
      return alert.location;
    }
    if ("source" in alert) {
      return `Source: ${alert.source}`;
    }
    return "";
  };

  const getUrl = (alert: AlertType): string | undefined => {
    if ("url" in alert) {
      return alert.url;
    }
    return undefined;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-red-50">
        <div className="flex items-start justify-between gap-6">
          {/* Left side - Title and Description */}
          <div className="flex items-start gap-3 flex-1">
            <AlertCircle
              size={24}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900">News Alerts</h2>
              <p className="text-sm text-slate-600 mt-1">
                Latest news about floods, government alerts, and weather events
                in Mozambique
              </p>
            </div>
          </div>

          {/* Right side - Last updated status */}
          <div className="border-l border-slate-300 pl-6 flex-shrink-0">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-blue-600 whitespace-nowrap">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Loading...
              </div>
            )}
            {!isLoading && (
              <div className="text-right whitespace-nowrap">
                <p className="text-xs text-slate-600">Last updated</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatLastUpdate(lastUpdate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-6">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const severity = getSeverity(alert);
            const isNews = "url" in alert;
            const url = getUrl(alert);

            return (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${getSeverityColor(severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${getSeverityBadgeColor(severity)}`}
                  >
                    {isNews ? <AlertCircle size={20} /> : <Cloud size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold">{getTitle(alert)}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getSeverityBadgeColor(severity)}`}
                      >
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </span>
                    </div>

                    {getLocation(alert) && (
                      <p className="text-sm opacity-75 flex items-center gap-1 mb-2">
                        {isNews ? (
                          <span>
                            <strong>Source:</strong> {getLocation(alert)}
                          </span>
                        ) : (
                          <>
                            <MapPin size={14} />
                            {getLocation(alert)}
                          </>
                        )}
                      </p>
                    )}

                    {getDescription(alert) && (
                      <p className="text-sm opacity-90 mb-2 line-clamp-2">
                        {getDescription(alert)}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-xs opacity-70">{getTime(alert)}</p>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium opacity-75 hover:opacity-100 transition-opacity"
                        >
                          Read more
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <TrendingUp
              size={32}
              className="mx-auto text-green-600 mb-2 opacity-50"
            />
            <p className="text-slate-600">No active alerts at this time</p>
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-slate-200 bg-blue-50 text-xs text-blue-700">
        ℹ News alerts are updated automatically from Google News and other news
        sources
      </div>
    </div>
  );
}
