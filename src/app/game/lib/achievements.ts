import type { GameState, Achievement } from '../types/game';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_goal',   title: '初ゴール',         description: '初めてのゴールを決めた',             icon: '⚽' },
  { id: 'hat_trick',    title: 'ハットトリック',    description: '1試合で3得点以上を記録した',         icon: '🎩' },
  { id: 'goals_10',     title: '10得点達成',        description: '通算10ゴールを達成した',             icon: '🥅' },
  { id: 'goals_50',     title: '50得点達成',        description: '通算50ゴールを達成した',             icon: '🌟' },
  { id: 'goals_100',    title: '100得点達成',       description: '通算100ゴールを達成した',            icon: '👑' },
  { id: 'ovr_60',       title: 'OVR60突破',         description: '総合力60を超えた',                   icon: '📈' },
  { id: 'ovr_80',       title: 'OVR80突破',         description: '総合力80を超えた',                   icon: '🔥' },
  { id: 'ovr_90',       title: 'OVR90突破',         description: '総合力90を超えた！',                 icon: '💎' },
  { id: 'reach_j1',     title: 'J1昇格',            description: 'J1リーグに到達した',                 icon: '🥇' },
  { id: 'reach_pl',     title: 'プレミアリーグ',    description: 'プレミアリーグに到達した',           icon: '⭐' },
  { id: 'reach_cl',     title: 'CL出場',            description: 'チャンピオンズリーグに到達した',     icon: '👑' },
  { id: 'first_trophy', title: '初タイトル',        description: '初めてのタイトルを獲得した',         icon: '🏆' },
  { id: 'season_5',     title: 'ベテラン',          description: '5シーズンをプレーした',              icon: '📅' },
  { id: 'millionaire',  title: '億万長者',          description: '貯金1000万円を達成した',             icon: '💰' },
];

export function checkAchievements(prev: GameState, next: GameState, matchGoals = 0): string[] {
  const newlyUnlocked: string[] = [];
  const already = new Set(next.achievements ?? []);

  const check = (id: string, condition: boolean) => {
    if (condition && !already.has(id)) {
      already.add(id);
      newlyUnlocked.push(id);
    }
  };

  check('first_goal',   next.totalGoals >= 1);
  check('hat_trick',    matchGoals >= 3);
  check('goals_10',     next.totalGoals >= 10);
  check('goals_50',     next.totalGoals >= 50);
  check('goals_100',    next.totalGoals >= 100);
  check('ovr_60',       next.ovr >= 60);
  check('ovr_80',       next.ovr >= 80);
  check('ovr_90',       next.ovr >= 90);
  check('reach_j1',     next.currentLeague === 'j1');
  check('reach_pl',     next.currentLeague === 'premier_league');
  check('reach_cl',     next.currentLeague === 'champions_league');
  check('first_trophy', next.trophies.length >= 1);
  check('season_5',     next.currentSeason >= 5);
  check('millionaire',  next.money >= 1000);

  return newlyUnlocked;
}
