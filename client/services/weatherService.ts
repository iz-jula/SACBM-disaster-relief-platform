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

// WMO Weather codes mapping (Open-Meteo)
const weatherCodeMap: Record<number, "sunny" | "cloudy" | "rainy"> = {
  // Clear sky
  0: "sunny",
  // Mainly clear, partly cloudy
  1: "sunny",
  2: "cloudy",
  // Overcast
  3: "cloudy",
  // Fog
  45: "cloudy",
  48: "cloudy",
  // Drizzle/Light Rain
  51: "rainy",
  53: "rainy",
  55: "rainy",
  // Rain
  61: "rainy",
  63: "rainy",
  65: "rainy",
  // Freezing rain
  66: "rainy",
  67: "rainy",
  // Showers
  71: "rainy",
  73: "rainy",
  75: "rainy",
  77: "rainy",
  // Snow
  80: "rainy",
  81: "rainy",
  82: "rainy",
  // Thunderstorm
  85: "rainy",
  86: "rainy",
  95: "rainy",
  96: "rainy",
  99: "rainy",
};

function getWeatherCondition(code: number): "sunny" | "cloudy" | "rainy" {
  return weatherCodeMap[code] || "cloudy";
}

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy with rime",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Unknown";
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

  // Debug logging
  console.log(`[WEATHER] Getting weather for ${city}`, {
    coordsFound: !!coords,
    apiConfig: !!API_CONFIG,
    apiKey: !!API_CONFIG?.openMeteo?.apiKey,
  });

  if (!coords || !API_CONFIG?.openMeteo?.apiKey) {
    const reason = !coords ? "City not found" : "API key not configured";
    console.warn(`[WEATHER] ${reason} for ${city}`);
    return null;
  }

  // Check cache
  const cached = weatherCache.get(city);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_DURATION) {
    console.log(`[WEATHER] Using cached data for ${city}`);
    return cached.data;
  }

  try {
    console.log(`[WEATHER] Fetching fresh weather data for ${city}`);
    // Open-Meteo API format
    const params = new URLSearchParams({
      latitude: coords.lat.toString(),
      longitude: coords.lon.toString(),
      current: 'temperature_2m,weather_code,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      timezone: 'Africa/Johannesburg',
      apikey: API_CONFIG.openMeteo.apiKey,
    });

    const response = await fetch(
      `${API_CONFIG.openMeteo.baseUrl}/v1/forecast?${params}`,
    );

    if (!response.ok) {
      console.error("Open-Meteo API error:", response.statusText);
      return null;
    }

    const data = await response.json();
    const current = data.current;
    const daily = data.daily;

    // Map Open-Meteo weather codes to our conditions
    const condition = getWeatherCondition(current.weather_code);

    const weatherData: WeatherData = {
      temp: Math.round(current.temperature_2m),
      high: Math.round(daily.temperature_2m_max[0]),
      low: Math.round(daily.temperature_2m_min[0]),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: getWindDirection(current.wind_direction_10m || 0),
      condition: condition,
      rainChance: daily.precipitation_probability_max[0],
      visibility: 10, // Open-Meteo doesn't provide visibility in free tier
      pressure: Math.round(current.pressure_msl),
      description: getWeatherDescription(current.weather_code),
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
  if (!coords || !API_CONFIG?.openMeteo?.apiKey) {
    return null;
  }

  // Check cache
  const cached = forecastCache.get(city);
  if (cached && Date.now() - cached.timestamp < FORECAST_CACHE_DURATION) {
    return cached.data;
  }

  try {
    // Open-Meteo API format for 5-day forecast
    const params = new URLSearchParams({
      latitude: coords.lat.toString(),
      longitude: coords.lon.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
      temperature_unit: 'celsius',
      timezone: 'Africa/Johannesburg',
      apikey: API_CONFIG.openMeteo.apiKey,
    });

    const response = await fetch(
      `${API_CONFIG.openMeteo.baseUrl}/v1/forecast?${params}`,
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Convert to ForecastDay array
    const forecastData = data.daily.time
      .slice(0, 5)
      .map((dateStr: string, index: number) => {
        const date = new Date(dateStr);
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName =
          index === 0
            ? "Today"
            : index === 1
              ? "Tomorrow"
              : days[date.getDay()];

        return {
          day: dayName,
          date: dateStr,
          high: Math.round(data.daily.temperature_2m_max[index]),
          low: Math.round(data.daily.temperature_2m_min[index]),
          condition: getWeatherCondition(data.daily.weather_code[index]),
          rainChance: data.daily.precipitation_probability_max[index],
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
  body?: string;
  source: string;
  url?: string;
  publishedAt: string;
  severity: "high" | "medium" | "low";
  author?: string;
  image?: string;
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
    console.log("[ALERTS] Fetching from /api/news/alerts");
    // Call the backend proxy endpoint instead of calling NewsAPI directly
    const response = await fetch("/api/news/alerts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("[ALERTS] Response status:", response.status);

    if (!response.ok) {
      console.warn(`Backend returned status ${response.status}`);
      return [];
    }

    const data = await response.json();
    console.log("[ALERTS] Response data:", data);

    // Handle articles from backend (already converted from EventRegistry events)
    let articles: any[] = [];

    if (data.articles && Array.isArray(data.articles)) {
      articles = data.articles.slice(0, 20);
      console.log(
        "[ALERTS] Received",
        articles.length,
        "articles from backend",
      );
    } else {
      console.log(
        "[ALERTS] No articles in response, data keys:",
        Object.keys(data),
      );
    }

    if (articles.length === 0) {
      console.log("No articles found from backend");
      return [];
    }

    const alerts: NewsAlert[] = articles
      .slice(0, 10)
      .map((article: any, index: number) => {
        const title = article.title || article.name || "Untitled Event";
        const description =
          article.body ||
          article.summary ||
          article.description ||
          article.content ||
          "";
        const fullText = `${title} ${description}`;

        // Get URL - prefer stories' medoidArticle URL first, then article URL
        let url: string | undefined;
        if (
          article.stories &&
          Array.isArray(article.stories) &&
          article.stories.length > 0
        ) {
          const firstStory = article.stories[0];
          if (firstStory.medoidArticle?.url) {
            url = firstStory.medoidArticle.url;
          } else if (firstStory.url) {
            url = firstStory.url;
          }
        }
        // Fallback to article-level URLs
        if (!url) {
          url = article.url || article.uri;
        }
        // Only use URL if it's a valid HTTP(S) URL
        if (url && !url.startsWith("http")) {
          url = undefined;
        }

        return {
          id: `news-${index}-${Date.now()}`,
          title: title,
          description: description,
          source: article.source || article.location?.label || "EventRegistry",
          url: url, // Will be undefined if no valid URL found
          publishedAt:
            article.publishedAt ||
            article.date ||
            article.datePublished ||
            new Date().toISOString(),
          severity: determineSeverity(fullText),
        };
      });

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
    console.error("[ALERTS] Error fetching news alerts from backend:", error);
    if (error instanceof Error) {
      console.error("[ALERTS] Error message:", error.message);
      console.error("[ALERTS] Error stack:", error.stack);
    }
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
