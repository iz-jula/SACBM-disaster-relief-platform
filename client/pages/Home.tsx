import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Users, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { getAchievements, getAchievementsMetrics } from "@/services/achievementsService";
import { getMetrics } from "@/services/requestsService";

const Home = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementsMetrics, setAchievementsMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [achievementsData, metricsData] = await Promise.all([
          getAchievements(),
          getAchievementsMetrics(),
        ]);
        setAchievements(achievementsData.slice(0, 6)); // Featured 6
        setAchievementsMetrics(metricsData);
      } catch (error) {
        console.error("Failed to load home data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Making a Difference<br />
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Together
            </span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground sm:text-2xl">
            Discover how our chamber members are creating meaningful social impact across the community through disaster relief, humanitarian aid, and community support.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center sm:gap-6">
            <Link to="/gallery">
              <Button size="lg" className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700">
                Explore Actions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 right-0 h-80 w-80 rounded-full bg-orange-200 opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-blue-200 opacity-20 blur-3xl" />
      </section>

      {/* Impact Metrics Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Our Impact</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real numbers showing the difference we&apos;re making together
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Actions</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {achievementsMetrics?.totalAchievements || 0}
                  </p>
                </div>
                <Award className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">People Impacted</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {achievementsMetrics?.totalPeopleImpacted
                      ? (achievementsMetrics.totalPeopleImpacted / 1000).toFixed(1) + "K"
                      : "0"}
                  </p>
                </div>
                <Users className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contribution</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    ${achievementsMetrics?.totalContributed || 0}
                  </p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Members</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {achievementsMetrics?.completedAchievements || 0}
                  </p>
                </div>
                <Heart className="h-12 w-12 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Actions Gallery */}
      {!loading && achievements.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Featured Actions</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Stories of impact from our community members
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                {achievement.media && achievement.media.length > 0 && (
                  <div className="relative h-48 w-full overflow-hidden bg-muted">
                    <img
                      src={achievement.media[0]}
                      alt={achievement.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{achievement.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {achievement.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {achievement.peopleImpacted && (
                      <p className="flex items-center text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {achievement.peopleImpacted} people impacted
                      </p>
                    )}
                    {achievement.category && (
                      <p className="inline-block rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                        {achievement.category}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/gallery">
              <Button size="lg" variant="outline">
                View All Actions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Card className="border-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Join Our Mission</CardTitle>
            <CardDescription className="text-orange-100">
              Are you a member? Submit your social responsibility actions and help showcase our collective impact.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button size="lg" variant="secondary" className="bg-white hover:bg-orange-50">
                Member Portal
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default Home;
