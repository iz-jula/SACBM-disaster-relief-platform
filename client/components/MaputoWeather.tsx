import { useState } from "react";
import { Search, Cloud, CloudRain, Sun, Droplets, Wind, Eye } from "lucide-react";

interface DetailedWeather {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy";
  humidity: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  pressure: number;
  rainChance: number;
  rainTrajectory: string;
  uvIndex: number;
}

const locationData: Record<string, DetailedWeather[]> = {
  Maputo: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 68,
      windSpeed: 13,
      windDirection: "E",
      visibility: 10,
      pressure: 1014,
      rainChance: 35,
      rainTrajectory: "Scattered showers possible",
      uvIndex: 7,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 28,
      low: 22,
      condition: "sunny",
      humidity: 60,
      windSpeed: 11,
      windDirection: "NE",
      visibility: 11,
      pressure: 1016,
      rainChance: 15,
      rainTrajectory: "Clear skies developing",
      uvIndex: 8,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 29,
      low: 23,
      condition: "sunny",
      humidity: 55,
      windSpeed: 10,
      windDirection: "N",
      visibility: 12,
      pressure: 1017,
      rainChance: 5,
      rainTrajectory: "No precipitation",
      uvIndex: 8,
    },
  ],
  Nampula: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 26,
      low: 20,
      condition: "rainy",
      humidity: 75,
      windSpeed: 15,
      windDirection: "SE",
      visibility: 8,
      pressure: 1013,
      rainChance: 60,
      rainTrajectory: "Light to moderate rain expected",
      uvIndex: 6,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 70,
      windSpeed: 12,
      windDirection: "SE",
      visibility: 9,
      pressure: 1015,
      rainChance: 40,
      rainTrajectory: "Scattered showers",
      uvIndex: 7,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 28,
      low: 22,
      condition: "sunny",
      humidity: 65,
      windSpeed: 10,
      windDirection: "NE",
      visibility: 11,
      pressure: 1017,
      rainChance: 10,
      rainTrajectory: "Clear skies",
      uvIndex: 8,
    },
  ],
  Sofala: [
    {
      date: "2024-01-26",
      day: "Today",
      high: 26,
      low: 20,
      condition: "rainy",
      humidity: 80,
      windSpeed: 18,
      windDirection: "SE",
      visibility: 7,
      pressure: 1012,
      rainChance: 80,
      rainTrajectory: "Heavy rainfall expected",
      uvIndex: 5,
    },
    {
      date: "2024-01-27",
      day: "Tomorrow",
      high: 25,
      low: 19,
      condition: "rainy",
      humidity: 78,
      windSpeed: 16,
      windDirection: "SE",
      visibility: 8,
      pressure: 1014,
      rainChance: 70,
      rainTrajectory: "Scattered showers",
      uvIndex: 6,
    },
    {
      date: "2024-01-28",
      day: "Wed",
      high: 27,
      low: 21,
      condition: "cloudy",
      humidity: 72,
      windSpeed: 13,
      windDirection: "NE",
      visibility: 10,
      pressure: 1016,
      rainChance: 30,
      rainTrajectory: "Clearing up",
      uvIndex: 7,
    },
  ],
};

const allCities = Object.keys(locationData);

function getWeatherIcon(condition: string) {
  switch (condition) {
    case "sunny":
      return <Sun className="w-12 h-12 text-yellow-400" />;
    case "cloudy":
      return <Cloud className="w-12 h-12 text-slate-400" />;
    case "rainy":
      return <CloudRain className="w-12 h-12 text-blue-400" />;
    default:
      return <Cloud className="w-12 h-12 text-slate-400" />;
  }
}

export default function MaputoWeather() {
  const [selectedCity, setSelectedCity] = useState("Maputo");
  const [searchInput, setSearchInput] = useState("");
  const weather = locationData[selectedCity] || locationData["Maputo"];

  const filteredCities = allCities.filter((city) =>
    city.toLowerCase().includes(searchInput.toLowerCase())
  );

  const todayWeather = weather[0];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
        <h2 className="text-xl font-bold text-slate-900">Weather Forecast - {selectedCity}</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* City Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by city..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-600 text-sm">Today</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {todayWeather.high}°C
              </p>
              <p className="text-sm text-slate-600 mt-1">Low: {todayWeather.low}°C</p>
            </div>
            <div className="text-right">
              {getWeatherIcon(todayWeather.condition)}
              <p className="text-sm font-semibold text-slate-900 mt-2 capitalize">
                {todayWeather.condition}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200">
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Humidity</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{todayWeather.humidity}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Wind</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{todayWeather.windSpeed} km/h</p>
            </div>
            <div>
              <p className="text-xs text-slate-600 uppercase tracking-wide">Rain</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{todayWeather.rainChance}%</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg">
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CloudRain size={16} className="text-blue-600" />
              {todayWeather.rainTrajectory}
            </p>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">5-Day Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {weather.map((day, index) => (
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

        {/* Weather Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Wind Direction</p>
            <p className="text-lg font-bold text-slate-900 mt-2">{todayWeather.windDirection}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Visibility</p>
            <p className="text-lg font-bold text-slate-900 mt-2">{todayWeather.visibility} km</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 uppercase tracking-wide">Pressure</p>
            <p className="text-lg font-bold text-slate-900 mt-2">{todayWeather.pressure} mb</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-xs text-slate-600 uppercase tracking-wide">UV Index</p>
            <p className="text-lg font-bold text-slate-900 mt-2">{todayWeather.uvIndex}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
