import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { NOSTALGIC_QUOTES } from '../data/kkData';

export const LyricMarquee: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % NOSTALGIC_QUOTES.length);
        setFade(true);
      }, 350);
    }, 7500);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + NOSTALGIC_QUOTES.length) % NOSTALGIC_QUOTES.length);
      setFade(true);
    }, 200);
  };

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % NOSTALGIC_QUOTES.length);
      setFade(true);
    }, 200);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto my-8 px-4">
      <div className="relative rounded-3xl console-surface px-6 sm:px-12 py-7 sm:py-8 border border-amber-500/15 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4 overflow-hidden">
        {/* Soft tungsten atmospheric halo */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-96 h-20 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Previous Quote Arrow */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous archival memory"
          className="p-2 rounded-full text-stone-400 hover:text-amber-300 hover:bg-white/5 transition-all shrink-0 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Poetic Center Quote in Playfair / Lora Serif */}
        <div className="flex-1 text-center min-h-[64px] flex flex-col items-center justify-center px-3 sm:px-6">
          <div className="flex items-center gap-2 mb-1.5 opacity-60">
            <span className="w-6 h-[1px] bg-amber-400/40" />
            <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-amber-300/80">
              ARCHIVE MEMORY #{String(index + 1).padStart(2, '0')}
            </span>
            <span className="w-6 h-[1px] bg-amber-400/40" />
          </div>

          <p
            className={`font-editorial italic text-lg sm:text-2xl text-stone-100/95 leading-relaxed tracking-wide transition-all duration-400 transform ${
              fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1.5 scale-[0.98]'
            }`}
          >
            {NOSTALGIC_QUOTES[index]}
          </p>
        </div>

        {/* Next Quote Arrow */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next archival memory"
          className="p-2 rounded-full text-stone-400 hover:text-amber-300 hover:bg-white/5 transition-all shrink-0 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Elegant Progress Ticker Dots */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {NOSTALGIC_QUOTES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Jump to memory ${i + 1}`}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'w-1.5 bg-stone-700 hover:bg-stone-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
