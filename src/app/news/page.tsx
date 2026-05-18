import Image from 'next/image';
import type { Article } from '@/types/news';
import { AlertCircle } from 'lucide-react';
import { fetchLatestNews } from '@/lib/newsData';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

const NewsCard = ({ article }: { article: Article }) => {
  const pubDate = new Date(article.pubDate).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <a href={article.link} target="_blank" rel="noopener noreferrer">
        <div className="relative w-full h-48">
          <Image
            src={article.image_url || '/placeholder.svg'}
            alt={article.title}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-300 hover:scale-105"
            unoptimized
          />
        </div>
      </a>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold mb-2 flex-grow">
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
            {article.title}
          </a>
        </h3>
        <p className="text-sm text-text-secondary mb-3 line-clamp-3">
          {article.description}
        </p>
        <time className="text-xs text-text-secondary self-end">{pubDate}</time>
      </div>
    </div>
  );
};

const NewsGrid = ({ title, articles }: { title: string; articles: Article[] }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6 border-l-4 border-primary pl-4">{title}</h2>
    {articles && articles.length > 0 ? (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard key={article.article_id} article={article} />
        ))}
      </div>
    ) : (
      <p className="text-center text-text-secondary">ニュースが見つかりませんでした。</p>
    )}
  </div>
);

export default async function NewsPage() {
  try {
    const { overseas, jleague } = await fetchLatestNews();

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header />
        <h1 className="text-3xl font-bold mt-8 mb-8 text-center">ニュース</h1>
        <div className="space-y-12">
          <NewsGrid title="海外サッカー" articles={overseas} />
          <NewsGrid title="Jリーグ" articles={jleague} />
        </div>
        <Footer />
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header />
        <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle className="h-6 w-6 mr-3" />
          <div>
            <h2 className="font-bold">エラー</h2>
            <p>ニュースの読み込みに失敗しました。時間をおいて再度お試しください。</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
