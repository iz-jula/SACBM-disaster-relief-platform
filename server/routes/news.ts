export async function handleNewsAlerts(req: any, res: any) {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    console.warn('NewsAPI key not configured');
    return res.status(500).json({
      error: 'NewsAPI key not configured',
      articles: []
    });
  }

  try {
    const query = '(Mozambique AND (floods OR weather OR government OR emergency))';
    const searchParams = new URLSearchParams({
      query: query,
      sortBy: 'publishedAt',
      maxArticles: '20',
      apiKey: apiKey,
    });

    const url = `https://api.newsapi.ai/v1/search?${searchParams}`;
    console.log('Fetching news from:', url.replace(apiKey, 'XXX'));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error('NewsAPI error:', response.status, response.statusText);
      return res.status(response.status).json({
        error: 'Failed to fetch news from NewsAPI.ai',
        articles: [],
        status: response.status
      });
    }

    const data = await response.json();
    const articles = data.articles || data.data || [];

    console.log(`Successfully fetched ${articles.length} articles from NewsAPI.ai`);

    // Return the articles directly
    res.json({ articles, success: true });
  } catch (error: any) {
    console.error('Error fetching news alerts:', error?.message || error);
    res.status(500).json({
      error: error?.message || 'Internal server error',
      articles: [],
      isNetworkError: error?.code === 'ENOTFOUND' || error?.name === 'AbortError'
    });
  }
}
