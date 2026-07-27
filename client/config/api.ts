// API Configuration
// Add these environment variables to your .env file:
// VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
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
  newsApi: {
    apiKey: import.meta.env.VITE_NEWSAPI_KEY || "",
    baseUrl: "https://api.newsapi.ai/v1",
  },
};
