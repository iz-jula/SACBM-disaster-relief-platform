export async function handleNewsAlerts(req: any, res: any) {
  const apiKey = process.env.NEWSAPI_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'NewsAPI key not configured',
      articles: [] 
    });
  }

  try {
    const searchParams = new URLSearchParams({
      query: '(Mozambique AND (floods OR weather OR government OR emergency))',
      sortBy: 'publishedAt',
      maxArticles: '20',
      apiKey: apiKey,
    });

    const response = await fetch(`https://api.newsapi.ai/v1/search?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('NewsAPI error:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: 'Failed to fetch news from NewsAPI.ai',
        articles: [] 
      });
    }

    const data = await response.json();
    const articles = data.articles || data.data || [];

    // Return the articles directly
    res.json({ articles });
  } catch (error) {
    console.error('Error fetching news alerts:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      articles: [] 
    });
  }
}
