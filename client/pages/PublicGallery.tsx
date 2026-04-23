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
      <div className="border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900">Our Impact</h1>
          <p className="mt-4 text-lg text-slate-600">
            Explore the measurable difference our members are making across Mozambique
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex flex-1 items-center gap-2 rounded-lg border bg-white px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:flex-1">
                  <Filter className="h-4 w-4 mr-2" />
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

              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-full sm:flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Companies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:flex-1">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="impact">Most Impact</SelectItem>
                  <SelectItem value="contribution">Highest Contribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== "all" || selectedCompany !== "all") && (
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== "all" && (
                  <Badge variant="secondary">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="ml-2 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCompany !== "all" && (
                  <Badge variant="secondary">
                    Company: {selectedCompany}
                    <button
                      onClick={() => setSelectedCompany("all")}
                      className="ml-2 hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading impact stories...</p>
          </div>
        ) : filteredAchievements.length > 0 ? (
          <>
            <p className="mb-8 text-sm text-slate-600">
              Showing {filteredAchievements.length} impact{filteredAchievements.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col cursor-pointer"
                  onClick={() => setSelectedImpact(achievement)}
                >
                  {/* Image Container */}
                  {achievement.media && achievement.media.length > 0 ? (
                    <div className="relative h-56 w-full overflow-hidden bg-slate-200">
                      <img
                        src={achievement.media[0]}
                        alt={achievement.title}
                        className="h-full w-full object-cover"
                      />
                      {achievement.category && (
                        <div className="absolute top-4 right-4 bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white rounded-md">
                          {achievement.category}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-56 w-full bg-gradient-to-br from-emerald-100 to-slate-100 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-medium text-slate-600">No Image</p>
                      </div>
                      {achievement.category && (
                        <div className="absolute top-4 right-4 bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white rounded-md">
                          {achievement.category}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Content */}
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 text-lg text-slate-900">
                      {achievement.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-slate-600 mt-1">
                      {achievement.company_name}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    {/* Description */}
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {achievement.description}
                    </p>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* People Impacted */}
                      {achievement.people_impacted && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-600 mb-1">People Impacted</p>
                          <p className="text-lg font-bold text-blue-700">
                            {achievement.people_impacted.toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Contribution */}
                      {achievement.amount && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-600 mb-1">Contribution</p>
                          <p className="text-lg font-bold text-green-700">
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-12">
            <p className="text-slate-600">No impact stories found matching your filters</p>
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
