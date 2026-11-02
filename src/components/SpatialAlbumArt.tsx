import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { KKTrack } from '../data/kkData';
import { soundEffects } from '../services/soundEffects';

interface SpatialAlbumArtProps {
  currentTrack: KKTrack;
  isPlaying: boolean;
  onTogglePlay: () => void;
  showLyrics: boolean;
  isTheatreMode?: boolean;
}

export const SpatialAlbumArt: React.FC<SpatialAlbumArtProps> = ({
  currentTrack,
  isPlaying,
  onTogglePlay,
  showLyrics,
  isTheatreMode = false,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const glowColor = currentTrack.ambientGlow.primary;
  const glowRgba = currentTrack.ambientGlow.glowRgba;

  // Normalized cursor position (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // High-fidelity spring physics for physical weight, momentum, and settling
  const springConfig = { damping: 22, stiffness: 260, mass: 0.6 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // 3D Parallax Rotation (card tilts toward the cursor)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['14deg', '-14deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-14deg', '14deg']);

  // Parallax layer shifts for multi-tiered physical depth
  const vinylTranslateX = useTransform(mouseXSpring, [-0.5, 0.5], ['-12px', '12px']);
  const vinylTranslateY = useTransform(mouseYSpring, [-0.5, 0.5], ['-12px', '12px']);
  const sheenTranslateX = useTransform(mouseXSpring, [-0.5, 0.5], ['20px', '-20px']);
  const sheenTranslateY = useTransform(mouseYSpring, [-0.5, 0.5], ['16px', '-16px']);
  const auraTranslateX = useTransform(mouseXSpring, [-0.5, 0.5], ['-18px', '18px']);
  const auraTranslateY = useTransform(mouseYSpring, [-0.5, 0.5], ['-18px', '18px']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / rect.width - 0.5;
    const yPct = mouseY / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div 
      className={`relative mx-auto flex flex-col items-center justify-center transition-all duration-700 select-none hero-spatial-canvas ${
        showLyrics 
          ? 'scale-[0.85] blur-[20px] opacity-30 -translate-y-6 pointer-events-none' 
          : isTheatreMode 
          ? 'scale-105 opacity-100 my-4' 
          : 'scale-100 blur-0 opacity-100 my-4 sm:my-8'
      }`}
      style={{
        perspective: 1200,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Dynamic Ambient Breathing Aura Behind Album Centerpiece with Subtle Parallax Offset */}
      <motion.div 
        className={`absolute rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${
          isPlaying ? 'w-[440px] h-[440px] opacity-70 scale-105' : 'w-[360px] h-[360px] opacity-35 scale-95'
        }`}
        style={{
          x: auraTranslateX,
          y: auraTranslateY,
          background: `radial-gradient(circle, ${glowColor} 0%, ${currentTrack.ambientGlow.secondary} 40%, transparent 70%)`,
        }}
      />

      {/* Main 3D Tilting Centerpiece */}
      <motion.div 
        className="relative group cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          soundEffects.playMechanicalClick(isPlaying);
          onTogglePlay();
        }}
        role="button"
        tabIndex={0}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered && !showLyrics ? 1.03 : 1,
        }}
        transition={{
          scale: { type: 'spring', damping: 20, stiffness: 300 },
        }}
      >
        {/* 1:1 Aspect Ratio Canvas Container with Strict Micro-Border and Diffuse Multi-Tiered Shadows */}
        <div 
          className="relative z-10 w-[280px] xs:w-[320px] sm:w-[390px] md:w-[440px] lg:w-[460px] aspect-square rounded-[32px] sm:rounded-[40px] overflow-hidden border transition-all duration-500 flex items-center justify-center"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.06)',
            boxShadow: isHovered
              ? `0 30px 80px rgba(0, 0, 0, 0.75), 0 0 140px ${glowRgba}`
              : `0 20px 60px rgba(0, 0, 0, 0.6), 0 0 120px ${glowRgba}`,
            background: 'linear-gradient(135deg, #1f1f2e, #0d0d12)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Internal Ambient Mesh Gradient Glow Layer */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at 75% 25%, ${glowColor}30 0%, transparent 65%), radial-gradient(circle at 25% 80%, ${currentTrack.ambientGlow.secondary}20 0%, transparent 60%)`,
            }}
          />

          {/* Dynamic Specular Sheen & Light Glare that moves oppositely across the surface */}
          <motion.div 
            className="absolute -inset-10 pointer-events-none rounded-[48px]"
            style={{
              x: sheenTranslateX,
              y: sheenTranslateY,
              background: 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.12) 0%, transparent 60%)',
              transform: 'translateZ(20px)',
            }}
          />

          {/* Micro-border Inner Highlight */}
          <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-[32px] sm:rounded-[40px]" />
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

          {/* Central High-Fidelity Vinyl Record Graphic Floating Forward in 3D Space */}
          <motion.div 
            className={`relative w-[210px] xs:w-[240px] sm:w-[290px] md:w-[330px] aspect-square rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center ${
              isPlaying ? 'animate-spin-vinyl' : ''
            }`}
            style={{
              x: vinylTranslateX,
              y: vinylTranslateY,
              transform: 'translateZ(35px)',
              backgroundImage: 'repeating-radial-gradient(circle at center, #1b1b22 0, #1b1b22 2px, #121217 3px, #121217 5px)',
            }}
          >
            {/* Fine Vinyl Grooves Shimmer Layer */}
            <div className="absolute inset-2 rounded-full border border-white/[0.05] pointer-events-none" />
            <div className="absolute inset-6 rounded-full border border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-10 rounded-full border border-white/[0.04] pointer-events-none" />
            <div className="absolute inset-14 rounded-full border border-white/[0.03] pointer-events-none" />
            <div className="absolute inset-20 rounded-full border border-white/[0.04] pointer-events-none" />

            {/* Vinyl Center Label (Rich Ambient Tinted Core with 3D Depth) */}
            <div 
              className="w-20 sm:w-28 h-20 sm:h-28 rounded-full border border-amber-400/30 flex items-center justify-center shadow-inner relative transition-colors duration-1000"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${glowColor}dd 0%, #151520 85%)`,
                transform: 'translateZ(10px)',
              }}
            >
              {/* Spindle Core Hole */}
              <div className="w-5 h-5 rounded-full bg-[#0a0a0f] border border-white/30 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9)] flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              </div>
            </div>
          </motion.div>

          {/* Central Play/Pause Hover Affordance Floating Foremost in Z-Space */}
          <div 
            className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 pointer-events-none ${
              isHovered || !isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
            style={{
              transform: 'translateZ(55px)',
            }}
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/75 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-[0_12px_35px_rgba(0,0,0,0.85)]">
              {isPlaying ? (
                <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
              ) : (
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
