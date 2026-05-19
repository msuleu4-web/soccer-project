import type { GameState, Skill } from '../types/game';

export const SKILLS: Skill[] = [
  { id: 'speed_star',   name: 'スピードスター',   description: 'スピード80以上',          icon: '💨', bonus: '疲労回復+5%' },
  { id: 'sniper',       name: 'スナイパー',       description: 'シュート80以上',          icon: '🎯', bonus: 'シュート上昇+1' },
  { id: 'playmaker',    name: 'プレイメーカー',   description: 'パス80以上',              icon: '🧠', bonus: 'パス上昇+1' },
  { id: 'dribble_king', name: 'ドリブルキング',   description: 'ドリブル80以上',          icon: '🕺', bonus: 'ドリブル上昇+1' },
  { id: 'iron_body',    name: '鉄の肉体',         description: 'スタミナ80以上',          icon: '💪', bonus: '疲労増加-20%' },
  { id: 'wall',         name: '鉄壁',             description: 'ディフェンス80以上',      icon: '🛡️', bonus: '怪我リスク-50%' },
  { id: 'all_rounder',  name: 'オールラウンダー', description: '全スタット50以上',        icon: '⭐', bonus: 'OVR計算+2' },
  { id: 'legend',       name: 'レジェンド',       description: 'OVR90以上',              icon: '👑', bonus: '全トレーニング+1' },
];

export function checkNewSkills(state: GameState): string[] {
  const already = new Set(state.skills ?? []);
  const newSkills: string[] = [];
  const s = state.stats;

  const check = (id: string, condition: boolean) => {
    if (condition && !already.has(id)) newSkills.push(id);
  };

  check('speed_star',   s.speed >= 80);
  check('sniper',       s.shooting >= 80);
  check('playmaker',    s.passing >= 80);
  check('dribble_king', s.dribbling >= 80);
  check('iron_body',    s.stamina >= 80);
  check('wall',         s.defense >= 80);
  check('all_rounder',  Object.values(s).every(v => v >= 50));
  check('legend',       state.ovr >= 90);

  return newSkills;
}
