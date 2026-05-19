'use client';

import type { GameState } from '../types/game';
import { GAME_CONFIG } from '../lib/gameConfig';

interface Props {
  state: GameState;
}

export default function StatEffectPanel({ state }: Props) {
  const { stats, ovr, position, fatigue, morale } = state;

  // simulateMatch と同じ計算式で実際の確率を算出
  const fatiguePenalty = fatigue > 50 ? (fatigue - 50) / 100 : 0;
  const moraleFactor = morale / 100;
  const effectiveOvr = ovr * (1 - fatiguePenalty * 0.3) * (0.7 + moraleFactor * 0.3);

  let goalChance = 0;
  if (position === 'FW')      goalChance = (stats.shooting / 100) * 0.6 + (effectiveOvr / 100) * 0.4;
  else if (position === 'MF') goalChance = (stats.shooting / 100) * 0.3 + (effectiveOvr / 100) * 0.2;
  else                        goalChance = (stats.shooting / 100) * 0.1 + (effectiveOvr / 100) * 0.05;

  // 1試合あたり期待ゴール数
  const expectedGoals = goalChance * 1.5 * (0.75 * 1 + 0.25 * 2);
  const goalProbPct = Math.round(goalChance * 100);
  const assistPct  = 25; // 固定確率

  // 疲労・モラルによるOVR低下
  const ovrPenaltyPct = ovr > 0 ? Math.round((1 - effectiveOvr / ovr) * 100) : 0;

  // 怪我リスク
  const injuryRisk = fatigue >= GAME_CONFIG.FATIGUE_INJURY_THRESHOLD
    ? Math.round(GAME_CONFIG.FATIGUE_INJURY_CHANCE * 100)
    : 0;

  const rows: { label: string; value: string; color?: string; detail?: string }[] = [
    {
      label: 'ゴール確率',
      value: `${goalProbPct}% / 試合`,
      color: goalProbPct >= 40 ? '#22c55e' : goalProbPct >= 25 ? '#eab308' : '#9ca3af',
      detail: `期待値 ${expectedGoals.toFixed(2)}点/試合`,
    },
    {
      label: 'アシスト確率',
      value: `${assistPct}%`,
      color: '#3b82f6',
      detail: 'パス・ドリブルが高いほど質が上がる',
    },
    {
      label: '実効OVR',
      value: `${Math.round(effectiveOvr)} (${ovr}基準)`,
      color: ovrPenaltyPct > 10 ? '#ef4444' : '#22c55e',
      detail: ovrPenaltyPct > 0
        ? `疲労・モラルで${ovrPenaltyPct}%低下中`
        : '疲労・モラル良好',
    },
    {
      label: '評価点 目安',
      value: (() => {
        const base = 5.0 + (effectiveOvr - 50) / 20;
        return `${Math.max(3, Math.min(10, base)).toFixed(1)} 〜 ${Math.max(3, Math.min(10, base + 0.8)).toFixed(1)}`;
      })(),
      detail: 'ゴール・勝利でさらに上昇',
    },
    ...(injuryRisk > 0 ? [{
      label: '怪我リスク',
      value: `${injuryRisk}% / 練習`,
      color: '#ef4444',
      detail: '疲労80超で発動。休息で解消',
    }] : []),
  ];

  // スタットが実際に何に効くか
  const statEffects: { stat: string; effect: string }[] = position === 'FW' ? [
    { stat: 'シュート↑', effect: 'ゴール確率+（最重要）' },
    { stat: 'ドリブル↑', effect: '突破成功率・評価点+' },
    { stat: 'スピード↑', effect: '抜け出し成功・疲労ペナルティ軽減' },
    { stat: 'スタミナ↑', effect: '疲労増加ペナルティ軽減' },
    { stat: 'パス↑',     effect: 'アシスト品質・評価点+' },
    { stat: 'DF↑',       effect: 'FWにはほぼ影響なし' },
  ] : position === 'MF' ? [
    { stat: 'パス↑',     effect: 'アシスト品質・チームプレー+（最重要）' },
    { stat: 'ドリブル↑', effect: '突破・ゲームメイク+' },
    { stat: 'シュート↑', effect: 'ゴール確率+' },
    { stat: 'スタミナ↑', effect: '90分通じた安定パフォーマンス' },
    { stat: 'スピード↑', effect: 'プレスバック・カウンター参加' },
    { stat: 'DF↑',       effect: 'ボール奪取・評価点+' },
  ] : position === 'DF' ? [
    { stat: 'DF↑',       effect: '失点防止・評価点+（最重要）' },
    { stat: 'スタミナ↑', effect: '90分のデュエル維持' },
    { stat: 'スピード↑', effect: '裏抜け対応・カバーリング' },
    { stat: 'パス↑',     effect: 'ビルドアップ貢献' },
    { stat: 'ドリブル↑', effect: 'DFにはほぼ影響なし' },
    { stat: 'シュート↑', effect: 'DFにはほぼ影響なし' },
  ] : [
    { stat: 'DF↑',       effect: 'セーブ率・評価点+（最重要）' },
    { stat: 'スタミナ↑', effect: '集中力持続・反応速度' },
    { stat: 'スピード↑', effect: '飛び出し対応' },
    { stat: 'パス↑',     effect: 'ビルドアップ配球' },
    { stat: 'シュート/ドリブル↑', effect: 'GKにはほぼ影響なし' },
  ];

  return (
    <div className="gl-card mb-4">
      <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wide">
        📊 試合への影響
      </h3>

      {/* 実数値 */}
      <div className="space-y-2 mb-4">
        {rows.map(row => (
          <div key={row.label} className="flex items-center justify-between gap-2">
            <span className="text-xs text-text-secondary w-24 flex-shrink-0">{row.label}</span>
            <div className="flex-1 text-right">
              <span className="text-xs font-bold" style={{ color: row.color ?? 'var(--fg-1)' }}>
                {row.value}
              </span>
              {row.detail && (
                <p className="text-xs text-text-secondary mt-0.5">{row.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* スタット効果一覧 */}
      <div className="border-t border-[var(--color-border)] pt-3">
        <p className="text-xs text-text-secondary font-semibold mb-2 uppercase tracking-wide">
          {position} スタット効果
        </p>
        <div className="space-y-1">
          {statEffects.map(({ stat, effect }) => (
            <div key={stat} className="flex items-start gap-2 text-xs">
              <span className="font-bold text-[var(--color-accent-green)] w-28 flex-shrink-0">{stat}</span>
              <span className="text-text-secondary">{effect}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
