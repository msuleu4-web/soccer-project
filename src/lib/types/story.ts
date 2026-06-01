// ストーリーシステム全体で使用する型定義
// as any 禁止：すべての型は明示的に定義する

export type SceneType       = 'dialogue' | 'choice' | 'match_event' | 'reflection';
export type ContentType     = 'scene' | 'route' | 'ending' | 'extra_choice';
export type TransactionType = 'salary' | 'unlock_scene' | 'gift' | 'training' | 'refund';
export type RelatedContentType = 'scene' | 'character' | 'item';
export type Emotion         = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'serious' | 'smile' | 'anxious' | 'shy' | 'embarrassed' | 'determined' | 'crying';

// シーンコンテンツ

export interface DialogueLine {
  speaker: string;   // キャラスラグ | 'player' | 'narration'
  text: string;
  emotion?: Emotion;
}

export interface Choice {
  id: string;
  text: string;
  cost: number;                         // 0 = 無料
  next_scene_id: string | null;
  next_scene_id_win?: string | null;    // branch_by_match: true 時の WIN 遷移先
  next_scene_id_lose?: string | null;   // branch_by_match: true 時の LOSE 遷移先
  branch_by_match?: boolean;            // true なら last_match_win フラグで分岐
  sets_flags?: Record<string, boolean>;
  locked_message?: string;
  game_bonus?: GameBonus;               // 選択後にゲームへ反映するボーナス
}

// 育成ゲームへのフィードバックボーナス
export interface GameBonus {
  morale?:    number;  // モラル加算 (負数も可)
  shooting?:  number;
  passing?:   number;
  dribbling?: number;
  speed?:     number;
  stamina?:   number;
  defense?:   number;
}

export interface SceneContent {
  type: SceneType;
  lines: DialogueLine[];
  choices?: Choice[];
  background_image?: string;
  bgm?: string;
}

// テーブル型

export interface StoryCharacter {
  id: string;
  slug: string;
  display_name_ja: string;
  role: string;
  archetype: string;
  theme_color: string;
  character_image_url: string | null;
  bio_summary_ja: string | null;
  unlock_condition: Record<string, unknown>;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoryChapter {
  id: string;
  part_number: 1 | 2 | 3;
  chapter_number: number;
  title_ja: string;
  subtitle_ja: string | null;
  description_ja: string | null;
  required_progress: Record<string, unknown>;
  created_at: string;
}

export interface StoryScene {
  id: string;
  chapter_id: string;
  character_id: string | null;
  scene_order: number;
  scene_type: SceneType;
  title_ja: string | null;
  content: SceneContent;
  unlock_cost: number;
  requires_flags: Record<string, boolean>;
  sets_flags: Record<string, boolean>;
  created_at: string;
}

export interface UserStoryProgress {
  user_id: string;
  current_part: 1 | 2 | 3;
  current_chapter_id: string | null;
  current_scene_id: string | null;
  season_number: number;
  gameweek: number;
  story_flags: Record<string, boolean>;
  completed_routes: string[];
  unlocked_routes: string[];
  last_played_at: string;
  created_at: string;
}

export interface UserWallet {
  user_id: string;
  balance: number;
  weekly_salary: number;
  last_payday_at: string;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: TransactionType;
  amount: number;
  description_ja: string;
  related_content_type: RelatedContentType | null;
  related_content_id: string | null;
  created_at: string;
}

export interface UserUnlockedContent {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  unlocked_at: string;
}

// API レスポンス型

export interface ProgressResponse {
  progress: UserStoryProgress | null;
  wallet: UserWallet | null;
}

export interface AdvanceResponse {
  next_scene: StoryScene | null;
  progress: UserStoryProgress;
  flags_updated: Record<string, boolean>;
}

export interface ChooseResponse {
  next_scene_id: string | null;
  flags_set: Record<string, boolean>;
  progress: UserStoryProgress;
}

export interface UnlockResponse {
  success: boolean;
  content_id: string;
  new_balance: number;
  already_unlocked?: boolean;
}

export interface PaydayResponse {
  credited: boolean;
  amount: number;
  new_balance: number;
  next_payday_at: string;
  message_ja: string;
}
