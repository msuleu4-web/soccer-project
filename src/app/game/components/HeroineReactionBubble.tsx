'use client';

import { useEffect, useState } from 'react';
import { CHAR_COLOR, CHAR_NAME, EMOTION_ICON } from '../lib/heroineReactions';
import type { HeroineReaction } from '../lib/heroineReactions';

interface Props {
  reaction: HeroineReaction;
  onDismiss: () => void;
}

export default function HeroineReactionBubble({ reaction, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 40);
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350);
    }, 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  const color   = CHAR_COLOR[reaction.character];
  const name    = CHAR_NAME[reaction.character];
  const charSrc = reaction.character === 'misaki'
    ? '/images/characters/misaki.png'
    : '/images/characters/rin.png';
  const bgColor = reaction.character === 'misaki' ? '#0a0f1c' : '#ffffff';
  const blend   = reaction.character === 'misaki' ? 'screen' : 'multiply';

  return (
    <div
      className="fixed bottom-24 right-3 z-40 flex items-end gap-2 cursor-pointer select-none"
      style={{
        maxWidth: '290px',
        opacity:   visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.95)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      onClick={() => { setVisible(false); setTimeout(onDismiss, 350); }}
    >
      {/* キャラクターポートレート */}
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden"
        style={{
          border:     `2px solid ${color}`,
          background: bgColor,
          boxShadow:  `0 0 12px ${color}50`,
        }}
      >
        <img
          src={charSrc}
          alt={name}
          className="w-full h-full object-cover"
          style={{ objectPosition: 'top center', mixBlendMode: blend as 'screen' | 'multiply' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* 吹き出し */}
      <div
        className="rounded-2xl rounded-bl-none px-3.5 py-2.5 shadow-2xl"
        style={{
          background:     'rgba(8,12,24,0.96)',
          border:         `1px solid ${color}50`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-bold tracking-wide" style={{ color }}>{name}</span>
          <span className="text-sm">{EMOTION_ICON[reaction.emotion]}</span>
        </div>
        <p className="text-white text-xs leading-relaxed">
          「{reaction.line}」
        </p>
      </div>
    </div>
  );
}
