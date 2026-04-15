import {
  getRequests as getSupabaseRequests,
  getRecentRequests as getSupabaseRecentRequests,
  createRequest as createSupabaseRequest,
  updateRequest as updateSupabaseRequest,
  deleteRequest as deleteSupabaseRequest,
  getMetrics as getSupabaseMetrics,
  getIngdRequests as getSupabaseIngdRequests,
  createIngdRequest as createSupabaseIngdRequest,
  updateIngdRequest as updateSupabaseIngdRequest,
  deleteIngdRequest as deleteSupabaseIngdRequest,
  RelieRequest,
  IngdRequest,
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

// Cache metrics and requests to avoid duplicate API calls
interface RequestsCache {
  metrics: Metrics | null;
  requests: RelieRequest[];
  ingdRequests: IngdRequest[];
  timestamp: number;
}

const requestsCache: RequestsCache = {
  metrics: null,
  requests: [],
  ingdRequests: [],
  timestamp: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch all requests from Supabase
export async function getRequests(
  status?: string,
  limit?: number,
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

// Fetch all requests without limit (for admin/export)
export async function getAllRequests(): Promise<RelieRequest[]> {
  try {
    const requests = await getSupabaseRequests();
    return requests;
  } catch (error) {
    console.error("Error fetching all requests:", error);
    return [];
  }
}

// Fetch recent requests (limited)
export async function getRecentRequests(limit = 5): Promise<RelieRequest[]> {
  return getSupabaseRecentRequests(limit);
}

// Fetch requests by status
export async function getRequestsByStatus(
  status: "pending" | "met",
): Promise<RelieRequest[]> {
  const statusBool = status === "met";
  const allRequests = await getSupabaseRequests();
  return allRequests.filter((r) => r.status === statusBool);
}

// Create a new request in Supabase
export async function createRequest(
  request: Omit<RelieRequest, "id" | "created_at" | "edited_at">,
): Promise<RelieRequest | null> {
  try {
    const newRequest = await createSupabaseRequest({
      originator: request.originator,
      email: request.email,
      full_name: request.full_name,
      location: request.location,
      partner_organisation: request.partner_organisation,
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
  updates: Partial<RelieRequest>,
): Promise<RelieRequest | null> {
  try {
    const updated = await updateSupabaseRequest(id, updates);
    return updated;
  } catch (error) {
    console.error("Error updating request:", error);
    return null;
  }
}

// Delete relief request from Supabase
export async function deleteRequest(id: number): Promise<boolean> {
  try {
    const deleted = await deleteSupabaseRequest(id);
    return deleted;
  } catch (error) {
    console.error("Error deleting request:", error);
    return false;
  }
}

// Fetch metrics (aggregates) from Supabase with caching
export async function getMetrics(): Promise<Metrics | null> {
  const now = Date.now();

  // Return cached data if still valid
  if (
    requestsCache.metrics &&
    now - requestsCache.timestamp < CACHE_DURATION
  ) {
    console.log("Returning cached request metrics");
    return requestsCache.metrics;
  }

  try {
    console.log("Fetching request metrics from database...");
    const metrics = await getSupabaseMetrics();

    // Update cache
    requestsCache.metrics = metrics;
    requestsCache.timestamp = now;

    console.log("Fetched request metrics:", metrics);
    return metrics;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
}

// Fetch INGD relief requests from INGD_table with caching
export async function getIngdRequests(): Promise<IngdRequest[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (
    requestsCache.ingdRequests.length > 0 &&
    now - requestsCache.timestamp < CACHE_DURATION
  ) {
    console.log("Returning cached INGD requests");
    return requestsCache.ingdRequests;
  }

  try {
    console.log("Fetching INGD requests from database...");
    const requests = await getSupabaseIngdRequests();

    // Update cache
    requestsCache.ingdRequests = requests;
    requestsCache.timestamp = now;

    console.log("Fetched", requests.length, "INGD requests");
    return requests;
  } catch (error) {
    console.error("Error fetching INGD requests:", error);
    return [];
  }
}

// Create a new INGD relief request (admin feature)
export async function createIngdRequest(
  request: Omit<IngdRequest, "id" | "created_at">,
): Promise<IngdRequest | null> {
  try {
    const newRequest = await createSupabaseIngdRequest(request);
    return newRequest;
  } catch (error) {
    console.error("Error creating INGD request:", error);
    return null;
  }
}

// Update an INGD relief request (admin feature)
export async function updateIngdRequest(
  id: number,
  updates: Partial<IngdRequest>,
): Promise<IngdRequest | null> {
  try {
    const updated = await updateSupabaseIngdRequest(id, updates);
    return updated;
  } catch (error) {
    console.error("Error updating INGD request:", error);
    return null;
  }
}

// Delete an INGD relief request (admin feature)
export async function deleteIngdRequest(id: number): Promise<boolean> {
  try {
    const deleted = await deleteSupabaseIngdRequest(id);
    return deleted;
  } catch (error) {
    console.error("Error deleting INGD request:", error);
    return false;
  }
}
