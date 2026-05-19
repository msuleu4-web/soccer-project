
import Link from 'next/link';
import Header from './components/Header';
import Hero from './components/Hero';
import NewsSection from './components/NewsSection';
import MatchSection from './components/MatchSection';
import StandingsSection from './components/StandingsSection';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Header />
      <Hero />
      <NewsSection />
      <MatchSection />
      <StandingsSection />
      <div className="gl-card text-center">
        <h2 className="text-xl font-bold text-text-primary mb-2">マンUくんに聞いてみよう 🔴⚪</h2>
        <p className="text-text-secondary mb-4">Manchester United について何でも質問できるAIチャットボット</p>
        <Link href="/manu" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
          マンUくんと話す →
        </Link>
      </div>
      <div className="gl-card text-center mt-4">
        <h2 className="text-xl font-bold text-text-primary mb-2">選手育成ゲーム 🎮</h2>
        <p className="text-text-secondary mb-4">無名の選手を育ててバロンドールを目指せ！</p>
        <Link href="/game" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
          ゲームを始める →
        </Link>
      </div>
      <Footer />
    </main>
  );
}
