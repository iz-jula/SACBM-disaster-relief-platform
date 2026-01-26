import { Cloud, CloudRain, Sun, Wind, Droplets, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface WeatherDay {
  day: string;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy";
  humidity: number;
  windSpeed: number;
}

export default function WeatherForecast() {
  // Sample weather data for Mozambique
  const weatherData: WeatherDay[] = [
    {
      day: "Today",
      high: 28,
      low: 22,
      condition: "rainy",
      humidity: 75,
      windSpeed: 15,
    },
    {
      day: "Tomorrow",
      high: 26,
      low: 20,
      condition: "rainy",
      humidity: 80,
      windSpeed: 18,
    },
    {
      day: "Wed",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 65,
      windSpeed: 12,
    },
    {
      day: "Thu",
      high: 29,
      low: 23,
      condition: "sunny",
      humidity: 55,
      windSpeed: 10,
    },
    {
      day: "Fri",
      high: 30,
      low: 24,
      condition: "sunny",
      humidity: 50,
      windSpeed: 8,
    },
  ];

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun size={32} className="text-yellow-500" />;
      case "cloudy":
        return <Cloud size={32} className="text-slate-400" />;
      case "rainy":
        return <CloudRain size={32} className="text-blue-500" />;
      default:
        return <Sun size={32} className="text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Weather Forecast</h2>
        <p className="text-sm text-slate-600 mt-1">Mozambique Region</p>
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
