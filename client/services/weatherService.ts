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
  if (!coords || !API_CONFIG.openMeteo.apiKey) {
    console.warn(`City ${city} not found or API key not configured`);
    return null;
  }

  // Check cache
  const cached = weatherCache.get(city);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_DURATION) {
    return cached.data;
  }

  try {
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
