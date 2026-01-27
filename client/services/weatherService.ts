import { API_CONFIG, MOZAMBIQUE_CITIES } from "@/config/api";

export interface WeatherData {
  temp: number;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: "sunny" | "cloudy" | "rainy";
  rainChance: number;
  visibility: number;
  pressure: number;
  description: string;
}

export interface ForecastDay {
  day: string;
  date: string;
  high: number;
  low: number;
  condition: "sunny" | "cloudy" | "rainy";
  rainChance: number;
}

const weatherCodeMap: Record<number, "sunny" | "cloudy" | "rainy"> = {
  // Clear
  800: "sunny",
  // Clouds
  801: "cloudy",
  802: "cloudy",
  803: "cloudy",
  804: "cloudy",
  // Rain
  300: "rainy",
  301: "rainy",
  302: "rainy",
  310: "rainy",
  311: "rainy",
  312: "rainy",
  313: "rainy",
  314: "rainy",
  321: "rainy",
  500: "rainy",
  501: "rainy",
  502: "rainy",
  503: "rainy",
  504: "rainy",
  511: "rainy",
  520: "rainy",
  521: "rainy",
  522: "rainy",
  531: "rainy",
  // Thunder
  200: "rainy",
  201: "rainy",
  202: "rainy",
  210: "rainy",
  211: "rainy",
  212: "rainy",
  221: "rainy",
  230: "rainy",
  231: "rainy",
  232: "rainy",
};

function getWeatherCondition(code: number): "sunny" | "cloudy" | "rainy" {
  return weatherCodeMap[code] || "cloudy";
}

function getWindDirection(degrees: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Weather cache to minimize API calls (OpenWeatherMap has 1000 requests/day limit)
const weatherCache = new Map<
  string,
  { data: WeatherData | null; timestamp: number }
>();
const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getCurrentWeather(
  city: string,
): Promise<WeatherData | null> {
  const coords = MOZAMBIQUE_CITIES[city as keyof typeof MOZAMBIQUE_CITIES];
  if (!coords || !API_CONFIG.openWeather.apiKey) {
    console.warn(`City ${city} not found or API key not configured`);
    return null;
  }

  // Check cache
  const cached = weatherCache.get(city);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.openWeather.baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_CONFIG.openWeather.apiKey}&units=metric`,
    );

    if (!response.ok) {
      console.error("OpenWeatherMap API error:", response.statusText);
      return null;
    }

    const data = await response.json();

    const weatherData: WeatherData = {
      temp: Math.round(data.main.temp),
      high: Math.round(data.main.temp_max),
      low: Math.round(data.main.temp_min),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: getWindDirection(data.wind.deg || 0),
      condition: getWeatherCondition(data.weather[0].id),
      rainChance: data.clouds.all,
      visibility: Math.round(data.visibility / 1000), // Convert to km
      pressure: data.main.pressure,
      description: data.weather[0].description,
    };

    // Cache the result in both caches
    const now = Date.now();
    weatherCache.set(city, { data: weatherData, timestamp: now });
    weatherCache2.set(city, { data: weatherData, timestamp: now });

    return weatherData;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

// Forecast cache
const forecastCache = new Map<
  string,
  { data: ForecastDay[] | null; timestamp: number }
>();
const FORECAST_CACHE_DURATION = 60 * 60 * 1000; // 60 minutes

export async function getForecast(city: string): Promise<ForecastDay[] | null> {
  const coords = MOZAMBIQUE_CITIES[city as keyof typeof MOZAMBIQUE_CITIES];
  if (!coords || !API_CONFIG.openWeather.apiKey) {
    return null;
  }

  // Check cache
  const cached = forecastCache.get(city);
  if (cached && Date.now() - cached.timestamp < FORECAST_CACHE_DURATION) {
    return cached.data;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.openWeather.baseUrl}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_CONFIG.openWeather.apiKey}&units=metric`,
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const dailyForecasts: Record<string, any> = {};

    // Group forecasts by day
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split("T")[0];

      if (!dailyForecasts[dayKey]) {
        dailyForecasts[dayKey] = {
          temps: [],
          conditions: [],
          rain: [],
          date: dayKey,
        };
      }

      dailyForecasts[dayKey].temps.push(item.main.temp);
      dailyForecasts[dayKey].conditions.push(item.weather[0].id);
      dailyForecasts[dayKey].rain.push(item.clouds.all);
    });

    // Convert to ForecastDay array
    const forecastData = Object.entries(dailyForecasts)
      .slice(0, 5)
      .map(([_, dayData], index) => {
        const date = new Date(dayData.date);
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName =
          index === 0
            ? "Today"
            : index === 1
              ? "Tomorrow"
              : days[date.getDay()];

        return {
          day: dayName,
          date: dayData.date,
          high: Math.round(Math.max(...dayData.temps)),
          low: Math.round(Math.min(...dayData.temps)),
          condition: getWeatherCondition(dayData.conditions[0]),
          rainChance: Math.round(
            dayData.rain.reduce((a: number, b: number) => a + b) /
              dayData.rain.length,
          ),
        };
      });

    // Cache the result in both caches
    const now = Date.now();
    forecastCache.set(city, { data: forecastData, timestamp: now });
    weatherCache2.set(city, { data: forecastData, timestamp: now });

    return forecastData;
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return null;
  }
}

export interface NewsAlert {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  severity: "high" | "medium" | "low";
}

// Cache for news alerts and weather data to minimize API calls
interface CacheEntry {
  data: NewsAlert[];
  timestamp: number;
}

const newsAlertsCache: CacheEntry = {
  data: [],
  timestamp: 0,
};

const weatherCache2 = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Get the last time news alerts were updated
export function getNewsAlertsLastUpdate(): Date | null {
  if (newsAlertsCache.timestamp === 0) {
    return null;
  }
  return new Date(newsAlertsCache.timestamp);
}

// Get the last time weather was updated for a city
export function getWeatherLastUpdate(city: string): Date | null {
  const cached = weatherCache2.get(city);
  if (!cached || cached.timestamp === 0) {
    return null;
  }
  return new Date(cached.timestamp);
}

// Fetch news alerts from backend proxy
// The backend calls NewsAPI.ai to bypass CORS restrictions
export async function getNewsAlerts(): Promise<NewsAlert[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (
    newsAlertsCache.data.length > 0 &&
    now - newsAlertsCache.timestamp < CACHE_DURATION
  ) {
    return newsAlertsCache.data;
  }

  try {
    // Call the backend proxy endpoint instead of calling NewsAPI directly
    const response = await fetch("/api/news/alerts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`Backend returned status ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Handle both EventRegistry format (events with nested articles) and flat articles format
    let articles: any[] = [];

    if (data.events && Array.isArray(data.events)) {
      // EventRegistry format: flatten events' articles into a single array
      articles = data.events
        .flatMap((event: any) => event.articles || [])
        .slice(0, 20);
      console.log("Parsed EventRegistry format:", articles.length, "articles from events");
    } else if (data.articles && Array.isArray(data.articles)) {
      // Flat articles format
      articles = data.articles.slice(0, 20);
      console.log("Parsed flat articles format:", articles.length, "articles");
    }

    if (articles.length === 0) {
      console.log("No articles found from backend");
      return [];
    }

    const alerts: NewsAlert[] = articles
      .slice(0, 10)
      .map((article: any, index: number) => ({
        id: `news-${index}-${Date.now()}`,
        title: article.title || article.name || "Untitled",
        description:
          article.body ||
          article.summary ||
          article.description ||
          article.content ||
          "",
        source: article.source?.title || article.source?.name || article.source || "Unknown Source",
        url: article.url || article.uri || "#",
        publishedAt:
          article.datePublished ||
          article.publishedAt ||
          article.date ||
          new Date().toISOString(),
        severity: determineSeverity(
          (article.title || article.name || "") +
            " " +
            (article.body ||
              article.summary ||
              article.description ||
              article.content ||
              ""),
        ),
      }));

    // Sort by severity (high first) and then by recency
    const sortedAlerts = alerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    });

    // Update cache
    newsAlertsCache.data = sortedAlerts;
    newsAlertsCache.timestamp = now;

    console.log(
      `Fetched ${sortedAlerts.length} news alerts from backend proxy`,
    );
    return sortedAlerts;
  } catch (error) {
    console.error("Error fetching news alerts from backend:", error);
    // Return empty array to trigger fallback alerts if there's an error
    return [];
  }
}

function determineSeverity(text: string): "high" | "medium" | "low" {
  const highSeverityKeywords = [
    "flood",
    "emergency",
    "disaster",
    "critical",
    "danger",
    "severe",
    "warning",
  ];
  const mediumSeverityKeywords = [
    "weather",
    "alert",
    "risk",
    "event",
    "government",
  ];

  const lowerText = text.toLowerCase();

  if (highSeverityKeywords.some((keyword) => lowerText.includes(keyword))) {
    return "high";
  } else if (
    mediumSeverityKeywords.some((keyword) => lowerText.includes(keyword))
  ) {
    return "medium";
  }

  return "low";
}
