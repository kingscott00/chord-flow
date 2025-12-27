// Music Theory Constants and Utilities

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Normalize note name (handle flats)
export function normalizeNote(note) {
  const flatToSharp = {
    'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
    'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B'
  };
  return flatToSharp[note] || note;
}

// Get note index (0-11)
export function getNoteIndex(note) {
  const normalized = normalizeNote(note);
  return NOTES.indexOf(normalized);
}

// Get note at semitone distance from root
export function transposeNote(root, semitones) {
  const rootIndex = getNoteIndex(root);
  const newIndex = (rootIndex + semitones + 12) % 12;
  return NOTES[newIndex];
}

// Major scale intervals (in semitones)
export const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
export const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// Get scale notes
export function getScaleNotes(root, mode = 'major') {
  const intervals = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;
  return intervals.map(i => transposeNote(root, i));
}

// Chord quality patterns (scale degrees) for major keys
export const MAJOR_KEY_QUALITIES = {
  1: 'major',
  2: 'minor',
  3: 'minor',
  4: 'major',
  5: 'major',
  6: 'minor',
  7: 'diminished'
};

// Chord quality patterns for minor keys
export const MINOR_KEY_QUALITIES = {
  1: 'minor',
  2: 'diminished',
  3: 'major',
  4: 'minor',
  5: 'minor', // natural minor; dominant7 for harmonic
  6: 'major',
  7: 'major'
};

// Get diatonic chords for a key
export function getDiatonicChords(root, mode = 'major') {
  const scaleNotes = getScaleNotes(root, mode);
  const qualities = mode === 'major' ? MAJOR_KEY_QUALITIES : MINOR_KEY_QUALITIES;

  return scaleNotes.map((note, i) => ({
    root: note,
    degree: i + 1,
    quality: qualities[i + 1]
  }));
}

// Roman numeral display
export const ROMAN_NUMERALS = {
  major: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'],
  minor: ['i', 'ii', 'III', 'iv', 'v', 'VI', 'VII']
};

// Get interval between two notes (in semitones)
export function getInterval(note1, note2) {
  const i1 = getNoteIndex(note1);
  const i2 = getNoteIndex(note2);
  return (i2 - i1 + 12) % 12;
}

// Check if a chord fits in a key
export function chordFitsKey(chordRoot, chordQuality, keyRoot, keyMode = 'major') {
  const scaleNotes = getScaleNotes(keyRoot, keyMode);
  const normalizedRoot = normalizeNote(chordRoot);

  if (!scaleNotes.map(normalizeNote).includes(normalizedRoot)) {
    return false;
  }

  const degree = scaleNotes.map(normalizeNote).indexOf(normalizedRoot) + 1;
  const expectedQuality = keyMode === 'major' ? MAJOR_KEY_QUALITIES[degree] : MINOR_KEY_QUALITIES[degree];

  // Allow some quality variations
  const qualityMatches = {
    'major': ['major', 'major7', 'major6', 'add9', 'sus2', 'sus4'],
    'minor': ['minor', 'minor7', 'm7b5'],
    'diminished': ['diminished', 'm7b5', 'dim7']
  };

  return qualityMatches[expectedQuality]?.includes(chordQuality) || false;
}

// Detect key from progression
export function detectKey(chords) {
  if (chords.length === 0) return { root: 'C', mode: 'major', confidence: 0 };
  if (chords.length === 1) {
    // Single chord - assume it's the key
    const isMinor = chords[0].quality?.includes('minor') || chords[0].quality?.includes('m7');
    return {
      root: chords[0].root,
      mode: isMinor ? 'minor' : 'major',
      confidence: 0.3
    };
  }

  const scores = {};

  // Test each possible key
  for (const root of NOTES) {
    for (const mode of ['major', 'minor']) {
      const key = `${root}_${mode}`;
      scores[key] = 0;

      chords.forEach((chord, index) => {
        // Weight first and last chords higher
        const weight = (index === 0 || index === chords.length - 1) ? 2 : 1;

        const scaleNotes = getScaleNotes(root, mode);
        if (scaleNotes.map(normalizeNote).includes(normalizeNote(chord.root))) {
          scores[key] += weight;

          // Bonus for matching quality
          if (chordFitsKey(chord.root, chord.quality, root, mode)) {
            scores[key] += weight * 0.5;
          }
        }
      });
    }
  }

  // Find best match
  let bestKey = 'C_major';
  let bestScore = 0;

  for (const [key, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  const [root, mode] = bestKey.split('_');
  const maxPossibleScore = chords.length * 2.5 + 3; // Rough max

  return {
    root,
    mode,
    confidence: Math.min(bestScore / maxPossibleScore, 1)
  };
}

// Common chord moves from each scale degree
export const COMMON_MOVES = {
  major: {
    1: [4, 5, 6, 2],      // I -> IV, V, vi, ii
    2: [5, 4, 7],         // ii -> V, IV, vii
    3: [6, 4],            // iii -> vi, IV
    4: [5, 1, 2],         // IV -> V, I, ii
    5: [1, 6, 4],         // V -> I, vi, IV
    6: [4, 2, 5],         // vi -> IV, ii, V
    7: [1, 3]             // vii -> I, iii
  },
  minor: {
    1: [4, 5, 6, 7],      // i -> iv, v, VI, VII
    2: [5, 1],            // ii° -> v, i
    3: [6, 4],            // III -> VI, iv
    4: [5, 1, 7],         // iv -> v, i, VII
    5: [1, 6],            // v -> i, VI
    6: [4, 2, 7],         // VI -> iv, ii°, VII
    7: [3, 1]             // VII -> III, i
  }
};

// Get degree of a chord in a key
export function getChordDegree(chordRoot, keyRoot, keyMode = 'major') {
  const scaleNotes = getScaleNotes(keyRoot, keyMode);
  const normalizedRoot = normalizeNote(chordRoot);
  const index = scaleNotes.map(normalizeNote).indexOf(normalizedRoot);
  return index >= 0 ? index + 1 : null;
}

// Guitar string tuning (standard)
export const GUITAR_STRINGS = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
export const STRING_NOTES = ['E', 'A', 'D', 'G', 'B', 'E'];

// Convert fret position to note
export function fretToNote(stringIndex, fret) {
  if (fret < 0) return null; // Muted
  const openNote = STRING_NOTES[stringIndex];
  return transposeNote(openNote, fret);
}

// Convert frets array to playable notes with octaves
export function fretsToNotes(frets) {
  const notes = [];
  const baseOctaves = [2, 2, 3, 3, 3, 4]; // E2, A2, D3, G3, B3, E4

  frets.forEach((fret, stringIndex) => {
    if (fret >= 0) {
      const note = fretToNote(stringIndex, fret);
      const octaveShift = Math.floor((getNoteIndex(STRING_NOTES[stringIndex]) + fret) / 12);
      const octave = baseOctaves[stringIndex] + octaveShift;
      notes.push(`${note}${octave}`);
    }
  });

  return notes;
}

// Quality to symbol mapping
export const QUALITY_SYMBOLS = {
  'major': '',
  'minor': 'm',
  'dominant7': '7',
  'major7': 'maj7',
  'minor7': 'm7',
  'diminished': 'dim',
  'dim7': 'dim7',
  'm7b5': 'm7b5',
  'augmented': 'aug',
  'sus2': 'sus2',
  'sus4': 'sus4',
  'add9': 'add9',
  'major6': '6',
  'minor6': 'm6'
};

// Build chord symbol from root and quality
export function buildChordSymbol(root, quality) {
  return `${root}${QUALITY_SYMBOLS[quality] || ''}`;
}
