import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { ArrowRight, Search, Building2, User } from "lucide-react";
import { getAchievements } from "@/services/achievementsService";

interface Member {
  company: string;
  representative: string;
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
        const memberMap = new Map<string, { representative: string; count: number }>();

        achievements.forEach((achievement: any) => {
          const company = achievement.company_name || "Unknown Company";
          const representative = achievement.submittedBy || "Unknown Representative";

          if (!memberMap.has(company)) {
            memberMap.set(company, { representative, count: 0 });
          }

          const member = memberMap.get(company)!;
          member.count += 1;
        });

        // Convert to array
        const membersList: Member[] = Array.from(memberMap.entries()).map(
          ([company, { representative, count }]) => ({
            company,
            representative,
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
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member, index) => (
                <Card
                  key={`${member.company}-${index}`}
                  className="overflow-hidden border border-slate-200 shadow-none hover:shadow-md transition-all flex flex-col"
                >
                  <CardHeader className="border-b border-slate-200 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="rounded p-2.5 bg-slate-100">
                        <Building2 className="h-5 w-5 text-slate-700" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold text-slate-900 leading-tight">
                          {member.company}
                        </CardTitle>
                        <CardDescription className="mt-3 flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <User className="h-4 w-4" />
                          {member.representative}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pt-6 space-y-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Social Impact Actions</p>
                      <p className="text-lg font-light text-slate-900">
                        {member.actionCount}
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      Committed to creating positive social impact through disaster relief,
                      humanitarian aid, and community support initiatives.
                    </p>
                  </CardContent>

                  <div className="border-t border-slate-200 p-4">
                    <Link
                      to={`/gallery?company=${encodeURIComponent(member.company)}`}
                      className="block"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                      >
                        View Their Impact
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
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
