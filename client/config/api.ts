// API Configuration
// Add these environment variables to your .env file:
// VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
// VITE_OPENMETEO_API_KEY=your_openmeteo_api_key
// VITE_NEWSAPI_KEY=your_newsapi_key

export const API_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
    scopes: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  },
  openMeteo: {
    apiKey: import.meta.env.VITE_OPENMETEO_API_KEY || "",
    baseUrl: "https://customer-api.open-meteo.com",
  },
  newsApi: {
    apiKey: import.meta.env.VITE_NEWSAPI_KEY || "",
    baseUrl: "https://api.newsapi.ai/v1",
  },
};

// Mozambique cities with coordinates for weather API
export const MOZAMBIQUE_CITIES = {
  Maputo: { lat: -23.8645, lon: 35.3318 },
  Nampula: { lat: -15.1167, lon: 39.2667 },
  Inhambane: { lat: -23.8616, lon: 35.3845 },
  Gaza: { lat: -22.4167, lon: 35.2833 },
  Sofala: { lat: -18.6667, lon: 34.7333 },
  Beira: { lat: -19.8333, lon: 34.5333 },
  Chimoio: { lat: -19.8161, lon: 33.2915 },
  Quelimane: { lat: -18.8789, lon: 36.8867 },
  Tete: { lat: -16.1667, lon: 33.5833 },
  Lichinga: { lat: -13.3167, lon: 35.2667 },
  Nacala: { lat: -14.5403, lon: 40.6347 },
  Pemba: { lat: -12.9833, lon: 40.5167 },
  // Add more cities as needed
};
