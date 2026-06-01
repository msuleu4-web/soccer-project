import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/app/components/Header';
import GameErrorBoundary from './components/GameErrorBoundary';

export const metadata: Metadata = { title: '育成ゲーム | Goal Labo' };

// ssr: false: localStorage/sessionStorage を使うためSSR無効
const GameScreen = dynamic(() => import('./components/GameScreen'), {
  ssr: false,
  loading: () => <GameLoadingFallback />,
});

function GameLoadingFallback() {
  return (
    <div className="gl-card mt-4 flex flex-col items-center justify-center py-20 gap-3">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full animate-bounce"
            style={{
              background: 'var(--color-accent-green)',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <p className="text-text-secondary text-sm">ゲームを読み込み中...</p>
    </div>
  );
}

export default function GamePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Header />
      <GameErrorBoundary>
        <GameScreen />
      </GameErrorBoundary>
    </div>
  );
}
