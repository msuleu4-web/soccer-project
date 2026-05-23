'use client';

import type { GameState } from '../types/game';
import {
  generateSeasonReviews,
  GRADE_COLOR, GRADE_LABEL, SENTIMENT_COLOR,
  type SeasonReviewEntry,
} from '../lib/seasonReviewSystem';

interface Props {
  state: GameState;
  onClose: () => void;
}

const SENTIMENT_LABEL: Record<string, string> = {
  praise:    '絶賛',
  neutral:   '中立',
  mixed:     '賛否',
  criticism: '酷評',
};

const SENTIMENT_BG: Record<string, string> = {
  praise:    'rgba(34,197,94,0.08)',
  neutral:   'rgba(148,163,184,0.08)',
  mixed:     'rgba(245,158,11,0.08)',
  criticism: 'rgba(239,68,68,0.08)',
};

function ReviewCard({ entry }: { entry: SeasonReviewEntry }) {
  const borderColor  = SENTIMENT_COLOR[entry.sentiment];
  const bgColor      = SENTIMENT_BG[entry.sentiment];
  const gradeColor   = GRADE_COLOR[entry.grade];

  return (
    <div
      className="rounded-xl p-4 border transition-all"
      style={{ background: bgColor, borderColor, borderWidth: '1.5px' }}
    >
      {/* ヘッダー */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${borderColor}20` }}
        >
          {entry.reviewerEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-black text-text-primary">{entry.reviewerName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-2)' }}>
              {entry.reviewerRole}
            </span>
          </div>
        </div>
        {/* 評価バッジ */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span
            className="text-[10px] font-black px-1.5 py-0.5 rounded"
            style={{ background: `${gradeColor}20`, color: gradeColor }}
          >
            {entry.grade} {GRADE_LABEL[entry.grade]}
          </span>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: `${borderColor}20`, color: borderColor }}
          >
            {SENTIMENT_LABEL[entry.sentiment]}
          </span>
        </div>
      </div>

      {/* コメント本文 */}
      <blockquote
        className="text-sm leading-relaxed text-text-primary pl-3 italic"
        style={{ borderLeft: `3px solid ${borderColor}` }}
      >
        「{entry.comment}」
      </blockquote>
    </div>
  );
}

export default function SeasonReviewModal({ state, onClose }: Props) {
  const reviews = generateSeasonReviews(state);

  if (reviews.length === 0) {
    onClose();
    return null;
  }

  const summary = state.lastSeasonSummary;
  const gradeColor = GRADE_COLOR[reviews[0].grade];
  const overall    = reviews[0].grade;

  // 全体のセンチメントサマリー
  const praiseCount    = reviews.filter(r => r.sentiment === 'praise').length;
  const criticismCount = reviews.filter(r => r.sentiment === 'criticism').length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)' }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-card)', maxHeight: '92vh', boxShadow: '0 -4px 40px rgba(0,0,0,0.35)' }}
      >
        {/* ── ヘッダー ── */}
        <div
          className="px-5 pt-5 pb-4 border-b"
          style={{ borderColor: 'var(--border-default)', background: `${gradeColor}08` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0"
              style={{ background: `${gradeColor}25`, color: gradeColor }}
            >
              {overall}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-text-primary">
                シーズン {summary?.season} 評価レポート
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {summary?.league} ／ {summary?.goals}G {summary?.assists}A ／ 評価点 {summary?.rating.toFixed(1)}
              </p>
            </div>
          </div>

          {/* 評価サマリーバー */}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="font-bold" style={{ color: '#22c55e' }}>絶賛 {praiseCount}人</span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border-default)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(praiseCount / reviews.length) * 100}%`,
                  background: 'linear-gradient(to right, #22c55e, #ef4444)',
                  opacity: 0.8,
                }}
              />
            </div>
            <span className="font-bold" style={{ color: '#ef4444' }}>酷評 {criticismCount}人</span>
          </div>
        </div>

        {/* ── レビューリスト ── */}
        <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3">
          {reviews.map((entry, i) => (
            <ReviewCard key={i} entry={entry} />
          ))}
        </div>

        {/* ── フッター ── */}
        <div className="px-4 pb-5 pt-3 border-t" style={{ borderColor: 'var(--border-default)' }}>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl font-black text-base transition-all"
            style={{ background: 'var(--color-brand-green)', color: '#fff', boxShadow: '0 2px 12px rgba(15,61,46,0.3)' }}
          >
            次のシーズンへ →
          </button>
        </div>
      </div>
    </div>
  );
}
