import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import {
  Award,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  MapPin,
  ImagePlus,
  X,
  Plus,
} from "lucide-react";
import {
  getAchievements,
  getAchievementsMetrics,
  createAchievement,
  Achievement,
  AchievementsMetrics,
} from "@/services/achievementsService";

const CATEGORY_COLORS: Record<string, string> = {
  Training: "bg-blue-100 text-blue-800",
  "Community Work": "bg-green-100 text-green-800",
  Infrastructure: "bg-orange-100 text-orange-800",
  Advocacy: "bg-purple-100 text-purple-800",
  Research: "bg-pink-100 text-pink-800",
};

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-50 border-green-200 text-green-900",
  in_progress: "bg-blue-50 border-blue-200 text-blue-900",
  pending: "bg-yellow-50 border-yellow-200 text-yellow-900",
};

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle size={16} className="text-green-600" />;
    case "in_progress":
      return <Clock size={16} className="text-blue-600" />;
    case "pending":
      return <Clock size={16} className="text-yellow-600" />;
    default:
      return null;
  }
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [metrics, setMetrics] = useState<AchievementsMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    memberName: "",
    title: "",
    description: "",
    category: "Training" as const,
    location: "",
    peopleImpacted: "",
    amountContributed: "",
  });

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [achievementsData, metricsData] = await Promise.all([
        getAchievements(selectedStatus || undefined, selectedCategory || undefined),
        getAchievementsMetrics(),
      ]);
      setAchievements(achievementsData);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error loading achievements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedMedia([...uploadedMedia, ...Array.from(files)]);
    }
  };

  const removeMedia = (index: number) => {
    setUploadedMedia(uploadedMedia.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create new achievement
      const newAchievement: Achievement = {
        id: `ach-${Date.now()}`,
        memberName: formData.memberName,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        peopleImpacted: parseInt(formData.peopleImpacted) || 0,
        amountContributed: parseInt(formData.amountContributed) || 0,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // TODO: Upload media to Supabase storage and attach to achievement
      // For now, we'll just add the achievement to the list

      // Reset form
      setFormData({
        memberName: "",
        title: "",
        description: "",
        category: "Training",
        location: "",
        peopleImpacted: "",
        amountContributed: "",
      });
      setUploadedMedia([]);
      setShowForm(false);

      // Reload data
      await loadData();
    } catch (error) {
      console.error("Error submitting achievement:", error);
    }
  };

  const categories = [
    "Training",
    "Community Work",
    "Infrastructure",
    "Advocacy",
    "Research",
  ];
  const statuses = [
    { value: "completed", label: "Completed" },
    { value: "in_progress", label: "In Progress" },
    { value: "pending", label: "Pending" },
  ];

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Member Achievements
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Track community work and contributions beyond relief requests
          </p>
        </div>

        {/* Key Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    Total Achievements
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                    {metrics.totalAchievements}
                  </p>
                </div>
                <div className="bg-blue-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
                  <Award size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3">
                Member contributions
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    People Impacted
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                    {(metrics.totalPeopleImpacted || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
                  <Users size={20} className="text-green-600 sm:w-6 sm:h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3">
                Direct impact
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    Total Contribution
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-primary mt-1 sm:mt-2">
                    {((metrics.totalContributed || 0) / 1000).toFixed(1)}K MZN
                  </p>
                </div>
                <div className="bg-orange-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
                  <TrendingUp size={20} className="text-primary sm:w-6 sm:h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3">
                Funds invested
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-slate-600 text-xs sm:text-sm font-medium">
                    Completed
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">
                    {metrics.completedAchievements}
                  </p>
                </div>
                <div className="bg-purple-100 rounded-lg p-2 sm:p-3 flex-shrink-0">
                  <CheckCircle size={20} className="text-purple-600 sm:w-6 sm:h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 sm:mt-3">
                Successfully done
              </p>
            </div>
          </div>
        )}

        {/* Submit Achievement Form */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-blue-50 to-primary/5 hover:from-blue-100 hover:to-primary/10 transition-all border-b border-slate-200"
          >
            <div className="flex items-center gap-3">
              <Plus size={20} className="text-primary" />
              <h3 className="font-semibold text-slate-900">Submit Your Achievement</h3>
            </div>
            <span className="text-slate-600">{showForm ? "−" : "+"}</span>
          </button>

          {showForm && (
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Member Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.memberName}
                    onChange={(e) =>
                      setFormData({ ...formData, memberName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Doe"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Achievement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Community Training Program"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Training</option>
                    <option>Community Work</option>
                    <option>Infrastructure</option>
                    <option>Advocacy</option>
                    <option>Research</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Sofala Province"
                  />
                </div>

                {/* People Impacted */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    People Impacted *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.peopleImpacted}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        peopleImpacted: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="120"
                  />
                </div>

                {/* Amount Contributed */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Amount Contributed (MZN) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.amountContributed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amountContributed: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="8500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your achievement and impact..."
                  rows={3}
                />
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Media (Photos, Documents)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={handleMediaUpload}
                    className="hidden"
                    id="media-upload"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="media-upload"
                    className="flex items-center justify-center gap-2 cursor-pointer hover:text-primary transition-colors"
                  >
                    <ImagePlus size={20} className="text-slate-600" />
                    <span className="text-sm text-slate-600">
                      Click to upload media
                    </span>
                  </label>
                </div>

                {/* Uploaded Media Preview */}
                {uploadedMedia.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedMedia.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200"
                      >
                        <span className="text-sm text-slate-700 truncate">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Submit Achievement
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setUploadedMedia([]);
                    setFormData({
                      memberName: "",
                      title: "",
                      description: "",
                      category: "Training",
                      location: "",
                      peopleImpacted: "",
                      amountContributed: "",
                    });
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-all ${
                    selectedCategory === null
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedStatus(null)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-all ${
                    selectedStatus === null
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                {statuses.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setSelectedStatus(status.value)}
                    className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-all ${
                      selectedStatus === status.value
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements List */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Member Work
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {achievements.length} achievement{achievements.length !== 1 ? "s" : ""}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {isLoading ? (
              <div className="p-6 text-center text-slate-600">
                Loading achievements...
              </div>
            ) : achievements.length > 0 ? (
              achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`border-b border-slate-100 p-4 sm:p-6 transition-all hover:bg-slate-50 ${
                    STATUS_COLORS[achievement.status]
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">{getStatusIcon(achievement.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1 flex-wrap">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm sm:text-base text-slate-900">
                              {achievement.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600">
                              by{" "}
                              <span className="font-medium">
                                {achievement.memberName}
                              </span>
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                              CATEGORY_COLORS[achievement.category]
                            }`}
                          >
                            {achievement.category}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-700 mb-3 line-clamp-2">
                          {achievement.description}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs mb-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-600" />
                            <span className="text-slate-600">
                              {achievement.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users size={14} className="text-slate-600" />
                            <span className="text-slate-600">
                              {achievement.peopleImpacted.toLocaleString()} people
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-slate-600" />
                            <span className="font-semibold text-primary">
                              {(achievement.amountContributed / 1000).toFixed(1)}K MZN
                            </span>
                          </div>
                        </div>

                        {achievement.completedAt && (
                          <p className="text-xs text-slate-500">
                            Completed{" "}
                            {new Date(achievement.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <Award size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-600">
                  No achievements found with the selected filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
