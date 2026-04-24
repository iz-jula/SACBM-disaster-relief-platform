import { useState, useEffect } from "react";
import { getApprovedMembers } from "@/services/supabaseService";
import { getActionsMetrics } from "@/services/supabaseService";

interface ActionMetrics {
  totalAchievements: number;
  completedAchievements: number;
  inProgressAchievements: number;
  totalPeopleImpacted: number;
  totalContributed: number;
  averageImpact: number;
}

const MembersActionsSummary = () => {
  const [memberCount, setMemberCount] = useState(0);
  const [metrics, setMetrics] = useState<ActionMetrics>({
    totalAchievements: 0,
    completedAchievements: 0,
    inProgressAchievements: 0,
    totalPeopleImpacted: 0,
    totalContributed: 0,
    averageImpact: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch member count
        const members = await getApprovedMembers();
        setMemberCount(members.length);

        // Fetch action metrics
        const actionMetrics = await getActionsMetrics();
        setMetrics(actionMetrics);
      } catch (error) {
        console.error("Error loading summary data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      label: "Members",
      value: memberCount,
      icon: "👥",
    },
    {
      label: "Actions",
      value: metrics.totalAchievements,
      icon: "⚡",
    },
    {
      label: "People Impacted",
      value: metrics.totalPeopleImpacted.toLocaleString(),
      icon: "🤝",
    },
    {
      label: "Total Value (MZN)",
      value: metrics.totalContributed.toLocaleString(),
      icon: "💰",
    },
  ];

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 sm:px-8 py-20 sm:py-28">
        <div className="h-32 bg-slate-200 rounded-lg animate-pulse" />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 sm:px-8 py-20 sm:py-28">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="text-3xl sm:text-4xl font-light text-slate-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MembersActionsSummary;
