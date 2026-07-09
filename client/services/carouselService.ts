import { supabase } from "./supabaseService";

export interface CarouselImage {
  id?: string;
  url: string;
  title: string;
  description: string;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  location?: string; // Where this image is displayed: "moments_of_impact", "hero_background", etc.
}

// Upload carousel image file to Supabase Storage
export async function uploadCarouselImageFile(
  file: File,
  title: string,
  location: string = "moments_of_impact"
): Promise<string | null> {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `carousel-${location}-${timestamp}.${fileExt}`;
    const filePath = `carousel/${location}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("carousel-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Error uploading carousel image:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("carousel-images").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading carousel image file:", error);
    return null;
  }
}

// Delete carousel image from storage
export async function deleteCarouselImageFile(publicUrl: string): Promise<boolean> {
  try {
    // Extract path from public URL
    const urlParts = publicUrl.split("/carousel/");
    if (urlParts.length < 2) return false;

    const filePath = `carousel/${urlParts[1]}`;

    const { error } = await supabase.storage
      .from("carousel-images")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting carousel image:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting carousel image file:", error);
    return false;
  }
}

// Fetch all carousel images
export async function getCarouselImages(): Promise<CarouselImage[]> {
  try {
    const { data, error } = await supabase
      .from("carousel_images")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching carousel images:", error);
    return [];
  }
}

// Get carousel images for specific location
export async function getCarouselImagesByLocation(location: string): Promise<CarouselImage[]> {
  try {
    const { data, error } = await supabase
      .from("carousel_images")
      .select("*")
      .eq("location", location)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching carousel images by location:", error);
    return [];
  }
}

// Create carousel image record
export async function createCarouselImage(
  image: Omit<CarouselImage, "id" | "created_at" | "updated_at">
): Promise<CarouselImage | null> {
  try {
    const { data, error } = await supabase
      .from("carousel_images")
      .insert([{
        url: image.url,
        title: image.title,
        description: image.description,
        display_order: image.display_order,
        location: image.location || "moments_of_impact",
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating carousel image:", error);
    return null;
  }
}

// Update carousel image
export async function updateCarouselImage(
  id: string,
  updates: Partial<CarouselImage>
): Promise<CarouselImage | null> {
  try {
    const { data, error } = await supabase
      .from("carousel_images")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating carousel image:", error);
    return null;
  }
}

// Delete carousel image
export async function deleteCarouselImage(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("carousel_images")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting carousel image:", error);
    return false;
  }
}

// Get all unique carousel locations
export async function getCarouselLocations(): Promise<string[]> {
  try {
    const images = await getCarouselImages();
    const locations = [...new Set(images.map(img => img.location || "moments_of_impact"))];
    return locations;
  } catch (error) {
    console.error("Error getting carousel locations:", error);
    return ["moments_of_impact"];
  }
}
