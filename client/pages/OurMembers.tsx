import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { ArrowRight, Search } from "lucide-react";
import { getAchievements } from "@/services/achievementsService";

interface Member {
  company: string;
  actionCount: number;
  description?: string;
}

const OurMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const achievements = await getAchievements();

        // Group achievements by company
        const memberMap = new Map<string, { count: number }>();

        achievements.forEach((achievement: any) => {
          const company = achievement.company_name || "Unknown Company";

          if (!memberMap.has(company)) {
            memberMap.set(company, { count: 0 });
          }

          const member = memberMap.get(company)!;
          member.count += 1;
        });

        // Convert to array
        const membersList: Member[] = Array.from(memberMap.entries()).map(
          ([company, { count }]) => ({
            company,
            actionCount: count,
          })
        );

        setMembers(membersList);
        setFilteredMembers(membersList);
      } catch (error) {
        console.error("Failed to load members:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  // Filter members based on search
  useEffect(() => {
    const filtered = members.filter(
      (member) =>
        member.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.representative.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 sm:py-20">
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-slate-900">
            Our Members
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl">
            Meet the companies and organizations making a difference across Mozambique
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-8">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-6">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search members or representatives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent text-sm placeholder-slate-400 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 sm:py-24 lg:py-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Loading members...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <>
            <p className="mb-12 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {filteredMembers.length} Member{filteredMembers.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member, index) => {
                // Generate gradient colors for visual interest
                const gradients = [
                  "from-emerald-600 to-teal-700",
                  "from-slate-800 to-slate-900",
                  "from-blue-600 to-indigo-700",
                  "from-amber-600 to-orange-700",
                  "from-rose-600 to-pink-700",
                  "from-violet-600 to-purple-700",
                ];
                const gradient = gradients[index % gradients.length];

                return (
                  <Link
                    key={`${member.company}-${index}`}
                    to={`/gallery?company=${encodeURIComponent(member.company)}`}
                    className="group"
                  >
                    <div className={`bg-gradient-to-br ${gradient} rounded-lg overflow-hidden h-64 sm:h-72 relative flex flex-col items-end justify-between p-6 sm:p-8 hover:shadow-lg transition-shadow cursor-pointer`}>
                      {/* Top Right: Action Count */}
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                          Impact Actions
                        </p>
                        <p className="text-4xl sm:text-5xl font-light text-white">
                          {member.actionCount}
                        </p>
                      </div>

                      {/* Bottom: Company Name */}
                      <h3 className="text-2xl sm:text-3xl font-light text-white leading-tight max-w-full text-left self-start">
                        {member.company}
                      </h3>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          className="bg-white hover:bg-slate-100 text-slate-900 font-medium"
                          onClick={(e) => e.preventDefault()}
                        >
                          View Impact
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-slate-500 text-sm">No members found matching your search</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default OurMembers;
