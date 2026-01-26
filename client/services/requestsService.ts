import {
  getRequests as getSupabaseRequests,
  getRecentRequests as getSupabaseRecentRequests,
  createRequest as createSupabaseRequest,
  updateRequest as updateSupabaseRequest,
  getMetrics as getSupabaseMetrics,
  RelieRequest,
} from "./supabaseService";

export interface Metrics {
  totalRequests: number;
  totalPeopleAssisted: number;
  totalValueDeployed: number;
  averagePerRequest: number;
  metRequests?: number;
  pendingRequests?: number;
  partiallyMet?: number;
}

// Fetch all requests from Supabase
export async function getRequests(
  status?: string,
  limit?: number
): Promise<RelieRequest[]> {
  try {
    let requests = await getSupabaseRequests();

    // Filter by status if provided
    if (status) {
      const statusBool = status === "met";
      requests = requests.filter((r) => r.status === statusBool);
    }

    // Apply limit if provided
    if (limit) {
      requests = requests.slice(0, limit);
    }

    return requests;
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
}

// Fetch recent requests (limited)
export async function getRecentRequests(limit = 5): Promise<RelieRequest[]> {
  return getSupabaseRecentRequests(limit);
}

// Fetch requests by status
export async function getRequestsByStatus(
  status: "pending" | "met"
): Promise<RelieRequest[]> {
  const statusBool = status === "met";
  const allRequests = await getSupabaseRequests();
  return allRequests.filter((r) => r.status === statusBool);
}

// Create a new request in Supabase
export async function createRequest(
  request: Omit<RelieRequest, "id" | "created_at" | "edited_at">
): Promise<RelieRequest | null> {
  try {
    const newRequest = await createSupabaseRequest({
      originator: request.originator,
      location: request.location,
      help_type: request.help_type,
      evacuation_type: request.evacuation_type,
      people: request.people,
      value: request.value,
      status: request.status,
    });
    return newRequest;
  } catch (error) {
    console.error("Error creating request:", error);
    return null;
  }
}

// Update relief request in Supabase
export async function updateRequest(
  id: number,
  updates: Partial<RelieRequest>
): Promise<RelieRequest | null> {
  try {
    const updated = await updateSupabaseRequest(id, updates);
    return updated;
  } catch (error) {
    console.error("Error updating request:", error);
    return null;
  }
}

// Fetch metrics (aggregates) from Supabase
export async function getMetrics(): Promise<Metrics | null> {
  try {
    const metrics = await getSupabaseMetrics();
    return metrics;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
}
