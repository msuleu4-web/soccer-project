// シーンショップページ
// unlock_cost > 0 のシーン一覧を表示し、週給で解放できる

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatBalance } from '@/lib/story/wallet';
import type { StoryScene, UserWallet, UserUnlockedContent } from '@/lib/types/story';

interface ShopScene extends StoryScene {
  story_chapters: { title_ja: string; part_number: number } | null;
  story_characters: { display_name_ja: string; theme_color: string } | null;
}

export default function ShopPage() {
  const [scenes,       setScenes]       = useState<ShopScene[]>([]);
  const [wallet,       setWallet]       = useState<UserWallet | null>(null);
  const [unlockedIds,  setUnlockedIds]  = useState<string[]>([]);
  const [buying,       setBuying]       = useState<string | null>(null);
  const [message,      setMessage]      = useState<string | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      const [progressRes, scenesRes] = await Promise.all([
        fetch('/api/story/progress'),
        fetch('/api/story/shop-scenes'),
      ]);
      const progressData = await progressRes.json() as { wallet: UserWallet | null };
      setWallet(progressData.wallet);

      // shop-scenes がなければ client fetch で代替
      if (scenesRes.ok) {
        const data = await scenesRes.json() as { scenes: ShopScene[]; unlocked: string[] };
        setScenes(data.scenes);
        setUnlockedIds(data.unlocked);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  async function handleUnlock(scene: ShopScene) {
    if (buying) return;
    if (!wallet || wallet.balance < scene.unlock_cost) {
      setMessage('残高が不足しています。週給を受け取ってから再挑戦してください。');
      return;
    }
    setBuying(scene.id);
    setMessage(null);
    try {
      const res = await fetch('/api/story/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: 'scene', content_id: scene.id }),
      });
      const data = await res.json() as { success?: boolean; new_balance?: number; error?: string };
      if (data.success) {
        setUnlockedIds((prev) => [...prev, scene.id]);
        setWallet((prev) => prev ? { ...prev, balance: data.new_balance ?? prev.balance } : prev);
        setMessage(`「${scene.title_ja ?? 'シーン'}」を解放しました！`);
      } else {
        setMessage(data.error ?? '解放に失敗しました');
      }
    } finally {
      setBuying(null);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 h-14"
        style={{ background: 'var(--bg-header)', borderBottom: '1px solid var(--border-default)', backdropFilter: 'blur(12px)' }}
      >
        <Link href="/story" className="text-sm" style={{ color: 'var(--fg-2)' }}>← 戻る</Link>
        <span className="font-bold" style={{ color: 'var(--fg-1)' }}>シーンショップ</span>
        <span className="text-sm font-medium" style={{ color: 'var(--color-accent-green)' }}>
          {wallet ? `💰 ${formatBalance(wallet.balance)}` : ''}
        </span>
      </header>

      <main className="gl-container py-6 space-y-4">
        {message && (
          <div
            className="p-3 rounded-xl text-sm text-center"
            style={{ background: 'rgba(0,210,106,0.1)', color: 'var(--color-accent-green)', border: '1px solid var(--color-accent-green)' }}
          >
            {message}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12" style={{ color: 'var(--fg-muted)' }}>読み込み中...</div>
        )}

        {!isLoading && scenes.length === 0 && (
          <div className="gl-card text-center py-12" style={{ color: 'var(--fg-muted)' }}>
            <p className="text-2xl mb-2">🔒</p>
            <p>現在購入可能なシーンはありません。</p>
            <p className="text-sm mt-1">ストーリーを進めると解放コンテンツが増えます。</p>
          </div>
        )}

        {scenes.map((scene) => {
          const isUnlocked = unlockedIds.includes(scene.id);
          const canAfford  = (wallet?.balance ?? 0) >= scene.unlock_cost;

          return (
            <div
              key={scene.id}
              className="gl-card flex items-center gap-4 p-4"
              style={{ borderLeft: isUnlocked ? '3px solid var(--color-accent-green)' : '3px solid var(--color-border)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: scene.story_characters?.theme_color ? `${scene.story_characters.theme_color}22` : 'var(--bg-surface-elevated)' }}
              >
                {isUnlocked ? '✅' : '🔒'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--fg-1)' }}>
                  {scene.title_ja ?? `シーン (${scene.scene_type})`}
                </p>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  {scene.story_characters?.display_name_ja ?? '—'} ·{' '}
                  {scene.story_chapters?.title_ja ?? '—'}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                {isUnlocked ? (
                  <span className="text-xs font-medium" style={{ color: 'var(--color-accent-green)' }}>解放済み</span>
                ) : (
                  <button
                    onClick={() => handleUnlock(scene)}
                    disabled={!!buying || !canAfford}
                    className="gl-btn gl-btn-primary text-xs px-3 py-1.5"
                    style={{ opacity: (!canAfford || !!buying) ? 0.5 : 1 }}
                  >
                    {buying === scene.id ? '処理中...' : formatBalance(scene.unlock_cost)}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
