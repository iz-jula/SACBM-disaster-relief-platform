export async function handleNewsAlerts(req: any, res: any) {
  console.log('[NEWS] Handler called');

  try {
    const apiKey = process.env.NEWSAPI_KEY;
    console.log('[NEWS] API Key configured:', !!apiKey);

    if (!apiKey) {
      console.log('[NEWS] No API key, returning empty');
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        articles: [],
        isUsingFallback: true,
        message: 'No API key'
      });
      return;
    }

    // Build request for EventRegistry API
    const keyword = 'Mozambique floods emergency weather';
    const params = new URLSearchParams({
      apiKey: apiKey,
      keyword: keyword,
      eventsCount: '20',
      eventsSortBy: 'date', // date, rel, size, or socialScore
      resultType: 'events',
    });
    const url = `https://eventregistry.org/api/v1/event/getEvents?${params.toString()}`;

    console.log('[NEWS] Fetching from API');

    const apiResponse = await fetch(url);

    if (!apiResponse.ok) {
      console.log('[NEWS] API returned status:', apiResponse.status);
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({
        articles: [],
        error: `API status ${apiResponse.status}`
      });
      return;
    }

    const data = await apiResponse.json();
    const articles = (data.articles || data.data || []).slice(0, 20);

    console.log('[NEWS] Fetched', articles.length, 'articles');

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      articles: articles,
      success: true
    });
  } catch (error: any) {
    console.error('[NEWS] Handler error:', error?.message);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      articles: [],
      error: error?.message || 'Unknown error'
    });
  }
}
