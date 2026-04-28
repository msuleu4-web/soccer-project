import Link from 'next/link';
import type { Article } from '@/types/news';
import { fetchLatestNews } from '@/lib/newsData';

interface HomeNewsArticle extends Omit<Article, 'category'> {
  displayCategory: 'jleague' | 'overseas';
}

const Badge = ({ category }: { category: 'jleague' | 'overseas' }) => {
  const categoryStyles = {
    jleague: {
      label: 'Jリーグ',
      className: 'gl-badge-jleague',
    },
    overseas: {
      label: '海外',
      className: 'gl-badge-overseas',
    },
  };

  const { label, className } = categoryStyles[category];

  return (
    <span className={`gl-badge ${className}`}>
      {label}
    </span>
  );
};

const NewsSection = async () => {
  let newsItems: HomeNewsArticle[] = [];
  let error = null;

  try {
    const data = await fetchLatestNews();
    const jleagueNews = data.jleague?.slice(0, 2).map((item: Article) => ({ ...item, displayCategory: 'jleague' as const })) || [];
    const overseasNews = data.overseas?.slice(0, 2).map((item: Article) => ({ ...item, displayCategory: 'overseas' as const })) || [];
    newsItems = [...jleagueNews, ...overseasNews].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  } catch (e) {
    error = e instanceof Error ? e.message : 'An unknown error occurred';
    console.error('[NewsSection] Fetch Error:', error);
  }

  return (
    <div className="gl-card">
      <h2 className="text-xl font-bold text-text-primary mb-4">最新ニュース</h2>
      {error ? (
        <p className="text-text-muted">最新ニュースを読み込めませんでした。</p>
      ) : (
        <>
          <div className="flex flex-col">
            {newsItems.map((item, index) => (
              <div key={item.article_id || index} className={`flex items-center gap-4 py-3 ${index < newsItems.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="w-24 h-16 bg-surface-elevated rounded-md flex-shrink-0"></div>
                <div className="flex flex-col gap-1">
                  <Badge category={item.displayCategory} />
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-title text-base hover:underline">
                    {item.title}
                  </a>
                  <p className="text-xs text-text-muted">{new Date(item.pubDate).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Link href="/news" className="text-sm font-semibold text-accent-primary hover:underline">
              すべてのニュースを見る →
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default NewsSection;
