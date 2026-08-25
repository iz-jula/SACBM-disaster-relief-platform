import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "";

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface MemberCustomization {
  company: string;
  sector: string;
  description: string;
  image_url?: string | null;
  updated_at?: string;
}

export async function getMemberCustomizations(): Promise<MemberCustomization[]> {
  const { data, error } = await supabase
    .from("member_customizations")
    .select("company, sector, description, image_url, updated_at");

  if (error) throw error;
  return data || [];
}

export async function uploadMemberImage(file: File, company: string): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeCompany = company.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filePath = `${safeCompany}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("member-images")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("member-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function saveMemberCustomization(
  customization: Omit<MemberCustomization, "updated_at">,
): Promise<MemberCustomization> {
  const values = { ...customization, updated_at: new Date().toISOString() };
  const { data: updated, error: updateError } = await supabase
    .from("member_customizations")
    .update(values)
    .eq("company", customization.company)
    .select()
    .maybeSingle();

  if (updateError) throw updateError;
  if (updated) return updated;

  const { data: inserted, error: insertError } = await supabase
    .from("member_customizations")
    .insert(values)
    .select()
    .single();

  if (insertError) throw insertError;
  return inserted;
}

export interface RelieRequest {
  id?: number;
  originator: string;
  email: string;
  full_name: string;
  location: string;
  partner_organisation?: string | null;
  help_type: string;
  evacuation_type: string;
  people: string;
  value: string;
  status: boolean;
  created_at?: string;
  edited_at?: string;
}

// Fetch all relief requests
export async function getRequests(): Promise<RelieRequest[]> {
  try {
    const { data, error } = await supabase
      .from("relief_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
}

// Fetch recent requests (limited)
export async function getRecentRequests(limit = 5): Promise<RelieRequest[]> {
  try {
    const { data, error } = await supabase
      .from("relief_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching recent requests:", error);
    return [];
  }
}

// Create a new relief request
export async function createRequest(
  request: Omit<RelieRequest, "id" | "created_at" | "edited_at">,
): Promise<RelieRequest | null> {
  try {
    console.log("Attempting to create request:", request);

    const { data, error } = await supabase
      .from("relief_requests")
      .insert([request])
      .select()
      .single();

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log("Request created successfully:", data);
    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error creating request:", errorMessage);
    throw new Error(`Failed to create request: ${errorMessage}`);
  }
}

// Update a relief request
export async function updateRequest(
  id: number,
  updates: Partial<RelieRequest>,
): Promise<RelieRequest | null> {
  try {
    const { data, error } = await supabase
      .from("relief_requests")
      .update({ ...updates, edited_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating request:", error);
    return null;
  }
}

// Delete a relief request
export async function deleteRequest(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("relief_requests")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting request:", error);
    return false;
  }
}

// Get metrics for dashboard - optimized query with timeout
export async function getMetrics() {
  try {
    // Only select necessary columns, not all
    const query = supabase
      .from("relief_requests")
      .select("id,status,people,value")
      .order("created_at", { ascending: false });

    // Wrap in timeout to prevent hanging
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: new Error("Query timeout after 30 seconds") });
      }, ACTIONS_QUERY_TIMEOUT);
    });

    const { data, error } = await Promise.race([
      query,
      timeoutPromise,
    ]) as any;

    if (error) {
      console.warn("Supabase getMetrics:", error.message || error);
      return {
        totalRequests: 0,
        totalPeopleAssisted: 0,
        totalValueDeployed: 0,
        averagePerRequest: 0,
        metRequests: 0,
        pendingRequests: 0,
        partiallyMet: 0,
      };
    }

    const totalRequests = data?.length || 0;
    const metRequests =
      data?.filter((r: RelieRequest) => r.status === true).length || 0;
    const pendingRequests =
      data?.filter((r: RelieRequest) => r.status === false).length || 0;
    const partiallyMet = 0;

    // Calculate total people assisted - only from met requests
    const totalPeopleAssisted =
      data
        ?.filter((r: RelieRequest) => r.status === true)
        .reduce((sum: number, r: RelieRequest) => {
          const people = parseInt(r.people || "0", 10);
          return sum + (isNaN(people) ? 0 : people);
        }, 0) || 0;

    // Calculate total value deployed - only from met requests
    const totalValueDeployed =
      data
        ?.filter((r: RelieRequest) => r.status === true)
        .reduce((sum: number, r: RelieRequest) => {
          const value = parseInt(r.value || "0", 10);
          return sum + (isNaN(value) ? 0 : value);
        }, 0) || 0;

    // Calculate average per request
    const averagePerRequest =
      totalRequests > 0 ? totalValueDeployed / totalRequests : 0;

    return {
      totalRequests,
      totalPeopleAssisted,
      totalValueDeployed,
      averagePerRequest,
      metRequests,
      pendingRequests,
      partiallyMet,
    };
  } catch (error) {
    console.warn("Error fetching metrics (returning zeros):", error instanceof Error ? error.message : error);
    return {
      totalRequests: 0,
      totalPeopleAssisted: 0,
      totalValueDeployed: 0,
      averagePerRequest: 0,
      metRequests: 0,
      pendingRequests: 0,
      partiallyMet: 0,
    };
  }
}

// Subscribe to real-time changes
export function subscribeToRequests(callback: (request: RelieRequest) => void) {
  const subscription = supabase
    .from("relief_requests")
    .on("*", (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return subscription;
}

// Action/Achievement Interface - matches Supabase actions_table schema
export interface Action {
  id?: number;
  company_name: string;
  type_action: string;
  description: string;
  category:
    | "Food"
    | "Clothing"
    | "Materials"
    | "Medical"
    | "Shelter"
    | "Water"
    | "Evacuation"
    | "Multiple";
  location: string;
  partner_organisation?: string | null;
  people_impacted: number;
  amount: number;
  media?: string | null;
  created_at?: string;
}

const ACTIONS_QUERY_TIMEOUT = 30000;

// Fetch all actions - optimized query with timeout
export async function getActions(
  status?: string,
  category?: string,
): Promise<Action[]> {
  try {
    let query = supabase
      .from("actions_table")
      .select("id,company_name,type_action,description,category,location,partner_organisation,people_impacted,amount,media,created_at")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    // Wrap in timeout to prevent hanging
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: new Error("Query timeout after 30 seconds") });
      }, ACTIONS_QUERY_TIMEOUT);
    });

    const { data, error } = await Promise.race([
      query,
      timeoutPromise,
    ]) as any;

    if (error) {
      console.warn("Supabase getActions:", error.message || error);
      return [];
    }
    return data || [];
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.warn("Error fetching actions (returning empty):", errorMsg);
    return [];
  }
}

// Get action metrics - optimized query with timeout
export async function getActionsMetrics() {
  try {
    // Only select the columns needed for metrics calculation
    const query = supabase
      .from("actions_table")
      .select("id,people_impacted,amount");

    // Wrap in timeout to prevent hanging
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: new Error("Query timeout after 30 seconds") });
      }, ACTIONS_QUERY_TIMEOUT);
    });

    const { data, error } = await Promise.race([
      query,
      timeoutPromise,
    ]) as any;

    if (error) {
      console.warn("Supabase getActionsMetrics:", error.message || error);
      // Return zeros on error instead of crashing
      return {
        totalAchievements: 0,
        completedAchievements: 0,
        inProgressAchievements: 0,
        totalPeopleImpacted: 0,
        totalContributed: 0,
        averageImpact: 0,
      };
    }

    const actions = data || [];
    const totalAchievements = actions.length;
    const totalPeopleImpacted = actions.reduce(
      (sum: number, a: Action) => sum + (a.people_impacted || 0),
      0,
    );
    const totalContributed = actions.reduce(
      (sum: number, a: Action) => sum + (a.amount || 0),
      0,
    );

    return {
      totalAchievements,
      completedAchievements: totalAchievements,
      inProgressAchievements: 0,
      totalPeopleImpacted,
      totalContributed,
      averageImpact:
        actions.length > 0
          ? Math.round(totalPeopleImpacted / actions.length)
          : 0,
    };
  } catch (error) {
    console.warn("Error fetching action metrics (returning zeros):", error instanceof Error ? error.message : error);
    return {
      totalAchievements: 0,
      completedAchievements: 0,
      inProgressAchievements: 0,
      totalPeopleImpacted: 0,
      totalContributed: 0,
      averageImpact: 0,
    };
  }
}

// Create a new action
export async function createAction(
  action: Omit<Action, "id" | "created_at">,
): Promise<Action | null> {
  try {
    console.log("Creating action:", action);

    const { data, error } = await supabase
      .from("actions_table")
      .insert([action])
      .select()
      .single();

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log("Action created successfully:", data);
    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error creating action:", errorMessage);
    throw new Error(`Failed to create action: ${errorMessage}`);
  }
}

// Update an action
export async function updateAction(
  id: string,
  updates: Partial<Action>,
): Promise<Action | null> {
  try {
    const numericId = parseInt(id, 10);
    const { data, error } = await supabase
      .from("actions_table")
      .update(updates)
      .eq("id", numericId)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating action:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error updating action:", errorMsg);
    throw new Error(`Failed to update action: ${errorMsg}`);
  }
}

// Delete an action
export async function deleteAction(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("actions_table")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting action:", error);
    return false;
  }
}

// INGD Table Interface - matches the actual INGD_table schema
export interface IngdRequest {
  id?: number;
  created_at?: string;
  company_name?: string;
  Item?: string;
  category?: string;
  partner_organisation?: string;
  people_impacted?: number;
  amount?: number;
  description?: string;
  media?: any;
  Maputo?: number;
  Gaza?: number;
  Sofala?: number;
  Zambezia?: number;
  Total?: number;
  quantity?: number;
  status?: string;
  resolved_by?: string;
  company_name_action?: string;
  email_resolution?: string;
}

// Fetch all INGD relief requests from INGD_table - optimized query with timeout
export async function getIngdRequests(): Promise<IngdRequest[]> {
  try {
    const query = supabase
      .from("INGD_table")
      .select("id,created_at,Item,category,people_impacted,Total,quantity,status,resolved_by,company_name_action")
      .order("created_at", { ascending: false });

    // Wrap in timeout to prevent hanging
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: new Error("Query timeout after 30 seconds") });
      }, ACTIONS_QUERY_TIMEOUT);
    });

    const { data, error } = await Promise.race([
      query,
      timeoutPromise,
    ]) as any;

    if (error) {
      console.warn("Supabase getIngdRequests:", error.message || error);
      return [];
    }
    return data || [];
  } catch (error) {
    console.warn("Error fetching INGD requests (returning empty):", error instanceof Error ? error.message : error);
    return [];
  }
}

// Get INGD metrics for dashboard - optimized query with timeout
export async function getIngdMetrics() {
  try {
    // Only select the columns needed for metrics calculation
    const query = supabase
      .from("INGD_table")
      .select("id,people_impacted,Total");

    // Wrap in timeout to prevent hanging
    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) => {
      setTimeout(() => {
        resolve({ data: null, error: new Error("Query timeout after 30 seconds") });
      }, ACTIONS_QUERY_TIMEOUT);
    });

    const { data, error } = await Promise.race([
      query,
      timeoutPromise,
    ]) as any;

    if (error) {
      console.warn("Supabase getIngdMetrics:", error.message || error);
      return {
        totalRequests: 0,
        totalPeople: 0,
        totalValue: 0,
        averagePerRequest: 0,
      };
    }

    const totalRequests = data?.length || 0;
    const totalPeople = data?.reduce((sum: number, r: IngdRequest) => sum + (r.people_impacted || 0), 0) || 0;
    // Sum the Total column which represents total quantities across all locations
    const totalValue = data?.reduce((sum: number, r: IngdRequest) => sum + (r.Total || 0), 0) || 0;

    return {
      totalRequests,
      totalPeople,
      totalValue,
      averagePerRequest: totalRequests > 0 ? totalValue / totalRequests : 0,
    };
  } catch (error) {
    console.warn("Error fetching INGD metrics (returning zeros):", error instanceof Error ? error.message : error);
    return {
      totalRequests: 0,
      totalPeople: 0,
      totalValue: 0,
      averagePerRequest: 0,
    };
  }
}

// Create a new INGD relief request
export async function createIngdRequest(
  request: Omit<IngdRequest, "id" | "created_at">,
): Promise<IngdRequest | null> {
  try {
    const { data, error } = await supabase
      .from("INGD_table")
      .insert([request])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating INGD request:", error);
    return null;
  }
}

// Update an INGD relief request
export async function updateIngdRequest(
  id: number,
  updates: Partial<IngdRequest>,
): Promise<IngdRequest | null> {
  try {
    const { data, error } = await supabase
      .from("INGD_table")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating INGD request:", error);
    return null;
  }
}

// Delete an INGD relief request
export async function deleteIngdRequest(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("INGD_table")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting INGD request:", error);
    return false;
  }
}

// Create/Update INGD commitment - stores directly in INGD_table
export async function createIngdCommitment(
  itemIds: number[],
  fullName: string,
  companyName: string,
  email: string,
): Promise<boolean> {
  try {
    // Update each selected item with commitment info
    for (const itemId of itemIds) {
      const { error } = await supabase
        .from("INGD_table")
        .update({
          status: "commitment",
          resolved_by: fullName,
          company_name_action: companyName,
          email_resolution: email,
        })
        .eq("id", itemId);

      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("Error creating INGD commitment:", error);
    return false;
  }
}

// Mark INGD item as resolved
export async function resolveIngdRequest(
  itemIds: number[],
  fullName: string,
  companyName: string,
  email: string,
): Promise<boolean> {
  try {
    // Update each selected item to resolved
    for (const itemId of itemIds) {
      const { error } = await supabase
        .from("INGD_table")
        .update({
          status: "resolved",
          resolved_by: fullName,
          company_name_action: companyName,
          email_resolution: email,
        })
        .eq("id", itemId);

      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("Error resolving INGD request:", error);
    return false;
  }
}

// Revert INGD item status back to pending (clear commitment/resolution)
export async function revertIngdToPending(
  itemIds: number[],
): Promise<boolean> {
  try {
    // Update each selected item back to pending, clearing all action fields
    for (const itemId of itemIds) {
      const { error } = await supabase
        .from("INGD_table")
        .update({
          status: "pending",
          resolved_by: null,
          company_name_action: null,
          email_resolution: null,
        })
        .eq("id", itemId);

      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("Error reverting INGD request to pending:", error);
    return false;
  }
}

// INGD Documents Interface
export interface IngdDocument {
  id?: number;
  created_at?: string;
  file_name: string;
  file_url: string; // Contains base64 encoded data
  file_type: string; // "pdf", "xlsx", "xls", etc.
  description: string;
  uploaded_by?: string;
  type?: string; // "ingd" or "government_priority"
}

// Convert file to base64 data URL
export async function uploadDocumentToStorage(
  file: File,
  documentType: string = "ingd",
): Promise<string> {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result); // Returns "data:mime/type;base64,..."
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error("Error converting document to base64:", error);
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Fetch all INGD documents
export async function getIngdDocuments(): Promise<IngdDocument[]> {
  try {
    const { data, error } = await supabase
      .from("ingd_documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching INGD documents:", error);
    return [];
  }
}

// Create a new INGD document
export async function createIngdDocument(
  document: Omit<IngdDocument, "id" | "created_at">,
): Promise<IngdDocument | null> {
  try {
    const { data, error } = await supabase
      .from("ingd_documents")
      .insert([{
        file_name: document.file_name,
        file_url: document.file_url,
        file_type: document.file_type,
        description: document.description,
        uploaded_by: document.uploaded_by,
        type: document.type,
      }])
      .select();

    if (error) {
      const errorMsg = typeof error === 'object' && error !== null
        ? JSON.stringify(error, null, 2)
        : String(error);
      console.error("Supabase error creating document:", errorMsg);
      throw error;
    }
    return data?.[0] || null;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message :
                     typeof error === 'object' && error !== null ? JSON.stringify(error, null, 2) :
                     String(error);
    console.error("Error creating INGD document:", errorMsg);
    throw new Error(`Failed to create document: ${errorMsg}`);
  }
}

// Delete an INGD document
export async function deleteIngdDocument(id: number): Promise<boolean> {
  try {
    // Delete from database only (no storage cleanup needed for base64)
    const { error: deleteError } = await supabase
      .from("ingd_documents")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
    return true;
  } catch (error) {
    console.error("Error deleting INGD document:", error);
    return false;
  }
}

// Update an INGD document's type (destination page), name, and/or description
export async function updateIngdDocument(
  id: number,
  updates: { type?: string | null; file_name?: string; description?: string }
): Promise<boolean> {
  try {
    console.log(`[updateIngdDocument] Updating document ID ${id}`);
    console.log(`[updateIngdDocument] Updates object:`, updates);
    console.log(`[updateIngdDocument] Updates.type: ${updates.type}`);
    console.log(`[updateIngdDocument] Updates.file_name: ${updates.file_name}`);
    console.log(`[updateIngdDocument] Updates.description: ${updates.description}`);

    // Build the update object with all provided fields
    const updatePayload = { ...updates };
    console.log(`[updateIngdDocument] Final payload being sent to Supabase:`, updatePayload);

    const { error, data } = await supabase
      .from("ingd_documents")
      .update(updatePayload)
      .eq("id", id)
      .select();

    console.log(`[updateIngdDocument] Supabase response:`, { error, data });

    if (error) {
      console.error(`[updateIngdDocument] Supabase error for document ${id}:`, {
        message: error.message,
        code: (error as any).code,
        details: (error as any).details,
        hint: (error as any).hint,
        fullError: JSON.stringify(error)
      });
      throw new Error(`Supabase error: ${error.message}`);
    }

    console.log(`[updateIngdDocument] Successfully updated document ${id}`, data);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("[updateIngdDocument] Error updating INGD document:", errorMsg);
    return false;
  }
}

// Update an INGD document's type (destination page) - DEPRECATED, use updateIngdDocument instead
export async function updateIngdDocumentType(id: number, type: string | null): Promise<boolean> {
  return updateIngdDocument(id, { type });
}

// Get INGD active setting from database
export async function getIngdActiveSetting(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("setting_value")
      .eq("setting_key", "ingd_active")
      .single();

    if (error) {
      console.error("Error fetching INGD setting:", error);
      return true; // Default to true if error
    }

    // Handle both direct boolean and JSONB stored boolean
    const value = data?.setting_value;
    const isActive = value === true || value === 'true';
    console.log("INGD setting value:", value, "isActive:", isActive);
    return isActive;
  } catch (error) {
    console.error("Error fetching INGD setting:", error);
    return true; // Default to true if error
  }
}

// Update INGD active setting in database
export async function setIngdActiveSetting(isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("admin_settings")
      .update({
        setting_value: isActive,
        updated_at: new Date().toISOString()
      })
      .eq("setting_key", "ingd_active");

    if (error) {
      console.error("Error updating INGD setting:", error);
      throw error;
    }

    console.log("INGD setting updated to:", isActive);
    return true;
  } catch (error) {
    console.error("Error updating INGD setting:", error);
    return false;
  }
}

// Carousel Images Interface
export interface CarouselImage {
  id: string;
  url: string;
  title: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
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

// Create a new carousel image
export async function createCarouselImage(
  image: Omit<CarouselImage, "id" | "created_at" | "updated_at">
): Promise<CarouselImage | null> {
  try {
    const { data, error } = await supabase
      .from("carousel_images")
      .insert([image])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating carousel image:", error);
    return null;
  }
}

// Delete a carousel image
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

// Approved Members Interface
export interface ApprovedMember {
  id: string;
  email: string;
  full_name: string;
  company: string;
  created_at: string;
  updated_at: string;
}

// Fetch all approved members
export async function getApprovedMembers(): Promise<ApprovedMember[]> {
  try {
    const { data, error } = await supabase
      .from("approved_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching approved members:", error);
    return [];
  }
}

// Create a new approved member
export async function createApprovedMember(
  member: Omit<ApprovedMember, "id" | "created_at" | "updated_at">
): Promise<ApprovedMember | null> {
  try {
    const { data, error } = await supabase
      .from("approved_members")
      .insert([member])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating approved member:", error);
    return null;
  }
}

// Delete an approved member
export async function deleteApprovedMember(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("approved_members")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting approved member:", error);
    return false;
  }
}
