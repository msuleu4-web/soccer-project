'use client';

import type { LeagueId, Position } from '../types/game';

interface Props {
  ovr: number;
  league: LeagueId;
  position: Position;
  size?: number;
  showLabel?: boolean;
}

function getStage(ovr: number) {
  if (ovr >= 95) return 6;
  if (ovr >= 85) return 5;
  if (ovr >= 75) return 4;
  if (ovr >= 65) return 3;
  if (ovr >= 55) return 2;
  return 1;
}

const STAGE_LABEL = ['', 'ルーキー', 'アマチュア', 'セミプロ', 'プロ選手', 'スター', 'レジェンド'];
const STAGE_COLOR = ['', '#9ca3af', '#60a5fa', '#34d399', '#a78bfa', '#fb923c', '#fbbf24'];

const KIT: Record<LeagueId, { top: string; bottom: string; sock: string; accent: string }> = {
  regional:         { top: '#6b7280', bottom: '#4b5563', sock: '#d1d5db', accent: '#9ca3af' },
  j3:               { top: '#2563eb', bottom: '#1e40af', sock: '#93c5fd', accent: '#60a5fa' },
  j2:               { top: '#ea580c', bottom: '#9a3412', sock: '#fdba74', accent: '#fb923c' },
  j1:               { top: '#dc2626', bottom: '#7f1d1d', sock: '#fca5a5', accent: '#ef4444' },
  premier_league:   { top: '#1c1917', bottom: '#292524', sock: '#eab308', accent: '#fbbf24' },
  champions_league: { top: '#1e3a8a', bottom: '#1e40af', sock: '#fbbf24', accent: '#60a5fa' },
};

function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (i * 36 - 90) * (Math.PI / 180);
    const radius = i % 2 === 0 ? r : r * 0.4;
    pts.push(`${(cx + radius * Math.cos(a)).toFixed(2)},${(cy + radius * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/* ── 共通：頭部・顔パーツ ── */
function Head({ stage, skin, hair, uid, cx = 50, cy = 43 }: {
  stage: number; skin: string; hair: string; uid: string; cx?: number; cy?: number;
}) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="15" ry="17" fill={skin} />
      {/* 髪 */}
      <path d={`M${cx-15},${cy-3} Q${cx-13},${cy-20} ${cx},${cy-22} Q${cx+13},${cy-20} ${cx+15},${cy-3} Q${cx+8},${cy-14} ${cx},${cy-16} Q${cx-8},${cy-14} ${cx-15},${cy-3}Z`} fill={hair} />
      <ellipse cx={cx - 14.5} cy={cy + 1} rx="3" ry="8" fill={hair} />
      <ellipse cx={cx + 14.5} cy={cy + 1} rx="3" ry="8" fill={hair} />
      {/* 目 */}
      <ellipse cx={cx - 6} cy={cy} rx="2.8" ry="2.2" fill="white" />
      <circle cx={cx - 6} cy={cy} r="1.5" fill="#1a1a1a" />
      <circle cx={cx - 5.2} cy={cy - 0.8} r="0.55" fill="white" />
      <ellipse cx={cx + 6} cy={cy} rx="2.8" ry="2.2" fill="white" />
      <circle cx={cx + 6} cy={cy} r="1.5" fill="#1a1a1a" />
      <circle cx={cx + 6.8} cy={cy - 0.8} r="0.55" fill="white" />
      {/* 眉 */}
      {stage >= 4 ? (
        <>
          <path d={`M${cx-9},${cy-5} Q${cx-6},${cy-6.5} ${cx-3},${cy-5}`} stroke={hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d={`M${cx+3},${cy-5} Q${cx+6},${cy-6.5} ${cx+9},${cy-5}`} stroke={hair} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <line x1={cx - 9} y1={cy - 4.5} x2={cx - 3} y2={cy - 5} stroke={hair} strokeWidth="1.5" strokeLinecap="round" />
          <line x1={cx + 3} y1={cy - 5} x2={cx + 9} y2={cy - 4.5} stroke={hair} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {/* 鼻 */}
      <path d={`M${cx-1},${cy+4.5} Q${cx},${cy+7.5} ${cx+1},${cy+4.5}`} stroke="#d4956b" strokeWidth="1" fill="none" />
      {/* 口 */}
      {stage >= 3
        ? <path d={`M${cx-4},${cy+8.5} Q${cx},${cy+13} ${cx+4},${cy+8.5}`} stroke="#c0636b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        : <line x1={cx - 4} y1={cy + 9} x2={cx + 4} y2={cy + 9} stroke="#aaa" strokeWidth="1" />
      }
      {/* 首 */}
      <rect x={cx - 4} y={cy + 15} width="8" height="6" fill={skin} />
    </g>
  );
}

/* ════════════════════════════════════
   FW: 攻撃的シュートポーズ
   ════════════════════════════════════ */
function FWBody({ kit, stage, skin, uid, stageColor }: {
  kit: typeof KIT[LeagueId]; stage: number; skin: string; uid: string; stageColor: string;
}) {
  return (
    <g>
      {/* ジャージ（前傾み） */}
      <path d="M24,64 L76,64 L78,95 L22,95 Z" fill={kit.top} />
      <path d="M42,64 L58,64 L59,95 L41,95 Z" fill="rgba(255,255,255,0.12)" />
      {/* カラー */}
      <path d="M43,64 L50,59 L57,64 L53,68 L50,65 L47,68 Z" fill={kit.bottom} />
      {/* 背番号 */}
      {stage >= 2 && (
        <text x="50" y="83" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.75)" fontFamily="Arial,sans-serif">{}</text>
      )}
      {/* 左腕：上げたシュートモーション */}
      <path d="M24,67 L6,78 L10,82 L27,72 Z" fill={kit.top} />
      <circle cx="8" cy="83" r="4" fill={skin} />
      {/* 右腕：後ろに引いた */}
      <path d="M76,67 L91,72 L88,77 L73,72 Z" fill={kit.top} />
      <circle cx="90" cy="76" r="4" fill={skin} />
      {/* ショーツ */}
      <rect x="23" y="95" width="54" height="15" rx="3" fill={kit.bottom} />
      <line x1="50" y1="95" x2="50" y2="110" stroke={kit.top} strokeWidth="1.5" />
      {/* 左足：蹴り足 — 前に出ている */}
      <rect x="26" y="110" width="16" height="22" rx="2" fill={kit.sock} />
      <path d="M22,130 L40,130 L44,138 L20,138 Z" fill="#111" />
      {/* 右足：軸足 — 少し後ろ */}
      <rect x="57" y="112" width="16" height="22" rx="2" fill={kit.sock} transform="rotate(4,65,120)" />
      <path d="M54,132 L72,132 L76,140 L52,140 Z" fill="#111" transform="rotate(4,65,136)" />
      {/* ボール — 左足の前 */}
      <circle cx="22" cy="135" r="9" fill="white" stroke="#333" strokeWidth="0.8" />
      <path d="M22,126 l3,3 l-1,6 l-5,1 l-4,-3 l1,-5 Z" fill="#1a1a1a" />
      {/* シュートエフェクト — 星 */}
      {stage >= 3 && (
        <g fill={stageColor} opacity="0.8">
          <polygon points={starPoints(8, 122, 5)} filter={`url(#${uid}_gf)`} />
        </g>
      )}
    </g>
  );
}

/* ════════════════════════════════════
   MF: パスポーズ、腕を広げた司令塔
   ════════════════════════════════════ */
function MFBody({ kit, stage, skin, uid, stageColor }: {
  kit: typeof KIT[LeagueId]; stage: number; skin: string; uid: string; stageColor: string;
}) {
  return (
    <g>
      {/* ジャージ */}
      <path d="M25,63 L75,63 L77,94 L23,94 Z" fill={kit.top} />
      {/* サイドライン装飾 */}
      <path d="M25,63 L33,63 L34,94 L23,94 Z" fill={kit.accent} opacity="0.35" />
      <path d="M67,63 L75,63 L77,94 L66,94 Z" fill={kit.accent} opacity="0.35" />
      {/* センターストライプ */}
      <path d="M44,63 L56,63 L57,94 L43,94 Z" fill="rgba(255,255,255,0.10)" />
      <path d="M43,63 L50,58 L57,63 L53,67 L50,64 L47,67 Z" fill={kit.bottom} />
      {stage >= 2 && (
        <text x="50" y="81" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.75)" fontFamily="Arial,sans-serif">{}</text>
      )}
      {/* 左腕：横に広げパス指示 */}
      <path d="M25,66 L6,72 L7,77 L26,71 Z" fill={kit.top} />
      <circle cx="5.5" cy="75" r="4" fill={skin} />
      {/* 右腕：反対側に広げ */}
      <path d="M75,66 L94,72 L93,77 L74,71 Z" fill={kit.top} />
      <circle cx="94.5" cy="75" r="4" fill={skin} />
      {/* ショーツ */}
      <rect x="24" y="94" width="52" height="15" rx="3" fill={kit.bottom} />
      <line x1="50" y1="94" x2="50" y2="109" stroke={kit.top} strokeWidth="1.5" />
      {/* 左足 */}
      <rect x="27" y="109" width="16" height="25" rx="2" fill={kit.sock} />
      <path d="M23,132 L42,132 L46,141 L21,141 Z" fill="#111" />
      {/* 右足 */}
      <rect x="57" y="109" width="16" height="25" rx="2" fill={kit.sock} />
      <path d="M54,132 L73,132 L77,141 L52,141 Z" fill="#111" />
      {/* ボール — 右足横 */}
      <circle cx="76" cy="138" r="9" fill="white" stroke="#333" strokeWidth="0.8" />
      <path d="M76,129 l3,3 l-1,6 l-5,1 l-4,-3 l1,-5 Z" fill="#1a1a1a" />
      {/* パス軌跡エフェクト */}
      {stage >= 3 && (
        <g opacity="0.5">
          <path d="M75,135 Q88,115 100,110" stroke={stageColor} strokeWidth="1.5" fill="none" strokeDasharray="3,2" />
          <circle cx="100" cy="110" r="2" fill={stageColor} />
        </g>
      )}
    </g>
  );
}

/* ════════════════════════════════════
   DF: 守備ブロックポーズ、腕を広げ
   ════════════════════════════════════ */
function DFBody({ kit, stage, skin, uid, stageColor }: {
  kit: typeof KIT[LeagueId]; stage: number; skin: string; uid: string; stageColor: string;
}) {
  return (
    <g>
      {/* ジャージ — 少しがっしり */}
      <path d="M22,63 L78,63 L80,95 L20,95 Z" fill={kit.top} />
      {/* アーマー風サイドライン */}
      <path d="M22,63 L30,63 L31,95 L20,95 Z" fill={kit.bottom} />
      <path d="M70,63 L78,63 L80,95 L69,95 Z" fill={kit.bottom} />
      <path d="M43,63 L57,63 L58,95 L42,95 Z" fill="rgba(255,255,255,0.08)" />
      <path d="M41,63 L50,58 L59,63 L55,67 L50,64 L45,67 Z" fill={kit.bottom} />
      {stage >= 2 && (
        <text x="50" y="82" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.75)" fontFamily="Arial,sans-serif">{}</text>
      )}
      {/* 左腕：真横にブロック */}
      <path d="M22,65 L3,65 L3,70 L23,70 Z" fill={kit.top} />
      <circle cx="2.5" cy="67.5" r="4.5" fill={skin} />
      {/* 右腕：真横にブロック */}
      <path d="M78,65 L97,65 L97,70 L77,70 Z" fill={kit.top} />
      <circle cx="97.5" cy="67.5" r="4.5" fill={skin} />
      {/* ショーツ */}
      <rect x="21" y="95" width="58" height="15" rx="3" fill={kit.bottom} />
      <line x1="50" y1="95" x2="50" y2="110" stroke={kit.top} strokeWidth="1.5" />
      {/* 左足：ワイドスタンス */}
      <rect x="23" y="110" width="17" height="25" rx="2" fill={kit.sock} transform="rotate(-5,31,122)" />
      <path d="M18,133 L38,133 L42,142 L16,142 Z" fill="#111" transform="rotate(-5,30,137)" />
      {/* 右足：ワイドスタンス */}
      <rect x="60" y="110" width="17" height="25" rx="2" fill={kit.sock} transform="rotate(5,68,122)" />
      <path d="M58,133 L78,133 L82,142 L56,142 Z" fill="#111" transform="rotate(5,69,137)" />
      {/* シールドエフェクト */}
      {stage >= 4 && (
        <g opacity="0.18">
          <ellipse cx="50" cy="78" rx="38" ry="45" fill={stageColor} />
        </g>
      )}
      {stage >= 3 && (
        <g opacity="0.6">
          <path d="M35,58 L50,50 L65,58 L65,72 Q50,80 35,72 Z" fill="none" stroke={stageColor} strokeWidth="1.2" />
        </g>
      )}
    </g>
  );
}

/* ════════════════════════════════════
   GK: 構えポーズ、両腕広げ、グローブ
   ════════════════════════════════════ */
function GKBody({ kit, stage, skin, uid, stageColor }: {
  kit: typeof KIT[LeagueId]; stage: number; skin: string; uid: string; stageColor: string;
}) {
  const gloveColor = '#eab308';
  const gloveGlow = stage >= 4 ? stageColor : gloveColor;
  return (
    <g>
      {/* 長袖ジャージ */}
      <path d="M25,63 L75,63 L77,94 L23,94 Z" fill={kit.top} />
      {/* チェッカーパターン風 */}
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={25 + i * 13} y="63" width="6" height="6" fill={kit.accent} opacity="0.3" />
      ))}
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={31 + i * 13} y="69" width="6" height="6" fill={kit.accent} opacity="0.3" />
      ))}
      <path d="M43,63 L50,58 L57,63 L53,67 L50,64 L47,67 Z" fill={kit.bottom} />
      {stage >= 2 && (
        <text x="50" y="82" textAnchor="middle" fontSize="10" fontWeight="bold" fill="rgba(255,255,255,0.75)" fontFamily="Arial,sans-serif">{}</text>
      )}
      {/* 左腕 — 長袖 */}
      <path d="M25,65 L7,83 L12,87 L29,69 Z" fill={kit.top} />
      {/* 左グローブ */}
      <g>
        {stage >= 4 && <circle cx="10" cy="88" r="8" fill={gloveGlow} opacity="0.25" />}
        <circle cx="10" cy="88" r="6" fill={gloveColor} />
        <circle cx="10" cy="88" r="6" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
        {/* グローブ指の線 */}
        <line x1="6" y1="84" x2="5" y2="80" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <line x1="9" y1="83" x2="8.5" y2="79" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <line x1="12" y1="84" x2="12" y2="80" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      </g>
      {/* 右腕 — 長袖 */}
      <path d="M75,65 L93,83 L88,87 L71,69 Z" fill={kit.top} />
      {/* 右グローブ */}
      <g>
        {stage >= 4 && <circle cx="90" cy="88" r="8" fill={gloveGlow} opacity="0.25" />}
        <circle cx="90" cy="88" r="6" fill={gloveColor} />
        <circle cx="90" cy="88" r="6" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
        <line x1="86" y1="84" x2="85" y2="80" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <line x1="89" y1="83" x2="88.5" y2="79" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        <line x1="92" y1="84" x2="92" y2="80" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      </g>
      {/* ショーツ */}
      <rect x="24" y="94" width="52" height="15" rx="3" fill={kit.bottom} />
      <line x1="50" y1="94" x2="50" y2="109" stroke={kit.top} strokeWidth="1.5" />
      {/* 左足 — 少し腰を落とした構え */}
      <rect x="26" y="109" width="17" height="24" rx="2" fill={kit.sock} transform="rotate(3,34,121)" />
      <path d="M22,131 L42,131 L46,140 L20,140 Z" fill="#111" transform="rotate(3,33,135)" />
      {/* 右足 */}
      <rect x="57" y="109" width="17" height="24" rx="2" fill={kit.sock} transform="rotate(-3,65,121)" />
      <path d="M54,131 L74,131 L78,140 L52,140 Z" fill="#111" transform="rotate(-3,65,135)" />
      {/* セービングオーラ */}
      {stage >= 4 && (
        <g>
          <ellipse cx="10" cy="88" rx="10" ry="10" fill="none" stroke={stageColor} strokeWidth="1" opacity="0.5" strokeDasharray="4,2" />
          <ellipse cx="90" cy="88" rx="10" ry="10" fill="none" stroke={stageColor} strokeWidth="1" opacity="0.5" strokeDasharray="4,2" />
        </g>
      )}
    </g>
  );
}

export default function PlayerAvatar({ ovr, league, position, size = 100, showLabel = true }: Props) {
  const stage = getStage(ovr);
  const kit = KIT[league];
  const stageColor = STAGE_COLOR[stage];
  const label = STAGE_LABEL[stage];
  const skin = '#f5d6b8';
  const hair = '#3d2517';
  const uid = `av_${ovr}_${league}_${position}`;

  const showAura  = stage >= 4;
  const showStars = stage >= 5;
  const showCrown = stage >= 6;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 100 155"
        width={size}
        height={Math.round(size * 1.55)}
        style={{ overflow: 'visible' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {showAura && (
            <radialGradient id={`${uid}_ag`} cx="50%" cy="70%" r="50%">
              <stop offset="0%" stopColor={stageColor} stopOpacity="0.45" />
              <stop offset="100%" stopColor={stageColor} stopOpacity="0" />
            </radialGradient>
          )}
          <filter id={`${uid}_gf`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* 後光アウラ */}
        {showAura && <ellipse cx="50" cy="95" rx="50" ry="60" fill={`url(#${uid}_ag)`} />}

        {/* 浮遊する星 (スター以上) */}
        {showStars && (
          <>
            <polygon points={starPoints(9, 55, 10)} fill={stageColor} filter={`url(#${uid}_gf)`} opacity="0.9" />
            <polygon points={starPoints(91, 68, 10)} fill={stageColor} filter={`url(#${uid}_gf)`} opacity="0.9" />
            {showCrown && (
              <>
                <polygon points={starPoints(16, 25, 7)} fill={stageColor} opacity="0.75" />
                <polygon points={starPoints(84, 25, 7)} fill={stageColor} opacity="0.75" />
              </>
            )}
          </>
        )}

        {/* 王冠 (レジェンド) */}
        {showCrown && (
          <g filter={`url(#${uid}_gf)`}>
            <rect x="34" y="10" width="32" height="10" rx="2" fill="#fbbf24" />
            <polygon points="34,20 39,6 44,20" fill="#fbbf24" />
            <polygon points="47.5,20 50,3 52.5,20" fill="#fbbf24" />
            <polygon points="56,20 61,6 66,20" fill="#fbbf24" />
            <circle cx="39" cy="15" r="2.5" fill="#dc2626" />
            <circle cx="50" cy="10" r="3" fill="#dc2626" />
            <circle cx="61" cy="15" r="2.5" fill="#dc2626" />
          </g>
        )}

        {/* ポジション別ボディ */}
        {position === 'FW' && <FWBody kit={kit} stage={stage} skin={skin} uid={uid} stageColor={stageColor} />}
        {position === 'MF' && <MFBody kit={kit} stage={stage} skin={skin} uid={uid} stageColor={stageColor} />}
        {position === 'DF' && <DFBody kit={kit} stage={stage} skin={skin} uid={uid} stageColor={stageColor} />}
        {position === 'GK' && <GKBody kit={kit} stage={stage} skin={skin} uid={uid} stageColor={stageColor} />}

        {/* 頭部 (共通) */}
        <Head stage={stage} skin={skin} hair={hair} uid={uid} />

        {/* キラキラ (プロ以上) */}
        {stage >= 4 && (
          <g fill={stageColor} opacity="0.72" filter={`url(#${uid}_gf)`}>
            <path d="M83,36 L85,41 L90,41 L86.5,44.5 L88,49 L83,46 L78,49 L79.5,44.5 L76,41 L81,41 Z" />
          </g>
        )}

        {/* ポジションバッジ */}
        <rect x="38" y="148" width="24" height="10" rx="5" fill={
          position === 'FW' ? '#dc2626' :
          position === 'MF' ? '#16a34a' :
          position === 'DF' ? '#1d4ed8' :
          '#ca8a04'
        } opacity="0.9" />
        <text x="50" y="156.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="white" fontFamily="Arial,sans-serif">
          {position}
        </text>
      </svg>

      {showLabel && (
        <div
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wide whitespace-nowrap"
          style={{ background: `${stageColor}28`, color: stageColor, border: `1px solid ${stageColor}65` }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
