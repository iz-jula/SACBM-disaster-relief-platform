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
    const params = new URLSearchParams({
      // Search filters
      apiKey: apiKey,
      keyword: 'Mozambique', // Primary location filter
      conceptUri: 'http://en.wikipedia.org/wiki/Flood', // Filter for flood events
      eventsCount: '50', // Max results per page
      eventsSortBy: 'date', // Sort by most recent
      eventsSortByAsc: 'false', // Descending (newest first)
      resultType: 'events',
      lang: 'eng', // English language articles
      minArticlesInEvent: '1', // At least 1 article

      // Response format - what to include
      includeEventTitle: 'true', // Event title
      includeEventSummary: 'true', // Event summary
      includeEventLocation: 'true', // Where the event occurred
      includeEventDate: 'true', // When the event occurred
      includeEventArticleCounts: 'true', // Number of articles
      includeEventConcepts: 'true', // Related concepts
      includeEventCategories: 'true', // Event categories
      includeStoryTitle: 'true', // Story title from articles
      includeStoryDate: 'true', // Article publication date
      includeStoryLocation: 'true', // Story location
      includeStoryMedoidArticle: 'true', // Representative article
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

    // EventRegistry returns events in 'events' array
    const articles = (data.events || data.articles || data.data || []).slice(0, 20);

    console.log('[NEWS] Fetched', articles.length, 'events from EventRegistry');

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
