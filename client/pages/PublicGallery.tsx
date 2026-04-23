import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Users, Calendar, X, TrendingUp, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import ImpactDetailModal from "@/components/ImpactDetailModal";
import { getAchievements } from "@/services/achievementsService";

const PublicGallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [selectedImpact, setSelectedImpact] = useState<any>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const data = await getAchievements();
        setAchievements(data);
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((a: any) => a.category).filter(Boolean))];
        setCategories(uniqueCategories as string[]);
        // Extract unique companies
        const uniqueCompanies = [...new Set(data.map((a: any) => a.company_name).filter(Boolean))];
        setCompanies(uniqueCompanies as string[]);

        // Check if company filter is in URL params
        const companyParam = searchParams.get("company");
        if (companyParam) {
          setSelectedCompany(companyParam);
        }
      } catch (error) {
        console.error("Failed to load achievements:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
  }, [searchParams]);

  // Filter and sort achievements
  useEffect(() => {
    let filtered = achievements;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (selectedCompany !== "all") {
      filtered = filtered.filter((a) => a.company_name === selectedCompany);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case "recent":
        sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case "impact":
        sorted.sort((a, b) => (b.people_impacted || 0) - (a.people_impacted || 0));
        break;
      case "contribution":
        sorted.sort((a, b) => (b.amount || 0) - (a.amount || 0));
        break;
      default:
        break;
    }

    setFilteredAchievements(sorted);
  }, [searchTerm, selectedCategory, selectedCompany, sortBy, achievements]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 sm:py-20">
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-slate-900">
            Our Impact
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-2xl">
            Explore the measurable difference our members are making across Mozambique through social responsibility initiatives
          </p>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 py-8">
          <div className="flex flex-col gap-6">
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-6">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent text-sm placeholder-slate-400 focus-visible:ring-0"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Category
                </p>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full border-slate-200 text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Member
                </p>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-full border-slate-200 text-sm">
                    <SelectValue placeholder="All Members" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Sort By
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full border-slate-200 text-sm">
                    <SelectValue placeholder="Most Recent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="impact">Most Impact</SelectItem>
                    <SelectItem value="contribution">Highest Contribution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters - More Minimal */}
            {(selectedCategory !== "all" || selectedCompany !== "all") && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedCategory !== "all" && (
                  <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded flex items-center gap-2">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="hover:text-slate-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCompany !== "all" && (
                  <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded flex items-center gap-2">
                    {selectedCompany}
                    <button
                      onClick={() => setSelectedCompany("all")}
                      className="hover:text-slate-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="mx-auto max-w-7xl px-6 sm:px-8 py-16 sm:py-24 lg:py-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Loading impact stories...</p>
          </div>
        ) : filteredAchievements.length > 0 ? (
          <>
            <p className="mb-12 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {filteredAchievements.length} Impact{filteredAchievements.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="overflow-hidden border border-slate-200 shadow-none hover:shadow-md transition-all flex flex-col cursor-pointer"
                  onClick={() => setSelectedImpact(achievement)}
                >
                  {/* Image Container */}
                  {achievement.media && achievement.media.length > 0 ? (
                    <div className="relative h-56 w-full overflow-hidden bg-slate-200 group">
                      <img
                        src={achievement.media[0]}
                        alt={achievement.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <Button
                          variant="secondary"
                          className="bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImpact(achievement);
                          }}
                        >
                          View More
                        </Button>
                      </div>

                      {achievement.category && (
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white rounded">
                          {achievement.category}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-56 w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs font-medium text-slate-600">No Image</p>
                      </div>
                      {achievement.category && (
                        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white rounded">
                          {achievement.category}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content */}
                  <CardHeader className="pb-4 border-b border-slate-200">
                    <CardTitle className="line-clamp-2 text-base font-semibold text-slate-900 leading-tight">
                      {achievement.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 text-xs text-slate-500 mt-2 font-medium">
                      {achievement.company_name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 pt-4">
                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {achievement.description}
                    </p>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* People Impacted */}
                      {achievement.people_impacted && (
                        <div className="bg-slate-50 rounded p-3 border border-slate-200">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">People</p>
                          <p className="text-lg font-light text-slate-900">
                            {achievement.people_impacted.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Contribution */}
                      {achievement.amount && (
                        <div className="bg-slate-50 rounded p-3 border border-slate-200">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Contrib.</p>
                          <p className="text-lg font-light text-slate-900">
                            {(achievement.amount / 1000).toFixed(0)}K MZN
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Partner Organization */}
                    {achievement.partner_organisation && (
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs font-medium text-slate-600">Partner</p>
                        <p className="text-sm text-slate-700 font-medium mt-1">
                          {achievement.partner_organisation}
                        </p>
                      </div>
                    )}

                    {/* Location and Date */}
                    <div className="border-t border-slate-200 pt-3 space-y-2">
                      {achievement.location && (
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-slate-600">Location:</span>
                          <span className="text-sm font-medium text-slate-700">{achievement.location}</span>
                        </div>
                      )}
                      {achievement.created_at && (
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-600">
                            {new Date(achievement.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-slate-500 text-sm">No impact stories found matching your filters</p>
          </div>
        )}
      </div>

      {/* Impact Detail Modal */}
      {selectedImpact && (
        <ImpactDetailModal
          impact={selectedImpact}
          onClose={() => setSelectedImpact(null)}
        />
      )}

      {/* Footer */}
      {!selectedImpact && <PublicFooter />}
    </div>
  );
};

export default PublicGallery;
