// Mock data - will be replaced with Supabase queries
const MOCK_REQUESTS: RelieRequest[] = [
  {
    id: "1",
    originator: "Ministry of Health",
    location: "District 1, Village A",
    helpType: "Materials",
    evacuationType: "By boat",
    peopleInvolved: 150,
    amountSpent: 45000,
    category: "Category 2",
    status: "met",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    originator: "Local Government",
    location: "District 2, Village B",
    helpType: "Food",
    evacuationType: "By tractor",
    peopleInvolved: 320,
    amountSpent: 125000,
    category: "Category 1",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    originator: "NGO Partner",
    location: "District 3, Village C",
    helpType: "Medical",
    evacuationType: "By truck",
    peopleInvolved: 89,
    amountSpent: 67500,
    category: "Category 3",
    status: "partially_met",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    originator: "Community Center",
    location: "District 4, Village D",
    helpType: "Shelter",
    evacuationType: "By bus",
    peopleInvolved: 210,
    amountSpent: 89000,
    category: "Category 1",
    status: "met",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    originator: "Red Cross",
    location: "District 5, Village E",
    helpType: "Water & Sanitation",
    evacuationType: "By foot",
    peopleInvolved: 450,
    amountSpent: 156000,
    category: "Category 2",
    status: "pending",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export interface RelieRequest {
  id: string;
  originator: string;
  location: string;
  helpType: string;
  evacuationType: string;
  peopleInvolved: number;
  amountSpent: number;
  category: "Category 1" | "Category 2" | "Category 3";
  status: "pending" | "met" | "partially_met";
  createdAt: string;
}

export async function handleGetRequests(req: any, res: any) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const status = req.query.status as string | undefined;

    let requests = [...MOCK_REQUESTS];

    // Filter by status if provided
    if (status) {
      requests = requests.filter((r) => r.status === status);
    }

    // Sort by creation date (newest first)
    requests.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Apply limit if provided
    if (limit) {
      requests = requests.slice(0, limit);
    }

    res.json({ requests, total: MOCK_REQUESTS.length });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
}

export async function handleCreateRequest(req: any, res: any) {
  try {
    const {
      originator,
      location,
      helpType,
      evacuationType,
      peopleInvolved,
      amountSpent,
      category,
    } = req.body;

    // Validation
    if (!originator || !location || !helpType || !category) {
      return res
        .status(400)
        .json({ error: "Missing required fields" });
    }

    const newRequest: RelieRequest = {
      id: `${Date.now()}`,
      originator,
      location,
      helpType,
      evacuationType,
      peopleInvolved: parseInt(peopleInvolved) || 0,
      amountSpent: parseFloat(amountSpent) || 0,
      category,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    MOCK_REQUESTS.push(newRequest);

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ error: "Failed to create request" });
  }
}

export async function handleUpdateRequest(req: any, res: any) {
  try {
    const { id } = req.params;
    const { status, category } = req.body;

    const requestIndex = MOCK_REQUESTS.findIndex((r) => r.id === id);
    if (requestIndex === -1) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (status) {
      MOCK_REQUESTS[requestIndex].status = status;
    }
    if (category) {
      MOCK_REQUESTS[requestIndex].category = category;
    }

    res.json(MOCK_REQUESTS[requestIndex]);
  } catch (error) {
    console.error("Error updating request:", error);
    res.status(500).json({ error: "Failed to update request" });
  }
}

export async function handleGetMetrics(req: any, res: any) {
  try {
    const total = MOCK_REQUESTS.length;
    const totalPeople = MOCK_REQUESTS.reduce(
      (sum, r) => sum + r.peopleInvolved,
      0
    );
    const totalValue = MOCK_REQUESTS.reduce((sum, r) => sum + r.amountSpent, 0);

    const metrics = {
      totalRequests: total,
      totalPeopleAssisted: totalPeople,
      totalValueDeployed: totalValue,
      averagePerRequest: Math.round(totalValue / total),
      byStatus: {
        pending: MOCK_REQUESTS.filter((r) => r.status === "pending").length,
        met: MOCK_REQUESTS.filter((r) => r.status === "met").length,
        partially_met: MOCK_REQUESTS.filter(
          (r) => r.status === "partially_met"
        ).length,
      },
      byHelpType: {} as Record<string, number>,
      byCategory: {
        "Category 1": MOCK_REQUESTS.filter((r) => r.category === "Category 1")
          .length,
        "Category 2": MOCK_REQUESTS.filter((r) => r.category === "Category 2")
          .length,
        "Category 3": MOCK_REQUESTS.filter((r) => r.category === "Category 3")
          .length,
      },
    };

    // Count by help type
    MOCK_REQUESTS.forEach((r) => {
      metrics.byHelpType[r.helpType] =
        (metrics.byHelpType[r.helpType] || 0) + 1;
    });

    res.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    res.status(500).json({ error: "Failed to fetch metrics" });
  }
}
