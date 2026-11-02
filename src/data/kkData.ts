export interface AmbientGlow {
  primary: string; // Hex or gradient color
  secondary: string;
  glowRgba: string; // RGBA shadow string for Dynamic Island
  name: string;
}

export interface KKTrack {
  id: string;
  songName: string;
  movieOrAlbum: string;
  formattedTitle: string; // Strict 'Song Name — Movie/Album'
  artist: string;
  year: number;
  composer: string;
  iconicLyric: string;
  lyricTranslation: string;
  approxDurationSec: number;
  mood: string;
  ambientGlow: AmbientGlow;
  videoId?: string;
}

export interface PolaroidMemory {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  description: string;
  colorTone: string;
  rotation: string;
  linkedSong: string;
  tags: string[];
}

// User specified YouTube Playlist URL: https://youtube.com/playlist?list=PLe-t6JCkeEZE
export const KK_PLAYLIST_ID = 'PLe-t6JCkeEZE';

// Curated Master Tracklist dictionary mapping the KK Playlist tracks to strict 'Song Name — Movie/Album' typography
export const KK_TRACKS: KKTrack[] = [
  {
    id: 'khuda-jaane',
    songName: 'Khuda Jaane',
    movieOrAlbum: 'Bachna Ae Haseeno',
    formattedTitle: 'Khuda Jaane — Bachna Ae Haseeno',
    artist: 'KK, Shilpa Rao',
    year: 2008,
    composer: 'Vishal-Shekhar',
    iconicLyric: 'Sajde mein yun hi jhukta hoon, tum pe aake hi rukta hoon... Kya yeh sab ko hota hai?',
    lyricTranslation: 'I bow in sacred reverence, all my roads lead to you and halt... Does everyone feel this enchantment?',
    approxDurationSec: 333,
    mood: 'Mediterranean Symphony of Soulmates',
    ambientGlow: {
      primary: '#0284c7', // Rainy Mediterranean blue
      secondary: '#0369a1',
      glowRgba: 'rgba(2, 132, 199, 0.45)',
      name: 'Rainy Mediterranean Cyan',
    },
  },
  {
    id: 'aankhon-mein-teri',
    songName: 'Aankhon Mein Teri',
    movieOrAlbum: 'Om Shanti Om',
    formattedTitle: 'Aankhon Mein Teri — Om Shanti Om',
    artist: 'KK',
    year: 2007,
    composer: 'Vishal-Shekhar',
    iconicLyric: 'Aankhon mein teri ajab si ajab si adayein hain... Dil ko bana de jo patang saansein ye teri wo hawayein hain...',
    lyricTranslation: 'Your eyes hold such mysterious grace; your breath is the gentle breeze that sets my kite-like heart aloft.',
    approxDurationSec: 242,
    mood: 'Pure 2000s Bollywood Romance',
    ambientGlow: {
      primary: '#f59e0b', // Warm candle tungsten amber
      secondary: '#fbbf24',
      glowRgba: 'rgba(245, 158, 11, 0.5)',
      name: 'Candlelight Amber',
    },
  },
  {
    id: 'zara-sa',
    songName: 'Zara Sa',
    movieOrAlbum: 'Jannat',
    formattedTitle: 'Zara Sa — Jannat',
    artist: 'KK',
    year: 2008,
    composer: 'Pritam',
    iconicLyric: 'Zara sa jhoom loon main, zara sa dil mein de jagah tu... Zara sa apna bana le...',
    lyricTranslation: 'Let me sway just a little; give me a small space inside your heart and make me yours.',
    approxDurationSec: 304,
    mood: 'Late Night FM Radio Favorite',
    ambientGlow: {
      primary: '#8b5cf6', // Midnight violet / purple radio haze
      secondary: '#7c3aed',
      glowRgba: 'rgba(139, 92, 246, 0.45)',
      name: 'Midnight Radio Violet',
    },
  },
  {
    id: 'kya-mujhe-pyaar-hai',
    songName: 'Kya Mujhe Pyaar Hai',
    movieOrAlbum: 'Woh Lamhe',
    formattedTitle: 'Kya Mujhe Pyaar Hai — Woh Lamhe',
    artist: 'KK',
    year: 2006,
    composer: 'Pritam',
    iconicLyric: 'Kyun aajkal neend kam khwaab zyaada hai... Lagta khuda ka koi nek iraada hai...',
    lyricTranslation: 'Why do I sleep less nowadays and dream more? It feels like God has a gentle plan for me.',
    approxDurationSec: 279,
    mood: 'Rain-soaked Euphoric Pop',
    ambientGlow: {
      primary: '#10b981', // Monsoon emerald & turquoise
      secondary: '#059669',
      glowRgba: 'rgba(16, 185, 129, 0.45)',
      name: 'Monsoon Emerald',
    },
  },
  {
    id: 'dil-ibaadat',
    songName: 'Dil Ibaadat',
    movieOrAlbum: 'Tum Mile',
    formattedTitle: 'Dil Ibaadat — Tum Mile',
    artist: 'KK',
    year: 2009,
    composer: 'Pritam',
    iconicLyric: 'Dil ibaadat kar raha hai, dhadkanein meri sun... Tujhko main kar loon haasil, lagi hai yahi dhun...',
    lyricTranslation: 'My heart is praying, listen to its beats. My only desire now is to win you over.',
    approxDurationSec: 326,
    mood: 'Monsoon Floods & Passionate Devotion',
    ambientGlow: {
      primary: '#0d9488', // Stormy deluge teal
      secondary: '#0f766e',
      glowRgba: 'rgba(13, 148, 136, 0.45)',
      name: 'Deluge Teal',
    },
  },
  {
    id: 'tu-hi-meri-shab-hai',
    songName: 'Tu Hi Meri Shab Hai',
    movieOrAlbum: 'Gangster',
    formattedTitle: 'Tu Hi Meri Shab Hai — Gangster',
    artist: 'KK',
    year: 2006,
    composer: 'Pritam',
    iconicLyric: 'Tu hi meri shab hai subah hai, tu hi din hai mera... Tu hi mera rab hai jahaan hai...',
    lyricTranslation: 'You are my night and my morning, you are my day, my divine guide and my entire world.',
    approxDurationSec: 388,
    mood: 'Nocturnal Seoul City Acoustic Serenade',
    ambientGlow: {
      primary: '#f43f5e', // Neon Seoul rose / crimson magenta
      secondary: '#e11d48',
      glowRgba: 'rgba(244, 63, 94, 0.45)',
      name: 'Neon Rose',
    },
  },
  {
    id: 'labon-ko',
    songName: 'Labon Ko',
    movieOrAlbum: 'Bhool Bhulaiyaa',
    formattedTitle: 'Labon Ko — Bhool Bhulaiyaa',
    artist: 'KK',
    year: 2007,
    composer: 'Pritam',
    iconicLyric: 'Labon ko labon pe sajao... kya ho tum mujhe ab batao... tod do khud ko tum...',
    lyricTranslation: 'Let our lips meet and celebrate; tell me who you are now, let all inhibitions shatter.',
    approxDurationSec: 341,
    mood: 'Sensual Midnight Ballad',
    ambientGlow: {
      primary: '#be123c', // Deep velvet burgundy
      secondary: '#9f1239',
      glowRgba: 'rgba(190, 18, 60, 0.45)',
      name: 'Velvet Burgundy',
    },
  },
  {
    id: 'alvida',
    songName: 'Alvida',
    movieOrAlbum: 'Life in a... Metro',
    formattedTitle: 'Alvida — Life in a... Metro',
    artist: 'KK',
    year: 2007,
    composer: 'Pritam',
    iconicLyric: 'Alvida, yaara alvida... Meri raahein tere tak hain, tujhpe hi to mera haq hai...',
    lyricTranslation: 'Goodbye, my beloved, goodbye. All my roads lead only to you; my claim is on you alone.',
    approxDurationSec: 340,
    mood: 'Heartbreaking Rain Rock Anthem',
    ambientGlow: {
      primary: '#3b82f6', // Electric cobalt rock rain
      secondary: '#2563eb',
      glowRgba: 'rgba(59, 130, 246, 0.45)',
      name: 'Electric Cobalt',
    },
  },
  {
    id: 'haan-tu-hain',
    songName: 'Haan Tu Hain',
    movieOrAlbum: 'Jannat',
    formattedTitle: 'Haan Tu Hain — Jannat',
    artist: 'KK',
    year: 2008,
    composer: 'Pritam',
    iconicLyric: 'Jo gham ko khushi mein badal de, haan tu hain woh... Haan tu hain...',
    lyricTranslation: 'The one who turns sorrow into blossoming joy, yes it is you... Yes it is you.',
    approxDurationSec: 326,
    mood: 'Uplifting Euphoric Ballad',
    ambientGlow: {
      primary: '#eab308', // Radiant sunflower yellow
      secondary: '#ca8a04',
      glowRgba: 'rgba(234, 179, 8, 0.45)',
      name: 'Sunflower Gold',
    },
  },
  {
    id: 'yaaron',
    songName: 'Yaaron Dosti',
    movieOrAlbum: 'Pal',
    formattedTitle: 'Yaaron Dosti — Pal',
    artist: 'KK',
    year: 1999,
    composer: 'Leslie Lewis',
    iconicLyric: 'Yaaron dosti badi hi haseen hai, yeh na ho to kya phir bolo yeh zindagi hai...',
    lyricTranslation: 'Friendship is truly beautiful, my friends. What would life even be without it?',
    approxDurationSec: 284,
    mood: 'College Farewell & Lifelong Brotherhood',
    ambientGlow: {
      primary: '#f97316', // Nostalgic sunset orange
      secondary: '#ea580c',
      glowRgba: 'rgba(249, 115, 22, 0.45)',
      name: 'Sunset Orange',
    },
  },
  {
    id: 'pal',
    songName: 'Pyaar Ke Pal',
    movieOrAlbum: 'Pal',
    formattedTitle: 'Pyaar Ke Pal — Pal',
    artist: 'KK',
    year: 1999,
    composer: 'Leslie Lewis',
    iconicLyric: 'Hum rahe ya na rahe kal... kal yaad aayenge ye pal...',
    lyricTranslation: 'Whether we are here tomorrow or not, we will remember these precious moments.',
    approxDurationSec: 337,
    mood: 'Nostalgic Tearful Goodbyes',
    ambientGlow: {
      primary: '#d97706', // Golden nostalgic farewell
      secondary: '#b45309',
      glowRgba: 'rgba(217, 119, 6, 0.5)',
      name: 'Farewell Gold',
    },
  },
  {
    id: 'tadap-tadap',
    songName: 'Tadap Tadap',
    movieOrAlbum: 'Hum Dil De Chuke Sanam',
    formattedTitle: 'Tadap Tadap — Hum Dil De Chuke Sanam',
    artist: 'KK, Dominique Cerejo',
    year: 1999,
    composer: 'Ismail Darbar',
    iconicLyric: 'Tadap tadap ke is dil se aah nikalti rahi... mujhko saza di pyaar ki aisa kya gunaah kiya...',
    lyricTranslation: 'A pained sigh kept escaping my aching heart; what sin did I commit to receive this punishment of love?',
    approxDurationSec: 395,
    mood: 'The Legendary Breakthrough Masterpiece',
    ambientGlow: {
      primary: '#dc2626', // Crimson agony & passion
      secondary: '#b91c1c',
      glowRgba: 'rgba(220, 38, 38, 0.55)',
      name: 'Crimson Flame',
    },
  },
  {
    id: 'beete-lamhein',
    songName: 'Beete Lamhein',
    movieOrAlbum: 'The Train',
    formattedTitle: 'Beete Lamhein — The Train',
    artist: 'KK',
    year: 2007,
    composer: 'Mithoon',
    iconicLyric: 'Dard dilon ke kam ho jaate, main aur tum gar hum ho jaate... Dard mein bhi yeh lab muskuraate...',
    lyricTranslation: 'Heartaches would have lessened if you and I had become "us". Even in pain, these lips would have smiled.',
    approxDurationSec: 326,
    mood: 'Melancholy Rain Walk',
    ambientGlow: {
      primary: '#6366f1', // Indigo rain
      secondary: '#4f46e5',
      glowRgba: 'rgba(99, 102, 241, 0.45)',
      name: 'Indigo Rain',
    },
  },
  {
    id: 'sach-keh-raha-hai',
    songName: 'Sach Keh Raha Hai Deewana',
    movieOrAlbum: 'Rehnaa Hai Terre Dil Mein',
    formattedTitle: 'Sach Keh Raha Hai Deewana — Rehnaa Hai Terre Dil Mein',
    artist: 'KK',
    year: 2001,
    composer: 'Harris Jayaraj',
    iconicLyric: 'Sach keh raha hai deewana dil, dil na kisi se lagaana... Jhoothe hain yaar ke vaade saare...',
    lyricTranslation: 'This lovesick heart speaks the bitter truth: never lose your heart to anyone. All vows of love are false.',
    approxDurationSec: 328,
    mood: 'Hostel Room Broken Heart Anthems',
    ambientGlow: {
      primary: '#2563eb', // Deep sapphire heartbreak
      secondary: '#1d4ed8',
      glowRgba: 'rgba(37, 99, 235, 0.45)',
      name: 'Sapphire Heartbreak',
    },
  },
  {
    id: 'tu-aashiqui-hai',
    songName: 'Tu Aashiqui Hai',
    movieOrAlbum: 'Jhankaar Beats',
    formattedTitle: 'Tu Aashiqui Hai — Jhankaar Beats',
    artist: 'KK',
    year: 2003,
    composer: 'Vishal-Shekhar',
    iconicLyric: 'Tu hi meri shab hai subah hai, tu hi din hai mera... Tu hi mera rab hai jahaan hai...',
    lyricTranslation: 'You are my night and my dawn; you are my day, my divine guide and my entire world.',
    approxDurationSec: 374,
    mood: 'Acoustic Guitar Summer Jam',
    ambientGlow: {
      primary: '#fbbf24', // Summer sunlight gold
      secondary: '#f59e0b',
      glowRgba: 'rgba(251, 191, 36, 0.45)',
      name: 'Sunlight Amber',
    },
  },
];

export function formatRawYouTubeTitle(rawTitle: string, playlistIndex = 0): {
  songName: string;
  movieOrAlbum: string;
  formattedTitle: string;
} {
  if (!rawTitle) {
    const fallback = KK_TRACKS[playlistIndex % KK_TRACKS.length];
    return {
      songName: fallback.songName,
      movieOrAlbum: fallback.movieOrAlbum,
      formattedTitle: fallback.formattedTitle,
    };
  }

  for (const track of KK_TRACKS) {
    const cleanRaw = rawTitle.toLowerCase();
    const cleanSong = track.songName.toLowerCase();

    if (cleanRaw.includes(cleanSong)) {
      return {
        songName: track.songName,
        movieOrAlbum: track.movieOrAlbum,
        formattedTitle: track.formattedTitle,
      };
    }
  }

  const cleaned = rawTitle
    .replace(/\s*[\(\[\{].*?[\)\]\}]\s*/g, ' ')
    .replace(/full video song|full audio song|official video|lyrical video|audio|t-series|sony music/gi, '')
    .trim();

  const parts = cleaned.split(/[-|–—:]+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const song = parts[0];
    const album = parts[1];
    return {
      songName: song,
      movieOrAlbum: album,
      formattedTitle: `${song} — ${album}`,
    };
  }

  const fallback = KK_TRACKS[playlistIndex % KK_TRACKS.length];
  return {
    songName: fallback.songName,
    movieOrAlbum: fallback.movieOrAlbum,
    formattedTitle: fallback.formattedTitle,
  };
}

export const NOSTALGIC_QUOTES: string[] = [
  '“Hum rahe ya na rahe kal... kal yaad aayenge ye pal.” — The anthem that sealed our school goodbyes.',
  'School Farewell, March 2008: Everyone in white uniforms crying on the auditorium stage while Pal played on loop.',
  'Walking home from coaching in the monsoon rain with a ₹20 cassette and wired earphones plugged into a Sony Walkman.',
  '“Yaaron dosti badi hi haseen hai... Yeh na ho to kya phir bolo yeh zindagi hai.” — Forever our friendship anthem.',
  'Rewinding the magnetic cassette tape with a Natraj pencil during lunch break to save precious pencil batteries.',
  'Singing “Aankhon Mein Teri” on the college hostel terrace under the starry midnight sky with a battered acoustic guitar.',
  'Listening to 98.3 Radio Mirchi under the quilt at 1:00 AM, waiting for RJ to play “Zara Sa”.',
  '“KK never needed auto-tune, flashy gossip, or celebrity drama. Just a microphone and an unmatched soul.”',
  'May 31, 2022: The voice that held our sweetest memories fell silent, but his echo will live in our hearts for generations.',
  '“Khuda Jaane ke main fida hoon...” The song that made every college crush feel cinematic.',
];

export const POLAROID_MEMORIES: PolaroidMemory[] = [
  {
    id: 'farewell-2008',
    title: "Farewell Day '08",
    subtitle: 'Auditorium Tears & White Shirt Signatures',
    year: '2008',
    description: 'We had permanent markers in our hands, scribbling promises of "Friends Forever" across each other’s school uniforms. When the chorus of "Pal" struck the speakers, the tough guys in the back row broke down in tears.',
    colorTone: 'from-amber-900/30 via-slate-900/60 to-slate-950/90',
    rotation: '-rotate-2',
    linkedSong: 'pal',
    tags: ['School Farewell', 'Pen Signatures', 'Unforgettable'],
  },
  {
    id: 'khuda-jaane-confession',
    title: 'First Love & Walkman Rewind',
    subtitle: 'Listening to "Khuda Jaane" at 2 AM',
    year: '2008',
    description: 'Sharing one earphone on the college bus, blushing every time KK’s soaring falsetto kicked in. Every lyric felt written precisely for that silent heartbeat.',
    colorTone: 'from-amber-600/25 via-slate-900/60 to-slate-950/90',
    rotation: 'rotate-1',
    linkedSong: 'khuda-jaane',
    tags: ['First Crush', 'Bachna Ae Haseeno', 'Pure Melody'],
  },
  {
    id: 'pencil-rewind',
    title: 'The Natraj Pencil Trick',
    subtitle: 'Battery Saver Technology of the 2000s',
    year: '2004',
    description: 'Two AA batteries cost pocket money. So when Side-A ended, we inserted a hexagonal Natraj pencil into the cassette cog and spun it furiously with our fingers to rewind back to "Yaaron" before tuition began.',
    colorTone: 'from-blue-900/30 via-slate-900/60 to-slate-950/90',
    rotation: 'rotate-3',
    linkedSong: 'yaaron',
    tags: ['Cassette Culture', '90s Hacks', 'Sony Walkman'],
  },
  {
    id: 'monsoon-walk',
    title: 'Rain Drops & Wired Earphones',
    subtitle: 'Walking Home with "Kya Mujhe Pyaar Hai"',
    year: '2006',
    description: 'Cloudburst over the city. Roads flooded. Wet canvas shoes, an umbrella tucked under an arm, and KK’s soaring falsetto filling the ears. Every street corner felt like a cinematic movie scene.',
    colorTone: 'from-emerald-900/30 via-slate-900/60 to-slate-950/90',
    rotation: '-rotate-1',
    linkedSong: 'kya-mujhe-pyaar-hai',
    tags: ['Monsoon Melody', 'Earphone Tangled', 'Pure Emotion'],
  },
  {
    id: 'college-fest',
    title: 'Live Concert Stage',
    subtitle: 'Golden Lights & Thousands Singing Together',
    year: '2012',
    description: 'The moment KK walked up to the mic, smiles turned into roar. No gimmicks, no autotune—just pure, raw golden vocal power resonating through the open night sky as everyone swayed together.',
    colorTone: 'from-amber-600/25 via-slate-900/60 to-slate-950/90',
    rotation: '-rotate-3',
    linkedSong: 'tu-hi-meri-shab-hai',
    tags: ['Live Stage', 'Acoustic Soul', 'Golden Era'],
  },
];
