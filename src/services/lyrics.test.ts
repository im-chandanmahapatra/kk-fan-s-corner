import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankLyrics, type LyricsRecord } from './lyrics';
import { parseLrc } from '../components/LyricsPanel';
import { PLAYLIST_TRACKS } from '../data/kkData';

const record = (overrides: Partial<LyricsRecord> = {}): LyricsRecord => ({
  id: 1, trackName: 'Example Song', artistName: 'KK', albumName: 'Example Album',
  duration: 240, instrumental: false, plainLyrics: 'Test line', syncedLyrics: '[00:10.00]Test line', ...overrides,
});

test('rejects another song, another artist and alternate mixes', () => {
  assert.equal(rankLyrics([
    record({ trackName: 'Different Song' }),
    record({ artistName: 'Another Artist', albumName: 'Another Album' }),
    record({ trackName: 'Example Song (LoFi Mix)' }),
  ], 'Example Song', 'Example Album', 240), undefined);
});

test('prefers a matching recording duration over a different album version', () => {
  const matched = record({ id: 2, albumName: 'Compilation', duration: 241 });
  assert.equal(rankLyrics([record({ duration: 300 }), matched], 'Example Song', 'Example Album', 240)?.id, 2);
});

test('accepts a duet and a From soundtrack suffix', () => {
  const duet = record({ trackName: 'Example Song (From "Example Album")', artistName: 'K.K. & Second Singer' });
  assert.equal(rankLyrics([duet], 'Example Song', 'Example Album', 240)?.id, 1);
});

test('preserves readable lyrics when only an unmatched duration is available', () => {
  assert.equal(rankLyrics([record({ duration: 300, syncedLyrics: null })], 'Example Song', 'Example Album', 240)?.plainLyrics, 'Test line');
});

test('parses repeated timestamps, decimal precision, offsets and sorts for seeking', () => {
  assert.deepEqual(parseLrc('[offset:-500]\n[00:20.50][00:40.500]Second\n[00:10.1]First\n[ar:Test]'), [
    { time: 9.6, text: 'First' }, { time: 20, text: 'Second' }, { time: 40, text: 'Second' },
  ]);
});

test('matches non-KK songs present in the supplied playlist', () => {
  const guest = record({ artistName: 'Javed Ali', albumName: 'Compilation' });
  assert.equal(rankLyrics([guest], 'Example Song', 'Example Album', 240, 'Javed Ali')?.id, 1);
});

test('playlist uses the real first recording, unique video IDs and matching thumbnails', () => {
  assert.equal(PLAYLIST_TRACKS.length, 21);
  assert.equal(PLAYLIST_TRACKS[0].songName, 'Dil Ibaadat');
  assert.equal(PLAYLIST_TRACKS[0].videoId, 'U2QNhsAgIIE');
  assert.equal(new Set(PLAYLIST_TRACKS.map(track => track.videoId)).size, 21);
  assert.ok(PLAYLIST_TRACKS.every(track => track.artworkUrl?.includes(track.videoId!)));
});
