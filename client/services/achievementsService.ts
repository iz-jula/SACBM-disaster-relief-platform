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
}

const achievementsCache: AchievementsCache = {
  achievements: [],
  metrics: null,
  timestamp: 0,
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getAchievements(
  status?: string,
  category?: string,
): Promise<Achievement[]> {
  const now = Date.now();

  // Return cached data if still valid
  if (
    achievementsCache.achievements.length > 0 &&
    now - achievementsCache.timestamp < CACHE_DURATION
  ) {
    let filtered = [...achievementsCache.achievements];
    if (status) {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (category) {
      filtered = filtered.filter((a) => a.category === category);
    }
    return filtered;
  }

  try {
    const achievements = await getSupabaseActions(status, category);
    
    // Update cache
    achievementsCache.achievements = achievements;
    achievementsCache.timestamp = now;

    console.log("Fetched", achievements.length, "achievements");
    return achievements;
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return [];
  }
}

export async function getAchievementsMetrics(): Promise<AchievementsMetrics | null> {
  const now = Date.now();

  // Return cached data if still valid
  if (
    achievementsCache.metrics &&
    now - achievementsCache.timestamp < CACHE_DURATION
  ) {
    return achievementsCache.metrics;
  }

  try {
    const metrics = await getSupabaseActionsMetrics();

    // Update cache
    achievementsCache.metrics = metrics;
    achievementsCache.timestamp = now;

    console.log("Fetched achievement metrics");
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

    // Map from UI field names to database column names
    const dbAction = {
      company_name: achievement.company_name,
      type_action: achievement.type_action,
      description: achievement.description,
      category: achievement.category,
      location: achievement.location,
      partner_organisation: achievement.partner_organisation,
      people_impacted: achievement.people_impacted,
      amount: achievement.amount,
      media: achievement.media,
    };

    const result = await createSupabaseAction(dbAction as any);

    // Invalidate cache so fresh data is fetched
    achievementsCache.achievements = [];
    achievementsCache.metrics = null;
    achievementsCache.timestamp = 0;

    console.log("Achievement created successfully");
    return result;
  } catch (error) {
    console.error("Error creating achievement:", error);
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
    console.error("Error updating achievement:", error);
    return null;
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
