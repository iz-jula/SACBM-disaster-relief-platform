export async function handleNewsAlerts(req: any, res: any) {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    console.warn('NewsAPI key not configured. Available env keys:', Object.keys(process.env).filter(k => k.includes('NEWS') || k.includes('API')));
    return res.status(500).json({
      error: 'NewsAPI key not configured',
      articles: []
    });
  }

  console.log('NewsAPI key configured:', apiKey ? '✓' : '✗');

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
    const isNetworkError = error?.code === 'ENOTFOUND' || error?.name === 'AbortError' || error?.message?.includes('fetch failed');

    if (isNetworkError) {
      console.warn('News API - Network error (dev environment may not have external DNS access):', error?.message || error);
    } else {
      console.error('Error fetching news alerts:', error?.message || error);
    }

    res.status(500).json({
      error: isNetworkError ? 'Network connectivity issue - using fallback alerts' : (error?.message || 'Internal server error'),
      articles: [],
      isNetworkError: isNetworkError,
      isFallbackMode: isNetworkError
    });
  }
}
