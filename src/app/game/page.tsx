import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/app/components/Header';

// localStorageを使うためSSRを無効化 (Hydrationエラー対策)
const GameScreen = dynamic(() => import('./components/GameScreen'), {
  ssr: false,
  loading: () => (
    <div className="gl-card mt-4 flex items-center justify-center py-20">
      <p className="text-text-secondary text-sm">ゲームを読み込み中...</p>
    </div>
  ),
});

export const metadata: Metadata = { title: '育成ゲーム | Goal Labo' };

export default function GamePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Header />
      <GameScreen />
    </div>
  );
}
