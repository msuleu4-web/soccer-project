'use client';

import { useState } from 'react';
import type { Position } from '../types/game';
import { useGameState } from '../hooks/useGameState';
import { useAutoSave } from '../hooks/useAutoSave';
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
import StatEffectPanel from './StatEffectPanel';
import LeagueStandingsPanel from './LeagueStandingsPanel';
import AwardsCeremonyModal from './AwardsCeremonyModal';
import { RARITY_COLOR, RARITY_LABEL } from '../lib/awardsSystem';
import { ACHIEVEMENTS } from '../lib/achievements';
import { LEAGUES } from '../lib/leagueData';
import { SKILLS } from '../lib/skills';

const POSITIONS: { value: Position; label: string; desc: string; icon: string }[] = [
  { value: 'FW', label: 'フォワード', desc: '点取り屋として活躍する攻撃的なポジション', icon: '⚽' },
  { value: 'MF', label: 'ミッドフィールダー', desc: 'パスで試合を支配するゲームメーカー', icon: '🎯' },
  { value: 'DF', label: 'ディフェンダー', desc: '守備の要として最終ラインを守る', icon: '🛡️' },
  { value: 'GK', label: 'ゴールキーパー', desc: '最後の砦として守門神を目指す', icon: '🥅' },
];

export default function GameScreen() {
  const game = useGameState();
  const { state } = game;
  useAutoSave(state);

  const [setupName, setSetupName] = useState('');
  const [setupPosition, setSetupPosition] = useState<Position>('FW');
  const [setupError, setSetupError] = useState('');

  const handleStartGame = () => {
    if (!setupName.trim()) {
      setSetupError('選手名を入力してください');
      return;
    }
    if (setupName.trim().length > 20) {
      setSetupError('選手名は20文字以内で入力してください');
      return;
    }
    setSetupError('');
    game.startNewGame(setupName.trim(), setupPosition);
  };

  // Setup screen
  if (state.gamePhase === 'setup') {
    return (
      <div className="gl-card max-w-lg mx-auto">
        <h1 className="text-2xl font-black text-text-primary mb-1">選手育成ゲーム</h1>
        <p className="text-text-secondary text-sm mb-6">
          無名の選手を育ててバロンドールを目指せ！地域リーグからチャンピオンズリーグまでの頂点へ。
        </p>

        {/* Name Input */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-text-secondary mb-1.5">
            選手名
          </label>
          <input
            type="text"
            value={setupName}
            onChange={e => setSetupName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleStartGame()}
            placeholder="例: 田中 健太"
            maxLength={20}
            className="gl-input w-full"
            style={{ minHeight: '44px' }}
          />
          {setupError && <p className="text-red-400 text-xs mt-1">{setupError}</p>}
        </div>

        {/* Position Selection */}
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
          onClick={handleStartGame}
          className="gl-btn gl-btn-accent w-full text-base font-bold"
          style={{ minHeight: '48px' }}
        >
          ゲームスタート →
        </button>

        {/* Load Save Notice */}
        <p className="text-xs text-text-secondary text-center mt-3">
          ※ セーブデータは自動保存されます
        </p>
      </div>
    );
  }

  // Ending screen
  if (state.gamePhase === 'ending') {
    return <EndingScreen state={state} onRestart={game.restartGame} />;
  }

  // Match day screen
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
          onContinue={game.continueFromMatch}
        />
      </div>
    );
  }

  // Transfer screen
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

  // Achievement/Skill unlock toast notification
  const UnlockToast = () => {
    if (game.newUnlocks.length === 0) return null;
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1 pointer-events-none">
        {game.newUnlocks.map((msg, i) => (
          <div
            key={i}
            className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg"
            style={{ background: 'rgba(34,197,94,0.9)' }}
          >
            {msg}
          </div>
        ))}
      </div>
    );
  };

  // Main playing screen
  return (
    <div>
      <UnlockToast />

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

      <GameHeader state={state} />
      <PlayerCard state={state} />
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
          />
          {(state.leagueStandings?.length ?? 0) > 0 && (
            <LeagueStandingsPanel state={state} />
          )}
        </div>
      </div>

      {/* Career totals */}
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

      {/* Skills section */}
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

      {/* Achievements section */}
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

      {/* Reset button */}
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

      {/* Event Modal */}
      {game.pendingEvent && (
        <EventModal
          event={game.pendingEvent}
          onChoice={game.resolveEvent}
        />
      )}
    </div>
  );
}
