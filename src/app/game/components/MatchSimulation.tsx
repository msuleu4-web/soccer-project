'use client';

import { useState, useEffect } from 'react';
import type { MatchResult, MatchEventType } from '../types/game';

interface Props {
  result: MatchResult;
  playerName: string;
  highlights: string[];
  position: string;
  league: string;
  age: number;
  ovr: number;
  onContinue: () => void;
}

type Phase = 'intro' | 'live' | 'result';

function eventIcon(type: MatchEventType): string {
  switch (type) {
    case 'player_goal':    return '⚽';
    case 'player_assist':  return '🎯';
    case 'teammate_goal':  return '⚽';
    case 'opponent_goal':  return '💥';
    case 'chance':         return '🔥';
    case 'save':           return '🛡️';
    case 'danger':         return '⚠️';
    default:               return '▶';
  }
}

function eventBg(type: MatchEventType): string {
  switch (type) {
    case 'player_goal':    return 'rgba(0,210,106,0.15)';
    case 'player_assist':  return 'rgba(0,210,106,0.08)';
    case 'teammate_goal':  return 'rgba(59,130,246,0.1)';
    case 'opponent_goal':  return 'rgba(239,68,68,0.1)';
    case 'chance':         return 'rgba(234,179,8,0.08)';
    default:               return 'var(--bg-surface-elevated)';
  }
}

function eventBorder(type: MatchEventType): string {
  switch (type) {
    case 'player_goal':    return 'rgba(0,210,106,0.6)';
    case 'player_assist':  return 'rgba(0,210,106,0.3)';
    case 'teammate_goal':  return 'rgba(59,130,246,0.4)';
    case 'opponent_goal':  return 'rgba(239,68,68,0.5)';
    case 'chance':         return 'rgba(234,179,8,0.4)';
    default:               return 'var(--color-border)';
  }
}

export default function MatchSimulation({ result, playerName, highlights: _, position, league, age, ovr, onContinue }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [countdown, setCountdown] = useState(3);
  const [shownCount, setShownCount] = useState(0);
  const [analystComment, setAnalystComment] = useState<string | null>(null);
  const [analystName, setAnalystName] = useState<string | null>(null);
  const [analystLoading, setAnalystLoading] = useState(false);

  // カウントダウン
  useEffect(() => {
    if (phase !== 'intro') return;
    if (countdown <= 0) { setPhase('live'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // result フェーズに入ったらアナリストコメントを非同期で取得
  useEffect(() => {
    if (phase !== 'result') return;
    setAnalystLoading(true);
    fetch('/api/game/analyst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName, goals: result.playerGoals, assists: result.playerAssists,
        rating: result.playerRating, win: result.win,
        teamScore: result.teamScore, opponentScore: result.opponentScore,
        opponent: result.opponent, league, age, position, ovr,
        highlights: result.events.map(e => e.text),
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.comment) {
          setAnalystComment(data.comment);
          setAnalystName(data.analystName);
        }
      })
      .catch(() => {})
      .finally(() => setAnalystLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // イベントを1つずつ表示
  useEffect(() => {
    if (phase !== 'live') return;
    if (shownCount >= result.events.length) {
      const t = setTimeout(() => setPhase('result'), 600);
      return () => clearTimeout(t);
    }
    const delay = result.events[shownCount]?.type === 'player_goal' ? 900 : 650;
    const t = setTimeout(() => setShownCount(c => c + 1), delay);
    return () => clearTimeout(t);
  }, [phase, shownCount, result.events]);

  // 現在スコア計算（表示済みイベントまで）
  const visibleEvents = result.events.slice(0, shownCount);
  // アシストはゴールではないのでスコア計算に含めない
  const liveTeamGoals = visibleEvents.filter(e =>
    e.type === 'player_goal' || e.type === 'teammate_goal'
  ).length;
  const liveOpponent = visibleEvents.filter(e => e.type === 'opponent_goal').length;

  return (
    <div className="gl-card py-6 px-4">
      {/* ── イントロ ── */}
      {phase === 'intro' && (
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-2">試合開始！</p>
          <h2 className="text-xl font-bold text-text-primary mb-1">
            {result.opponent} 戦
          </h2>
          <div className="text-6xl font-black my-5" style={{ color: 'var(--color-accent-green)' }}>
            {countdown > 0 ? countdown : '⚽'}
          </div>
          <p className="text-text-secondary text-sm">キックオフ！</p>
        </div>
      )}

      {/* ── ライブイベント ── */}
      {phase === 'live' && (
        <div>
          {/* スコアボード */}
          <div className="flex items-center justify-center gap-6 mb-4 py-3 rounded-xl" style={{ background: 'var(--bg-surface-elevated)' }}>
            <div className="text-center">
              <p className="text-xs text-text-secondary mb-0.5">あなたのチーム</p>
              <p className="text-4xl font-black text-text-primary">{liveTeamGoals}</p>
            </div>
            <span className="text-2xl text-text-secondary font-bold">—</span>
            <div className="text-center">
              <p className="text-xs text-text-secondary mb-0.5">{result.opponent}</p>
              <p className="text-4xl font-black text-text-primary">{liveOpponent}</p>
            </div>
          </div>

          {/* イベントタイムライン */}
          <div className="space-y-2 min-h-[180px]">
            {visibleEvents.map((ev, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg px-3 py-2 border text-sm transition-all"
                style={{ background: eventBg(ev.type), borderColor: eventBorder(ev.type) }}
              >
                <span className="text-base flex-shrink-0 mt-0.5">{eventIcon(ev.type)}</span>
                <span className={`flex-1 ${
                  ev.type === 'player_goal' ? 'font-bold text-text-primary' :
                  ev.type === 'opponent_goal' ? 'text-red-400' :
                  'text-text-secondary'
                }`}>
                  {ev.text}
                </span>
              </div>
            ))}

            {/* 読み込み中インジケーター */}
            {shownCount < result.events.length && (
              <div className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary">
                <span className="animate-pulse">▶</span>
                <span>試合進行中...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 試合結果 ── */}
      {phase === 'result' && (
        <div>
          {/* スコア */}
          <p className="text-text-secondary text-sm mb-2 text-center">試合終了</p>
          <div className="flex items-center justify-center gap-6 mb-3 py-3 rounded-xl" style={{ background: 'var(--bg-surface-elevated)' }}>
            <div className="text-center">
              <p className="text-xs text-text-secondary mb-0.5">あなたのチーム</p>
              <p className="text-5xl font-black text-text-primary">{result.teamScore}</p>
            </div>
            <span className="text-2xl text-text-secondary font-bold">—</span>
            <div className="text-center">
              <p className="text-xs text-text-secondary mb-0.5">{result.opponent}</p>
              <p className="text-5xl font-black text-text-primary">{result.opponentScore}</p>
            </div>
          </div>

          <div className="text-center mb-4">
            <span className={`inline-block px-5 py-1.5 rounded-full text-sm font-bold ${
              result.win ? 'bg-green-700 text-green-100' :
              result.teamScore === result.opponentScore ? 'bg-yellow-700 text-yellow-100' :
              'bg-red-800 text-red-100'
            }`}>
              {result.win ? '勝利！🎉' : result.teamScore === result.opponentScore ? '引き分け' : '敗北...'}
            </span>
          </div>

          {/* 個人成績 */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
            {[
              { label: 'ゴール', value: result.playerGoals, highlight: result.playerGoals >= 2 },
              { label: 'アシスト', value: result.playerAssists, highlight: result.playerAssists >= 1 },
              { label: '評価点', value: result.playerRating.toFixed(1), highlight: result.playerRating >= 8 },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="rounded-lg p-2" style={{ background: 'var(--bg-surface-elevated)' }}>
                <p className="text-xs text-text-secondary">{label}</p>
                <p className={`text-xl font-bold ${
                  highlight ? 'text-yellow-400' : 'text-text-primary'
                }`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ゴール記録ハイライト（ゴール・アシストのみ抜粋） */}
          {result.events.filter(e =>
            e.type === 'player_goal' || e.type === 'player_assist' || e.type === 'teammate_goal'
          ).length > 0 && (
            <div className="mb-4 space-y-1">
              <p className="text-xs text-text-secondary font-semibold mb-1 uppercase tracking-wide">得点記録</p>
              {result.events
                .filter(e => e.type === 'player_goal' || e.type === 'player_assist' || e.type === 'teammate_goal')
                .map((ev, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs rounded px-2 py-1"
                    style={{ background: eventBg(ev.type) }}>
                    <span>{eventIcon(ev.type)}</span>
                    <span className={ev.type === 'player_goal' ? 'font-bold text-text-primary' : 'text-text-secondary'}>
                      {ev.text}
                    </span>
                  </div>
                ))
              }
            </div>
          )}

          {/* 個人サマリー */}
          <div className="text-xs text-text-secondary text-center mb-4 py-2 rounded-lg" style={{ background: 'var(--bg-surface-elevated)' }}>
            {playerName}：{result.playerGoals}ゴール / {result.playerAssists}アシスト / 評価点 {result.playerRating.toFixed(1)}
            {result.playerGoals >= 3 && ' 🎩 ハットトリック！'}
            {result.playerRating >= 9 && ' 🌟 マン・オブ・ザ・マッチ！'}
          </div>

          {/* アナリストコメント */}
          <div
            className="mb-4 rounded-xl p-3 text-left border"
            style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">🎙️</span>
              <span className="text-xs font-bold text-text-secondary">
                {analystName ?? '試合後コメント'}
              </span>
              {analystLoading && (
                <span className="text-xs text-text-secondary animate-pulse ml-auto">分析中...</span>
              )}
            </div>
            {analystComment ? (
              <p className="text-sm text-text-primary leading-relaxed">{analystComment}</p>
            ) : !analystLoading ? (
              <p className="text-xs text-text-secondary italic">コメントを取得できませんでした</p>
            ) : (
              <div className="flex gap-1 py-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: 'var(--color-accent-green)', animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onContinue}
            className="gl-btn gl-btn-primary w-full"
            style={{ minHeight: '44px' }}
          >
            続ける →
          </button>
        </div>
      )}
    </div>
  );
}
