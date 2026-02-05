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
    if (!date || !(date instanceof Date)) return "Never";
    try {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Never";
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
      return safeString(alert.time);
    }
    if ("publishedAt" in alert) {
      const publishedAtStr = safeString(alert.publishedAt);
      if (!publishedAtStr) return "";

      try {
        const date = new Date(publishedAtStr);
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
      } catch {
        return "Recently";
      }
    }
    return "";
  };

  const getSeverity = (alert: AlertType): "high" | "medium" | "low" => {
    return alert.severity || "medium";
  };

  const getLocation = (alert: AlertType): string => {
    if ("location" in alert) {
      return safeString(alert.location);
    }
    if ("source" in alert) {
      return `Source: ${safeString(alert.source)}`;
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
    <div className="rounded-2xl bg-white/50 backdrop-blur border border-slate-200/50 overflow-hidden flex flex-col max-h-[600px]">
      <div className="px-6 sm:px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-red-50/50 to-transparent flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Title and Description */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 rounded-lg p-2">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Live Alerts</h2>
            </div>
            <p className="text-slate-600 text-sm">
              Real-time news about floods, weather & emergencies
            </p>
          </div>

          {/* Right side - Last updated status */}
          <div className="flex-shrink-0 text-right min-w-fit">
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <RefreshCw size={14} className="animate-spin" />
                <span>Updating...</span>
              </div>
            )}
            {!isLoading && (
              <div className="text-xs">
                <p className="text-slate-600">Updated</p>
                <p className="font-medium text-slate-900">
                  {formatLastUpdate(lastUpdate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 p-6 overflow-y-auto flex-1 min-h-0">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const severity = getSeverity(alert);
            const isNews = "url" in alert;
            const url = getUrl(alert);

            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-md hover:border-opacity-100 group ${getSeverityColor(severity)}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${getSeverityBadgeColor(severity)}`}
                  >
                    {isNews ? <AlertCircle size={18} className="sm:w-5 sm:h-5" /> : <Cloud size={18} className="sm:w-5 sm:h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-sm sm:text-base">{getTitle(alert)}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getSeverityBadgeColor(severity)}`}
                      >
                        {severity.charAt(0).toUpperCase() + severity.slice(1)}
                      </span>
                    </div>

                    {getLocation(alert) && (
                      <p className="text-xs sm:text-sm opacity-75 flex items-start gap-1 mb-2">
                        {isNews ? (
                          <span>
                            <strong>Source:</strong> {getLocation(alert)}
                          </span>
                        ) : (
                          <>
                            <MapPin size={12} className="flex-shrink-0 mt-0.5 sm:w-3.5 sm:h-3.5" />
                            <span>{getLocation(alert)}</span>
                          </>
                        )}
                      </p>
                    )}

                    {getDescription(alert) && (
                      <p className="text-xs sm:text-sm opacity-90 mb-2 line-clamp-2">
                        {getDescription(alert)}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                      <p className="opacity-70">{getTime(alert)}</p>
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 font-medium opacity-75 hover:opacity-100 transition-opacity whitespace-nowrap"
                        >
                          Read more
                          <ExternalLink size={12} className="sm:w-3 sm:h-3" />
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

      <div className="px-6 py-4 border-t border-slate-200/50 bg-blue-50/30 text-xs text-blue-700 flex items-center gap-2 flex-shrink-0">
        <AlertCircle size={14} className="flex-shrink-0" />
        <span>Updated automatically from news sources</span>
      </div>
    </div>
  );
}
