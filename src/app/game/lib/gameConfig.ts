import type { Position, PlayerStats } from '../types/game';

// ポジション別 スタット上限
// 主力スタットは100超え可能、非主力は低め
export const STAT_MAX: Record<Position, Record<keyof PlayerStats, number>> = {
  FW: { shooting: 130, passing: 105, dribbling: 120, speed: 115, stamina: 105, defense: 85 },
  MF: { shooting: 110, passing: 130, dribbling: 120, speed: 110, stamina: 120, defense: 105 },
  DF: { shooting: 75,  passing: 100, dribbling: 85,  speed: 115, stamina: 120, defense: 130 },
  GK: { shooting: 60,  passing: 90,  dribbling: 60,  speed: 100, stamina: 110, defense: 150 },
};

export const GAME_CONFIG = {
  INITIAL_STATS: {
    FW: { shooting: 25, passing: 15, dribbling: 20, speed: 20, stamina: 15, defense: 10 },
    MF: { shooting: 15, passing: 25, dribbling: 20, speed: 15, stamina: 20, defense: 15 },
    DF: { shooting: 10, passing: 15, dribbling: 10, speed: 15, stamina: 20, defense: 25 },
    GK: { shooting: 5,  passing: 10, dribbling: 5,  speed: 10, stamina: 15, defense: 30 },
  } as Record<Position, PlayerStats>,
  OVR_WEIGHTS: {
    FW: { shooting: 0.30, passing: 0.15, dribbling: 0.25, speed: 0.15, stamina: 0.10, defense: 0.05 },
    MF: { shooting: 0.15, passing: 0.30, dribbling: 0.15, speed: 0.10, stamina: 0.15, defense: 0.15 },
    DF: { shooting: 0.05, passing: 0.15, dribbling: 0.05, speed: 0.15, stamina: 0.15, defense: 0.45 },
    GK: { shooting: 0.00, passing: 0.05, dribbling: 0.00, speed: 0.10, stamina: 0.10, defense: 0.75 },
  } as Record<Position, Record<keyof PlayerStats, number>>,
  TRANSFER_THRESHOLDS: {
    j3: 45,
    j2: 55,
    j1: 65,
    premier_league: 75,
    champions_league: 85,
  } as Record<string, number>,
  FATIGUE_RECOVERY_PER_WEEK: 10,
  FATIGUE_INJURY_THRESHOLD: 80,
  FATIGUE_INJURY_CHANCE: 0.10,
  EVENT_CHANCE_PER_WEEK: 0.20,
  RETIREMENT_AGE: 35,
  BALLON_DOR_OVR: 95,
  BALLON_DOR_RATING: 8.5,
};
