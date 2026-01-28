// Helper function to extract string from EventRegistry label objects
function extractLabel(label: any): string {
  if (typeof label === "string") return label;
  if (!label) return "";
  if (typeof label !== "object") return String(label);

  // Try to get English label first
  if (label.eng) return String(label.eng);

  // Try to find first string value in the object
  for (const value of Object.values(label)) {
    if (typeof value === "string") return value;
    // If value is an object, try to extract from it recursively
    if (typeof value === "object" && value !== null) {
      const nested = extractLabel(value);
      if (nested) return nested;
    }
  }

  return "";
}

export async function handleNewsAlerts(req: any, res: any) {
  console.log("[NEWS] Handler called");

  try {
    const apiKey = process.env.NEWSAPI_KEY;
    console.log("[NEWS] API Key configured:", !!apiKey);

    if (!apiKey) {
      console.log("[NEWS] No API key, returning empty");
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        articles: [],
        isUsingFallback: true,
        message: "No API key",
      });
      return;
    }

    // Build request for EventRegistry API
    const params = new URLSearchParams({
      // Search filters
      apiKey: apiKey,
      keyword: "Mozambique", // Primary location filter
      conceptUri: "http://en.wikipedia.org/wiki/Flood", // Filter for flood events
      eventsCount: "50", // Max results per page
      eventsSortBy: "date", // Sort by most recent
      eventsSortByAsc: "false", // Descending (newest first)
      resultType: "events",
      lang: "eng", // English language articles
      minArticlesInEvent: "1", // At least 1 article

      // Response format - what to include
      includeEventTitle: "true", // Event title
      includeEventSummary: "true", // Event summary
      includeEventLocation: "true", // Where the event occurred
      includeEventDate: "true", // When the event occurred
      includeEventArticleCounts: "true", // Number of articles
      includeEventConcepts: "true", // Related concepts
      includeEventCategories: "true", // Event categories
      includeStoryTitle: "true", // Story title from articles
      includeStoryDate: "true", // Article publication date
      includeStoryLocation: "true", // Story location
      includeStoryMedoidArticle: "true", // Representative article
    });
    const url = `https://eventregistry.org/api/v1/event/getEvents?${params.toString()}`;

    console.log("[NEWS] Fetching from API");

    const apiResponse = await fetch(url);

    if (!apiResponse.ok) {
      console.log("[NEWS] API returned status:", apiResponse.status);
      res.setHeader("Content-Type", "application/json");
      res.status(200).json({
        articles: [],
        error: `API status ${apiResponse.status}`,
      });
      return;
    }

    const data = await apiResponse.json();

    // Extract events from EventRegistry response
    let articles: any[] = [];

    // EventRegistry returns events as an object with a 'results' array inside
    const eventsList = data.events?.results || data.events || [];

    console.log("[NEWS] Events list type:", typeof eventsList);
    console.log("[NEWS] Events list is array:", Array.isArray(eventsList));
    console.log("[NEWS] Events list length:", eventsList.length);

    if (Array.isArray(eventsList) && eventsList.length > 0) {
      // Convert events to article format for frontend compatibility
      articles = eventsList.slice(0, 20).map((event: any) => ({
        // Use event data as primary
        title: extractLabel(event.title) || extractLabel(event.name) || "Untitled Event",
        description: extractLabel(event.summary) || extractLabel(event.description) || extractLabel(event.body) || "",
        body: extractLabel(event.summary) || extractLabel(event.description) || "",
        url: event.uri || event.url || event.link || "#",
        date: event.date?.date || event.publishDate || new Date().toISOString(),
        publishedAt: event.date?.date || event.publishDate || new Date().toISOString(),
        source: extractLabel(event.location?.label) || "EventRegistry",
        // Store raw event for reference
        _event: event,
        // Include story/article data if available
        stories: event.stories || [],
      }));

      console.log("[NEWS] Converted", articles.length, "events to articles");
    } else {
      console.log("[NEWS] No events found in response");
      console.log("[NEWS] Events list is empty or not an array");
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      articles: articles,
      success: articles.length > 0,
      count: articles.length,
    });
  } catch (error: any) {
    console.error("[NEWS] Handler error:", error?.message);

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      articles: [],
      error: error?.message || "Unknown error",
    });
  }
}
