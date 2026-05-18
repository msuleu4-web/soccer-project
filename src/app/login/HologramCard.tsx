'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';

export default function HologramCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 20;
    const rotateX = ((centerY - y) / centerY) * 20;

    setRotation({ x: rotateX, y: rotateY });
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
    setGlarePos({ x: 50, y: 50 });
  };

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    setRotation({
      x: ((rect.height / 2 - y) / (rect.height / 2)) * 15,
      y: ((x - rect.width / 2) / (rect.width / 2)) * 15,
    });
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    setIsHovering(true);
  }, []);

  const handleTouchEnd = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div style={{ perspective: '1200px' }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: '320px',
          height: '440px',
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: isHovering ? 'none' : 'transform 0.6s ease, box-shadow 0.6s ease',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow: isHovering
            ? '0 30px 80px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)'
            : '0 10px 30px rgba(0, 0, 0, 0.3)',
          border: '2px solid rgba(255, 215, 0, 0.6)',
          background: 'linear-gradient(145deg, #0a1a0a 0%, #0F3D2E 30%, #0a2a1a 60%, #0a1a0a 100%)',
        }}
      >
        {/* ホログラム反射レイヤー */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(
              circle at ${glarePos.x}% ${glarePos.y}%,
              rgba(255, 215, 0, 0.4) 0%,
              rgba(0, 210, 106, 0.3) 20%,
              rgba(0, 191, 255, 0.2) 40%,
              rgba(255, 0, 128, 0.15) 60%,
              transparent 80%
            )`,
            mixBlendMode: 'color-dodge',
            opacity: isHovering ? 0.9 : 0,
            transition: isHovering ? 'opacity 0.2s' : 'opacity 0.6s',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />

        {/* 白いグレア（光沢） */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(
              circle at ${glarePos.x}% ${glarePos.y}%,
              rgba(255, 255, 255, 0.3) 0%,
              rgba(255, 255, 255, 0.08) 35%,
              transparent 65%
            )`,
            opacity: isHovering ? 1 : 0,
            transition: isHovering ? 'opacity 0.15s' : 'opacity 0.5s',
            pointerEvents: 'none',
            zIndex: 4,
          }}
        />

        {/* キラキラパーティクル */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              radial-gradient(1.5px 1.5px at 15% 25%, rgba(255,255,255,0.9), transparent),
              radial-gradient(1px 1px at 55% 65%, rgba(255,255,255,0.7), transparent),
              radial-gradient(1.5px 1.5px at 80% 15%, rgba(255,215,0,0.8), transparent),
              radial-gradient(1px 1px at 35% 85%, rgba(255,255,255,0.6), transparent),
              radial-gradient(2px 2px at 70% 45%, rgba(255,215,0,0.7), transparent),
              radial-gradient(1px 1px at 20% 70%, rgba(0,210,106,0.6), transparent),
              radial-gradient(1.5px 1.5px at 90% 80%, rgba(255,255,255,0.8), transparent),
              radial-gradient(1px 1px at 45% 35%, rgba(0,191,255,0.5), transparent)
            `,
            animation: 'sparkle 3s ease-in-out infinite',
            opacity: isHovering ? 1 : 0.2,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />

        {/* カード内容 */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '4px',
            color: 'rgba(255, 215, 0, 0.7)',
            marginBottom: '16px',
            textTransform: 'uppercase',
          }}>
            ★ GOAL LABO ★
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: isHovering
              ? 'drop-shadow(0 0 20px rgba(255,215,0,0.5))'
              : 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            transition: 'filter 0.3s ease',
          }}>
            <Image
              src="/images/trophy.png"
              alt="World Cup Trophy"
              width={200}
              height={280}
              style={{ objectFit: 'contain', maxHeight: '280px' }}
              priority
            />
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '800',
              color: '#FFD700',
              textShadow: '0 0 15px rgba(255,215,0,0.3)',
              letterSpacing: '2px',
            }}>
              WORLD CLASS
            </div>
            <div style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '4px',
              letterSpacing: '1px',
            }}>
              サッカー情報プラットフォーム
            </div>
          </div>
        </div>

        {/* 枠の装飾ライン */}
        <div style={{
          position: 'absolute',
          inset: '8px',
          border: '1px solid rgba(255, 215, 0, 0.15)',
          borderRadius: '14px',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
      </div>

      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
