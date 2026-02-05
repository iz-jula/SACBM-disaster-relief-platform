export interface Achievement {
  id: string;
  memberName: string;
  title: string;
  description: string;
  category: "Food" | "Clothing" | "Materials" | "Medical" | "Shelter" | "Water" | "Evacuation" | "Multiple";
  location: string;
  peopleImpacted: number;
  amountContributed: number;
  status: "completed" | "in_progress" | "pending";
  createdAt: string;
  completedAt?: string;
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
}

const achievementsCache: AchievementsCache = {
  achievements: [],
  metrics: null,
  timestamp: 0,
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getAchievements(
  status?: string,
  category?: string
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
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (category) params.append("category", category);

    const queryString = params.toString();
    const url = `/api/achievements${queryString ? "?" + queryString : ""}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Failed to fetch achievements:", response.statusText);
      return [];
    }

    const data = await response.json();

    // Update cache
    achievementsCache.achievements = data.achievements || [];
    achievementsCache.timestamp = now;

    console.log("Fetched", data.achievements?.length || 0, "achievements");
    return data.achievements || [];
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
    const response = await fetch("/api/achievements/metrics");

    if (!response.ok) {
      console.error("Failed to fetch achievement metrics:", response.statusText);
      return null;
    }

    const data = await response.json();

    // Update cache
    achievementsCache.metrics = data;
    achievementsCache.timestamp = now;

    console.log("Fetched achievement metrics");
    return data;
  } catch (error) {
    console.error("Error fetching achievement metrics:", error);
    return null;
  }
}

export async function createAchievement(achievement: Omit<Achievement, 'id' | 'createdAt'>): Promise<Achievement | null> {
  try {
    const response = await fetch("/api/achievements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(achievement),
    });

    if (!response.ok) {
      console.error("Failed to create achievement:", response.statusText);
      return null;
    }

    const data = await response.json();

    // Invalidate cache so fresh data is fetched
    achievementsCache.achievements = [];
    achievementsCache.metrics = null;
    achievementsCache.timestamp = 0;

    console.log("Achievement created successfully");
    return data.achievement || null;
  } catch (error) {
    console.error("Error creating achievement:", error);
    return null;
  }
}
