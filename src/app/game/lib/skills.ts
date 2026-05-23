import type { GameState, Skill } from '../types/game';
import { STAT_MAX } from './gameConfig';

export const SKILLS: Skill[] = [
  { id: 'speed_star',   name: 'スピードスター',   description: 'スピードが上限の70%以上',          icon: '💨', bonus: '疲労回復+5%' },
  { id: 'sniper',       name: 'スナイパー',       description: 'シュートが上限の70%以上',          icon: '🎯', bonus: 'シュート上昇+1' },
  { id: 'playmaker',    name: 'プレイメーカー',   description: 'パスが上限の70%以上',              icon: '🧠', bonus: 'パス上昇+1' },
  { id: 'dribble_king', name: 'ドリブルキング',   description: 'ドリブルが上限の70%以上',          icon: '🕺', bonus: 'ドリブル上昇+1' },
  { id: 'iron_body',    name: '鉄の肉体',         description: 'スタミナが上限の70%以上',          icon: '💪', bonus: '疲労増加-20%' },
  { id: 'wall',         name: '鉄壁',             description: 'ディフェンスが上限の65%以上',      icon: '🛡️', bonus: '怪我リスク-50%' },
  { id: 'all_rounder',  name: 'オールラウンダー', description: '全スタットが各上限の45%以上',      icon: '⭐', bonus: 'OVR計算+2' },
  { id: 'legend',       name: 'レジェンド',       description: 'OVR90以上',                       icon: '👑', bonus: '全トレーニング+1' },
];

export function checkNewSkills(state: GameState): string[] {
  const already = new Set(state.skills ?? []);
  const newSkills: string[] = [];
  const s = state.stats;
  const mx = STAT_MAX[state.position];

  const check = (id: string, condition: boolean) => {
    if (condition && !already.has(id)) newSkills.push(id);
  };

  // 各スタットの閾値はポジション上限の70%（GKがshooterスキルを取れない問題を解消）
  check('speed_star',   s.speed    >= mx.speed    * 0.70);
  check('sniper',       s.shooting >= mx.shooting * 0.70);
  check('playmaker',    s.passing  >= mx.passing  * 0.70);
  check('dribble_king', s.dribbling >= mx.dribbling * 0.70);
  check('iron_body',    s.stamina  >= mx.stamina  * 0.70);
  check('wall',         s.defense  >= mx.defense  * 0.65);
  // all_rounder: 全スタットが各自上限の45%以上
  check('all_rounder',
    s.shooting  >= mx.shooting  * 0.45 &&
    s.passing   >= mx.passing   * 0.45 &&
    s.dribbling >= mx.dribbling * 0.45 &&
    s.speed     >= mx.speed     * 0.45 &&
    s.stamina   >= mx.stamina   * 0.45 &&
    s.defense   >= mx.defense   * 0.45
  );
  check('legend', state.ovr >= 90);

  return newSkills;
}
