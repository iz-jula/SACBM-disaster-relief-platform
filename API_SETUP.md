# SABCM API Setup Guide

This guide walks you through setting up the required APIs for real-time weather data and Google OAuth integration.

## 1. OpenWeatherMap API (Weather Data)

### Getting Your API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Click "Sign Up" and create a free account
3. Navigate to your API keys section
4. Copy your API key (it may take a few minutes to activate)

### Add to .env

Create a `.env` file in the root directory and add:

```env
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
```

**Free tier includes:**
- Current weather for any location
- 5-day forecast
- Covers Mozambique and all supported cities

### Testing

Once configured, the weather on the Dashboard will automatically update with real-time data from OpenWeatherMap.

---

## 2. Google OAuth Setup (Sign In & Calendar Alerts)

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it "SABCM Disaster Relief" (or your preferred name)
4. Click "Create"

### Step 2: Enable Required APIs

1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Google Calendar API** - for reading alerts
   - **Google Drive API** - for file sync
   - **Google Sheets API** - for spreadsheet integration

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
5. Copy your **Client ID**

### Step 4: Add to .env

Add your Google Client ID to `.env`:

```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### Step 5: Grant Permissions

When users sign in with Google in the app, they will see a permissions dialog:
- Access to Google Drive
- Access to Google Calendar (for alerts)
- Access to Google Sheets (for data sync)

---

## 3. Complete .env Setup

Your complete `.env` file should look like this:

```env
# OpenWeatherMap Configuration
VITE_OPENWEATHER_API_KEY=abc123def456ghi789

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

---

## 4. Features Enabled

### Weather Features (OpenWeatherMap)
- ✅ Real-time temperature for all Mozambique cities
- ✅ 5-day weather forecast
- ✅ Humidity, wind speed, visibility, pressure
- ✅ Rain probability and descriptions
- ✅ Location-based weather search

### Google Integration
- ✅ Sign in with Google Account
- ✅ Google Calendar alerts sync
- ✅ Google Drive file export/import
- ✅ Google Sheets synchronization
- ✅ Google Docs collaboration

---

## 5. Testing Your Setup

### Test Weather API
1. Navigate to the Dashboard
2. Go to "Weather Forecast" section
3. Search for any Mozambique city
4. Verify real-time data displays correctly

### Test Google OAuth
1. Go to Admin Panel
2. Navigate to Settings
3. Click "Sign In with Google Account"
4. Sign in with a test Google account
5. Grant requested permissions
6. Verify Google Calendar events appear as alerts

---

## 6. Troubleshooting

### Weather Not Loading
- Check that `VITE_OPENWEATHER_API_KEY` is set correctly
- Verify the API key is activated (wait a few minutes after creating)
- Check browser console for error messages
- Ensure the city is in our supported list

### Google Sign-In Not Working
- Verify `VITE_GOOGLE_CLIENT_ID` is set
- Check that redirect URIs match your domain
- Ensure Google Calendar API is enabled in Cloud Console
- Check browser console for CORS or authentication errors

### Getting Help
- Google Cloud Console support: https://cloud.google.com/support
- OpenWeatherMap support: https://openweathermap.org/help
- Check your .env file syntax (no quotes around values)

---

## 7. Supported Mozambique Cities

The app supports weather data for these 13+ Mozambican cities:

- Maputo (Southern)
- Nampula (Northern)
- Inhambane (Southern)
- Gaza (Southern)
- Sofala (Central)
- Beira (Central)
- Chimoio (Western)
- Quelimane (Central)
- Tete (Western)
- Lichinga (Northern)
- Nacala (Northern)
- Pemba (Northern)

More cities can be added by updating the `MOZAMBIQUE_CITIES` object in `client/config/api.ts`.
