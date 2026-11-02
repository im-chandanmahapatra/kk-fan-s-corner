import React, { useMemo } from 'react';
import { AmbientGlow } from '../data/kkData';

interface ConcertAtmosphereProps {
  isPlaying: boolean;
  rainMode?: 'gentle' | 'monsoon' | 'off';
  ambientGlow?: AmbientGlow;
  isTheatreMode?: boolean;
}

export const ConcertAtmosphere: React.FC<ConcertAtmosphereProps> = ({
  isPlaying,
  rainMode = 'gentle',
  ambientGlow,
  isTheatreMode = false,
}) => {
  const raindrops = useMemo(() => {
    if (rainMode === 'off' || isTheatreMode) return [];
    const count = rainMode === 'monsoon' ? 32 : 16;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 5.8 + (i % 7) * 2.2) % 96}%`,
      delay: `${(i * 0.19) % 3}s`,
      duration: `${rainMode === 'monsoon' ? 0.95 + (i % 4) * 0.15 : 1.6 + (i % 5) * 0.25}s`,
      height: `${rainMode === 'monsoon' ? 32 + (i % 18) : 16 + (i % 10)}px`,
      opacity: (0.1 + (i % 4) * 0.04).toFixed(2),
    }));
  }, [rainMode, isTheatreMode]);

  const glowColor1 = ambientGlow ? ambientGlow.primary : '#f59e0b';
  const glowColor2 = ambientGlow ? ambientGlow.secondary : '#b45309';

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-colors duration-1000 ${
      isTheatreMode ? 'bg-[#030304]' : 'bg-[#050507]'
    }`}>
      {/* Slow-Moving Dark Mesh Gradient Layer with Dynamic 1.5s Ambient Aura Crossfade */}
      <div className="absolute inset-0">
        {/* Blob 1: Active Track Ambient Color Radial Stage Glow */}
        <div 
          className={`absolute -top-32 left-1/4 w-[850px] h-[700px] rounded-full blur-[150px] pointer-events-none animate-mesh-1 transition-all duration-1500 ease-in-out ${
            isPlaying && !isTheatreMode ? 'opacity-90' : isTheatreMode ? 'opacity-40' : 'opacity-30'
          }`}
          style={{
            background: `radial-gradient(circle, ${glowColor1} 0%, ${glowColor2} 50%, transparent 75%)`,
          }}
        />

        {/* Blob 2: Deep Midnight Secondary Fog */}
        <div 
          className={`absolute top-1/3 -right-24 w-[750px] h-[750px] rounded-full blur-[160px] pointer-events-none animate-mesh-2 transition-all duration-1500 ease-in-out ${
            isTheatreMode ? 'opacity-25' : 'opacity-55'
          }`}
          style={{
            background: `radial-gradient(circle, ${glowColor2} 0%, rgba(10, 14, 28, 0.4) 60%, transparent 80%)`,
          }}
        />

        {/* Blob 3: Lower Ambient Glow */}
        <div 
          className={`absolute -bottom-40 left-1/3 w-[850px] h-[650px] rounded-full blur-[160px] pointer-events-none animate-mesh-3 transition-all duration-1500 ease-in-out ${
            isPlaying && !isTheatreMode ? 'opacity-70' : isTheatreMode ? 'opacity-30' : 'opacity-25'
          }`}
          style={{
            background: `radial-gradient(circle, ${glowColor1} 0%, rgba(20, 15, 10, 0.3) 60%, transparent 80%)`,
          }}
        />
      </div>

      {/* High-Fidelity Filmic Grain Overlay */}
      <div className="film-grain" />

      {/* Rain Streaks with Ambient Tint */}
      {raindrops.map((r) => (
        <div
          key={r.id}
          className="rain-stream"
          style={{
            left: r.left,
            height: r.height,
            animationDelay: r.delay,
            animationDuration: r.duration,
            opacity: Number(r.opacity),
            background: `linear-gradient(180deg, transparent, ${glowColor1}44, transparent)`,
          }}
        />
      ))}
    </div>
  );
};
