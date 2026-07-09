import { RequestHandler } from "express";
import { StatsResponse } from "@shared/api";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export const handleGetStats: RequestHandler = async (req, res) => {
  try {
    // Query actions_table for metrics
    const { data, error } = await supabase
      .from("actions_table")
      .select("id,people_impacted,amount");

    if (error) {
      console.error("Supabase error:", error);
      return res.json({
        totalActions: 0,
        peopleImpacted: 0,
        totalContribution: 0,
      });
    }

    const actions = data || [];
    const totalActions = actions.length;
    const peopleImpacted = actions.reduce(
      (sum: number, a: any) => sum + (a.people_impacted || 0),
      0
    );
    const totalContribution = actions.reduce(
      (sum: number, a: any) => sum + (a.amount || 0),
      0
    );

    const stats: StatsResponse = {
      totalActions,
      peopleImpacted,
      totalContribution,
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
