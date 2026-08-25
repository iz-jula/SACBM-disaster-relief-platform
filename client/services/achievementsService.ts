import {
  getActions as getSupabaseActions,
  getActionsMetrics as getSupabaseActionsMetrics,
  createAction as createSupabaseAction,
  updateAction as updateSupabaseAction,
  deleteAction as deleteSupabaseAction,
  Action,
} from "./supabaseService";

export type Achievement = Action;
export type { Action };

export function normalizeCompanyName(companyName: string): string {
  const normalized = companyName.trim().replace(/\s+/g, " ");
  const key = normalized.toLowerCase().replace(/[–—-]/g, " ").replace(/\s+/g, " ");

  if (key.includes("coca cola")) return "Coca Cola";
  if (key.includes("companhia industrial da matola") || key === "cim") {
    return "CIM Premier Foods";
  }
  if (key === "trac" || key.includes("trans african concessions") || key === "trac n4") {
    return "Trac N4";
  }
  if (key === "tongaat hulett") return "Tongaat";
  if (key === "grindrod group") return "Grindrod";
  if (key.includes("lionshare auto group")) return "Lionshare";
  if (key.includes("matola cargo terminal")) return "Matola Cargo";

  return normalized;
}

export interface AchievementsMetrics {
  totalAchievements: number;
  completedAchievements: number;
  inProgressAchievements: number;
  totalPeopleImpacted: number;
  totalContributed: number;
  averageImpact: number;
}

// Cache achievements to minimize API calls
interface AchievementsCache {
  achievements: Achievement[];
  metrics: AchievementsMetrics | null;
  timestamp: number;
  lastFetch: number;
}

const achievementsCache: AchievementsCache = {
  achievements: [],
  metrics: null,
  timestamp: 0,
  lastFetch: 0,
};

// Shorter cache for frequently accessed data (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;
// Longer cache for less frequently accessed data (30 minutes)
const LONG_CACHE_DURATION = 30 * 60 * 1000;

export async function getAchievements(
  status?: string,
  category?: string,
): Promise<Achievement[]> {
  const now = Date.now();

  // Return cached data if still valid (use shorter cache for frequently accessed data)
  if (
    achievementsCache.achievements.length > 0 &&
    now - achievementsCache.timestamp < CACHE_DURATION
  ) {
    console.log("Returning cached achievements");
    let filtered = [...achievementsCache.achievements];
    if (category) {
      filtered = filtered.filter((a) => a.category === category);
    }
    return filtered;
  }

  try {
    console.log("Fetching achievements from database...");
    const achievements = (await getSupabaseActions(undefined, category)).map((achievement) => ({
      ...achievement,
      company_name: normalizeCompanyName(achievement.company_name),
    }));

    // Update cache
    achievementsCache.achievements = achievements;
    achievementsCache.timestamp = now;
    achievementsCache.lastFetch = now;

    console.log("Fetched", achievements.length, "achievements");
    return achievements;
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error fetching achievements:", errorMsg);
    throw error;
  }
}

export async function getAchievementsMetrics(): Promise<AchievementsMetrics | null> {
  const now = Date.now();

  // Return cached data if still valid
  if (
    achievementsCache.metrics &&
    now - achievementsCache.timestamp < CACHE_DURATION
  ) {
    console.log("Returning cached achievement metrics");
    return achievementsCache.metrics;
  }

  try {
    console.log("Fetching achievement metrics from database...");
    const metrics = await getSupabaseActionsMetrics();

    // Update cache
    achievementsCache.metrics = metrics;
    achievementsCache.timestamp = now;
    achievementsCache.lastFetch = now;

    console.log("Fetched achievement metrics:", metrics);
    return metrics;
  } catch (error) {
    console.error("Error fetching achievement metrics:", error);
    return null;
  }
}

export async function createAchievement(
  achievement: Omit<Achievement, "id" | "created_at">,
): Promise<Achievement | null> {
  try {
    console.log("Creating achievement:", achievement);

    const result = await createSupabaseAction({
      ...achievement,
      company_name: normalizeCompanyName(achievement.company_name),
    });

    // Invalidate cache so fresh data is fetched
    achievementsCache.achievements = [];
    achievementsCache.metrics = null;
    achievementsCache.timestamp = 0;

    console.log("Achievement created successfully");
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error creating achievement:", errorMsg);
    console.error("Full error object:", error);
    return null;
  }
}

export async function updateAchievement(
  id: string,
  updates: Partial<Omit<Achievement, "id" | "createdAt">>,
): Promise<Achievement | null> {
  try {
    const result = await updateSupabaseAction(id, updates);

    // Invalidate cache so fresh data is fetched
    achievementsCache.achievements = [];
    achievementsCache.metrics = null;
    achievementsCache.timestamp = 0;

    console.log("Achievement updated successfully");
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Error updating achievement:", errorMsg);
    throw error;
  }
}

export async function deleteAchievement(id: string): Promise<boolean> {
  try {
    const result = await deleteSupabaseAction(id);

    // Invalidate cache so fresh data is fetched
    achievementsCache.achievements = [];
    achievementsCache.metrics = null;
    achievementsCache.timestamp = 0;

    console.log("Achievement deleted successfully");
    return result;
  } catch (error) {
    console.error("Error deleting achievement:", error);
    return false;
  }
}
