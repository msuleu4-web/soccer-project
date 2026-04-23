
'use client';

import { useTheme } from 'next-themes';

const LogoSVG = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
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
};

export default LogoSVG;
