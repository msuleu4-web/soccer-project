import type { NewsApiResponse, Article } from '@/types/news';

async function fetchNewsAPI(query: string) {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    throw new Error('API key is not configured');
  }
  const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&${query}`;
  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) {
    const errorData = await response.json();
    console.error('NewsData.io API error:', errorData);
    throw new Error(`Failed to fetch news. Status: ${response.status}`);
  }
  return response.json() as Promise<NewsApiResponse>;
}

export async function fetchLatestNews(): Promise<{ overseas: Article[]; jleague: Article[] }> {
  const overseasQuery = 'q=soccer%20OR%20%22Premier%20League%22%20OR%20%22Champions%20League%22%20OR%20%22La%20Liga%22&language=ja,en&category=sports';
  const jleagueQuery = 'q=%22J%E3%83%AA%E3%83%BC%E3%82%B0%22%20OR%20%22J1%22%20OR%20%22%E3%82%AC%E3%83%B3%E3%83%90%E5%A4%A7%E9%98%AA%22&language=ja&category=sports';

  const [overseasNews, jleagueNews] = await Promise.all([
    fetchNewsAPI(overseasQuery),
    fetchNewsAPI(jleagueQuery)
  ]);

  const excludedKeywords = [
    'nfl', 'american football', 'touchdown', 'quarterback', 'super bowl', 'texans', 'cowboys', 'patriots'
  ];

  const filteredOverseas = overseasNews.results.filter(article => {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    return !excludedKeywords.some(keyword => title.includes(keyword) || description.includes(keyword));
  });

  return {
    overseas: filteredOverseas,
    jleague: jleagueNews.results,
  };
}
