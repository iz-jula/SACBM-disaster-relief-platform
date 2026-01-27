export async function handleNewsAlerts(req: any, res: any) {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    console.warn("NewsAPI key not configured");
    return res.status(200).json({
      articles: [],
      isUsingFallback: true,
      message: "NewsAPI key not configured, using fallback alerts",
    });
  }

  try {
    const query =
      "(Mozambique AND (floods OR weather OR government OR emergency))";
    const searchParams = new URLSearchParams({
      query: query,
      sortBy: "publishedAt",
      maxArticles: "20",
      apiKey: apiKey,
    });

    const url = `https://api.newsapi.ai/v1/search?${searchParams}`;
    console.log("Fetching news from:", url.replace(apiKey, "XXX"));

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(
        "NewsAPI HTTP error:",
        response.status,
        response.statusText,
        "- using fallback alerts",
      );
      return res.status(200).json({
        articles: [],
        isUsingFallback: true,
        message: `NewsAPI returned ${response.status} - using fallback alerts`,
      });
    }

    const data = await response.json();
    const articles = data.articles || data.data || [];

    console.log(
      `Successfully fetched ${articles.length} articles from NewsAPI.ai`,
    );

    // Return the articles directly
    return res.json({ articles, success: true });
  } catch (error: any) {
    console.error("Error fetching news alerts:", error?.message || error);

    // Return 200 with empty articles to trigger fallback on frontend
    return res.status(200).json({
      articles: [],
      isUsingFallback: true,
      message: "News API unavailable - using fallback alerts",
    });
  }
}
