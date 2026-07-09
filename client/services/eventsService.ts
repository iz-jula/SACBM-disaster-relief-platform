// Events service for managing events with localStorage persistence
// This service handles CRUD operations for events and help needs

export interface HelpNeed {
  name: string;
  quantity?: number;
  unit?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  attendees?: number;
  featured?: boolean;
  helpNeeds?: HelpNeed[];
  contactMessage?: string;
  image?: string;
  gallery?: string[];
}

const EVENTS_STORAGE_KEY = "sacbm_events";

// Mock data to initialize with if localStorage is empty
const MOCK_EVENTS: Event[] = [
  {
    id: "1",
    title: "Community Health Drive",
    date: "March 15, 2024",
    time: "8:00 AM - 2:00 PM",
    location: "Central Health Center, Maputo",
    description: "Free medical checkups and health awareness program in partnership with local clinics. All community members welcome.",
    category: "Health & Wellness",
    attendees: 250,
    featured: true,
    image: "https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F3a1a4e655da0467388df0f18259e3a68?format=webp&width=400&height=400",
    gallery: [
      "https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F3a1a4e655da0467388df0f18259e3a68?format=webp&width=400&height=400",
    ],
    helpNeeds: [
      { name: "Hospital beds", quantity: 5, unit: "units" },
      { name: "Medical supplies", quantity: 100, unit: "kits" },
      { name: "Medications", quantity: 50, unit: "boxes" },
      { name: "First aid kits", quantity: 20, unit: "kits" },
    ],
    contactMessage: "To contribute, please contact Dr. Maria Silva at maria.silva@chs.org.mz or call +258 84 123 4567",
  },
  {
    id: "2",
    title: "Disaster Relief Training",
    date: "March 22, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "Chamber Building, Maputo",
    description: "Comprehensive training for rapid response teams in emergency situations. Professional certification provided.",
    category: "Training",
    attendees: 100,
    featured: true,
    helpNeeds: [
      { name: "Emergency shelter materials", quantity: 30, unit: "tents" },
      { name: "Food supplies", quantity: 200, unit: "meals" },
      { name: "Water containers", quantity: 50, unit: "units" },
      { name: "First responder equipment", quantity: 15, unit: "sets" },
    ],
    contactMessage: "For donations, contact João Mascarenhas at j.mascarenhas@sacbm.org.mz or +258 82 765 4321",
  },
  {
    id: "3",
    title: "Environmental Cleanup Initiative",
    date: "April 5, 2024",
    time: "7:00 AM - 12:00 PM",
    location: "Coastal Areas, Gaza Province",
    description: "Join member organizations in community environmental conservation and cleanup projects.",
    category: "Environment",
    attendees: 180,
    helpNeeds: [
      { name: "Cleaning supplies", quantity: 500, unit: "liters" },
      { name: "Waste disposal equipment", quantity: 10, unit: "units" },
      { name: "Protective gear", quantity: 200, unit: "sets" },
      { name: "Transportation", quantity: 5, unit: "vehicles" },
    ],
    contactMessage: "Please reach out to the SACBM environmental team at environment@sacbm.org.mz",
  },
  {
    id: "4",
    title: "CSR Leadership Summit",
    date: "April 12, 2024",
    time: "2:00 PM - 6:00 PM",
    location: "Polana Hotel, Maputo",
    description: "Strategic dialogue on corporate social responsibility initiatives and impact measurement.",
    category: "Leadership",
    attendees: 75,
    helpNeeds: [
      { name: "Refreshments", quantity: 75, unit: "portions" },
      { name: "Conference materials", quantity: 75, unit: "sets" },
      { name: "Technology support", quantity: 3, unit: "teams" },
      { name: "Venue resources", quantity: 1, unit: "complete" },
    ],
    contactMessage: "To support this summit, contact events@sacbm.org.mz or call +258 84 999 8888",
  },
  {
    id: "5",
    title: "School Supplies Distribution",
    date: "April 20, 2024",
    time: "10:00 AM - 3:00 PM",
    location: "Multiple Schools, Sofala Province",
    description: "Distribution of educational materials and supplies to underprivileged schools.",
    category: "Education",
    attendees: 200,
    helpNeeds: [
      { name: "School supplies", quantity: 500, unit: "sets" },
      { name: "Textbooks", quantity: 300, unit: "units" },
      { name: "Learning materials", quantity: 1000, unit: "items" },
      { name: "Stationery", quantity: 50, unit: "boxes" },
    ],
    contactMessage: "For educational donations, contact education@sacbm.org.mz",
  },
  {
    id: "6",
    title: "Women Empowerment Workshop",
    date: "May 1, 2024",
    time: "9:00 AM - 4:00 PM",
    location: "Chamber Building, Maputo",
    description: "Skills development and business training for women entrepreneurs and community leaders.",
    category: "Empowerment",
    attendees: 120,
    helpNeeds: [
      { name: "Training materials", quantity: 120, unit: "sets" },
      { name: "Refreshments", quantity: 120, unit: "meals" },
      { name: "Business resources", quantity: 80, unit: "guides" },
      { name: "Mentorship support", quantity: 30, unit: "mentors" },
    ],
    contactMessage: "To participate as a mentor or sponsor, reach out to women@sacbm.org.mz",
  },
];

/**
 * Initialize localStorage with mock data if empty
 */
function initializeStorage(): void {
  if (!localStorage.getItem(EVENTS_STORAGE_KEY)) {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(MOCK_EVENTS));
  }
}

/**
 * Get all events
 */
export function getAllEvents(): Event[] {
  initializeStorage();
  const data = localStorage.getItem(EVENTS_STORAGE_KEY);
  return data ? JSON.parse(data) : MOCK_EVENTS;
}

/**
 * Get event by ID
 */
export function getEventById(id: string): Event | null {
  const events = getAllEvents();
  return events.find((e) => e.id === id) || null;
}

/**
 * Create new event
 */
export function createEvent(event: Omit<Event, "id">): Event {
  const events = getAllEvents();
  const newEvent: Event = {
    ...event,
    id: Date.now().toString(),
  };
  events.push(newEvent);
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  return newEvent;
}

/**
 * Update event
 */
export function updateEvent(id: string, updates: Partial<Event>): Event | null {
  const events = getAllEvents();
  const index = events.findIndex((e) => e.id === id);
  
  if (index === -1) {
    return null;
  }

  events[index] = {
    ...events[index],
    ...updates,
    id: events[index].id, // Ensure ID doesn't change
  };

  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  return events[index];
}

/**
 * Delete event
 */
export function deleteEvent(id: string): boolean {
  const events = getAllEvents();
  const filteredEvents = events.filter((e) => e.id !== id);
  
  if (filteredEvents.length === events.length) {
    return false; // Event not found
  }

  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(filteredEvents));
  return true;
}

/**
 * Add help need to event
 */
export function addHelpNeedToEvent(eventId: string, helpNeed: HelpNeed): Event | null {
  const events = getAllEvents();
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return null;
  }

  if (!event.helpNeeds) {
    event.helpNeeds = [];
  }

  event.helpNeeds.push(helpNeed);
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  return event;
}

/**
 * Update help need in event
 */
export function updateHelpNeedInEvent(
  eventId: string,
  helpNeedIndex: number,
  helpNeed: HelpNeed,
): Event | null {
  const events = getAllEvents();
  const event = events.find((e) => e.id === eventId);

  if (!event || !event.helpNeeds || helpNeedIndex < 0 || helpNeedIndex >= event.helpNeeds.length) {
    return null;
  }

  event.helpNeeds[helpNeedIndex] = helpNeed;
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  return event;
}

/**
 * Delete help need from event
 */
export function deleteHelpNeedFromEvent(eventId: string, helpNeedIndex: number): Event | null {
  const events = getAllEvents();
  const event = events.find((e) => e.id === eventId);

  if (!event || !event.helpNeeds || helpNeedIndex < 0 || helpNeedIndex >= event.helpNeeds.length) {
    return null;
  }

  event.helpNeeds.splice(helpNeedIndex, 1);
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  return event;
}

/**
 * Get featured events only
 */
export function getFeaturedEvents(): Event[] {
  const events = getAllEvents();
  return events.filter((e) => e.featured);
}

/**
 * Get events by category
 */
export function getEventsByCategory(category: string): Event[] {
  const events = getAllEvents();
  return events.filter((e) => e.category === category);
}

/**
 * Get list of all categories
 */
export function getCategories(): string[] {
  const events = getAllEvents();
  const categories = new Set(events.map((e) => e.category));
  return Array.from(categories).sort();
}
