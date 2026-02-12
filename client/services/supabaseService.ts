import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseKey);

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

// Get metrics for dashboard
export async function getMetrics() {
  try {
    const { data, error } = await supabase.from("relief_requests").select("*");

    if (error) throw error;

    const totalRequests = data?.length || 0;
    const metRequests =
      data?.filter((r: RelieRequest) => r.status === true).length || 0;
    const pendingRequests =
      data?.filter((r: RelieRequest) => r.status === false).length || 0;
    const partiallyMet = 0; // Based on your schema, you may want to add a separate column for this

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

    // Calculate average per request (based on total requests, not just met)
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
    console.error("Error fetching metrics:", error);
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
  hide_amount?: boolean;
}

// Fetch all actions
export async function getActions(
  status?: string,
  category?: string,
): Promise<Action[]> {
  try {
    let query = supabase
      .from("actions_table")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error in getActions:", error.message);
      throw error;
    }
    return data || [];
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error fetching actions:", errorMsg);
    return [];
  }
}

// Get action metrics
export async function getActionsMetrics() {
  try {
    const { data, error } = await supabase.from("actions_table").select("*");

    if (error) {
      console.error("Supabase error in getActionsMetrics:", error.message);
      throw error;
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
    console.error("Error fetching action metrics:", error);
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
    const { data, error } = await supabase
      .from("actions_table")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating action:", error);
    return null;
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

// Fetch all INGD relief requests from INGD_table
export async function getIngdRequests(): Promise<IngdRequest[]> {
  try {
    const { data, error } = await supabase
      .from("INGD_table")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching INGD requests:", error);
    return [];
  }
}

// Get INGD metrics for dashboard
export async function getIngdMetrics() {
  try {
    const { data, error } = await supabase.from("INGD_table").select("*");

    if (error) throw error;

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
    console.error("Error fetching INGD metrics:", error);
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
