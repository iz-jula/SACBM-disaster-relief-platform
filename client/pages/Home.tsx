import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, HeartHandshake, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getActionsMetrics } from "@/services/supabaseService";

interface Stats {
  totalActions: number;
  peopleImpacted: number;
  totalContribution: number;
}

const Home = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getActionsMetrics().then((metrics) => {
      setStats({
        totalActions: metrics.totalAchievements,
        peopleImpacted: metrics.totalPeopleImpacted,
        totalContribution: metrics.totalContributed,
      });
    });
  }, []);

  const formattedContribution = stats
    ? `${Math.round(stats.totalContribution / 1_000_000).toLocaleString()}M`
    : "—";

  const statCards = [
    {
      label: "Total actions",
      value: stats?.totalActions.toLocaleString() || "—",
      description: "CSR initiatives recorded",
      icon: BarChart3,
    },
    {
      label: "People impacted",
      value: stats?.peopleImpacted.toLocaleString() || "—",
      description: "Lives positively affected",
      icon: Users,
    },
    {
      label: "Total contribution",
      value: formattedContribution,
      description: "MZN committed and deployed",
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <main>
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
            <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Impact at a glance
                </p>
                <h1 className="mt-3 text-3xl font-light tracking-tight text-slate-950 sm:text-5xl">
                  SACBM&apos;s CSR impact
                </h1>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-600">
                A live summary of the difference our members are making across Mozambique.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {statCards.map(({ label, value, description, icon: Icon }) => (
                <div key={label} className="border border-slate-200 bg-white p-7 sm:p-8">
                  <Icon className="h-5 w-5 text-emerald-700" />
                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-3 text-5xl font-light tracking-tight text-slate-950">
                    {value}
                  </p>
                  <p className="mt-3 text-sm text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Corporate social responsibility
            </p>
            <h2 className="mt-4 text-3xl font-light tracking-tight text-slate-950 sm:text-5xl">
              See the work behind the numbers.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Explore the individual initiatives, organizations, and communities represented in this summary.
            </p>
            <div className="mt-8">
              <Link to="/gallery">
                <Button className="bg-emerald-700 text-white hover:bg-emerald-800">
                  View impact gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
};

export default Home;
