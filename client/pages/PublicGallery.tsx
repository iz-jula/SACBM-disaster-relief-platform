import { useEffect, useState } from "react";
import { Search, Filter, Users, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { getAchievements } from "@/services/achievementsService";

const PublicGallery = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const data = await getAchievements();
        setAchievements(data);
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((a: any) => a.category).filter(Boolean))];
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error("Failed to load achievements:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
  }, []);

  // Filter achievements
  useEffect(() => {
    let filtered = achievements;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAchievements(filtered);
  }, [searchTerm, selectedCategory, achievements]);

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2 rounded-lg border bg-white px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
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
