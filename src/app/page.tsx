'use client';

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
      <Footer />
    </main>
  );
}