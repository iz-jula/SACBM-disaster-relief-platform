# Supabase Events Migration Guide

## Overview

The events management system has been migrated from localStorage to Supabase. This includes:
- Event CRUD operations (Create, Read, Update, Delete)
- Image upload functionality (main event images and gallery images)
- Help needs management (stored as JSONB array)
- Gallery management (stored as JSONB array of image URLs)

## Database Schema

### Events Table

Create a new table in Supabase called `events` with the following schema:

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  attendees INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  help_needs JSONB DEFAULT '[]'::jsonb,
  contact_message TEXT,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Storage Buckets

Create two storage buckets in Supabase:

1. **events-images** (public):
   - Main folder for storing event images
   - Sub-paths:
     - `main/` - Event main images
     - `gallery/` - Event gallery images

## API Functions

### Async Functions

All event functions are now **async** and return promises:

#### Reading Events
```typescript
// Get all events
const events = await getAllEvents(): Promise<Event[]>

// Get single event by ID
const event = await getEventById(id: string): Promise<Event | null>

// Get featured events only
const featured = await getFeaturedEvents(): Promise<Event[]>

// Get events by category
const category = await getEventsByCategory(category: string): Promise<Event[]>

// Get all categories
const categories = await getCategories(): Promise<string[]>
```

#### Creating/Updating Events
```typescript
// Create new event
const newEvent = await createEvent(event: Omit<Event, "id">): Promise<Event | null>

// Update existing event
const updated = await updateEvent(id: string, updates: Partial<Event>): Promise<Event | null>

// Delete event
const success = await deleteEvent(id: string): Promise<boolean>
```

#### Image Upload
```typescript
// Upload main event image
const imageUrl = await uploadEventImage(file: File, eventId: string): Promise<string | null>

// Upload gallery image
const imageUrl = await uploadGalleryImage(file: File, eventId: string): Promise<string | null>

// Delete image from storage
const success = await deleteEventImage(imagePath: string): Promise<boolean>

// Delete gallery image from storage
const success = await deleteGalleryImage(imagePath: string): Promise<boolean>
```

## Event Interface

```typescript
export interface Event {
  id: string;                    // UUID from database
  title: string;
  date: string;                  // e.g., "March 15, 2024"
  time: string;                  // e.g., "8:00 AM - 2:00 PM"
  location: string;
  description: string;
  category: string;
  attendees?: number;
  featured?: boolean;
  helpNeeds?: HelpNeed[];        // Converted from help_needs JSONB
  contactMessage?: string;       // Converted from contact_message
  image_url?: string;            // URL from storage (renamed from image)
  gallery?: string[];            // Array of image URLs from gallery JSONB
}

export interface HelpNeed {
  name: string;
  quantity?: number;
  unit?: string;
}
```

## Usage Examples

### In React Components

```typescript
import { getAllEvents, createEvent, updateEvent, deleteEvent, uploadEventImage } from "@/services/eventsService";

// Load events on component mount
useEffect(() => {
  const loadEvents = async () => {
    const events = await getAllEvents();
    setEvents(events);
  };
  loadEvents();
}, []);

// Create new event with image upload
const handleSaveEvent = async () => {
  let imageUrl = null;
  
  if (imageFile) {
    imageUrl = await uploadEventImage(imageFile, "new");
  }
  
  const newEvent = await createEvent({
    ...eventData,
    image_url: imageUrl,
  });
};

// Update event
const handleUpdateEvent = async (id: string) => {
  const updated = await updateEvent(id, {
    title: "Updated Title",
    featured: true,
  });
};

// Delete event
const handleDeleteEvent = async (id: string) => {
  const success = await deleteEvent(id);
};
```

## Migration Steps (If Migrating Existing Data)

If you have existing events in localStorage and want to migrate them to Supabase:

1. Backup your current events data
2. Create the `events` table in Supabase following the schema above
3. Insert existing events into the table, mapping fields:
   - `image` -> `image_url`
   - `helpNeeds` -> `help_needs`
   - `contactMessage` -> `contact_message`

## Breaking Changes

1. **All functions are now async**: You must use `await` or `.then()` when calling event functions
2. **Image field renamed**: `event.image` is now `event.image_url`
3. **LocalStorage no longer used**: All data comes from Supabase
4. **MOCK_EVENTS removed**: No fallback to mock data; empty array returned if Supabase is unavailable

## Error Handling

All functions return `null` or `false` on error and log errors to console:

```typescript
const event = await getEventById("non-existent-id");
if (!event) {
  console.log("Event not found");
}

const deleted = await deleteEvent("some-id");
if (!deleted) {
  console.log("Failed to delete event");
}
```

## Environment Setup

Ensure these environment variables are set in your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The Supabase client is imported from `@/services/supabaseService.ts`.
