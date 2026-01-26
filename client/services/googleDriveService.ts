import { RelieRequest } from "./requestsService";
import { getStoredGoogleUser } from "./googleService";

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

// Configuration for your Google Sheet
// You'll need to create a Google Sheet and update this ID
const RELIEF_REQUESTS_SHEET_ID = process.env.VITE_RELIEF_SHEET_ID || "";
const RELIEF_SHEET_NAME = "Relief Requests";

interface GoogleSheetValues {
  range: string;
  majorDimension: string;
  values: any[][];
}

/**
 * Initialize the Google Sheet for relief requests
 * Creates the sheet if it doesn't exist
 */
export async function initializeRelieSheet(): Promise<string | null> {
  const user = getStoredGoogleUser();
  if (!user?.accessToken) {
    console.warn("Google user not authenticated");
    return null;
  }

  try {
    // Check if sheet exists, if not create it
    if (!RELIEF_REQUESTS_SHEET_ID) {
      const sheetId = await createReliefSheet(user.accessToken);
      return sheetId;
    }

    // Verify sheet is accessible
    const response = await fetch(
      `${SHEETS_API_BASE}/${RELIEF_REQUESTS_SHEET_ID}?fields=spreadsheetId`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Relief sheet not accessible");
      return null;
    }

    return RELIEF_REQUESTS_SHEET_ID;
  } catch (error) {
    console.error("Error initializing relief sheet:", error);
    return null;
  }
}

/**
 * Create a new Google Sheet for relief requests
 */
async function createReliefSheet(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(`${SHEETS_API_BASE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          title: "Relief Requests Database",
        },
        sheets: [
          {
            properties: {
              sheetId: 0,
              title: RELIEF_SHEET_NAME,
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Failed to create sheet:", response.statusText);
      return null;
    }

    const data = await response.json();
    const sheetId = data.spreadsheetId;

    // Initialize headers
    await initializeSheetHeaders(sheetId, accessToken);

    return sheetId;
  } catch (error) {
    console.error("Error creating relief sheet:", error);
    return null;
  }
}

/**
 * Initialize sheet headers
 */
async function initializeSheetHeaders(
  sheetId: string,
  accessToken: string
): Promise<void> {
  const headers = [
    "ID",
    "Originator",
    "Location",
    "Help Type",
    "Evacuation Type",
    "People Involved",
    "Amount Spent",
    "Category",
    "Status",
    "Created At",
  ];

  try {
    await fetch(`${SHEETS_API_BASE}/${sheetId}/values/${RELIEF_SHEET_NAME}!A1`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [headers],
      }),
    });
  } catch (error) {
    console.error("Error initializing sheet headers:", error);
  }
}

/**
 * Fetch all relief requests from Google Sheet
 */
export async function getRequestsFromSheet(): Promise<RelieRequest[]> {
  const user = getStoredGoogleUser();
  if (!user?.accessToken || !RELIEF_REQUESTS_SHEET_ID) {
    console.warn("Not authenticated or sheet ID not set");
    return [];
  }

  try {
    const response = await fetch(
      `${SHEETS_API_BASE}/${RELIEF_REQUESTS_SHEET_ID}/values/${RELIEF_SHEET_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch sheet data:", response.statusText);
      return [];
    }

    const data: GoogleSheetValues = await response.json();
    const requests: RelieRequest[] = [];

    if (data.values && data.values.length > 1) {
      // Skip header row
      for (let i = 1; i < data.values.length; i++) {
        const row = data.values[i];
        if (row.length >= 9) {
          requests.push({
            id: row[0],
            originator: row[1],
            location: row[2],
            helpType: row[3],
            evacuationType: row[4],
            peopleInvolved: parseInt(row[5]) || 0,
            amountSpent: parseFloat(row[6]) || 0,
            category: (row[7] as any) || "Category 1",
            status: (row[8] as any) || "pending",
            createdAt: row[9],
          });
        }
      }
    }

    return requests;
  } catch (error) {
    console.error("Error fetching requests from sheet:", error);
    return [];
  }
}

/**
 * Add a new relief request to Google Sheet
 */
export async function addRequestToSheet(
  request: Omit<RelieRequest, "id" | "createdAt">
): Promise<RelieRequest | null> {
  const user = getStoredGoogleUser();
  if (!user?.accessToken || !RELIEF_REQUESTS_SHEET_ID) {
    console.warn("Not authenticated or sheet ID not set");
    return null;
  }

  try {
    const id = `${Date.now()}`;
    const createdAt = new Date().toISOString();

    const row = [
      id,
      request.originator,
      request.location,
      request.helpType,
      request.evacuationType,
      request.peopleInvolved,
      request.amountSpent,
      request.category,
      request.status,
      createdAt,
    ];

    const response = await fetch(
      `${SHEETS_API_BASE}/${RELIEF_REQUESTS_SHEET_ID}/values/${RELIEF_SHEET_NAME}!A:A:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to add request:", response.statusText);
      return null;
    }

    return {
      id,
      ...request,
      createdAt,
    };
  } catch (error) {
    console.error("Error adding request to sheet:", error);
    return null;
  }
}

/**
 * Update a relief request in Google Sheet
 */
export async function updateRequestInSheet(
  id: string,
  updates: Partial<Pick<RelieRequest, "status" | "category">>
): Promise<boolean> {
  const user = getStoredGoogleUser();
  if (!user?.accessToken || !RELIEF_REQUESTS_SHEET_ID) {
    console.warn("Not authenticated or sheet ID not set");
    return false;
  }

  try {
    // Fetch current data to find the row
    const response = await fetch(
      `${SHEETS_API_BASE}/${RELIEF_REQUESTS_SHEET_ID}/values/${RELIEF_SHEET_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return false;
    }

    const data: GoogleSheetValues = await response.json();
    let rowIndex = -1;

    if (data.values) {
      for (let i = 1; i < data.values.length; i++) {
        if (data.values[i][0] === id) {
          rowIndex = i;
          break;
        }
      }
    }

    if (rowIndex === -1) {
      console.warn("Request not found");
      return false;
    }

    // Update the specific cells
    const updatePromises = [];

    if (updates.status) {
      updatePromises.push(
        fetch(
          `${SHEETS_API_BASE}/${RELIEF_REQUESTS_SHEET_ID}/values/${RELIEF_SHEET_NAME}!I${rowIndex + 1}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              values: [[updates.status]],
            }),
          }
        )
      );
    }

    if (updates.category) {
      updatePromises.push(
        fetch(
          `${SHEETS_API_BASE}/${RELIEF_REQUESTS_SHEET_ID}/values/${RELIEF_SHEET_NAME}!H${rowIndex + 1}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              values: [[updates.category]],
            }),
          }
        )
      );
    }

    const results = await Promise.all(updatePromises);
    return results.every((r) => r.ok);
  } catch (error) {
    console.error("Error updating request in sheet:", error);
    return false;
  }
}

/**
 * Get metrics/aggregates from all requests
 */
export async function getRequestMetrics() {
  const requests = await getRequestsFromSheet();

  const metrics = {
    totalRequests: requests.length,
    totalPeopleAssisted: requests.reduce((sum, r) => sum + r.peopleInvolved, 0),
    totalValueDeployed: requests.reduce((sum, r) => sum + r.amountSpent, 0),
    averagePerRequest: 0,
    byStatus: {
      pending: 0,
      met: 0,
      partially_met: 0,
    },
    byCategory: {
      "Category 1": 0,
      "Category 2": 0,
      "Category 3": 0,
    },
  };

  if (metrics.totalRequests > 0) {
    metrics.averagePerRequest = Math.round(
      metrics.totalValueDeployed / metrics.totalRequests
    );
  }

  requests.forEach((r) => {
    metrics.byStatus[r.status]++;
    metrics.byCategory[r.category]++;
  });

  return metrics;
}
