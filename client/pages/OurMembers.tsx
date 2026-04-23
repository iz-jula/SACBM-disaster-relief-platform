import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { ArrowRight, Search, X } from "lucide-react";
import { getAchievements } from "@/services/achievementsService";

interface Member {
  company: string;
  actionCount: number;
  description?: string;
  sector?: string;
  image?: string;
  totalPeopleImpacted?: number;
  totalContribution?: number;
}

const OurMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const achievements = await getAchievements();

        // Group achievements by company and aggregate metrics
        const memberMap = new Map<string, {
          count: number;
          image?: string;
          totalPeopleImpacted: number;
          totalContribution: number;
        }>();

        achievements.forEach((achievement: any) => {
          const company = achievement.company_name || "Unknown Company";

          if (!memberMap.has(company)) {
            memberMap.set(company, {
              count: 0,
              totalPeopleImpacted: 0,
              totalContribution: 0,
            });
          }

          const member = memberMap.get(company)!;
          member.count += 1;
          member.totalPeopleImpacted += achievement.people_impacted || 0;
          member.totalContribution += achievement.amount || 0;

          // Get first image from first achievement for this company
          if (!member.image && achievement.media && achievement.media.length > 0) {
            let media = achievement.media;
            if (typeof media === "string") {
              try {
                media = JSON.parse(media);
              } catch {
                media = [media];
              }
            }
            if (Array.isArray(media) && media.length > 0) {
              member.image = media[0];
            }
          }
        });

        // Convert to array with member details
        // Map company names to sectors and images
        const sectorMap: Record<string, { sector: string; image?: string }> = {
          "Coca Cola": {
            sector: "Beverages & Consumer Goods",
            image: "https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2Ffd781964b761486d9ddd8f310d955099?format=webp&width=800&height=1200",
          },
          "McDonald's": {
            sector: "Food & Beverage",
          },
          // Add more as needed
        };

        const membersList: Member[] = Array.from(memberMap.entries()).map(
          ([company, { count, image, totalPeopleImpacted, totalContribution }]) => {
            const companyConfig = sectorMap[company];
            return {
              company,
              actionCount: count,
              image: image || companyConfig?.image,
              totalPeopleImpacted,
              totalContribution,
              sector: companyConfig?.sector || "Business & Commerce",
              description: `Leading organization committed to creating positive social impact across Mozambique.`,
            };
          }
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
        member.sector?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  }, [searchTerm, members]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedMember(null);
      }
    };
    if (selectedMember) {
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [selectedMember]);

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
            <div className="space-y-6">
              {filteredMembers.map((member, index) => {
                // Generate gradient colors for visual interest (fallback)
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
                  <button
                    key={`${member.company}-${index}`}
                    onClick={() => setSelectedMember(member)}
                    className="w-full group text-left"
                  >
                    <div
                      className="relative h-48 sm:h-64 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                      style={
                        member.image
                          ? {
                              backgroundImage: `url(${member.image})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    >
                      {/* Fallback gradient if no image */}
                      {!member.image && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/40" />

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-between p-6 sm:p-8 text-white">
                        {/* Right side - Metrics */}
                        <div className="text-right self-end">
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/80 mb-1">
                            Total Actions
                          </p>
                          <p className="text-3xl sm:text-4xl font-light text-white">
                            {member.actionCount}
                          </p>
                        </div>

                        {/* Left side - Name */}
                        <div className="self-start">
                          <h3 className="text-3xl sm:text-4xl font-light text-white leading-tight max-w-xl">
                            {member.company}
                          </h3>
                          {member.sector && (
                            <p className="text-sm text-white/70 mt-2">{member.sector}</p>
                          )}
                        </div>
                      </div>

                      {/* Hover Button */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          className="bg-white hover:bg-slate-100 text-slate-900 font-medium"
                        >
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </button>
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

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-50 border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 py-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light tracking-tight text-slate-900">
                  {selectedMember.company}
                </h1>
                {selectedMember.sector && (
                  <p className="mt-1 text-sm text-slate-600">{selectedMember.sector}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="rounded-full p-2 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mx-auto max-w-6xl px-6 sm:px-8 py-12 lg:py-16">
            <div className="grid gap-12 lg:grid-cols-3">
              {/* Image - Left Column */}
              <div className="lg:col-span-1">
                {selectedMember.image ? (
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.company}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <p className="text-slate-500">No image available</p>
                  </div>
                )}
              </div>

              {/* Details - Right Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                {selectedMember.description && (
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                      About
                    </h2>
                    <p className="text-base leading-relaxed text-slate-700">
                      {selectedMember.description}
                    </p>
                  </div>
                )}

                {/* Impact Summary */}
                <div className="border-t border-slate-200 pt-8">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
                    Impact Summary
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Total Actions */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                        Total Actions
                      </p>
                      <p className="text-4xl font-light text-slate-900">
                        {selectedMember.actionCount}
                      </p>
                    </div>

                    {/* People Impacted */}
                    {selectedMember.totalPeopleImpacted > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Total People Impacted
                        </p>
                        <p className="text-4xl font-light text-slate-900">
                          {selectedMember.totalPeopleImpacted.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* Total Contribution */}
                    {selectedMember.totalContribution > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Total Contribution
                        </p>
                        <p className="text-4xl font-light text-slate-900">
                          {(selectedMember.totalContribution / 1000).toFixed(0)}K MZN
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Their Impact Link */}
                <div className="border-t border-slate-200 pt-8">
                  <Link to={`/gallery?company=${encodeURIComponent(selectedMember.company)}`}>
                    <Button
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium"
                      onClick={() => setSelectedMember(null)}
                    >
                      View Their Impact Actions
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-white py-8 mt-12">
            <div className="mx-auto max-w-6xl px-6 sm:px-8 flex justify-between items-center">
              <Button
                onClick={() => setSelectedMember(null)}
                variant="outline"
                className="text-slate-700 border-slate-300 hover:bg-slate-50"
              >
                Close
              </Button>
              <p className="text-xs text-slate-500">Or press ESC</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {!selectedMember && <PublicFooter />}
    </div>
  );
};

export default OurMembers;
