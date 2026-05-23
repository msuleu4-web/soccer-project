import type { Position, PlayerStats } from '../types/game';

// ポジション別 スタット上限（500以上スケール）
export const STAT_MAX: Record<Position, Record<keyof PlayerStats, number>> = {
  FW: { shooting: 500, passing: 380, dribbling: 450, speed: 430, stamina: 380, defense: 250 },
  MF: { shooting: 380, passing: 500, dribbling: 440, speed: 400, stamina: 450, defense: 380 },
  DF: { shooting: 220, passing: 360, dribbling: 260, speed: 430, stamina: 450, defense: 500 },
  GK: { shooting: 160, passing: 280, dribbling: 160, speed: 340, stamina: 420, defense: 550 },
};

export const GAME_CONFIG = {
  INITIAL_STATS: {
    FW: { shooting: 90, passing: 55, dribbling: 75, speed: 70, stamina: 55, defense: 30 },
    MF: { shooting: 55, passing: 90, dribbling: 72, speed: 60, stamina: 70, defense: 52 },
    DF: { shooting: 35, passing: 52, dribbling: 35, speed: 70, stamina: 70, defense: 90 },
    GK: { shooting: 18, passing: 40, dribbling: 20, speed: 52, stamina: 62, defense: 105 },
  } as Record<Position, PlayerStats>,
  OVR_WEIGHTS: {
    FW: { shooting: 0.30, passing: 0.15, dribbling: 0.25, speed: 0.15, stamina: 0.10, defense: 0.05 },
    MF: { shooting: 0.15, passing: 0.30, dribbling: 0.15, speed: 0.10, stamina: 0.15, defense: 0.15 },
    DF: { shooting: 0.05, passing: 0.15, dribbling: 0.05, speed: 0.15, stamina: 0.15, defense: 0.45 },
    GK: { shooting: 0.00, passing: 0.05, dribbling: 0.00, speed: 0.10, stamina: 0.10, defense: 0.75 },
  } as Record<Position, Record<keyof PlayerStats, number>>,
  TRANSFER_THRESHOLDS: {
    j3: 50,
    j2: 62,
    j1: 72,
    premier_league: 80,
    champions_league: 88,
  } as Record<string, number>,
  FATIGUE_RECOVERY_PER_WEEK: 10,
  FATIGUE_INJURY_THRESHOLD: 80,
  FATIGUE_INJURY_CHANCE: 0.10,
  EVENT_CHANCE_PER_WEEK: 0.20,
  RETIREMENT_AGE: 35,
  BALLON_DOR_OVR: 95,
  BALLON_DOR_RATING: 8.5,
};
