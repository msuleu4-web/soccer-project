'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// 白背景画像をキャンバスで透過処理する
function useRemoveWhiteBg(src: string | null): string | null {
  const [result, setResult] = useState<string | null>(null);
  useEffect(() => {
    if (!src) { setResult(null); return; }
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth, h = img.naturalHeight;
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { setResult(src); return; }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, w, h);
        const d = imageData.data;
        // コーナーからフラッドフィルで白背景を透過
        const THRESHOLD = 245;
        const visited = new Uint8Array(w * h);
        const stack: number[] = [];
        for (let x = 0; x < w; x++) { stack.push(x, w * (h - 1) + x); }
        for (let y = 1; y < h - 1; y++) { stack.push(y * w, y * w + w - 1); }
        while (stack.length) {
          const pos = stack.pop()!;
          if (pos < 0 || pos >= w * h || visited[pos]) continue;
          visited[pos] = 1;
          const i = pos * 4;
          if (d[i] < THRESHOLD || d[i + 1] < THRESHOLD || d[i + 2] < THRESHOLD) continue;
          d[i + 3] = 0;
          const x = pos % w, y = (pos / w) | 0;
          if (x > 0)     stack.push(pos - 1);
          if (x < w - 1) stack.push(pos + 1);
          if (y > 0)     stack.push(pos - w);
          if (y < h - 1) stack.push(pos + w);
        }
        ctx.putImageData(imageData, 0, 0);
        setResult(canvas.toDataURL('image/png'));
      } catch { setResult(src); }
    };
    img.onerror = () => setResult(src);
    img.src = src;
  }, [src]);
  return result;
}
import { useRouter } from 'next/navigation';
import type { StoryScene, UserWallet, Choice, DialogueLine, GameBonus } from '@/lib/types/story';
import { formatBalance } from '@/lib/story/wallet';

interface ScenePlayerProps {
  scene:      StoryScene;
  wallet:     UserWallet;
  storyFlags: Record<string, boolean>;
  returnTo?:  string; // ゲームから来た場合の戻り先URL (例: '/game')
}

const CHAR_INTERVAL_MS = 30;
const AUTO_DELAY_MS    = 1800;

type PlayerPhase = 'typing' | 'line_done' | 'choices';

// speaker スラグ → スプライト設定
// blendMode: 黒背景画像は 'screen'、白背景画像は 'multiply'
type CharConfig = { src: string; blendMode: 'screen' | 'multiply' | 'normal'; dropShadow: string };
const CHARACTER_CONFIG: Record<string, CharConfig> = {
  'misaki':       { src: '/images/characters/misaki.png', blendMode: 'screen',   dropShadow: '0 0 32px rgba(232,180,216,0.3)' },
  'misaki-aoi':   { src: '/images/characters/misaki.png', blendMode: 'screen',   dropShadow: '0 0 32px rgba(232,180,216,0.3)' },
  'rin-kurosaki': { src: '/images/characters/rin.png',    blendMode: 'multiply', dropShadow: '0 0 32px rgba(107,44,95,0.5)'  },
  'koko-kirino':  { src: '/images/characters/koko.png',   blendMode: 'multiply', dropShadow: '0 0 32px rgba(255,105,180,0.5)' },
  'koko':         { src: '/images/characters/koko.png',   blendMode: 'multiply', dropShadow: '0 0 32px rgba(255,105,180,0.5)' },
};

export default function ScenePlayer({ scene, wallet, storyFlags, returnTo: returnToProp }: ScenePlayerProps) {
  const router = useRouter();

  // returnTo: SSRでは undefined を返すので useState + useEffect で初期化する
  const [effectiveReturnTo, setEffectiveReturnTo] = useState<string | undefined>(returnToProp);
  useEffect(() => {
    if (returnToProp) {
      sessionStorage.setItem('storyReturnTo', returnToProp);
      setEffectiveReturnTo(returnToProp);
    } else {
      // returnTo なしで開かれた場合は古いデータを消去する
      // (ゲームから来た前回セッションの storyReturnTo が残っていると誤動作するため)
      sessionStorage.removeItem('storyReturnTo');
      setEffectiveReturnTo(undefined);
    }
  }, [returnToProp]);

  // seed SQL が 'dialogue' キーで保存した場合と 'lines' キーの両方に対応
  const rawContent = scene.content as unknown as Record<string, unknown>;
  const lines: DialogueLine[] = (
    (rawContent.lines as DialogueLine[] | undefined) ??
    (rawContent.dialogue as DialogueLine[] | undefined) ??
    []
  );

  // 背景画像も 'background_image' / 'background' 両方に対応
  // 相対パスには '/' を補完し、/story/play/ からの誤解決を防ぐ
  const rawBg =
    (rawContent.background_image as string | undefined) ??
    (rawContent.background as string | undefined);
  // seed SQL が label/next_scene_order 形式で保存した選択肢を正規化
  // branch_by_match / next_scene_id_win / next_scene_id_lose にも対応
  type RawChoice = Record<string, unknown>;
  const normalizeChoice = (raw: RawChoice, idx: number): Choice => ({
    id:                 (raw.id as string | undefined)                ?? `choice_${scene.id}_${idx}`,
    text:               (raw.text as string | undefined)              ?? (raw.label as string | undefined) ?? `選択肢 ${idx + 1}`,
    cost:               (raw.cost as number | undefined)              ?? 0,
    next_scene_id:      (raw.next_scene_id as string | undefined)     ?? null,
    next_scene_id_win:  (raw.next_scene_id_win as string | undefined) ?? null,
    next_scene_id_lose: (raw.next_scene_id_lose as string | undefined) ?? null,
    branch_by_match:    (raw.branch_by_match as boolean | undefined)  ?? false,
    sets_flags: typeof raw.sets_flags === 'string'
      ? (JSON.parse(raw.sets_flags) as Record<string, boolean>)
      : (raw.sets_flags as Record<string, boolean> | undefined) ?? {},
    locked_message: raw.locked_message as string | undefined,
    game_bonus: typeof raw.game_bonus === 'string'
      ? (JSON.parse(raw.game_bonus) as GameBonus)
      : (raw.game_bonus as GameBonus | undefined),
  });

  const choices: Choice[] = (
    (rawContent.choices as RawChoice[] | undefined) ?? []
  ).map(normalizeChoice);

  const bgImage = rawBg
    ? rawBg.startsWith('http') || rawBg.startsWith('/')
      ? rawBg
      : `/${rawBg}`
    : undefined;

  // lines が空のシーンは最初から選択肢フェーズ
  const initialPhase: PlayerPhase = lines.length === 0 ? 'choices' : 'typing';

  const [lineIndex,      setLineIndex]      = useState(0);
  const [displayedText,  setDisplayedText]  = useState('');
  const [charIndex,      setCharIndex]      = useState(0);
  const [phase,          setPhase]          = useState<PlayerPhase>(initialPhase);
  const [isAuto,        setIsAuto]        = useState(false);
  const [isSkip,        setIsSkip]        = useState(false);
  const [currentBalance]                  = useState(wallet.balance);
  const [isAdvancing,   setIsAdvancing]   = useState(false);
  const [pendingBonus,  setPendingBonus]  = useState<GameBonus>({});
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // pendingStoryBonus: シーン跨ぎでボーナスを引き継ぐ (sessionStorage 経由)
  useEffect(() => {
    const stored = sessionStorage.getItem('pendingStoryBonus');
    if (stored) {
      try { setPendingBonus(JSON.parse(stored) as GameBonus); }
      catch { /* ignore */ }
    }
  // 初回マウント時のみ実行
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentLine = lines[lineIndex];
  const hasChoices  = choices.length > 0;

  // 表示するキャラクタースプライト
  // choices フェーズでは最後に喋ったキャラを継続表示
  const charSpeaker: string | null = (() => {
    if (phase !== 'choices') {
      const spk = currentLine?.speaker;
      return spk && spk !== 'narration' && spk !== 'player' ? spk : null;
    }
    // choices フェーズ: セリフ一覧を末尾から探す
    const last = [...lines].reverse().find(
      (l) => l.speaker !== 'narration' && l.speaker !== 'player',
    );
    return last?.speaker ?? null;
  })();
  const charConfig = charSpeaker ? (CHARACTER_CONFIG[charSpeaker] ?? null) : null;
  const charImage  = charConfig?.src ?? null;
  const processedCharImage = useRemoveWhiteBg(charImage);

  // タイプライター

  useEffect(() => {
    if (phase !== 'typing') return;
    if (!currentLine) return;

    const text = currentLine.text;

    if (isSkip || charIndex >= text.length) {
      setDisplayedText(text);
      setPhase('line_done');
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + text[charIndex]);
      setCharIndex((prev) => prev + 1);
    }, CHAR_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [charIndex, phase, currentLine, isSkip]);

  // 行送り・オートモード

  const advanceLine = useCallback(() => {
    if (phase === 'typing') {
      // タイプ中にタップ → 全文一括表示
      if (currentLine) {
        setDisplayedText(currentLine.text);
        setPhase('line_done');
        setCharIndex(currentLine.text.length);
      }
      return;
    }

    if (phase === 'line_done') {
      const nextIndex = lineIndex + 1;
      if (nextIndex < lines.length) {
        setLineIndex(nextIndex);
        setDisplayedText('');
        setCharIndex(0);
        setPhase('typing');
      } else {
        // 全セリフ完了 → 選択肢フェーズへ
        setPhase('choices');
      }
    }
  }, [phase, lineIndex, lines.length, currentLine]);

  // オートモード
  useEffect(() => {
    if (!isAuto || phase !== 'line_done') return;

    autoTimer.current = setTimeout(() => {
      advanceLine();
    }, AUTO_DELAY_MS);

    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, [isAuto, phase, advanceLine]);

  // スキップモード: 全セリフを一気に飛ばす
  useEffect(() => {
    if (!isSkip) return;
    setDisplayedText(currentLine?.text ?? '');
    setPhase('line_done');
  }, [isSkip, currentLine]);

  // シーン遷移

  async function handleAdvanceScene() {
    if (isAdvancing) return;
    setIsAdvancing(true);
    try {
      const res = await fetch('/api/story/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scene_id: scene.id }),
      });
      const data = await res.json() as { next_scene?: StoryScene };
      if (data.next_scene) {
        router.push(`/story/play/${data.next_scene.id}${effectiveReturnTo ? `?returnTo=${encodeURIComponent(effectiveReturnTo)}` : ''}`);
      } else {
        flushBonusAndNavigate(effectiveReturnTo ?? '/story', pendingBonus);
      }
    } finally {
      setIsAdvancing(false);
    }
  }

  async function handleChoice(choice: Choice) {
    if (isAdvancing) return;
    setIsAdvancing(true);

    // branch_by_match: last_match_win フラグで遷移先を解決
    let resolvedNextSceneId = choice.next_scene_id;
    if (choice.branch_by_match) {
      const isWin = storyFlags['last_match_win'] === true;
      resolvedNextSceneId = isWin
        ? (choice.next_scene_id_win ?? null)
        : (choice.next_scene_id_lose ?? null);
    }

    // ボーナスを即時ローカルに蓄積 (setState は非同期なので直接計算する)
    let localBonus: GameBonus = { ...pendingBonus };
    if (choice.game_bonus && effectiveReturnTo) {
      for (const [k, v] of Object.entries(choice.game_bonus)) {
        const key = k as keyof GameBonus;
        localBonus[key] = (localBonus[key] ?? 0) + (v as number);
      }
    }

    try {
      await fetch('/api/story/choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_scene_id: scene.id,
          next_scene_id:    resolvedNextSceneId,
          sets_flags:       choice.sets_flags ?? {},
          game_bonus:       choice.game_bonus ?? null,
        }),
      });

      if (resolvedNextSceneId) {
        // 次シーンへ: 蓄積ボーナスを sessionStorage に保存して引き継ぐ (setState は unmount で消えるため)
        if (Object.keys(localBonus).length > 0) {
          sessionStorage.setItem('pendingStoryBonus', JSON.stringify(localBonus));
        }
        router.push(`/story/play/${resolvedNextSceneId}${effectiveReturnTo ? `?returnTo=${encodeURIComponent(effectiveReturnTo)}` : ''}`);
      } else if (effectiveReturnTo) {
        // next_scene_id なし + effectiveReturnTo あり = ゲームから来たキャリアシーン → 即座にゲームへ戻る
        flushBonusAndNavigate(effectiveReturnTo, localBonus);
      } else {
        // 通常ストーリー: advance で同 chapter 内の次のシーンを探す
        const advRes = await fetch('/api/story/advance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scene_id: scene.id }),
        });
        const advData = await advRes.json() as { next_scene?: StoryScene };
        if (advData.next_scene) {
          router.push(`/story/play/${advData.next_scene.id}`);
        } else {
          flushBonusAndNavigate('/story', localBonus);
        }
      }
    } finally {
      setIsAdvancing(false);
    }
  }

  // ボーナスをsessionStorageに保存してから遷移
  function flushBonusAndNavigate(dest: string, bonusToFlush: GameBonus = pendingBonus) {
    if (Object.keys(bonusToFlush).length > 0) {
      sessionStorage.setItem('storyBonus', JSON.stringify(bonusToFlush));
    }
    sessionStorage.removeItem('storyReturnTo');
    sessionStorage.removeItem('pendingStoryBonus');
    router.push(dest);
  }

  // スピーカー表示名

  const SPEAKER_NAME: Record<string, string> = {
    'misaki':         '碧井みさき',
    'misaki-aoi':     '碧井みさき',
    'rin-kurosaki':   '黒崎 凛',
    'koko-kirino':    '桐乃ここ',
    'koko':           '桐乃ここ',
  };

  const SPEAKER_COLOR: Record<string, string> = {
    'misaki':       '#E8B4D8',
    'misaki-aoi':   '#E8B4D8',
    'rin-kurosaki': '#A855C8',
    'koko-kirino':  '#FF69B4',
    'koko':         '#FF69B4',
  };

  function getSpeakerLabel(speaker: string): string {
    if (speaker === 'narration') return '';
    if (speaker === 'player')    return '選手';
    return SPEAKER_NAME[speaker] ?? speaker;
  }

  function getSpeakerColor(speaker: string): string {
    if (speaker === 'narration') return 'transparent';
    if (speaker === 'player')    return 'var(--color-accent-green)';
    return SPEAKER_COLOR[speaker] ?? 'var(--color-accent-green-dark)';
  }

  // レンダリング

  return (
    <div
      className="fixed inset-0 flex flex-col select-none"
      style={{ background: '#0a0f1c', zIndex: 50 }}
    >
      {/* 背景画像 */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      {/* 暗幕グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      {/* キャラクタースプライト */}
      {charImage && (
        <div
          className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none"
          style={{ zIndex: 6 }}
        >
          <img
            key={charSpeaker}
            src={processedCharImage ?? charImage}
            alt=""
            className="w-auto"
            style={{
              height: 'min(68vh, 640px)',
              objectFit: 'contain',
              objectPosition: 'bottom',
              filter: `drop-shadow(${charConfig?.dropShadow ?? '0 0 32px rgba(255,255,255,0.2)'})`,
              opacity: processedCharImage ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* ダイアログ中: 上半分エリアをタップしても行送りできる透明オーバーレイ */}
      {phase !== 'choices' && (
        <div
          className="absolute inset-x-0 top-20 z-20"
          style={{ bottom: '42%' }}
          onClick={advanceLine}
        />
      )}

      {/* 上部バー: ノッチ/ステータスバー対応 */}
      <div
        className="relative z-30 flex items-center justify-between px-4"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={() => {
            sessionStorage.removeItem('storyReturnTo');
            sessionStorage.removeItem('pendingStoryBonus');
            router.push(effectiveReturnTo ?? '/story');
          }}
          className="text-white/60 active:text-white text-sm px-3 rounded-full border border-white/20 active:border-white/40 transition-colors"
          style={{ minHeight: 44, paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
        >
          {effectiveReturnTo ? '← ゲームへ' : '← メニュー'}
        </button>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'var(--color-accent-green)' }}
          >
            💰 {formatBalance(currentBalance)}
          </span>
          <button
            onClick={() => setIsAuto((v) => !v)}
            className="text-xs px-3 rounded-full border transition-colors"
            style={{
              borderColor: isAuto ? 'var(--color-accent-green)' : 'rgba(255,255,255,0.3)',
              color:       isAuto ? 'var(--color-accent-green)' : 'rgba(255,255,255,0.6)',
              background:  isAuto ? 'rgba(0,210,106,0.15)' : 'rgba(0,0,0,0.4)',
              minHeight: 44, paddingTop: '0.5rem', paddingBottom: '0.5rem',
            }}
          >
            AUTO
          </button>
          <button
            onClick={() => setIsSkip((v) => !v)}
            className="text-xs px-3 rounded-full border transition-colors"
            style={{
              borderColor: isSkip ? '#FFB703' : 'rgba(255,255,255,0.3)',
              color:       isSkip ? '#FFB703' : 'rgba(255,255,255,0.6)',
              background:  isSkip ? 'rgba(255,183,3,0.15)' : 'rgba(0,0,0,0.4)',
              minHeight: 44, paddingTop: '0.5rem', paddingBottom: '0.5rem',
            }}
          >
            SKIP
          </button>
        </div>
      </div>

      {/* 選択肢フェーズ */}
      {phase === 'choices' && hasChoices && (
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center gap-3 px-4"
          style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        >
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice)}
              disabled={isAdvancing}
              className="w-full max-w-lg text-left px-5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background:     'rgba(0,0,0,0.78)',
                border:         '1px solid rgba(255,255,255,0.25)',
                color:          '#FFFFFF',
                backdropFilter: 'blur(8px)',
                minHeight: 56,
                paddingTop: '1rem',
                paddingBottom: '1rem',
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
      )}

      {/* エンディング / 次へボタン */}
      {phase === 'choices' && !hasChoices && (() => {
        // ゲームから来たキャリアシーン (effectiveReturnTo あり) は常にエンディング扱い (シーン連鎖防止)
        const isEnding = rawContent.is_ending === true || !!effectiveReturnTo;
        const endingText = rawContent.ending_text as string | undefined;
        if (isEnding) {
          return (
            <div
              className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              <div
                className="w-full max-w-sm rounded-2xl p-6 space-y-4"
                style={{ background: 'rgba(5,10,25,0.92)', border: '1px solid rgba(232,180,216,0.4)', backdropFilter: 'blur(12px)' }}
              >
                <div style={{ color: '#E8B4D8', fontSize: '2rem' }}>✦</div>
                <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans" style={{ color: '#F5F1EA' }}>
                  {endingText ?? 'ルートクリア'}
                </pre>
              </div>
              <button
                onClick={() => flushBonusAndNavigate(effectiveReturnTo ?? '/story')}
                className="px-8 rounded-full text-sm font-semibold transition-all"
                style={{ background: '#E8B4D8', color: '#1a0a14', minHeight: 52, paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
              >
                {effectiveReturnTo ? 'ゲームへ戻る' : 'メニューへ戻る'}
              </button>
            </div>
          );
        }
        return (
          <div
            className="relative z-10 flex-1 flex items-center justify-center"
            style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
          >
            <button
              onClick={handleAdvanceScene}
              disabled={isAdvancing}
              className="px-10 rounded-full text-base font-semibold transition-all"
              style={{
                background: 'var(--color-accent-green)',
                color: '#fff',
                opacity: isAdvancing ? 0.6 : 1,
                minHeight: 56,
                paddingTop: '0.875rem',
                paddingBottom: '0.875rem',
              }}
            >
              {isAdvancing ? '読み込み中...' : '次へ →'}
            </button>
          </div>
        );
      })()}

      {/* ダイアログボックス: ホームインジケーター対応 */}
      {phase !== 'choices' && currentLine && (
        <div
          className="relative z-30 mt-auto"
          onClick={advanceLine}
        >
          <div
            className="mx-3 rounded-2xl p-4"
            style={{
              background: 'rgba(5, 10, 25, 0.92)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
              marginBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
            }}
          >
            {currentLine.speaker !== 'narration' && (
              <div
                className="text-xs font-bold mb-2 tracking-wider"
                style={{ color: getSpeakerColor(currentLine.speaker) }}
              >
                {getSpeakerLabel(currentLine.speaker)}
              </div>
            )}

            <p
              className="leading-relaxed"
              style={{
                fontSize:  currentLine.speaker === 'narration' ? '0.9rem' : '1rem',
                fontStyle: currentLine.speaker === 'narration' ? 'italic' : 'normal',
                color:     currentLine.speaker === 'narration' ? 'rgba(255,255,255,0.72)' : '#fff',
                minHeight: '4.5rem',
              }}
            >
              {displayedText}
              {phase === 'typing' && (
                <span className="animate-pulse ml-0.5 opacity-70">▌</span>
              )}
            </p>

            {phase === 'line_done' && (
              <div className="text-right mt-1">
                <span className="text-white/40 text-sm animate-bounce inline-block">▼</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
