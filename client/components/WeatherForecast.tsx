import { useState, useEffect } from "react";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  ArrowRight,
  Loader,
  CloudSnow,
  Zap,
  CloudFog,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getCurrentWeather,
  getForecast,
  WeatherData,
  ForecastDay,
  getWeatherIconInfo,
} from "@/services/weatherService";

export default function WeatherForecast() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null,
  );
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setIsLoading(true);
    try {
      const [weather, forecastData] = await Promise.all([
        getCurrentWeather("Maputo"),
        getForecast("Maputo"),
      ]);

      if (weather) {
        setCurrentWeather(weather);
      }

      if (forecastData) {
        setForecast(forecastData);
      }
    } catch (error) {
      console.error("Error loading weather:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun size={32} className="text-amber-400" />;
      case "cloudy":
        return <Cloud size={32} className="text-slate-400" />;
      case "rainy":
        return <CloudRain size={32} className="text-blue-500" />;
      case "snow":
        return <CloudSnow size={32} className="text-slate-300" />;
      case "storm":
        return <Zap size={32} className="text-orange-500" />;
      case "fog":
        return <CloudFog size={32} className="text-slate-500" />;
      default:
        return <Cloud size={32} className="text-slate-400" />;
    }
  };

  const getLargeWeatherIcon = (code: number) => {
    const iconInfo = getWeatherIconInfo(code);
    switch (iconInfo.condition) {
      case "sunny":
        return <Sun size={48} className="text-amber-400" />;
      case "cloudy":
        return <Cloud size={48} className="text-slate-400" />;
      case "rainy":
        return <CloudRain size={48} className="text-blue-500" />;
      case "snow":
        return <CloudSnow size={48} className="text-slate-300" />;
      case "storm":
        return <Zap size={48} className="text-orange-500" />;
      case "fog":
        return <CloudFog size={48} className="text-slate-500" />;
      default:
        return <Cloud size={48} className="text-slate-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-white/50 backdrop-blur border border-slate-200/50 overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-blue-50/50 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Weather Forecast
            </h2>
            <p className="text-slate-600 mt-1">Maputo</p>
          </div>
          <Link
            to="/weather"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
          >
            View Full
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        ) : currentWeather ? (
          <>
            {/* Current Weather - Large Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 sm:p-6 border border-blue-200">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    Current Conditions
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                    {currentWeather.temp}°C
                  </p>
                  <p className="text-sm sm:text-base text-slate-700 mt-1 font-medium">
                    {currentWeather.description}
                  </p>
                  <div className="flex gap-4 mt-3 text-xs">
                    <span className="text-slate-600">
                      H:{" "}
                      <span className="font-bold text-slate-900">
                        {currentWeather.high}°C
                      </span>
                    </span>
                    <span className="text-slate-600">
                      L:{" "}
                      <span className="font-bold text-slate-900">
                        {currentWeather.low}°C
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getLargeWeatherIcon(currentWeather.weatherCode)}
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-blue-200">
                <div className="bg-white/60 rounded-lg p-3 flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">
                      Humidity
                    </p>
                    <p className="font-bold text-slate-900">
                      {currentWeather.humidity}%
                    </p>
                  </div>
                </div>
                <div className="bg-white/60 rounded-lg p-3 flex items-center gap-3">
                  <Wind className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-600 font-semibold">
                      Wind Speed
                    </p>
                    <p className="font-bold text-slate-900">
                      {currentWeather.windSpeed} km/h
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast && (
              <div>
                <h3 className="font-semibold text-base text-slate-900 mb-3">
                  5-Day Forecast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {forecast.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDay(day)}
                      className="p-3 sm:p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-blue-400 hover:shadow-lg hover:scale-105 transition-all cursor-pointer text-left"
                    >
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mb-2">
                        {day.day}
                      </p>
                      <div className="flex justify-center mb-3">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="text-center mb-3 border-b border-slate-200 pb-2">
                        <p className="text-sm font-bold text-slate-900">
                          {day.high}°
                        </p>
                        <p className="text-xs text-slate-600">{day.low}°</p>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-center gap-1 text-slate-600">
                          <CloudRain size={12} className="text-blue-500" />
                          <span>{day.rainChance}%</span>
                        </div>
                        {day.precipitation !== undefined &&
                          day.precipitation > 0 && (
                            <div className="flex items-center justify-center gap-1 text-slate-600">
                              <Droplets size={12} className="text-blue-600" />
                              <span>{day.precipitation.toFixed(1)} mm</span>
                            </div>
                          )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weather Alert - Conditional */}
            {currentWeather.rainChance > 50 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-orange-900 mb-1">
                  ⚠️ Weather Alert
                </p>
                <p className="text-sm text-orange-800">
                  High precipitation probability ({currentWeather.rainChance}%).
                  Ensure disaster relief operations account for wet conditions.
                </p>
              </div>
            )}

            {/* Forecast Detail Modal */}
            {selectedDay && (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                onClick={() => setSelectedDay(null)}
              >
                <div
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedDay.day} Forecast
                    </h3>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-slate-600" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Weather Icon and Description */}
                    <div className="flex flex-col items-center gap-3 py-4 border-b border-slate-200">
                      {getLargeWeatherIcon(selectedDay.weatherCode)}
                      <p className="text-base font-semibold text-slate-900">
                        {
                          getWeatherIconInfo(selectedDay.weatherCode)
                            .description
                        }
                      </p>
                    </div>

                    {/* Temperature Range */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-slate-600 font-semibold mb-1">
                            HIGH
                          </p>
                          <p className="text-3xl font-bold text-slate-900">
                            {selectedDay.high}°C
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-600 font-semibold mb-1">
                            LOW
                          </p>
                          <p className="text-3xl font-bold text-slate-900">
                            {selectedDay.low}°C
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Precipitation Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CloudRain size={18} className="text-blue-500" />
                          <span className="font-semibold text-slate-900">
                            Rain Chance
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          {selectedDay.rainChance}%
                        </span>
                      </div>

                      {selectedDay.precipitation !== undefined &&
                        selectedDay.precipitation > 0 && (
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Droplets size={18} className="text-blue-600" />
                              <span className="font-semibold text-slate-900">
                                Precipitation
                              </span>
                            </div>
                            <span className="font-bold text-slate-900">
                              {selectedDay.precipitation.toFixed(1)} mm
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Date */}
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-sm text-slate-600 text-center">
                        {new Date(selectedDay.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="font-medium text-blue-900">
              Unable to load weather data
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Please check your API configuration or try again later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
