import { API_CONFIG, MOZAMBIQUE_CITIES } from '@/config/api';

export interface WeatherData {
  temp: number;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: 'sunny' | 'cloudy' | 'rainy';
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
  condition: 'sunny' | 'cloudy' | 'rainy';
  rainChance: number;
}

const weatherCodeMap: Record<number, 'sunny' | 'cloudy' | 'rainy'> = {
  // Clear
  800: 'sunny',
  // Clouds
  801: 'cloudy',
  802: 'cloudy',
  803: 'cloudy',
  804: 'cloudy',
  // Rain
  300: 'rainy',
  301: 'rainy',
  302: 'rainy',
  310: 'rainy',
  311: 'rainy',
  312: 'rainy',
  313: 'rainy',
  314: 'rainy',
  321: 'rainy',
  500: 'rainy',
  501: 'rainy',
  502: 'rainy',
  503: 'rainy',
  504: 'rainy',
  511: 'rainy',
  520: 'rainy',
  521: 'rainy',
  522: 'rainy',
  531: 'rainy',
  // Thunder
  200: 'rainy',
  201: 'rainy',
  202: 'rainy',
  210: 'rainy',
  211: 'rainy',
  212: 'rainy',
  221: 'rainy',
  230: 'rainy',
  231: 'rainy',
  232: 'rainy',
};

function getWeatherCondition(code: number): 'sunny' | 'cloudy' | 'rainy' {
  return weatherCodeMap[code] || 'cloudy';
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export async function getCurrentWeather(city: string): Promise<WeatherData | null> {
  const coords = MOZAMBIQUE_CITIES[city as keyof typeof MOZAMBIQUE_CITIES];
  if (!coords || !API_CONFIG.openWeather.apiKey) {
    console.warn(`City ${city} not found or API key not configured`);
    return null;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.openWeather.baseUrl}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_CONFIG.openWeather.apiKey}&units=metric`
    );

    if (!response.ok) {
      console.error('OpenWeatherMap API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    return {
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
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

export async function getForecast(city: string): Promise<ForecastDay[] | null> {
  const coords = MOZAMBIQUE_CITIES[city as keyof typeof MOZAMBIQUE_CITIES];
  if (!coords || !API_CONFIG.openWeather.apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `${API_CONFIG.openWeather.baseUrl}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_CONFIG.openWeather.apiKey}&units=metric`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const dailyForecasts: Record<string, any> = {};

    // Group forecasts by day
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split('T')[0];

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
    return Object.entries(dailyForecasts)
      .slice(0, 5)
      .map(([_, dayData], index) => {
        const date = new Date(dayData.date);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayName = index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : days[date.getDay()];

        return {
          day: dayName,
          date: dayData.date,
          high: Math.round(Math.max(...dayData.temps)),
          low: Math.round(Math.min(...dayData.temps)),
          condition: getWeatherCondition(dayData.conditions[0]),
          rainChance: Math.round(dayData.rain.reduce((a: number, b: number) => a + b) / dayData.rain.length),
        };
      });
  } catch (error) {
    console.error('Error fetching forecast:', error);
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
  severity: 'high' | 'medium' | 'low';
}

// Fetch news alerts based on keywords relevant to Mozambique
// Using a CORS proxy and RSS feeds as they don't require API keys
export async function getNewsAlerts(): Promise<NewsAlert[]> {
  try {
    const alerts: NewsAlert[] = [];

    // Try multiple RSS feed sources for Mozambique news
    const rssFeedUrls = [
      'https://feeds.bloomberg.com/markets/news.rss', // General news
      'https://www.bbc.com/news/rss.xml', // BBC News
    ];

    const keywords = ['floods', 'mozambique', 'government', 'weather', 'alert', 'emergency'];

    for (const feedUrl of rssFeedUrls) {
      try {
        // Use a CORS proxy to fetch RSS feeds
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
        const response = await fetch(proxyUrl);

        if (response.ok) {
          const data = await response.json();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.contents, 'text/xml');

          const items = xmlDoc.querySelectorAll('item');
          items.forEach((item) => {
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();

            // Only include articles related to our keywords
            const content = (title + ' ' + description).toLowerCase();
            if (keywords.some(kw => content.includes(kw))) {
              const severity = determineSeverity(title + ' ' + description);
              const alertId = `${feedUrl}-${title}`;

              // Avoid duplicates
              if (!alerts.find(a => a.id === alertId)) {
                alerts.push({
                  id: alertId,
                  title: title.substring(0, 100),
                  description: description.substring(0, 200),
                  source: new URL(feedUrl).hostname.replace('feeds.', '').replace('www.', ''),
                  url: link || feedUrl,
                  publishedAt: pubDate,
                  severity,
                });
              }
            }
          });
        }
      } catch (error) {
        console.warn(`Error fetching RSS feed ${feedUrl}:`, error);
      }
    }

    // Sort by severity (high first) and then by recency
    return alerts
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching news alerts:', error);
    return [];
  }
}

function determineSeverity(text: string): 'high' | 'medium' | 'low' {
  const highSeverityKeywords = ['flood', 'emergency', 'disaster', 'critical', 'danger', 'alert', 'warning severe'];
  const mediumSeverityKeywords = ['weather', 'warning', 'risk', 'event', 'mozambique government'];

  const lowerText = text.toLowerCase();

  if (highSeverityKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'high';
  } else if (mediumSeverityKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'medium';
  }

  return 'low';
}
