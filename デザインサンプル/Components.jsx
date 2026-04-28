// Goal Labo — Components v2 (Light Mode Default)
// Exported to window for use by index.html

const { useState, useEffect } = React;

// ─── Theme ───────────────────────────────────────────────────────────────

const LIGHT = {
  pageBg:      '#FAFAF7',
  sectionBg:   '#F5F1EA',
  cardBg:      '#FFFFFF',
  headerBg:    'rgba(250,250,247,0.85)',
  border:      '#E8E4DC',
  borderStrong:'#D4CFC6',
  textPrimary: '#0F3D2E',
  textSecond:  '#5C6B5E',
  textMuted:   '#9AA89B',
  shadow:      '0 2px 8px rgba(0,0,0,0.06)',
  shadowHover: '0 6px 20px rgba(0,0,0,0.11)',
  accent:      '#00D26A',
  accentHover: '#00b85e',
  navy:        '#1A2B4A',
  score:       '#0F3D2E',
  rankGold:    '#D97706',
  rankSilver:  '#6B7280',
  rankBronze:  '#B45309',
  inputBg:     '#FAFAF7',
  theadBg:     '#F5F1EA',
  rowHover:    '#F9FAF5',
};

const DARK = {
  pageBg:      '#050a14',
  sectionBg:   '#0a1628',
  cardBg:      '#101827',
  headerBg:    'rgba(16,24,39,0.85)',
  border:      '#1f2937',
  borderStrong:'#374151',
  textPrimary: '#e5e7eb',
  textSecond:  '#9ca3af',
  textMuted:   '#6b7280',
  shadow:      '0 2px 8px rgba(0,0,0,0.25)',
  shadowHover: '0 6px 20px rgba(0,0,0,0.40)',
  accent:      '#00D26A',
  accentHover: '#00b85e',
  navy:        '#93c5fd',
  score:       '#e5e7eb',
  rankGold:    '#facc15',
  rankSilver:  '#d1d5db',
  rankBronze:  '#fb923c',
  inputBg:     '#1f2937',
  theadBg:     'rgba(255,255,255,0.05)',
  rowHover:    'rgba(255,255,255,0.03)',
};

// ─── Theme context ────────────────────────────────────────────────────────

const ThemeCtx = React.createContext(LIGHT);

// ─── Inline Logo ──────────────────────────────────────────────────────────

const LogoSVG = ({ dark }) => (
  <svg height="28" viewBox="0 0 158 28" xmlns="http://www.w3.org/2000/svg" style={{display:'block'}}>
    {/* pitch grid icon */}
    <rect x="0" y="1" width="28" height="26" fill="none" stroke={dark ? '#F5F1EA' : '#0F3D2E'} strokeWidth="2" strokeLinejoin="round"/>
    {[7,14,21].map(x => <line key={x} x1={x} y1="1" x2={x} y2="27" stroke={dark?'#F5F1EA':'#0F3D2E'} strokeWidth="0.5" opacity="0.3"/>)}
    {[8,14,20].map(y => <line key={y} x1="0" y1={y} x2="28" y2={y} stroke={dark?'#F5F1EA':'#0F3D2E'} strokeWidth="0.5" opacity="0.3"/>)}
    <circle cx="14" cy="14" r="5" fill="#00D26A"/>
    <circle cx="14" cy="14" r="5" fill="none" stroke={dark?'#F5F1EA':'#0F3D2E'} strokeWidth="1"/>
    <polygon points="14,9.5 17,11.5 16,17 12,17 11,11.5" fill={dark?'#0F3D2E':'#fff'}/>
    {/* wordmark */}
    <text x="36" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontSize="16" fontWeight="900" fill={dark?'#F5F1EA':'#0F3D2E'} letterSpacing="-0.5">GOAL</text>
    <rect x="82" y="5" width="2.5" height="16" fill="#00D26A"/>
    <text x="89" y="20" fontFamily="system-ui,-apple-system,sans-serif" fontSize="16" fontWeight="300" fill={dark?'#F5F1EA':'#1A2B4A'} letterSpacing="-0.5">LABO</text>
  </svg>
);

// ─── Icons ────────────────────────────────────────────────────────────────

const IconMenu = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconX    = () => <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconUser = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconShield = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconTrophy = ({size=14}) => <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M6 9H2V3h4M18 9h4V3h-4M6 9a6 6 0 0 0 12 0M12 15v4M8 19h8"/></svg>;
const IconGlobe = () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IconMoon = () => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const IconSun  = () => <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;

// ─── League config ────────────────────────────────────────────────────────

const LEAGUES = {
  'J1':        { bg:'#FEE2E2', color:'#B91C1C', darkBg:'rgba(230,57,70,0.18)',  darkColor:'#f87171', emoji:'🇯🇵' },
  'PL':        { bg:'#EDE9FE', color:'#6D28D9', darkBg:'rgba(123,44,191,0.18)', darkColor:'#c084fc', emoji:'🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'La Liga':   { bg:'#FFEDD5', color:'#C2410C', darkBg:'rgba(247,127,0,0.18)',   darkColor:'#fb923c', emoji:'🇪🇸' },
  'Serie A':   { bg:'#DBEAFE', color:'#1D4ED8', darkBg:'rgba(0,119,182,0.18)',   darkColor:'#60a5fa', emoji:'🇮🇹' },
  'LaLiga':    { bg:'#FFEDD5', color:'#C2410C', darkBg:'rgba(247,127,0,0.18)',   darkColor:'#fb923c', emoji:'🇪🇸' },
  'Bundesliga':{ bg:'#FEF9C3', color:'#A16207', darkBg:'rgba(255,183,3,0.18)',   darkColor:'#fbbf24', emoji:'🇩🇪' },
  'UCL':       { bg:'#DBEAFE', color:'#1e3a8a', darkBg:'rgba(0,53,102,0.18)',    darkColor:'#93c5fd', emoji:'⭐' },
};

const LeagueBadge = ({ league, dark }) => {
  const cfg = LEAGUES[league] || { bg:'#F3F4F6', color:'#4B5563', darkBg:'rgba(107,114,128,0.18)', darkColor:'#9ca3af', emoji:'⚽' };
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:'4px',
      padding:'3px 10px', borderRadius:'999px', fontSize:'11px', fontWeight:700,
      background: dark ? cfg.darkBg : cfg.bg,
      color: dark ? cfg.darkColor : cfg.color,
      fontFamily:"'Inter',sans-serif", lineHeight:'18px',
      letterSpacing:'0.02em',
    }}>
      {cfg.emoji} {league}
    </span>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────

const Header = ({ onNavigate, dark, onToggleDark }) => {
  const t = dark ? DARK : LIGHT;
  const [isOpen, setIsOpen] = useState(false);

  const linkStyle = {
    fontSize:'14px', color:t.textSecond, textDecoration:'none',
    background:'none', border:'none', cursor:'pointer',
    fontFamily:"'Inter',sans-serif", transition:'color 0.2s',
    padding:'0',
  };

  return (
    <header style={{
      position:'sticky', top:0, zIndex:50,
      background:t.headerBg, backdropFilter:'blur(14px)',
      borderBottom:`1px solid ${t.border}`,
    }}>
      <div style={{maxWidth:'960px',margin:'0 auto',padding:'0 20px',height:'64px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div onClick={() => onNavigate('home')} style={{cursor:'pointer'}}>
          <LogoSVG dark={dark} />
        </div>
        <nav style={{display:'flex',alignItems:'center',gap:'24px'}}>
          {['ニュース','試合日程','リーグ順位'].map(label => (
            <button key={label} style={linkStyle}
              onMouseEnter={e=>e.currentTarget.style.color=t.textPrimary}
              onMouseLeave={e=>e.currentTarget.style.color=t.textSecond}>{label}</button>
          ))}
          <div style={{width:'1px',height:'20px',background:t.border}}/>
          <button onClick={() => onNavigate('login')} style={{...linkStyle, color:t.textPrimary, fontWeight:600}}
            onMouseEnter={e=>e.currentTarget.style.color=t.accent}
            onMouseLeave={e=>e.currentTarget.style.color=t.textPrimary}>ログイン</button>
          <button onClick={onToggleDark} style={{
            background:t.sectionBg, border:`1px solid ${t.border}`, borderRadius:'8px',
            width:'34px', height:'34px', display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:t.textSecond, transition:'all 0.2s', flexShrink:0,
          }}>{dark ? <IconSun/> : <IconMoon/>}</button>
        </nav>
        <button onClick={() => setIsOpen(!isOpen)} style={{display:'none',background:'none',border:'none',color:t.textPrimary,cursor:'pointer',padding:'4px'}} className="mobile-menu-btn">
          {isOpen ? <IconX/> : <IconMenu/>}
        </button>
      </div>
    </header>
  );
};

// ─── Hero ──────────────────────────────────────────────────────────────────

const Hero = ({ dark, onNavigate }) => {
  const t = dark ? DARK : LIGHT;
  const [hovered, setHovered] = useState(false);
  return (
    <section style={{
      background: dark
        ? 'linear-gradient(160deg, #0a1628 0%, #0F3D2E22 100%)'
        : 'linear-gradient(160deg, #F5F1EA 0%, #e8f5ee 100%)',
      padding:'96px 20px 80px',
      textAlign:'center',
    }}>
      <div style={{maxWidth:'640px',margin:'0 auto'}}>
        <div style={{
          display:'inline-flex',alignItems:'center',gap:'8px',
          padding:'6px 16px',borderRadius:'999px',
          background: dark ? 'rgba(0,210,106,0.12)' : 'rgba(0,210,106,0.12)',
          border:`1px solid rgba(0,210,106,0.25)`,
          marginBottom:'28px',
        }}>
          <span style={{fontSize:'13px',fontWeight:600,color:'#00D26A',fontFamily:"'Inter',sans-serif"}}>⚽ AIでサッカーをもっと楽しく</span>
        </div>
        <h1 style={{
          fontSize:'clamp(32px,6vw,54px)', fontWeight:800,
          color:t.textPrimary, marginBottom:'20px',
          fontFamily:"'Inter',sans-serif", lineHeight:1.1,
          letterSpacing:'-0.02em',
        }}>
          世界のサッカーを、<br/>
          <span style={{color:'#00D26A'}}>もっと身近に</span>
        </h1>
        <p style={{
          fontSize:'17px', color:t.textSecond, maxWidth:'480px',
          margin:'0 auto 40px', lineHeight:1.75,
          fontFamily:"'Noto Sans JP',sans-serif", fontWeight:400,
        }}>
          最新ニュース、試合結果、リーグ順位を<br/>リアルタイムでお届けします。
        </p>
        <button
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background:hovered ? t.accentHover : t.accent,
            color:'#fff', fontWeight:700, fontSize:'15px',
            padding:'14px 36px', borderRadius:'12px', border:'none', cursor:'pointer',
            fontFamily:"'Inter',sans-serif",
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
            boxShadow: hovered ? '0 8px 24px rgba(0,210,106,0.35)' : '0 4px 12px rgba(0,210,106,0.20)',
            transition:'all 0.25s',
          }}>
          最新ニュースを見る →
        </button>
      </div>
    </section>
  );
};

// ─── News Section ──────────────────────────────────────────────────────────

const newsItems = [
  { league:'J1',      title:'ヴィッセル神戸、首位固め。古橋が決勝ゴール', date:'2024-04-22', tag:'🔥 話題' },
  { league:'PL',      title:'ハーランドのハットトリックでマンチェスターシティが快勝', date:'2024-04-22', tag:'⭐ 注目' },
  { league:'La Liga', title:'久保建英、2試合連続アシストでチームの勝利に貢献', date:'2024-04-21', tag:'📰 ニュース' },
  { league:'Serie A', title:'インテル、スクデット獲得に王手。ラウタロが2得点', date:'2024-04-21', tag:'⚽ 試合' },
];

const NewsSection = ({ dark }) => {
  const t = dark ? DARK : LIGHT;
  const [hovered, setHovered] = useState(null);
  return (
    <section>
      <SectionHeader title="最新ニュース" dark={dark} />
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        {newsItems.map((item, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{
              background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:'16px',
              padding:'16px', display:'flex', gap:'14px', alignItems:'flex-start', cursor:'pointer',
              boxShadow: hovered===i ? t.shadowHover : t.shadow,
              transform: hovered===i ? 'scale(1.01)' : 'scale(1)',
              transition:'all 0.25s',
            }}>
            <div style={{
              width:'88px', height:'60px', background:t.sectionBg,
              borderRadius:'10px', flexShrink:0, border:`1px solid ${t.border}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'24px',
            }}>⚽</div>
            <div style={{flex:1}}>
              <div style={{display:'flex',gap:'8px',alignItems:'center',marginBottom:'6px',flexWrap:'wrap'}}>
                <LeagueBadge league={item.league} dark={dark}/>
                <span style={{fontSize:'11px',color:t.textMuted,fontFamily:"'Inter',sans-serif"}}>{item.tag}</span>
              </div>
              <div style={{fontSize:'14px',fontWeight:700,color:t.textPrimary,lineHeight:1.5,fontFamily:"'Noto Sans JP',sans-serif",marginBottom:'4px'}}>{item.title}</div>
              <div style={{fontSize:'11px',color:t.textMuted,fontFamily:"'Inter',sans-serif"}}>{item.date}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Match Section ─────────────────────────────────────────────────────────

const matches = [
  { teamA:'川崎フロンターレ', teamB:'横浜F・マリノス', score:'1 - 2', league:'J1',      status:'FT' },
  { teamA:'マンチェスター・C', teamB:'アーセナル',      score:'20:00', league:'PL',     status:'予定' },
  { teamA:'レアル・マドリード',teamB:'FCバルセロナ',   score:'22:00', league:'La Liga', status:'予定' },
  { teamA:'浦和レッズ',       teamB:'鹿島アントラーズ', score:'2 - 2', league:'J1',     status:'FT' },
];

const MatchSection = ({ dark }) => {
  const t = dark ? DARK : LIGHT;
  const [hovered, setHovered] = useState(null);
  return (
    <section>
      <SectionHeader title="本日の試合" dark={dark} />
      <div style={{background:t.cardBg, border:`1px solid ${t.border}`, borderRadius:'16px', overflow:'hidden', boxShadow:t.shadow}}>
        {matches.map((m, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{
              display:'flex', alignItems:'center', padding:'14px 18px',
              borderBottom: i<matches.length-1 ? `1px solid ${t.border}` : 'none',
              background: hovered===i ? t.rowHover : 'transparent',
              transition:'background 0.2s', cursor:'pointer',
            }}>
            <div style={{width:'48px',flexShrink:0}}>
              <LeagueBadge league={m.league} dark={dark}/>
            </div>
            <div style={{flex:1,display:'flex',justifyContent:'flex-end',alignItems:'center',gap:'10px'}}>
              <span style={{fontWeight:700,fontSize:'13px',color:t.textPrimary,fontFamily:"'Noto Sans JP',sans-serif",textAlign:'right'}}>{m.teamA}</span>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',background:t.sectionBg,border:`1px solid ${t.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:t.textMuted}}>
                <IconShield/>
              </div>
            </div>
            <div style={{width:'80px',textAlign:'center'}}>
              <div style={{fontWeight:900,fontSize:'17px',color:t.score,fontFamily:"'Inter',sans-serif",letterSpacing:'-0.5px'}}>{m.score}</div>
              {m.status==='FT' && <div style={{fontSize:'9px',fontWeight:600,color:t.textMuted,fontFamily:"'Inter',sans-serif",letterSpacing:'0.05em',marginTop:'2px'}}>終了</div>}
            </div>
            <div style={{flex:1,display:'flex',alignItems:'center',gap:'10px'}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',background:t.sectionBg,border:`1px solid ${t.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:t.textMuted}}>
                <IconShield/>
              </div>
              <span style={{fontWeight:700,fontSize:'13px',color:t.textPrimary,fontFamily:"'Noto Sans JP',sans-serif"}}>{m.teamB}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─── Standings Section ─────────────────────────────────────────────────────

const plStandings = [
  {rank:1,team:'アーセナル',          points:77,w:24,d:5,l:5},
  {rank:2,team:'マンチェスター・C',   points:76,w:23,d:7,l:3},
  {rank:3,team:'リヴァプール',        points:74,w:22,d:8,l:4},
  {rank:4,team:'アストン・ヴィラ',    points:66,w:20,d:6,l:8},
  {rank:5,team:'トッテナム',          points:60,w:18,d:6,l:9},
];
const j1Standings = [
  {rank:1,team:'町田ゼルビア',        points:22,w:7,d:1,l:1},
  {rank:2,team:'セレッソ大阪',        points:20,w:5,d:5,l:0},
  {rank:3,team:'サンフレッチェ広島',  points:18,w:4,d:6,l:0},
  {rank:4,team:'ヴィッセル神戸',      points:17,w:5,d:2,l:2},
  {rank:5,team:'鹿島アントラーズ',    points:16,w:5,d:1,l:3},
];

const StandingsSection = ({ dark }) => {
  const t = dark ? DARK : LIGHT;
  const [tab, setTab] = useState('PL');
  const [hovered, setHovered] = useState(null);
  const standings = tab==='PL' ? plStandings : j1Standings;

  const rankColor = (r) => r===1 ? t.rankGold : r===2 ? t.rankSilver : r===3 ? t.rankBronze : t.textMuted;

  return (
    <section>
      <SectionHeader title="リーグ順位" dark={dark} />
      <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:'16px',overflow:'hidden',boxShadow:t.shadow}}>
        <div style={{display:'flex',borderBottom:`1px solid ${t.border}`,padding:'0 6px'}}>
          {[['PL','🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League'],['J1','🇯🇵 J1リーグ']].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding:'12px 14px', fontSize:'13px', fontWeight:600, cursor:'pointer',
              background:'none', border:'none',
              color: tab===key ? t.accent : t.textSecond,
              borderBottom: tab===key ? `2px solid ${t.accent}` : '2px solid transparent',
              fontFamily:"'Inter',sans-serif", transition:'all 0.2s',
            }}>{label}</button>
          ))}
        </div>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:t.theadBg}}>
              {['順位','クラブ','勝点','勝','分','敗'].map((h,i) => (
                <th key={h} style={{padding:'10px 12px',fontSize:'11px',fontWeight:600,color:t.textMuted,textAlign:i===1?'left':'center',fontFamily:"'Inter',sans-serif",letterSpacing:'0.04em'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map(s => (
              <tr key={s.rank}
                onMouseEnter={() => setHovered(s.rank)} onMouseLeave={() => setHovered(null)}
                style={{borderTop:`1px solid ${t.border}`,background:hovered===s.rank?t.rowHover:'transparent',transition:'background 0.2s'}}>
                <td style={{padding:'12px',textAlign:'center'}}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:'3px',color:rankColor(s.rank),fontWeight:700,fontFamily:"'Inter',sans-serif",fontSize:'13px'}}>
                    {s.rank<=3 && <IconTrophy size={12}/>}{s.rank}
                  </span>
                </td>
                <td style={{padding:'12px 12px',fontWeight:700,color:t.textPrimary,fontFamily:"'Noto Sans JP',sans-serif",fontSize:'13px'}}>{s.team}</td>
                <td style={{padding:'12px',textAlign:'center',fontWeight:800,color:t.textPrimary,fontFamily:"'Inter',sans-serif",fontSize:'15px'}}>{s.points}</td>
                {[s.w,s.d,s.l].map((v,i) => (
                  <td key={i} style={{padding:'12px',textAlign:'center',color:t.textSecond,fontFamily:"'Inter',sans-serif",fontSize:'13px'}}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────

const SectionHeader = ({ title, dark }) => {
  const t = dark ? DARK : LIGHT;
  return (
    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
      <div style={{width:'4px',height:'20px',background:'#00D26A',borderRadius:'2px'}}/>
      <h2 style={{fontSize:'18px',fontWeight:800,color:t.textPrimary,fontFamily:"'Inter',sans-serif",letterSpacing:'-0.01em'}}>{title}</h2>
    </div>
  );
};

// ─── Footer ────────────────────────────────────────────────────────────────

const Footer = ({ dark }) => {
  const t = dark ? DARK : LIGHT;
  return (
    <footer style={{background:t.sectionBg,borderTop:`1px solid ${t.border}`,padding:'40px 20px',marginTop:'80px'}}>
      <div style={{maxWidth:'960px',margin:'0 auto',display:'flex',flexWrap:'wrap',justifyContent:'space-between',alignItems:'center',gap:'20px'}}>
        <div>
          <LogoSVG dark={dark}/>
          <div style={{fontSize:'12px',color:t.textMuted,marginTop:'6px',fontFamily:"'Inter',sans-serif"}}>© {new Date().getFullYear()} Goal Labo. All rights reserved.</div>
        </div>
        <div style={{display:'flex',gap:'14px',color:t.textSecond}}>
          <a href="#" style={{color:t.textSecond,transition:'color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color=t.accent} onMouseLeave={e=>e.currentTarget.style.color=t.textSecond}><IconGlobe/></a>
          <a href="#" style={{color:t.textSecond,transition:'color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.color=t.accent} onMouseLeave={e=>e.currentTarget.style.color=t.textSecond}><IconGlobe/></a>
        </div>
        <nav style={{display:'flex',gap:'20px',fontSize:'13px'}}>
          {['ニュース','試合日程','リーグ順位','About'].map(l => (
            <a key={l} href="#" style={{color:t.textSecond,textDecoration:'none',fontFamily:"'Noto Sans JP',sans-serif",transition:'color 0.2s'}}
              onMouseEnter={e=>e.currentTarget.style.color=t.textPrimary} onMouseLeave={e=>e.currentTarget.style.color=t.textSecond}>{l}</a>
          ))}
        </nav>
      </div>
    </footer>
  );
};

// ─── Login Page ────────────────────────────────────────────────────────────

const LoginPage = ({ dark, onNavigate }) => {
  const t = dark ? DARK : LIGHT;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focus, setFocus] = useState(null);
  const [btnHov, setBtnHov] = useState(false);

  const inp = (field) => ({
    width:'100%', padding:'11px 14px',
    background: t.inputBg,
    border:`1.5px solid ${focus===field ? '#00D26A' : t.borderStrong}`,
    borderRadius:'10px', color:t.textPrimary,
    fontFamily:"'Noto Sans JP',sans-serif", fontSize:'14px', outline:'none',
    boxSizing:'border-box',
    boxShadow: focus===field ? '0 0 0 3px rgba(0,210,106,0.15)' : 'none',
    transition:'border-color 0.2s, box-shadow 0.2s',
  });

  return (
    <div style={{minHeight:'calc(100vh - 64px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 20px',background:t.pageBg}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <LogoSVG dark={dark}/>
        </div>
        <div style={{background:t.cardBg,border:`1px solid ${t.border}`,borderRadius:'20px',padding:'36px',boxShadow:'0 4px 24px rgba(0,0,0,0.07)'}}>
          <h1 style={{fontSize:'22px',fontWeight:800,textAlign:'center',color:t.textPrimary,marginBottom:'8px',fontFamily:"'Inter',sans-serif"}}>おかえりなさい 👋</h1>
          <p style={{textAlign:'center',fontSize:'13px',color:t.textSecond,marginBottom:'28px',fontFamily:"'Noto Sans JP',sans-serif"}}>Goal Laboにログインして続ける</p>

          <button style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',background:dark?'#1f2937':'#fff',color:dark?'#e5e7eb':'#111',fontWeight:600,fontSize:'14px',padding:'12px',borderRadius:'10px',border:`1px solid ${t.border}`,cursor:'pointer',marginBottom:'20px',fontFamily:"'Inter',sans-serif",boxShadow:t.shadow,transition:'box-shadow 0.2s'}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow=t.shadowHover} onMouseLeave={e=>e.currentTarget.style.boxShadow=t.shadow}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/><path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
            Googleでログイン
          </button>

          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
            <div style={{flex:1,height:'1px',background:t.border}}/>
            <span style={{fontSize:'11px',color:t.textMuted,fontFamily:"'Noto Sans JP',sans-serif",whiteSpace:'nowrap'}}>またはメールアドレスで</span>
            <div style={{flex:1,height:'1px',background:t.border}}/>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:t.textSecond,marginBottom:'6px',fontFamily:"'Inter',sans-serif"}}>メールアドレス</label>
              <input type="email" value={email} placeholder="you@example.com"
                onChange={e=>setEmail(e.target.value)}
                onFocus={()=>setFocus('email')} onBlur={()=>setFocus(null)}
                style={inp('email')}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'12px',fontWeight:600,color:t.textSecond,marginBottom:'6px',fontFamily:"'Inter',sans-serif"}}>パスワード</label>
              <input type="password" value={password} placeholder="••••••••"
                onChange={e=>setPassword(e.target.value)}
                onFocus={()=>setFocus('password')} onBlur={()=>setFocus(null)}
                style={inp('password')}/>
            </div>
          </div>

          <button
            onMouseEnter={()=>setBtnHov(true)} onMouseLeave={()=>setBtnHov(false)}
            style={{width:'100%',marginTop:'22px',background:btnHov?'#00b85e':'#00D26A',color:'#fff',fontWeight:700,fontSize:'15px',padding:'13px',borderRadius:'10px',border:'none',cursor:'pointer',fontFamily:"'Inter',sans-serif",transform:btnHov?'scale(1.01)':'scale(1)',boxShadow:btnHov?'0 6px 20px rgba(0,210,106,0.35)':'0 2px 8px rgba(0,210,106,0.20)',transition:'all 0.2s'}}>
            ログイン
          </button>
          <p style={{textAlign:'center',marginTop:'16px',fontSize:'12px',color:t.textMuted,fontFamily:"'Noto Sans JP',sans-serif"}}>
            まだアカウントをお持ちでない方は{' '}
            <a href="#" style={{color:'#00D26A',textDecoration:'none',fontWeight:600}}>新規登録</a>
          </p>
        </div>
        <div style={{textAlign:'center',marginTop:'16px'}}>
          <span onClick={() => onNavigate('home')} style={{fontSize:'12px',color:t.textSecond,cursor:'pointer',fontFamily:"'Inter',sans-serif"}}>← ホームへ戻る</span>
        </div>
      </div>
    </div>
  );
};

// Export
Object.assign(window, {
  Header, Hero, NewsSection, MatchSection, StandingsSection, Footer, LoginPage,
  LIGHT, DARK,
});
