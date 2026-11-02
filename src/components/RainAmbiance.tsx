import React, { useMemo } from 'react';

interface RainAmbianceProps {
  intensity?: 'gentle' | 'monsoon' | 'off';
}

export const RainAmbiance: React.FC<RainAmbianceProps> = ({ intensity = 'gentle' }) => {
  // Generate random rain streak positions and delays
  const raindrops = useMemo(() => {
    if (intensity === 'off') return [];
    const count = intensity === 'monsoon' ? 45 : 22;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i * 4.2 + (i % 5) * 1.5) % 98}%`,
      delay: `${(i * 0.17) % 2.5}s`,
      duration: `${intensity === 'monsoon' ? 0.8 + (i % 4) * 0.15 : 1.4 + (i % 5) * 0.2}s`,
      height: `${intensity === 'monsoon' ? 35 + (i % 25) : 20 + (i % 15)}px`,
      opacity: (0.15 + (i % 4) * 0.08).toFixed(2),
    }));
  }, [intensity]);

  if (intensity === 'off') return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft Vignette and Streetlight Glow in Distance */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Rain Stream Lines */}
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
          }}
        />
      ))}
    </div>
  );
};
