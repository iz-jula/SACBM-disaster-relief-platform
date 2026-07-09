import { RequestHandler } from "express";
import { getActionsMetrics } from "../../client/services/supabaseService";
import { StatsResponse } from "@shared/api";

export const handleGetStats: RequestHandler = async (req, res) => {
  try {
    const metrics = await getActionsMetrics();

    const stats: StatsResponse = {
      totalActions: metrics.totalAchievements,
      peopleImpacted: metrics.totalPeopleImpacted,
      totalContribution: metrics.totalContributed,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      totalActions: 0,
      peopleImpacted: 0,
      totalContribution: 0,
    });
  }
};
