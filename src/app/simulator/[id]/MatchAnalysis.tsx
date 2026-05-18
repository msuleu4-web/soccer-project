'use client';

import { useState } from 'react';
import type { MatchAnalysis } from '@/types/simulator';

interface Props {
  simId: string;
  homeTeamName: string;
  awayTeamName: string;
}

export default function MatchAnalysisSection({ simId, homeTeamName, awayTeamName }: Props) {
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/simulator/${simId}/analysis`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '分析の取得に失敗');
      setAnalysis(json.analysis);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  if (!analysis) {
    return (
      <div className="gl-card p-5 text-center">
        <button
          onClick={loadAnalysis}
          disabled={loading}
          className="gl-btn gl-btn-accent text-lg px-8 py-3"
        >
          {loading ? '分析中...' : '詳細分析を見る'}
        </button>
        {loading && (
          <p className="mt-3 text-sm text-[var(--fg-muted)]">
            AIが試合データと選手能力値を分析しています (10〜15秒)
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">AI 戦術分析レビュー</h3>

      {/* 勝因分析 */}
      <div className="gl-card p-5 border-l-4 border-green-500">
        <h4 className="font-bold text-green-500 mb-2">{analysis.winner_analysis.title}</h4>
        <ul className="space-y-2">
          {analysis.winner_analysis.factors.map((f, i) => (
            <li key={i} className="text-sm leading-relaxed flex gap-2">
              <span className="text-green-500 mt-0.5 shrink-0">▸</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 敗因分析 */}
      <div className="gl-card p-5 border-l-4 border-red-500/60">
        <h4 className="font-bold text-red-400 mb-2">{analysis.loser_analysis.title}</h4>
        <ul className="space-y-2">
          {analysis.loser_analysis.factors.map((f, i) => (
            <li key={i} className="text-sm leading-relaxed flex gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">▸</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 戦力比較 */}
      <div className="gl-card p-5">
        <h4 className="font-bold mb-3">戦力比較</h4>
        <p className="text-sm leading-relaxed mb-4">{analysis.power_comparison.summary}</p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-2">{homeTeamName} の強み</p>
            <ul className="space-y-1">
              {analysis.power_comparison.home_advantages.map((a, i) => (
                <li key={i} className="text-sm text-[var(--fg-muted)] flex gap-2">
                  <span className="shrink-0">💪</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">{awayTeamName} の強み</p>
            <ul className="space-y-1">
              {analysis.power_comparison.away_advantages.map((a, i) => (
                <li key={i} className="text-sm text-[var(--fg-muted)] flex gap-2">
                  <span className="shrink-0">💪</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* キープレイヤー評価 */}
      <div className="gl-card p-5">
        <h4 className="font-bold mb-3">キープレイヤー採点</h4>
        <div className="space-y-3">
          {[...analysis.key_players]
            .sort((a, b) => b.rating - a.rating)
            .map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`text-lg font-bold w-12 text-center rounded py-1 shrink-0 ${
                    p.rating >= 8.0
                      ? 'bg-green-500/20 text-green-500'
                      : p.rating >= 7.0
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {p.rating.toFixed(1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {p.name}
                    <span className="text-xs text-[var(--fg-muted)] ml-2">
                      ({p.team === 'home' ? homeTeamName : awayTeamName})
                    </span>
                  </p>
                  <p className="text-xs text-[var(--fg-muted)] truncate">{p.comment}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 戦術分析 */}
      <div className="gl-card p-5">
        <h4 className="font-bold mb-3">戦術分析</h4>
        <p className="text-sm leading-relaxed mb-3">{analysis.tactical_analysis.summary}</p>
        <div className="space-y-2 text-sm text-[var(--fg-muted)]">
          <p>
            <span className="font-medium text-[var(--gl-color-text,inherit)]">フォーメーション: </span>
            {analysis.tactical_analysis.formation_impact}
          </p>
          <p>
            <span className="font-medium text-[var(--gl-color-text,inherit)]">スタイル相性: </span>
            {analysis.tactical_analysis.style_matchup}
          </p>
        </div>
      </div>

      {/* What If */}
      <div className="gl-card p-5 bg-[var(--gl-color-bg-soft,var(--bg-subtle))]">
        <h4 className="font-bold mb-2">もしも…</h4>
        <p className="text-sm leading-relaxed italic">{analysis.what_if}</p>
      </div>
    </div>
  );
}
