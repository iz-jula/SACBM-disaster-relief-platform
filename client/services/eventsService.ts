import { supabase } from "./supabaseService";

export interface HelpNeed {
  name: string;
  quantity?: number;
  unit?: string;
}

export interface Attachment {
  name: string;
  url: string;
  size?: number;
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
  image_url?: string;
  gallery?: string[];
  attachments?: Attachment[];
}

/**
 * Get all events from Supabase
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      time: row.time,
      location: row.location,
      description: row.description,
      category: row.category,
      attendees: row.attendees,
      featured: row.featured,
      helpNeeds: row.help_needs || [],
      contactMessage: row.contact_message,
      image_url: row.image_url,
      gallery: row.gallery || [],
      attachments: row.attachments || [],
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

/**
 * Get event by ID from Supabase
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      date: data.date,
      time: data.time,
      location: data.location,
      description: data.description,
      category: data.category,
      attendees: data.attendees,
      featured: data.featured,
      helpNeeds: data.help_needs || [],
      contactMessage: data.contact_message,
      image_url: data.image_url,
      gallery: data.gallery || [],
      attachments: data.attachments || [],
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

/**
 * Create new event in Supabase
 */
export async function createEvent(
  event: Omit<Event, "id">
): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          description: event.description,
          category: event.category,
          attendees: event.attendees || 0,
          featured: event.featured || false,
          help_needs: event.helpNeeds || [],
          contact_message: event.contactMessage || "",
          image_url: event.image_url || "",
          gallery: event.gallery || [],
          attachments: event.attachments || [],
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      date: data.date,
      time: data.time,
      location: data.location,
      description: data.description,
      category: data.category,
      attendees: data.attendees,
      featured: data.featured,
      helpNeeds: data.help_needs || [],
      contactMessage: data.contact_message,
      image_url: data.image_url,
      gallery: data.gallery || [],
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return null;
  }
}

/**
 * Update event in Supabase
 */
export async function updateEvent(
  id: string,
  updates: Partial<Event>
): Promise<Event | null> {
  try {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.time !== undefined) updateData.time = updates.time;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.attendees !== undefined) updateData.attendees = updates.attendees;
    if (updates.featured !== undefined) updateData.featured = updates.featured;
    if (updates.helpNeeds !== undefined)
      updateData.help_needs = updates.helpNeeds;
    if (updates.contactMessage !== undefined)
      updateData.contact_message = updates.contactMessage;
    if (updates.image_url !== undefined)
      updateData.image_url = updates.image_url;
    if (updates.gallery !== undefined) updateData.gallery = updates.gallery;
    if (updates.attachments !== undefined)
      updateData.attachments = updates.attachments;

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating event:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      date: data.date,
      time: data.time,
      location: data.location,
      description: data.description,
      category: data.category,
      attendees: data.attendees,
      featured: data.featured,
      helpNeeds: data.help_needs || [],
      contactMessage: data.contact_message,
      image_url: data.image_url,
      gallery: data.gallery || [],
      attachments: data.attachments || [],
    };
  } catch (error) {
    console.error("Error updating event:", error);
    return null;
  }
}

/**
 * Delete event from Supabase
 */
export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
}

/**
 * Upload main event image to Supabase Storage
 */
export async function uploadEventImage(
  file: File,
  eventId: string
): Promise<string | null> {
  try {
    const fileName = `${eventId}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("events-images")
      .upload(`main/${fileName}`, file);

    if (error) {
      console.error("Error uploading event image:", error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("events-images").getPublicUrl(`main/${fileName}`);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading event image:", error);
    return null;
  }
}

/**
 * Delete event image from Supabase Storage
 */
export async function deleteEventImage(imagePath: string): Promise<boolean> {
  try {
    if (!imagePath) return false;

    // Extract the path from the full URL if needed
    const path = imagePath.includes("events-images/")
      ? imagePath.split("events-images/")[1]
      : imagePath;

    const { error } = await supabase.storage
      .from("events-images")
      .remove([path]);

    if (error) {
      console.error("Error deleting event image:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting event image:", error);
    return false;
  }
}

/**
 * Upload gallery image to Supabase Storage
 */
export async function uploadGalleryImage(
  file: File,
  eventId: string
): Promise<string | null> {
  try {
    const fileName = `${eventId}-gallery-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("events-images")
      .upload(`gallery/${fileName}`, file);

    if (error) {
      console.error("Error uploading gallery image:", error);
      return null;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("events-images")
      .getPublicUrl(`gallery/${fileName}`);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    return null;
  }
}

/**
 * Delete gallery image from Supabase Storage
 */
export async function deleteGalleryImage(imagePath: string): Promise<boolean> {
  try {
    if (!imagePath) return false;

    // Extract the path from the full URL if needed
    const path = imagePath.includes("events-images/")
      ? imagePath.split("events-images/")[1]
      : imagePath;

    const { error } = await supabase.storage
      .from("events-images")
      .remove([path]);

    if (error) {
      console.error("Error deleting gallery image:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return false;
  }
}

/**
 * Get featured events only
 */
export async function getFeaturedEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("featured", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching featured events:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      time: row.time,
      location: row.location,
      description: row.description,
      category: row.category,
      attendees: row.attendees,
      featured: row.featured,
      helpNeeds: row.help_needs || [],
      contactMessage: row.contact_message,
      image_url: row.image_url,
      gallery: row.gallery || [],
      attachments: row.attachments || [],
    }));
  } catch (error) {
    console.error("Error fetching featured events:", error);
    return [];
  }
}

/**
 * Get events by category
 */
export async function getEventsByCategory(category: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events by category:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      date: row.date,
      time: row.time,
      location: row.location,
      description: row.description,
      category: row.category,
      attendees: row.attendees,
      featured: row.featured,
      helpNeeds: row.help_needs || [],
      contactMessage: row.contact_message,
      image_url: row.image_url,
      gallery: row.gallery || [],
      attachments: row.attachments || [],
    }));
  } catch (error) {
    console.error("Error fetching events by category:", error);
    return [];
  }
}

/**
 * Get list of all categories
 */
export async function getCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("category")
      .order("category", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }

    const categories = new Set((data || []).map((row: any) => row.category));
    return Array.from(categories).filter((cat) => cat) as string[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Upload attachment (PDF or document) to Supabase Storage
 */
export async function uploadAttachment(
  file: File,
  eventId: string
): Promise<{ name: string; url: string } | null> {
  try {
    const fileName = `${eventId}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("events-images")
      .upload(`attachments/${fileName}`, file);

    if (error) {
      console.error("Error uploading attachment:", error);
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("events-images")
      .getPublicUrl(`attachments/${fileName}`);

    return {
      name: file.name,
      url: publicUrl,
    };
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return null;
  }
}

/**
 * Delete attachment from Supabase Storage
 */
export async function deleteAttachment(attachmentUrl: string): Promise<boolean> {
  try {
    if (!attachmentUrl) return false;

    const path = attachmentUrl.includes("events-images/")
      ? attachmentUrl.split("events-images/")[1]
      : attachmentUrl;

    const { error } = await supabase.storage
      .from("events-images")
      .remove([path]);

    if (error) {
      console.error("Error deleting attachment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return false;
  }
}
