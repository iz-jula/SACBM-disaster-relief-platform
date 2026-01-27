export async function handleNewsAlerts(req: any, res: any) {
  try {
    const apiKey = process.env.NEWSAPI_KEY;

    console.log('News alerts handler called, apiKey exists:', !!apiKey);

    if (!apiKey) {
      console.warn('NewsAPI key not configured');
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify({
        articles: [],
        isUsingFallback: true,
        message: 'NewsAPI key not configured'
      }));
    }

    const query = '(Mozambique AND (floods OR weather OR government OR emergency))';
    const searchParams = new URLSearchParams({
      query: query,
      sortBy: 'publishedAt',
      maxArticles: '20',
      apiKey: apiKey,
    });

    const url = `https://api.newsapi.ai/v1/search?${searchParams}`;
    console.log('Fetching from NewsAPI.ai');

    const apiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      console.warn('NewsAPI HTTP error:', apiResponse.status);
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify({
        articles: [],
        isUsingFallback: true,
        message: `NewsAPI error: ${apiResponse.status}`
      }));
    }

    const data = await apiResponse.json();
    const articles = data.articles || data.data || [];

    console.log(`Successfully fetched ${articles.length} news articles`);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({
      articles: articles,
      success: true,
      count: articles.length
    }));
  } catch (error: any) {
    console.error('News handler error:', error?.message || error);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify({
      articles: [],
      isUsingFallback: true,
      error: error?.message || 'Unknown error'
    }));
  }
}
