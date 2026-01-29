export interface Achievement {
  id: string;
  memberName: string;
  title: string;
  description: string;
  category: "Training" | "Community Work" | "Infrastructure" | "Advocacy" | "Research";
  location: string;
  peopleImpacted: number;
  amountContributed: number;
  status: "completed" | "in_progress" | "pending";
  createdAt: string;
  completedAt?: string;
}

// Mock achievements data - work done by members outside of relief requests
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "ach1",
    memberName: "Maria Dos Santos",
    title: "Community Flood Awareness Training",
    description: "Conducted flood preparedness workshop for 120 residents in Sofala Province",
    category: "Training",
    location: "Sofala Province",
    peopleImpacted: 120,
    amountContributed: 8500,
    status: "completed",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ach2",
    memberName: "João Silva",
    title: "Early Warning System Installation",
    description: "Installed 5 weather monitoring stations across Gaza Province for flood early warning",
    category: "Infrastructure",
    location: "Gaza Province",
    peopleImpacted: 850,
    amountContributed: 45000,
    status: "completed",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ach3",
    memberName: "Amara Mokhtar",
    title: "Water Safety Documentation Project",
    description: "Documented best practices for water system maintenance in rural areas",
    category: "Research",
    location: "Multiple Districts",
    peopleImpacted: 2500,
    amountContributed: 12000,
    status: "completed",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ach4",
    memberName: "Carlos Mendes",
    title: "Advocacy Campaign for Climate Adaptation",
    description: "Led community advocacy initiative resulting in 3 new government climate policies",
    category: "Advocacy",
    location: "Maputo City",
    peopleImpacted: 3200,
    amountContributed: 22000,
    status: "completed",
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ach5",
    memberName: "Fatima Ahmed",
    title: "Community Sanitation Program",
    description: "Established sustainable sanitation practices in 8 villages, benefiting 450+ households",
    category: "Community Work",
    location: "Inhambane District",
    peopleImpacted: 1800,
    amountContributed: 18500,
    status: "in_progress",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ach6",
    memberName: "Daniel Ferreira",
    title: "Disaster Risk Mapping Study",
    description: "Comprehensive flood and drought risk mapping for 5 districts",
    category: "Research",
    location: "Southern Region",
    peopleImpacted: 5600,
    amountContributed: 35000,
    status: "in_progress",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function handleGetAchievements(req: any, res: any) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;

    let achievements = [...MOCK_ACHIEVEMENTS];

    // Filter by status if provided
    if (status) {
      achievements = achievements.filter((a) => a.status === status);
    }

    // Filter by category if provided
    if (category) {
      achievements = achievements.filter((a) => a.category === category);
    }

    // Sort by creation date (newest first)
    achievements.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply limit if provided
    if (limit) {
      achievements = achievements.slice(0, limit);
    }

    res.json({ achievements, total: MOCK_ACHIEVEMENTS.length });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
}

export async function handleAchievementsMetrics(req: any, res: any) {
  try {
    const completedAchievements = MOCK_ACHIEVEMENTS.filter(
      (a) => a.status === "completed"
    );
    const totalPeopleImpacted = MOCK_ACHIEVEMENTS.reduce(
      (sum, a) => sum + a.peopleImpacted,
      0
    );
    const totalContributed = MOCK_ACHIEVEMENTS.reduce(
      (sum, a) => sum + a.amountContributed,
      0
    );

    res.json({
      totalAchievements: MOCK_ACHIEVEMENTS.length,
      completedAchievements: completedAchievements.length,
      inProgressAchievements: MOCK_ACHIEVEMENTS.filter(
        (a) => a.status === "in_progress"
      ).length,
      totalPeopleImpacted,
      totalContributed,
      averageImpact:
        MOCK_ACHIEVEMENTS.length > 0
          ? Math.round(totalPeopleImpacted / MOCK_ACHIEVEMENTS.length)
          : 0,
    });
  } catch (error) {
    console.error("Error calculating achievement metrics:", error);
    res.status(500).json({ error: "Failed to calculate metrics" });
  }
}

export async function handleCreateAchievement(req: any, res: any) {
  try {
    const { memberName, title, description, category, location, peopleImpacted, amountContributed } = req.body;

    // Validate required fields
    if (!memberName || !title || !description || !category || !location) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create new achievement
    const newAchievement: Achievement = {
      id: `ach-${Date.now()}`,
      memberName,
      title,
      description,
      category,
      location,
      peopleImpacted: parseInt(peopleImpacted) || 0,
      amountContributed: parseInt(amountContributed) || 0,
      status: "pending", // New submissions start as pending
      createdAt: new Date().toISOString(),
    };

    // Add to mock achievements (in production, this would save to database)
    MOCK_ACHIEVEMENTS.push(newAchievement);

    res.status(201).json({
      success: true,
      message: "Achievement submitted successfully",
      achievement: newAchievement,
    });
  } catch (error) {
    console.error("Error creating achievement:", error);
    res.status(500).json({ error: "Failed to create achievement" });
  }
}
