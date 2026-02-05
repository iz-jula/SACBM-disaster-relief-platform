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

    // Calculate date from 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fromDate = threeDaysAgo.toISOString().split("T")[0];

    // Build request for NewsAPI
    const params = new URLSearchParams({
      q: "Mozambique floods OR disaster OR emergency OR weather", // Search query
      sortBy: "publishedAt", // Sort by most recent
      language: "en", // English only
      from: fromDate, // From 3 days ago
      pageSize: "20", // Get 20 articles
      apiKey: apiKey,
    });

    const url = `https://newsapi.org/v2/everything?${params.toString()}`;
    console.log("[NEWS] Fetching from NewsAPI");

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

    // Convert NewsAPI articles to our format
    let articles: any[] = [];

    if (
      data.articles &&
      Array.isArray(data.articles) &&
      data.articles.length > 0
    ) {
      articles = data.articles
        .slice(0, 20)
        .map((article: any, index: number) => {
          return {
            title: article.title || "Untitled",
            description: article.description || "",
            body: article.content || "",
            url: article.url, // NewsAPI provides actual article URLs
            source: article.source?.name || "NewsAPI",
            image: article.urlToImage,
            date: article.publishedAt || new Date().toISOString(),
            publishedAt: article.publishedAt || new Date().toISOString(),
            author: article.author,
          };
        });

      console.log("[NEWS] Converted", articles.length, "articles from NewsAPI");
    } else {
      console.log("[NEWS] No articles in response");
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
