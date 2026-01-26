import { API_CONFIG } from '@/config/api';

declare global {
  interface Window {
    google: any;
  }
}

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

export interface GoogleAlert {
  id: string;
  title: string;
  location: string;
  description: string;
  start: string;
  end: string;
  severity: 'high' | 'medium' | 'low';
}

// Initialize Google API
export function initializeGoogleAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!API_CONFIG.google.clientId) {
        console.warn('Google Client ID not configured');
      }
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google API'));
    };

    document.head.appendChild(script);
  });
}

// Sign in with Google using Google Identity Services
export async function signInWithGoogle(): Promise<GoogleUser | null> {
  try {
    // Load the Google API script if not already loaded
    if (!window.google) {
      await initializeGoogleAPI();
    }

    if (!window.google || !API_CONFIG.google.clientId) {
      console.error('Google API not initialized or Client ID not configured');
      return null;
    }

    return new Promise((resolve) => {
      let resolved = false;
      let buttonClicked = false;

      // Initialize the Google Sign-In
      window.google.accounts.id.initialize({
        client_id: API_CONFIG.google.clientId,
        callback: (response: any) => {
          if (!resolved && response.credential) {
            resolved = true;
            const decoded = parseJwt(response.credential);
            const user: GoogleUser = {
              email: decoded.email,
              name: decoded.name,
              picture: decoded.picture,
              accessToken: response.credential, // This is the ID token
            };
            // Clean up containers
            const containers = document.querySelectorAll('[id^="google-"]');
            containers.forEach(c => c.remove());
            resolve(user);
          }
        },
      });

      // Create a hidden container for the sign-in button
      const buttonContainer = document.createElement('div');
      buttonContainer.id = 'google-signin-button-container';
      buttonContainer.style.display = 'none';
      document.body.appendChild(buttonContainer);

      // Render the button (it will trigger the callback when clicked)
      try {
        window.google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        });

        // Find and click the button to start authentication
        setTimeout(() => {
          const button = buttonContainer.querySelector('button');
          if (button && !buttonClicked) {
            buttonClicked = true;
            button.click();
          }
        }, 100);
      } catch (e) {
        console.error('Error rendering Google button:', e);
        resolve(null);
      }
    });
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
}

// Fetch Google Calendar events (alerts)
export async function getGoogleCalendarAlerts(accessToken: string): Promise<GoogleAlert[]> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=' +
        new Date().toISOString(),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch Google Calendar events');
      return [];
    }

    const data = await response.json();

    return data.items
      .filter((event: any) => event.start && event.end)
      .map((event: any) => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        location: event.location || 'No location',
        description: event.description || '',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        severity: determineSeverity(event.summary, event.description),
      }));
  } catch (error) {
    console.error('Error fetching Google Calendar alerts:', error);
    return [];
  }
}

// Helper function to determine alert severity based on title/description
function determineSeverity(title: string, description: string): 'high' | 'medium' | 'low' {
  const combined = `${title} ${description}`.toLowerCase();

  if (
    combined.includes('urgent') ||
    combined.includes('critical') ||
    combined.includes('emergency') ||
    combined.includes('alert')
  ) {
    return 'high';
  }

  if (
    combined.includes('warning') ||
    combined.includes('caution') ||
    combined.includes('attention')
  ) {
    return 'medium';
  }

  return 'low';
}

// Parse JWT token
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

// Sign out from Google
export function signOutGoogle() {
  if (window.google) {
    window.google.accounts.id.disableAutoSelect();
  }
}

// Store user in localStorage
export function saveGoogleUser(user: GoogleUser) {
  localStorage.setItem('googleUser', JSON.stringify(user));
}

// Load user from localStorage
export function getStoredGoogleUser(): GoogleUser | null {
  const stored = localStorage.getItem('googleUser');
  return stored ? JSON.parse(stored) : null;
}

// Clear stored user
export function clearStoredGoogleUser() {
  localStorage.removeItem('googleUser');
}
