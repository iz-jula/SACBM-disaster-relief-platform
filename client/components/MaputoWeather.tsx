import { useState, useEffect } from "react";
import { Search, Cloud, CloudRain, Sun, Droplets, Wind, Eye, AlertCircle, Loader } from "lucide-react";
import { getCurrentWeather, getForecast, WeatherData, ForecastDay } from "@/services/weatherService";
import { MOZAMBIQUE_CITIES } from "@/config/api";

const allCities = Object.keys(MOZAMBIQUE_CITIES);

function getWeatherIcon(condition: string, size: number = 12) {
  const sizeClass = `w-${size} h-${size}`;
  switch (condition) {
    case "sunny":
      return <Sun className={`${sizeClass} text-yellow-400`} />;
    case "cloudy":
      return <Cloud className={`${sizeClass} text-slate-400`} />;
    case "rainy":
      return <CloudRain className={`${sizeClass} text-blue-400`} />;
    default:
      return <Cloud className={`${sizeClass} text-slate-400`} />;
  }
}

export default function MaputoWeather() {
  const [selectedCity, setSelectedCity] = useState("Maputo");
  const [searchInput, setSearchInput] = useState("");
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCities = allCities.filter((city) =>
    city.toLowerCase().includes(searchInput.toLowerCase())
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
        setError("Unable to load weather data. Please check your OpenWeatherMap API key.");
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
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Weather - {selectedCity}</h2>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* City Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">{error}</p>
              <p className="text-sm text-red-700 mt-1">
                To enable real-time weather, add your OpenWeatherMap API key to .env:
                <code className="block mt-1 text-xs bg-white p-1 rounded font-mono">
                  VITE_OPENWEATHER_API_KEY=your_api_key
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 border border-blue-200">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-slate-600 text-xs sm:text-sm">Today</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                    {currentWeather.temp}°C
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Low: {currentWeather.low}°C</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                    {currentWeather.condition === 'sunny' && <Sun className="w-10 h-10 sm:w-14 sm:h-14 text-yellow-400" />}
                    {currentWeather.condition === 'cloudy' && <Cloud className="w-10 h-10 sm:w-14 sm:h-14 text-slate-400" />}
                    {currentWeather.condition === 'rainy' && <CloudRain className="w-10 h-10 sm:w-14 sm:h-14 text-blue-400" />}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-2 capitalize">
                    {currentWeather.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 border-t border-blue-200">
                <div className="text-center">
                  <Droplets className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-xs text-slate-600 uppercase tracking-tight">Humidity</p>
                  <p className="text-sm sm:text-lg font-bold text-slate-900 mt-0.5">{currentWeather.humidity}%</p>
                </div>
                <div className="text-center">
                  <Wind className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-xs text-slate-600 uppercase tracking-tight">Wind</p>
                  <p className="text-sm sm:text-lg font-bold text-slate-900 mt-0.5">{currentWeather.windSpeed} km/h</p>
                </div>
                <div className="text-center">
                  <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-xs text-slate-600 uppercase tracking-tight">Rain</p>
                  <p className="text-sm sm:text-lg font-bold text-slate-900 mt-0.5">{currentWeather.rainChance}%</p>
                </div>
              </div>

              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white rounded-lg">
                <p className="text-xs sm:text-sm text-slate-700">
                  <span className="font-semibold">Pressure:</span> {currentWeather.pressure} mb | <span className="font-semibold">Visibility:</span> {currentWeather.visibility} km
                </p>
              </div>
            </div>

            {/* 5-Day Forecast */}
            {forecast && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">5-Day Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {forecast.map((day, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-slate-200 hover:border-primary hover:shadow-md transition-all text-center"
                    >
                      <p className="text-sm font-semibold text-slate-900">{day.day}</p>
                      <div className="flex justify-center my-2">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <p className="text-xs text-slate-600">{day.date}</p>
                      <p className="text-sm font-bold text-slate-900 mt-2">{day.high}°</p>
                      <p className="text-xs text-slate-600">{day.low}°</p>
                      <p className="text-xs text-blue-600 mt-1 flex items-center justify-center gap-1">
                        <Droplets size={12} />
                        {day.rainChance}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weather Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600 uppercase tracking-wide">Wind Direction</p>
                <p className="text-lg font-bold text-slate-900 mt-2">{currentWeather.windDirection}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600 uppercase tracking-wide">Visibility</p>
                <p className="text-lg font-bold text-slate-900 mt-2">{currentWeather.visibility} km</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600 uppercase tracking-wide">Pressure</p>
                <p className="text-lg font-bold text-slate-900 mt-2">{currentWeather.pressure} mb</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-600 uppercase tracking-wide">High</p>
                <p className="text-lg font-bold text-slate-900 mt-2">{currentWeather.high}°C</p>
              </div>
            </div>
          </>
        )}

        {/* API Not Configured Message */}
        {!currentWeather && !isLoading && (
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <AlertCircle size={32} className="mx-auto text-blue-600 mb-3" />
            <p className="font-medium text-blue-900">Real-Time Weather Data Not Configured</p>
            <p className="text-sm text-blue-700 mt-2">
              To enable live weather data from OpenWeatherMap, add your API key to your .env file
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
