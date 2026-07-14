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

export const mandelaDayHelpNeeds: HelpNeed[] = [
  { name: "Toys", quantity: 100, unit: "units" },
  { name: "Snacks and sandwiches", quantity: 100, unit: "units" },
  { name: "Cool drinks", quantity: 20, unit: "packs" },
  { name: "Water", quantity: 20, unit: "packs" },
  { name: "Small juices", quantity: 20, unit: "packs" },
  { name: "Biscuits", quantity: 5, unit: "boxes" },
  { name: "NAN 1 Milk", quantity: 20, unit: "units" },
  { name: "NAN Pre Milk", quantity: 10, unit: "units" },
  { name: "Milk Lactogen", quantity: 10, unit: "units" },
  { name: "Surgical gloves", quantity: 10, unit: "boxes" },
  { name: "Procedure gloves", quantity: 10, unit: "boxes" },
  { name: "Feeding tubes (20 per pack)", quantity: 20, unit: "packs" },
  { name: "Suction probes (20 per pack)", quantity: 20, unit: "packs" },
  { name: "Paracetamol 10mg/ml, 100ml ampoules", quantity: 50, unit: "ampoules" },
  { name: "Diclofenac 25mg/ml, 3ml ampoules", quantity: 50, unit: "ampoules" },
  { name: "Adrenaline 1mg/ml, 1ml ampoules", quantity: 90, unit: "ampoules" },
  { name: "Hydrocortisone 100mg ampoules", quantity: 90, unit: "ampoules" },
  { name: "MAQ Cleansing Cream", quantity: 5, unit: "units" },
  { name: "Window cleaner", quantity: 5, unit: "units" },
  { name: "MAQ Liquid Soap", quantity: 10, unit: "units" },
  { name: "Handy Andy", quantity: 10, unit: "units" },
  { name: "Adult disposable diapers, size M", quantity: 80, unit: "packs" },
  { name: "Adult disposable diapers, size L", quantity: 81, unit: "packs" },
  { name: "Adult disposable diapers, size XL", quantity: 82, unit: "packs" },
  { name: "Baby diapers", quantity: 1600, unit: "units" },
  { name: "Wet wipes", quantity: 100, unit: "units" },
  { name: "Blankets", quantity: 300, unit: "units" },
  { name: "Pillows", quantity: 60, unit: "units" },
  { name: "Pillowcases", quantity: 60, unit: "units" },
  { name: "Patient hospital clothing", quantity: 50, unit: "units" },
  { name: "White sheets", quantity: 300, unit: "units" },
  { name: "Bottle brushes", quantity: 5, unit: "units" },
  { name: "Baby bodysuits, short sleeve", quantity: 50, unit: "units" },
  { name: "Baby bodysuits, long sleeve", quantity: 50, unit: "units" },
  { name: "Bibs", quantity: 80, unit: "units" },
  { name: "Socks", quantity: 80, unit: "pairs" },
  { name: "Mattresses", quantity: 10, unit: "units" },
  { name: "Beds", quantity: 10, unit: "units" },
  { name: "Breastfeeding chairs", quantity: 60, unit: "units" },
  { name: "Stretchers", quantity: 5, unit: "units" },
  { name: "Wheelchairs", quantity: 5, unit: "units" },
  { name: "Incubators, MAS-BI300 (MASmed)", quantity: 10, unit: "units" },
  { name: "Infuser pumps, ZNB (KellyMed)", quantity: 10, unit: "units" },
  { name: "Phototherapy equipment, XHZ-90", quantity: 15, unit: "units" },
  { name: "Phototherapy lamps, YZ20BT132", quantity: 60, unit: "units" },
  { name: "LED lamps, 24W E27 spiral thread", quantity: 100, unit: "units" },
  { name: "LED lamps, T8 120cm", quantity: 25, unit: "units" },
  { name: "Polyethylene balls for lamps", quantity: 10, unit: "units" },
  { name: "Single-phase Legrand electrical sockets", quantity: 10, unit: "units" },
  { name: "Solar geysers, electric/hybrid 100L", quantity: 2, unit: "units" },
  { name: "20L electric kettles", quantity: 2, unit: "units" },
  { name: "Metal hooks with dowels for mosquito nets", quantity: 30, unit: "units" },
  { name: "Nursery and Paediatrics interior wall painting", quantity: 1, unit: "wall painting" },
];

const mandelaDayEvent: Event = {
  id: "mandela-day-mavalane",
  title: "Nelson Mandela Day at Mavalane Hospital",
  date: "17 July 2026",
  time: "8h30 – 10h30 (guests arrive from 8h00)",
  location: "Serviço de Pediatria, Hospital Mavalane, Maputo",
  description: "Vamos-nos envolver. Junte-se à SACBM para uma manhã de solidariedade, visitas guiadas e apoio prático às crianças no Hospital Mavalane.",
  category: "Community Impact",
  attendees: 107,
  featured: true,
  helpNeeds: mandelaDayHelpNeeds,
  contactMessage: "To coordinate a donation, contact SACBM. Medicines, medical consumables, and technical equipment must be confirmed with the hospital before purchase or delivery.",
};

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
      return [mandelaDayEvent];
    }

    const events = (data || []).map((row: any) => ({
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

    return events.some((event) => event.id === mandelaDayEvent.id)
      ? events
      : [mandelaDayEvent, ...events];
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
