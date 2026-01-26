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
  byHelpType: Record<string, number>;
  byCategory: Record<string, number>;
}

// Fetch all requests or filter by status
export async function getRequests(
  status?: string,
  limit?: number
): Promise<RelieRequest[]> {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (limit) params.append("limit", limit.toString());

    const response = await fetch(`/api/requests?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch requests: ${response.statusText}`);
    }

    const data = await response.json();
    return data.requests || [];
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

// Create a new request
export async function createRequest(
  request: Omit<RelieRequest, "id" | "createdAt">
): Promise<RelieRequest | null> {
  try {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create request: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating request:", error);
    return null;
  }
}

// Update request status or category
export async function updateRequest(
  id: string,
  updates: Partial<Pick<RelieRequest, "status" | "category">>
): Promise<RelieRequest | null> {
  try {
    const response = await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update request: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating request:", error);
    return null;
  }
}

// Fetch metrics (aggregates)
export async function getMetrics(): Promise<Metrics | null> {
  try {
    const response = await fetch("/api/metrics");
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return null;
  }
}
