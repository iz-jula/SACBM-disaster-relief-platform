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
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Weather Forecast</h2>
          <p className="text-sm text-slate-600 mt-1">Mozambique Region</p>
        </div>
        <Link
          to="/weather"
          className="inline-flex items-center gap-2 text-primary hover:text-orange-600 font-medium transition-colors"
        >
          View Full Forecast
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Current Weather - Large Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Current Conditions</p>
            <p className="text-4xl font-bold mt-2">28°C</p>
            <p className="text-lg mt-1">Rainy & Warm</p>
          </div>
          <CloudRain size={48} className="opacity-80" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-400">
          <div className="flex items-center gap-2">
            <Droplets size={18} />
            <div>
              <p className="text-xs opacity-75">Humidity</p>
              <p className="font-semibold">75%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={18} />
            <div>
              <p className="text-xs opacity-75">Wind</p>
              <p className="font-semibold">15 km/h</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4 text-sm">5-Day Forecast</h3>
        <div className="grid grid-cols-5 gap-3">
          {weatherData.map((day, index) => (
            <div
              key={index}
              className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200 hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-semibold text-slate-700 mb-3">{day.day}</p>
              <div className="flex justify-center mb-3">
                {getWeatherIcon(day.condition)}
              </div>
              <div className="text-xs mb-3">
                <p className="font-bold text-slate-900">{day.high}°C</p>
                <p className="text-slate-500">{day.low}°C</p>
              </div>
              <div className="space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                <div className="flex items-center justify-center gap-1">
                  <Droplets size={12} />
                  <span>{day.humidity}%</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Wind size={12} />
                  <span>{day.windSpeed}km/h</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Alert */}
      <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-orange-900 mb-1">⚠️ Weather Alert</p>
        <p className="text-sm text-orange-800">
          Heavy rainfall expected in the next 48 hours. Ensure disaster relief operations account for difficult road conditions.
        </p>
      </div>
    </div>
  );
}
