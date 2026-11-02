import React, { useEffect, useRef, useState } from 'react';
import { CloudFog, MoonStar, Sparkles, Sunrise } from 'lucide-react';
import { AmbientGlow } from '../data/kkData';
import night from '../assets/mountain-night.png';
import dawn from '../assets/mountain-dawn.png';

export function AnimatedBackdrop({ isDawnMode, onChangeMode, ambientGlow }: {
  isDawnMode: boolean; onChangeMode: (dawn: boolean) => void; ambientGlow: AmbientGlow;
}) {
  const [effect, setEffect] = useState<'stars' | 'mist' | 'sunrise' | null>(null);
  const [run, setRun] = useState(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clear = () => { if (timeout.current) clearTimeout(timeout.current); };
  useEffect(() => { clear(); setEffect(null); return clear; }, [isDawnMode]);
  function trigger(value: 'stars' | 'mist' | 'sunrise') {
    if ((isDawnMode && value === 'stars') || (!isDawnMode && value !== 'stars')) return;
    clear(); setEffect(value); setRun(n => n + 1);
    timeout.current = setTimeout(() => setEffect(null), 14000);
  }
  return <>
    <div className={'landscape absolute inset-0 overflow-hidden ' + (isDawnMode ? 'morning' : 'night')} aria-hidden="true">
      <div className="landscape-image" style={{ backgroundImage: 'url(' + night + ')', opacity: isDawnMode ? 0 : 1 }} />
      <div className="landscape-image" style={{ backgroundImage: 'url(' + dawn + ')', opacity: isDawnMode ? 1 : 0 }} />
      <div className="landscape-tint" style={{ backgroundColor: ambientGlow.primary }} />
      {isDawnMode && <><div className="morning-fog fog-a" /><div className="morning-fog fog-b" /></>}
      {!isDawnMode && <div className="quiet-stars">{[12, 26, 43, 61, 77, 90].map((x, i) => <i key={x} style={{ left: x + '%', top: (12 + i % 3 * 9) + '%', animationDelay: i + 's' }} />)}</div>}
      <div key={run} className="weather-effects absolute inset-0" data-effect={effect || 'none'}>
        {!isDawnMode && effect === 'stars' && [0, 1, 2].map(i => <span key={i} className="single-meteor" style={{ left: (70 + i * 8) + '%', top: (38 + i * 8) + '%', animationDelay: (i * 4.5) + 's' }} />)}
        {isDawnMode && effect === 'mist' && <div className="fog-release" />}
        {isDawnMode && effect === 'sunrise' && <div className="sunrise-release" />}
      </div>
      <div className="landscape-shade" />
    </div>
    <div className="atmosphere-controls" role="group" aria-label="Scene and weather">
      <button type="button" onClick={() => onChangeMode(false)} aria-pressed={!isDawnMode}><MoonStar size={16} /><span>Night</span></button>
      <button type="button" onClick={() => onChangeMode(true)} aria-pressed={isDawnMode}><Sunrise size={16} /><span>Dawn</span></button>
      <span className="control-divider" />
      {isDawnMode ? <>
        <button type="button" onClick={() => trigger('mist')} data-active={effect === 'mist'} aria-label="Release morning fog"><CloudFog size={16} /><span>Fog</span></button>
        <button type="button" onClick={() => trigger('sunrise')} data-active={effect === 'sunrise'} aria-label="Slow sunrise"><Sunrise size={16} /><span>Glow</span></button>
      </> : <button type="button" onClick={() => trigger('stars')} data-active={effect === 'stars'} aria-label="Release shooting stars one at a time"><Sparkles size={16} /><span>Shooting stars</span></button>}
    </div>
    {effect && <div className="weather-status" role="status">{effect === 'stars' ? 'Shooting stars · tap to replay' : effect === 'mist' ? 'Morning fog · tap to replay' : 'Sunrise glow · tap to replay'}</div>}
  </>;
}
