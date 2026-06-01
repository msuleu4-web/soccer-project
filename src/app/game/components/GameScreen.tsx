'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Position } from '../types/game';
import { useGameState } from '../hooks/useGameState';
import { useAutoSave } from '../hooks/useAutoSave';
import { TEAMS } from '../lib/leagueData';
import GameHeader from './GameHeader';
import PlayerCard from './PlayerCard';
import StatsPanel from './StatsPanel';
import TrainingPanel from './TrainingPanel';
import LeagueProgress from './LeagueProgress';
import MatchSimulation from './MatchSimulation';
import TransferModal from './TransferModal';
import EventModal from './EventModal';
import EndingScreen from './EndingScreen';
import SeasonSummaryModal from './SeasonSummaryModal';
import SeasonReviewModal from './SeasonReviewModal';
import StatEffectPanel from './StatEffectPanel';
import LeagueStandingsPanel from './LeagueStandingsPanel';
import AwardsCeremonyModal from './AwardsCeremonyModal';
import { RARITY_COLOR, RARITY_LABEL } from '../lib/awardsSystem';
import { ACHIEVEMENTS } from '../lib/achievements';
import { LEAGUES } from '../lib/leagueData';
import { SKILLS } from '../lib/skills';
import ShopModal from './ShopModal';
import GachaModal from './GachaModal';
import InventoryModal from './InventoryModal';
import HeroineReactionBubble from './HeroineReactionBubble';
import { getTrainingReaction, getInjuryReaction } from '../lib/heroineReactions';
import type { HeroineReaction } from '../lib/heroineReactions';

const POSITIONS: { value: Position; label: string; desc: string; icon: string }[] = [
  { value: 'FW', label: 'フォワード', desc: '点取り屋として活躍する攻撃的なポジション', icon: '⚽' },
  { value: 'MF', label: 'ミッドフィールダー', desc: 'パスで試合を支配するゲームメーカー', icon: '🎯' },
  { value: 'DF', label: 'ディフェンダー', desc: '守備の要として最終ラインを守る', icon: '🛡️' },
  { value: 'GK', label: 'ゴールキーパー', desc: '最後の砦として守門神を目指す', icon: '🥅' },
];

const REGIONAL_TEAMS = TEAMS.regional;

export default function GameScreen() {
  const game   = useGameState();
  const router = useRouter();
  const { state } = game;
  useAutoSave(state);

  // ヒロイン反応バブル
  const [heroineReaction, setHeroineReaction] = useState<HeroineReaction | null>(null);
  const prevTrainingFeedback = useRef(game.trainingFeedback);
  const prevInjury = useRef(state.injury);

  // トレーニング完了時の反応
  useEffect(() => {
    if (game.trainingFeedback && !prevTrainingFeedback.current) {
      const r = getTrainingReaction(game.trainingFeedback);
      if (r) setHeroineReaction(r);
    }
    prevTrainingFeedback.current = game.trainingFeedback;
  }, [game.trainingFeedback]);

  // 怪我発生 / 回復時の反応
  useEffect(() => {
    const r = getInjuryReaction(prevInjury.current, state.injury);
    if (r) setHeroineReaction(r);
    prevInjury.current = state.injury;
  }, [state.injury]);

  // ストーリーから戻ってきた時: ボーナス適用
  useEffect(() => {
    if (!state.playerName) return;

    const bonusRaw = sessionStorage.getItem('storyBonus');
    if (bonusRaw) {
      sessionStorage.removeItem('storyBonus');
      try {
        const bonus = JSON.parse(bonusRaw) as Record<string, number>;
        game.applyStoryBonus(bonus);
      } catch { /* ignore */ }
    }

    const weekStr = sessionStorage.getItem('pendingStoryWeek');
    if (weekStr) {
      sessionStorage.removeItem('pendingStoryWeek');
      game.markStoryWeekSeen(parseInt(weekStr, 10));
      return;
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.playerName]);

  // 解禁されているストーリー週を取得 (5,10,15,20,25,30,35,38)
  const STORY_WEEKS = [5, 10, 15, 20, 25, 30, 35, 38] as const;
  const availableStoryWeek = STORY_WEEKS.find(
    w => state.currentWeek >= w && !(state.storySeenWeeks ?? []).includes(w)
  );

  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [storyLoadFailed, setStoryLoadFailed] = useState(false);

  const handleStoryButtonClick = useCallback(async () => {
    if (!availableStoryWeek || isStoryLoading) return;
    setIsStoryLoading(true);
    setStoryLoadFailed(false);

    const winRate     = state.seasonRating > 0 ? Math.min(1, state.seasonRating / 10) : 0.5;
    const goalRate    = state.matchesPlayed > 0 ? state.seasonGoals / state.matchesPlayed : 0;
    const hadTransfer = (game.pendingTransferOffers?.length ?? 0) > 0;
    const recentWin   = state.matchesPlayed > 0 && state.seasonRating >= 7.5;

    try {
      const res  = await fetch('/api/story/game-event', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          event_type:     'match_cycle',
          win:            recentWin,
          win_rate:       winRate,
          goal_rate:      goalRate,
          had_transfer:   hadTransfer,
          has_injury:     state.injury > 0,
          morale:         state.morale,
          current_league: state.currentLeague,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { scene_id?: string | null };
        if (data.scene_id) {
          sessionStorage.setItem('pendingStoryWeek', String(availableStoryWeek));
          router.push(`/story/play/${data.scene_id}?returnTo=/game`);
          return; // ページ遷移するのでここで終了
        }
        // 200だがシーンなし → このWeekのストーリーは設定なし、スキップ扱い
        game.markStoryWeekSeen(availableStoryWeek);
        setIsStoryLoading(false);
        return;
      }
      if (res.status === 401) {
        setStoryLoadFailed(true);
        setIsStoryLoading(false);
        return;
      }
      // 500 など → 失敗表示（ボタンは消さない）
      setStoryLoadFailed(true);
    } catch {
      // ネットワークエラー → 失敗表示
      setStoryLoadFailed(true);
    }

    setIsStoryLoading(false);
  }, [availableStoryWeek, isStoryLoading, state, game, router]);

  const handleStorySkip = useCallback(() => {
    if (!availableStoryWeek) return;
    game.markStoryWeekSeen(availableStoryWeek);
    setStoryLoadFailed(false);
  }, [availableStoryWeek, game]);

  const handleMatchContinue = useCallback(() => {
    game.continueFromMatch();
  }, [game]);

  const [setupName, setSetupName] = useState('');
  const [setupPosition, setSetupPosition] = useState<Position>('FW');
  const [setupTeamId, setSetupTeamId] = useState<string>(REGIONAL_TEAMS[0].id);
  const [setupStep, setSetupStep] = useState<'basic' | 'team'>('basic');
  const [setupError, setSetupError] = useState('');
  const [showShop, setShowShop] = useState(false);
  const [showGacha, setShowGacha] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const handleNextStep = () => {
    if (!setupName.trim()) {
      setSetupError('選手名を入力してください');
      return;
    }
    if (setupName.trim().length > 20) {
      setSetupError('選手名は20文字以内で入力してください');
      return;
    }
    setSetupError('');
    setSetupStep('team');
  };

  const handleStartGame = () => {
    game.startNewGame(setupName.trim(), setupPosition, setupTeamId);
  };

  if (game.isInitializing) {
    return <div className="fixed inset-0" style={{ background: 'var(--bg-base)' }} />;
  }

  // セットアップ: 名前・ポジション
  if (state.gamePhase === 'setup' && setupStep === 'basic') {
    return (
      <div className="gl-card max-w-lg mx-auto">
        <h1 className="text-2xl font-black text-text-primary mb-1">選手育成ゲーム</h1>
        <p className="text-text-secondary text-sm mb-6">
          無名の選手を育ててバロンドールを目指せ！地域リーグからチャンピオンズリーグまでの頂点へ。
        </p>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            選手名
          </label>
          <input
            type="text"
            value={setupName}
            onChange={e => setSetupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleNextStep()}
            placeholder="例: 田中 健太"
            maxLength={20}
            className="gl-input w-full"
            style={{ minHeight: '44px' }}
          />
          {setupError && <p className="text-red-400 text-xs mt-1">{setupError}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-text-secondary mb-2">
            ポジション
          </label>
          <div className="grid grid-cols-2 gap-2">
            {POSITIONS.map(pos => (
              <button
                key={pos.value}
                onClick={() => setSetupPosition(pos.value)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  setupPosition === pos.value
                    ? 'border-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent-green)]'
                }`}
                style={{ minHeight: '44px' }}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span>{pos.icon}</span>
                  <span className="text-sm font-bold text-text-primary">{pos.label} ({pos.value})</span>
                </div>
                <p className="text-xs text-text-secondary">{pos.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleNextStep}
          className="gl-btn gl-btn-accent w-full text-base font-bold"
          style={{ minHeight: '48px' }}
        >
          次へ：チームを選ぶ →
        </button>

        <p className="text-xs text-text-secondary text-center mt-3">
          ※ セーブデータは自動保存されます
        </p>
      </div>
    );
  }

  // セットアップ: チーム選択
  if (state.gamePhase === 'setup' && setupStep === 'team') {
    return (
      <div className="gl-card max-w-lg mx-auto">
        <button
          onClick={() => setSetupStep('basic')}
          className="text-xs text-text-secondary hover:text-text-primary mb-4 flex items-center gap-1"
        >
          ← 戻る
        </button>
        <h2 className="text-xl font-black text-text-primary mb-1">🏘️ 所属チームを選択</h2>
        <p className="text-text-secondary text-sm mb-4">
          地域リーグのチームからスタートします。実力をつけて上のリーグを目指そう！
        </p>
        <div className="space-y-2 mb-6">
          {REGIONAL_TEAMS.map(team => (
            <button
              key={team.id}
              onClick={() => setSetupTeamId(team.id)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                setupTeamId === team.id
                  ? 'border-[var(--color-accent-green)] bg-[var(--color-accent-green)]/10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-accent-green)]'
              }`}
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-text-primary">{team.name}</span>
                  <span className="text-xs text-text-secondary ml-2">地域リーグ</span>
                </div>
                <span className="text-xs text-text-secondary">給料 {team.salary}万/月</span>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={handleStartGame}
          className="gl-btn gl-btn-accent w-full text-base font-bold"
          style={{ minHeight: '48px' }}
        >
          ゲームスタート →
        </button>
      </div>
    );
  }

  if (state.gamePhase === 'ending') {
    return <EndingScreen state={state} onRestart={game.restartGame} />;
  }

  if (state.gamePhase === 'match_day' && game.lastMatchResult) {
    return (
      <div>
        <GameHeader state={state} />
        <MatchSimulation
          result={game.lastMatchResult}
          playerName={state.playerName}
          highlights={game.highlights}
          position={state.position}
          league={LEAGUES[state.currentLeague].name}
          age={state.age}
          ovr={state.ovr}
          onContinue={handleMatchContinue}
        />
      </div>
    );
  }

  if (state.gamePhase === 'transfer') {
    return (
      <div>
        <GameHeader state={state} />
        <PlayerCard state={state} />
        <TransferModal
          offers={game.pendingTransferOffers}
          currentSalary={state.currentTeam.salary}
          onAccept={game.acceptTransfer}
          onDecline={game.declineTransfer}
        />
      </div>
    );
  }

  const UnlockToast = () => {
    if (game.newUnlocks.length === 0) return null;
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1 pointer-events-none">
        {game.newUnlocks.map((msg, i) => (
          <div key={i} className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg"
            style={{ background: 'rgba(34,197,94,0.9)' }}>
            {msg}
          </div>
        ))}
      </div>
    );
  };

  const TrainingToast = () => {
    const fb = game.trainingFeedback;
    if (!fb) return null;
    const styles: Record<string, { bg: string; border: string; color: string }> = {
      critical_success: { bg: 'rgba(250,204,21,0.95)',  border: '#ca8a04', color: '#78350f' },
      success:          { bg: 'rgba(34,197,94,0.92)',   border: '#15803d', color: '#fff' },
      failure:          { bg: 'rgba(107,114,128,0.92)', border: '#4b5563', color: '#fff' },
      critical_failure: { bg: 'rgba(220,38,38,0.92)',   border: '#991b1b', color: '#fff' },
    };
    const s = styles[fb.outcome];
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div
          className="px-5 py-3 rounded-xl text-sm font-bold shadow-xl border"
          style={{ background: s.bg, borderColor: s.border, color: s.color, minWidth: '220px', textAlign: 'center' }}
        >
          {fb.message}
        </div>
      </div>
    );
  };

  return (
    <div>
      <UnlockToast />
      <TrainingToast />

      {/* ヒロイン反応フローティングバブル */}
      {heroineReaction && (
        <HeroineReactionBubble
          reaction={heroineReaction}
          onDismiss={() => setHeroineReaction(null)}
        />
      )}

      {/* ショップモーダル */}
      {showShop && (
        <ShopModal
          state={state}
          onBuy={item => game.buyItem(item)}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* ガチャモーダル */}
      {showGacha && (
        <GachaModal
          state={state}
          onPull={(type, isMulti) => game.pullGacha(type, isMulti)}
          onClose={() => setShowGacha(false)}
        />
      )}

      {/* 倉庫モーダル */}
      {showInventory && (
        <InventoryModal
          state={state}
          onUse={uid => game.useInventoryItem(uid)}
          onDiscard={uid => game.discardInventoryItem(uid)}
          onClose={() => setShowInventory(false)}
        />
      )}

      {/* 授賞式モーダル: pendingAwardsがあれば必ず先に表示 */}
      {(state.pendingAwards?.length ?? 0) > 0 && (
        <AwardsCeremonyModal
          awards={state.pendingAwards!}
          playerName={state.playerName}
          onClose={game.dismissPendingAwards}
        />
      )}

      {/* シーズン要約: awardsがすべて閉じた後にのみ表示 */}
      {state.showSeasonSummary && (state.pendingAwards?.length ?? 0) === 0 && (
        state.lastSeasonSummary
          ? <SeasonSummaryModal summary={state.lastSeasonSummary} onClose={game.dismissSeasonSummary} />
          : null
      )}

      {/* シーズン評価レポート: 要約を閉じた後に表示 */}
      {state.showSeasonReview && !state.showSeasonSummary && (
        <SeasonReviewModal state={state} onClose={game.dismissSeasonReview} />
      )}

      <GameHeader state={state} />
      <PlayerCard state={state} />

      {/* ストーリーボタン（解禁週に表示・必須） */}
      {availableStoryWeek && (
        <div className="mb-3">
          <button
            onClick={handleStoryButtonClick}
            disabled={isStoryLoading}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(124,58,237,0.45)',
              animation: isStoryLoading ? 'none' : 'story-btn-glow 2s ease-in-out infinite',
              opacity: isStoryLoading ? 0.7 : 1,
            }}
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <span>
                <span className="text-xs font-normal opacity-80 block leading-none mb-0.5">
                  Week {availableStoryWeek} ストーリー（必須）
                </span>
                <span className="text-sm">ストーリーを見る</span>
              </span>
            </span>
            <span className="text-xs opacity-80">
              {isStoryLoading ? '読み込み中…' : 'タップ →'}
            </span>
          </button>

          {storyLoadFailed && (
            <div className="mt-2 p-2 rounded-lg text-xs flex items-center justify-between gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <span className="text-red-400">⚠️ ストーリーを読み込めませんでした</span>
              <div className="flex gap-2">
                <button
                  onClick={handleStoryButtonClick}
                  className="px-2 py-1 rounded text-xs font-bold"
                  style={{ background: 'rgba(124,58,237,0.15)', color: '#a855f7' }}
                >
                  再試行
                </button>
                <button
                  onClick={handleStorySkip}
                  className="px-2 py-1 rounded text-xs font-bold"
                  style={{ background: 'rgba(107,114,128,0.15)', color: '#9ca3af' }}
                >
                  スキップ
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ショップ・ガチャ・倉庫ボタン */}
      <div className="mb-4 flex justify-end items-center gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowShop(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'var(--color-brand-green)', color: '#fff', boxShadow: '0 2px 8px rgba(15,61,46,0.25)' }}
          >
            🛒 <span className="hidden sm:inline">ショップ</span>
            <span className="text-xs opacity-75 font-normal">{state.money.toLocaleString()}万</span>
          </button>
          <button
            onClick={() => setShowGacha(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg,#eab308,#f59e0b)', color: '#fff', boxShadow: '0 2px 8px rgba(234,179,8,0.35)' }}
          >
            🔍 <span className="hidden sm:inline">スカウト</span>
          </button>
          <button
            onClick={() => setShowInventory(true)}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'var(--bg-surface-elevated)', color: 'var(--fg-2)', border: '1px solid var(--border-default)' }}
          >
            🗃️ <span className="hidden sm:inline">倉庫</span>
            {(state.inventory ?? []).length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                style={{ background: '#ef4444', color: '#fff' }}>
                {Math.min((state.inventory ?? []).length, 99)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
        <div>
          <StatsPanel state={state} />
          <StatEffectPanel state={state} />
          <LeagueProgress state={state} />
        </div>
        <div>
          <TrainingPanel
            state={state}
            onTraining={game.selectTraining}
            onSkip={game.skipWeek}
            storyBlocked={!!availableStoryWeek}
          />
          {(state.leagueStandings?.length ?? 0) > 0 && (
            <LeagueStandingsPanel state={state} />
          )}
        </div>
      </div>

      <div className="gl-card mb-4">
        <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">通算成績</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-text-secondary">ゴール</p>
            <p className="text-lg font-bold text-text-primary">{state.totalGoals}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">アシスト</p>
            <p className="text-lg font-bold text-text-primary">{state.totalAssists}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary">獲得賞</p>
            <p className="text-lg font-bold text-text-primary">{state.awards.length + state.trophies.length}</p>
          </div>
        </div>
      </div>

      {/* 受賞歴 */}
      {(state.seasonAwards?.length ?? 0) > 0 && (
        <div className="gl-card mb-4">
          <h3 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wide">
            🏆 受賞歴 ({state.seasonAwards!.length}件)
          </h3>
          <div className="space-y-1.5">
            {state.seasonAwards!.slice().reverse().map((award, idx) => (
              <div
                key={`${award.id}-${idx}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ background: `${RARITY_COLOR[award.rarity]}10`, borderLeft: `3px solid ${RARITY_COLOR[award.rarity]}` }}
              >
                <span className="text-xl flex-shrink-0">{award.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text-primary">{award.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: `${RARITY_COLOR[award.rarity]}22`, color: RARITY_COLOR[award.rarity] }}>
                      {RARITY_LABEL[award.rarity]}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">{award.league} · Season {award.season}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(state.skills ?? []).length > 0 && (
        <div className="gl-card mb-4">
          <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">特技</h3>
          <div className="flex flex-col gap-1">
            {(state.skills ?? [])
              .map(id => SKILLS.find(s => s.id === id))
              .filter((s): s is NonNullable<typeof s> => s !== undefined)
              .map(skill => (
                <div key={skill.id} className="flex items-center gap-2 text-sm text-text-primary">
                  <span>{skill.icon}</span>
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-text-secondary text-xs">— {skill.bonus}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="gl-card mb-4">
        <h3 className="text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">
          実績 ({(state.achievements ?? []).length}/{ACHIEVEMENTS.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map(a => {
            const unlocked = (state.achievements ?? []).includes(a.id);
            return (
              <span
                key={a.id}
                title={a.description}
                className={`text-xs px-2 py-1 rounded-full border transition-opacity ${
                  unlocked
                    ? 'border-[var(--color-accent-green)] text-text-primary'
                    : 'border-[var(--color-border)] text-text-secondary opacity-30'
                }`}
              >
                {a.icon} {a.title}
              </span>
            );
          })}
        </div>
      </div>

      <div className="text-center mb-4">
        <button
          onClick={() => {
            if (confirm('ゲームをリセットしますか？セーブデータが削除されます。')) {
              game.restartGame();
            }
          }}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          ゲームをリセット
        </button>
      </div>

      {game.pendingEvent && (
        <EventModal
          event={game.pendingEvent}
          onChoice={game.resolveEvent}
        />
      )}
    </div>
  );
}
