import {
  getRequestsFromSheet,
  addRequestToSheet,
  updateRequestInSheet,
  getRequestMetrics,
} from "./googleDriveService";
import { getStoredGoogleUser } from "./googleService";

export interface RelieRequest {
  id: string;
  originator: string;
  location: string;
  helpType: string;
  evacuationType: string;
  peopleInvolved: number;
  amountSpent: number;
  category: "Category 1" | "Category 2" | "Category 3";
  status: "pending" | "met" | "partially_met";
  createdAt?: string;
}

export interface Metrics {
  totalRequests: number;
  totalPeopleAssisted: number;
  totalValueDeployed: number;
  averagePerRequest: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

// Fetch all requests from Google Sheet
export async function getRequests(
  status?: string,
  limit?: number
): Promise<RelieRequest[]> {
  try {
    // Check if user is authenticated
    const user = getStoredGoogleUser();
    if (!user?.accessToken) {
      console.warn("User not authenticated with Google");
      return [];
    }

    let requests = await getRequestsFromSheet();

    // Filter by status if provided
    if (status) {
      requests = requests.filter((r) => r.status === status);
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
  return getRequests(undefined, limit);
}

// Fetch requests by status
export async function getRequestsByStatus(
  status: "pending" | "met" | "partially_met"
): Promise<RelieRequest[]> {
  return getRequests(status);
}

// Create a new request in Google Sheet
export async function createRequest(
  request: Omit<RelieRequest, "id" | "createdAt">
): Promise<RelieRequest | null> {
  try {
    const user = getStoredGoogleUser();
    if (!user?.accessToken) {
      console.error("User not authenticated");
      return null;
    }

    const newRequest = await addRequestToSheet(request);
    return newRequest;
  } catch (error) {
    console.error("Error creating request:", error);
    return null;
  }
}

// Update request status or category in Google Sheet
export async function updateRequest(
  id: string,
  updates: Partial<Pick<RelieRequest, "status" | "category">>
): Promise<RelieRequest | null> {
  try {
    const user = getStoredGoogleUser();
    if (!user?.accessToken) {
      console.error("User not authenticated");
      return null;
    }

    const success = await updateRequestInSheet(id, updates);
    if (success) {
      // Return the updated request - ideally fetch it from the sheet
      // For now, return a partial object
      return { id } as RelieRequest;
    }
    return null;
  } catch (error) {
    console.error("Error updating request:", error);
    return null;
  }
}

// Fetch metrics (aggregates) from Google Sheet
export async function getMetrics(): Promise<Metrics | null> {
  try {
    const user = getStoredGoogleUser();
    if (!user?.accessToken) {
      console.warn("User not authenticated");
      return null;
    }

    const metrics = await getRequestMetrics();
    return metrics as unknown as Metrics;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
}
