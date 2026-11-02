import React from 'react';
import { KKTrack } from '../data/kkData';
import { LyricsPanel } from './LyricsPanel';
export function TheatreStage({ currentTrack, currentTime, isPlaying, onSeek, duration }: {
  duration: number;
  currentTrack: KKTrack; currentTime: number; isPlaying: boolean;
  onTogglePlay: () => void; onSeek: (seconds: number) => void;
}) {
  return <TheatreContent currentTrack={currentTrack} currentTime={currentTime} isPlaying={isPlaying} onSeek={onSeek} duration={duration} />;
}
function TheatreContent(props: {currentTrack: KKTrack; currentTime: number; isPlaying: boolean; onSeek: (seconds:number)=>void; duration: number}) {
  const {currentTrack: track, isPlaying} = props;
  return <main className="theatre-layout">
    <div className="theatre-record">
      <div className="record" style={{ animationPlayState: isPlaying ? 'running' : 'paused', boxShadow: '0 0 90px ' + track.ambientGlow.glowRgba }}>
        {track.artworkUrl && <img src={track.artworkUrl} alt={track.movieOrAlbum} />}
        <span />
      </div>
      <h1>{track.songName}</h1><p>{track.movieOrAlbum}</p>
    </div>
    <LyricsPanel key={track.videoId} videoId={track.videoId} currentTime={props.currentTime} onSeek={props.onSeek} songName={track.songName} album={track.movieOrAlbum} artist={track.artist} duration={props.duration} />
  </main>;
}
