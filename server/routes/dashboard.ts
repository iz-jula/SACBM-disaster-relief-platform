import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache for dashboard data to prevent redundant calls within short timeframe
interface DashboardCache {
  data: any;
  timestamp: number;
}

const dashboardCache: DashboardCache = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes server-side cache

export async function handleGetDashboardData(req: any, res: any) {
  try {
    const now = Date.now();

    // Return cached data if still valid
    if (
      dashboardCache.data &&
      now - dashboardCache.timestamp < CACHE_DURATION
    ) {
      console.log("[Dashboard] Returning cached dashboard data");
      return res.json(dashboardCache.data);
    }

    console.log("[Dashboard] Fetching fresh dashboard data from Supabase...");
    console.time("Dashboard data fetch");

    // Use Promise.allSettled to handle individual query timeouts gracefully
    const results = await Promise.allSettled([
      // Recent relief requests (limited to 5)
      supabase
        .from("relief_requests")
        .select("id,originator,location,people,value,status,created_at")
        .order("created_at", { ascending: false })
        .limit(5),

      // Achievements count only (much faster than fetching all rows)
      supabase
        .from("actions_table")
        .select("id", { count: "exact", head: true }),

      // Recent achievements (for images gallery, limited to 20)
      supabase
        .from("actions_table")
        .select("id,company_name,type_action,location,media,created_at,people_impacted,amount")
        .order("created_at", { ascending: false })
        .limit(20),

      // INGD count only (much faster than fetching all rows)
      supabase
        .from("INGD_table")
        .select("id", { count: "exact", head: true }),

      // Recent INGD requests (limited to 5)
      supabase
        .from("INGD_table")
        .select("id,created_at,Item,category,people_impacted,Total,quantity,status,resolved_by,company_name_action")
        .order("created_at", { ascending: false })
        .limit(5),

      // INGD documents
      supabase
        .from("ingd_documents")
        .select("id,created_at,file_name,file_url,file_type,description,type")
        .order("created_at", { ascending: false })
        .limit(10),

      // INGD active setting
      supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "ingd_active")
        .single(),
    ]);

    // Extract values from settled promises
    const recentRequestsData = results[0].status === "fulfilled" ? results[0].value : { data: null, error: null };
    const achievementsCountData = results[1].status === "fulfilled" ? results[1].value : { data: null, error: null };
    const achievementsData = results[2].status === "fulfilled" ? results[2].value : { data: null, error: null };
    const ingdCountData = results[3].status === "fulfilled" ? results[3].value : { data: null, error: null };
    const ingdRequestsData = results[4].status === "fulfilled" ? results[4].value : { data: null, error: null };
    const ingdDocumentsData = results[5].status === "fulfilled" ? results[5].value : { data: null, error: null };
    const ingdActiveData = results[6].status === "fulfilled" ? results[6].value : { data: null, error: null };

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.warn(`[Dashboard] Query ${index} failed:`, result.reason);
      }
    });

    // Check for errors
    if (recentRequestsData.error) throw recentRequestsData.error;
    if (achievementsCountData.error) throw achievementsCountData.error;
    if (achievementsData.error) throw achievementsData.error;
    if (ingdCountData.error) throw ingdCountData.error;
    if (ingdRequestsData.error) throw ingdRequestsData.error;
    if (ingdDocumentsData.error) throw ingdDocumentsData.error;
    if (ingdActiveData.error) throw ingdActiveData.error;

    // Get counts from head queries (much faster!)
    const totalAchievements = achievementsCountData.count || 0;
    const ingdTotalRequests = ingdCountData.count || 0;

    // Process recent requests for metrics (we only have 5, so estimate from sample)
    const recentRequestsRaw = recentRequestsData.data || [];
    const totalRequests = Math.max(5, recentRequestsRaw.length); // At least 5
    const metRequests = recentRequestsRaw.filter((r: any) => r.status === true).length;
    const pendingRequests = recentRequestsRaw.filter(
      (r: any) => r.status === false
    ).length;

    const totalPeopleAssisted = recentRequestsRaw
      .filter((r: any) => r.status === true)
      .reduce((sum: number, r: any) => {
        const people = parseInt(r.people || "0", 10);
        return sum + (isNaN(people) ? 0 : people);
      }, 0);

    const totalValueDeployed = recentRequestsRaw
      .filter((r: any) => r.status === true)
      .reduce((sum: number, r: any) => {
        const value = parseInt(r.value || "0", 10);
        return sum + (isNaN(value) ? 0 : value);
      }, 0);

    // Process achievements data to compute metrics from sample
    const achievementsRaw = achievementsData.data || [];
    const totalPeopleImpacted = achievementsRaw.reduce(
      (sum: number, a: any) => sum + (a.people_impacted || 0),
      0
    );
    const totalContributed = achievementsRaw.reduce(
      (sum: number, a: any) => sum + (a.amount || 0),
      0
    );

    // INGD metrics from recent requests
    const ingdRequestsRaw = ingdRequestsData.data || [];
    const ingdTotalPeople = ingdRequestsRaw.reduce(
      (sum: number, r: any) => sum + (r.people_impacted || 0),
      0
    );
    const ingdTotalValue = ingdRequestsRaw.reduce(
      (sum: number, r: any) => sum + (r.Total || 0),
      0
    );

    // Get INGD active setting
    const ingdActive =
      ingdActiveData.data?.setting_value === true ||
      ingdActiveData.data?.setting_value === "true";

    // Process government documents
    const ingdDocsData = ingdDocumentsData.data || [];
    const govDocs = ingdDocsData.filter(
      (doc: any) =>
        doc.type === "government_priority" ||
        doc.description?.toLowerCase().includes("government") ||
        doc.description?.toLowerCase().includes("priority")
    );

    const dashboardData = {
      recentRequests: recentRequestsRaw,
      metrics: {
        totalRequests,
        totalPeopleAssisted,
        totalValueDeployed,
        averagePerRequest:
          totalRequests > 0 ? totalValueDeployed / totalRequests : 0,
        metRequests,
        pendingRequests,
        partiallyMet: 0,
      },
      achievementsMetrics: {
        totalAchievements,
        completedAchievements: totalAchievements,
        inProgressAchievements: 0,
        totalPeopleImpacted,
        totalContributed,
        averageImpact:
          totalAchievements > 0
            ? Math.round(totalPeopleImpacted / totalAchievements)
            : 0,
      },
      ingdMetrics: {
        totalRequests: ingdTotalRequests,
        totalPeople: ingdTotalPeople,
        totalValue: ingdTotalValue,
        averagePerRequest:
          ingdTotalRequests > 0 ? ingdTotalValue / ingdTotalRequests : 0,
      },
      recentIngdRequests: ingdRequestsRaw,
      achievements: achievementsRaw,
      governmentDocument:
        govDocs.length > 0 ? govDocs[0] : null,
      ingdActive,
    };

    console.timeEnd("Dashboard data fetch");

    // Cache the result
    dashboardCache.data = dashboardData;
    dashboardCache.timestamp = now;

    res.json(dashboardData);
  } catch (error) {
    console.error("[Dashboard] Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
}
