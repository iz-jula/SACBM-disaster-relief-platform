// Service to fetch consolidated dashboard data from backend
// This reduces network calls from 7 separate requests to 1

interface DashboardData {
  recentRequests: any[];
  metrics: {
    totalRequests: number;
    totalPeopleAssisted: number;
    totalValueDeployed: number;
    averagePerRequest: number;
    metRequests: number;
    pendingRequests: number;
    partiallyMet: number;
  };
  achievementsMetrics: {
    totalAchievements: number;
    completedAchievements: number;
    inProgressAchievements: number;
    totalPeopleImpacted: number;
    totalContributed: number;
    averageImpact: number;
  };
  ingdMetrics: {
    totalRequests: number;
    totalPeople: number;
    totalValue: number;
    averagePerRequest: number;
  };
  recentIngdRequests: any[];
  achievements: any[];
  governmentDocument: any | null;
  ingdActive: boolean;
}

let dashboardCache: DashboardData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export async function getDashboardData(): Promise<DashboardData | null> {
  const now = Date.now();

  // Return cached data if still valid
  if (
    dashboardCache &&
    now - lastFetchTime < CACHE_DURATION
  ) {
    console.log("getDashboardData: Returning cached data");
    return dashboardCache;
  }

  try {
    console.log("getDashboardData: Fetching from /api/dashboard-data endpoint");
    console.time("getDashboardData");

    const response = await fetch("/api/dashboard-data");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DashboardData = await response.json();

    console.timeEnd("getDashboardData");
    console.log("getDashboardData: Successfully fetched consolidated data");

    // Cache the result
    dashboardCache = data;
    lastFetchTime = now;

    return data;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("getDashboardData: Error fetching dashboard data:", errorMsg);
    return null;
  }
}

// Invalidate cache when mutations happen
export function invalidateDashboardCache() {
  console.log("Invalidating dashboard cache");
  dashboardCache = null;
  lastFetchTime = 0;
}
