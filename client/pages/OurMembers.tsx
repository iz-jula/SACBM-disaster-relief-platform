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
      <div className="border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900">Our Members</h1>
          <p className="mt-4 text-lg text-slate-600">
            Meet the companies and organizations making a difference across Mozambique
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 rounded-lg border bg-white px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members or representatives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        ) : filteredMembers.length > 0 ? (
          <>
            <p className="mb-8 text-sm text-slate-600">
              Showing {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((member, index) => (
                <Card
                  key={`${member.company}-${index}`}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all flex flex-col"
                >
                  <CardHeader className="bg-gradient-to-br from-emerald-50 to-slate-50 border-b">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-100 p-3">
                        <Building2 className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-slate-900">
                          {member.company}
                        </CardTitle>
                        <CardDescription className="mt-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {member.representative}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Social Impact Actions</p>
                        <Badge variant="secondary" className="text-base font-semibold">
                          {member.actionCount} action{member.actionCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-600">
                        Committed to creating positive social impact through disaster relief,
                        humanitarian aid, and community support initiatives.
                      </p>
                    </div>
                  </CardContent>

                  <div className="border-t p-4">
                    <Link
                      to={`/gallery?company=${encodeURIComponent(member.company)}`}
                      className="inline-block"
                    >
                      <Button
                        size="sm"
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-12">
            <p className="text-slate-600">No members found matching your search</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default OurMembers;
