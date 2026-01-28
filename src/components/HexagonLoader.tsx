'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HexagonLoaderProps {
  size?: number;
  text?: string;
}

export function HexagonLoader({ size = 100, text = 'ANALYZING' }: HexagonLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const hexagons = containerRef.current.querySelectorAll('.hex-segment');

    gsap.to(hexagons, {
      opacity: 0.3,
      stagger: {
        each: 0.1,
        repeat: -1,
        yoyo: true,
      },
      duration: 0.3,
    });

    // Text animation
    const textEl = containerRef.current.querySelector('.loader-text');
    if (textEl) {
      gsap.to(textEl, {
        opacity: 0.5,
        repeat: -1,
        yoyo: true,
        duration: 0.5,
      });
    }
  }, []);

  const hexPoints: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = Math.cos(angle) * (size / 2.5);
    const y = Math.sin(angle) * (size / 2.5);
    hexPoints.push({ x: x + size / 2, y: y + size / 2 });
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="100%" stopColor="#ff00ff" />
          </linearGradient>
        </defs>

        {/* Outer rotating ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 5}
          fill="none"
          stroke="url(#hexGradient)"
          strokeWidth="2"
          strokeDasharray="10 5"
          style={{
            animation: 'rotate 4s linear infinite',
            transformOrigin: 'center',
          }}
        />

        {/* Hexagon segments */}
        {hexPoints.map((point, i) => (
          <line
            key={i}
            className="hex-segment"
            x1={point.x}
            y1={point.y}
            x2={hexPoints[(i + 1) % 6].x}
            y2={hexPoints[(i + 1) % 6].y}
            stroke="#00f5ff"
            strokeWidth="3"
            style={{
              filter: 'drop-shadow(0 0 5px #00f5ff)',
            }}
          />
        ))}

        {/* Center dot */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="4"
          fill="#ff00ff"
          style={{
            filter: 'drop-shadow(0 0 10px #ff00ff)',
          }}
        />

        {/* Inner rotating element */}
        <polygon
          points={hexPoints.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="#ff00ff"
          strokeWidth="1"
          opacity="0.5"
          style={{
            animation: 'rotate 8s linear infinite reverse',
            transformOrigin: 'center',
          }}
        />
      </svg>

      <div
        className="loader-text"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          letterSpacing: '0.3em',
          color: '#00f5ff',
          textShadow: '0 0 10px #00f5ff',
        }}
      >
        {'[ '}{text}{' ]'}
      </div>
    </div>
  );
}
