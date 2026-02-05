import { useState, useEffect } from "react";
import {
  Search,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudDrizzle,
  Droplets,
  Wind,
  Eye,
  AlertCircle,
  Loader,
  Zap,
  CloudFog,
  X,
} from "lucide-react";
import {
  getCurrentWeather,
  getForecast,
  WeatherData,
  ForecastDay,
  getWeatherIconInfo,
} from "@/services/weatherService";
import { MOZAMBIQUE_CITIES } from "@/config/api";

const allCities = Object.keys(MOZAMBIQUE_CITIES);

function getWeatherIcon(condition: string, size: number = 12) {
  const sizeClass = `w-${size} h-${size}`;
  switch (condition) {
    case "sunny":
      return <Sun className={`${sizeClass} text-amber-400`} />;
    case "cloudy":
      return <Cloud className={`${sizeClass} text-slate-400`} />;
    case "rainy":
      return <CloudRain className={`${sizeClass} text-blue-500`} />;
    case "snow":
      return <CloudSnow className={`${sizeClass} text-slate-300`} />;
    case "storm":
      return <Zap className={`${sizeClass} text-orange-500`} />;
    case "fog":
      return <CloudFog className={`${sizeClass} text-slate-500`} />;
    default:
      return <Cloud className={`${sizeClass} text-slate-400`} />;
  }
}

function getLargeWeatherIcon(code: number) {
  const iconInfo = getWeatherIconInfo(code);
  switch (iconInfo.condition) {
    case "sunny":
      return <Sun className="w-16 h-16 sm:w-20 sm:h-20 text-amber-400" />;
    case "cloudy":
      return <Cloud className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400" />;
    case "rainy":
      return <CloudRain className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500" />;
    case "snow":
      return <CloudSnow className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300" />;
    case "storm":
      return <Zap className="w-16 h-16 sm:w-20 sm:h-20 text-orange-500" />;
    case "fog":
      return <CloudFog className="w-16 h-16 sm:w-20 sm:h-20 text-slate-500" />;
    default:
      return <Cloud className="w-16 h-16 sm:w-20 sm:h-20 text-slate-400" />;
  }
}

export default function MaputoWeather() {
  const [selectedCity, setSelectedCity] = useState("Maputo");
  const [searchInput, setSearchInput] = useState("");
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(
    null,
  );
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);

  const filteredCities = allCities.filter((city) =>
    city.toLowerCase().includes(searchInput.toLowerCase()),
  );

  useEffect(() => {
    loadWeatherData(selectedCity);
  }, [selectedCity]);

  const loadWeatherData = async (city: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [weather, forecastData] = await Promise.all([
        getCurrentWeather(city),
        getForecast(city),
      ]);

      if (weather) {
        setCurrentWeather(weather);
      } else {
        setError(
          "Unable to load weather data. Please check your OpenWeatherMap API key.",
        );
      }

      if (forecastData) {
        setForecast(forecastData);
      }
    } catch (err) {
      console.error("Error loading weather:", err);
      setError("Failed to load weather data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/50 backdrop-blur border border-slate-200/50 overflow-hidden">
      <div className="px-6 sm:px-8 py-6 border-b border-slate-200/50 bg-gradient-to-r from-cyan-50/50 to-transparent">
        <h2 className="text-2xl font-bold text-slate-900">Weather Forecast</h2>
        <p className="text-slate-600 mt-1">{selectedCity}</p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* City Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {searchInput && filteredCities.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
              {filteredCities.slice(0, 5).map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    setSelectedCity(city);
                    setSearchInput("");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
            <AlertCircle
              size={18}
              className="text-red-600 flex-shrink-0 mt-0.5 sm:w-5 sm:h-5"
            />
            <div className="min-w-0">
              <p className="font-medium text-red-900 text-sm sm:text-base">
                {error}
              </p>
              <p className="text-xs sm:text-sm text-red-700 mt-1">
                To enable real-time weather, add your Open-Meteo API key to
                .env:
                <code className="block mt-1 text-xs bg-white p-1 rounded font-mono overflow-x-auto">
                  VITE_OPENMETEO_API_KEY=your_api_key
                </code>
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-blue-600" />
          </div>
        )}

        {/* Current Weather Card */}
        {currentWeather && !isLoading && (
          <>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 sm:p-6 border border-blue-200 shadow-sm">
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

              {/* Primary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 pb-4 border-b border-blue-200">
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-slate-600 font-semibold">
                      Humidity
                    </p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {currentWeather.humidity}%
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-slate-600 font-semibold">
                      Wind Speed
                    </p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {currentWeather.windSpeed} km/h
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CloudRain className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-slate-600 font-semibold">
                      Rain Chance
                    </p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {currentWeather.rainChance}%
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Cloud className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-slate-600 font-semibold">
                      Cloud Cover
                    </p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {currentWeather.cloudCover}%
                  </p>
                </div>
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white/40 rounded-lg p-3">
                  <p className="text-xs text-slate-600 font-semibold">
                    Wind Direction
                  </p>
                  <p className="text-base font-bold text-slate-900 mt-1">
                    {currentWeather.windDirection}
                  </p>
                </div>
                {currentWeather.windGust && (
                  <div className="bg-white/40 rounded-lg p-3">
                    <p className="text-xs text-slate-600 font-semibold">
                      Wind Gust
                    </p>
                    <p className="text-base font-bold text-slate-900 mt-1">
                      {currentWeather.windGust} km/h
                    </p>
                  </div>
                )}
                <div className="bg-white/40 rounded-lg p-3">
                  <p className="text-xs text-slate-600 font-semibold">
                    Visibility
                  </p>
                  <p className="text-base font-bold text-slate-900 mt-1">
                    {currentWeather.visibility} km
                  </p>
                </div>
                <div className="bg-white/40 rounded-lg p-3">
                  <p className="text-xs text-slate-600 font-semibold">
                    Pressure
                  </p>
                  <p className="text-base font-bold text-slate-900 mt-1">
                    {currentWeather.pressure} mb
                  </p>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast && (
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 mb-3">
                  5-Day Forecast
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <p className="text-xs sm:text-sm font-bold text-slate-900 mb-2">
                        {day.day}
                      </p>
                      <div className="flex justify-center mb-3">
                        {getWeatherIcon(day.condition, 8)}
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
                        <p className="text-slate-600">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* API Not Configured Message */}
        {!currentWeather && !isLoading && (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <AlertCircle size={32} className="mx-auto text-blue-600 mb-3" />
            <p className="font-medium text-blue-900">
              Real-Time Weather Data Not Configured
            </p>
            <p className="text-sm text-blue-700 mt-2">
              To enable live weather data from OpenWeatherMap, add your API key
              to your .env file
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
