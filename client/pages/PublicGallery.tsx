import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Users, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { getAchievements } from "@/services/achievementsService";

const PublicGallery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);

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

  // Filter achievements
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

    setFilteredAchievements(filtered);
  }, [searchTerm, selectedCategory, selectedCompany, achievements]);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Header */}
      <div className="border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900">Actions Gallery</h1>
          <p className="mt-4 text-lg text-slate-600">
            Browse member actions making a real difference across Mozambique
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
            <p className="text-muted-foreground">Loading actions...</p>
          </div>
        ) : filteredAchievements.length > 0 ? (
          <>
            <p className="mb-8 text-sm text-slate-600">
              Showing {filteredAchievements.length} action{filteredAchievements.length !== 1 ? "s" : ""}
            </p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  {achievement.media && achievement.media.length > 0 ? (
                    <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                      <img
                        src={achievement.media[0]}
                        alt={achievement.title}
                        className="h-full w-full object-cover"
                      />
                      {achievement.category && (
                        <div className="absolute top-4 right-4 rounded-full bg-emerald-700 px-3 py-1 text-xs font-medium text-white">
                          {achievement.category}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-emerald-100 to-slate-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-slate-600">No image</span>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg text-slate-900">{achievement.title}</CardTitle>
                    <CardDescription className="line-clamp-3 text-slate-600">
                      {achievement.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      {achievement.peopleImpacted && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Users className="mr-2 h-4 w-4" />
                          <span>{achievement.peopleImpacted} people impacted</span>
                        </div>
                      )}
                      {achievement.date && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{new Date(achievement.date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {achievement.location && (
                        <div className="text-sm text-slate-600">
                          📍 {achievement.location}
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
            <p className="text-slate-600">No actions found matching your filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicGallery;
