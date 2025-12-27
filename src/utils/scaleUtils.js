import { scaleDefinitions, NOTE_NAMES, STRING_TUNINGS, CHORD_TO_SCALES } from '../data/scaleData';

/**
 * Get the index of a note (0-11)
 */
export function getNoteIndex(note) {
  // Handle flats by converting to sharps
  const sharpVersion = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  }[note] || note;
  return NOTE_NAMES.indexOf(sharpVersion);
}

/**
 * Get note name from index
 */
export function getNoteName(index) {
  return NOTE_NAMES[(index + 12) % 12];
}

/**
 * Get all notes in a scale
 */
export function getScaleNotes(scaleId, rootNote) {
  const scale = scaleDefinitions[scaleId];
  if (!scale) return [];

  const rootIndex = getNoteIndex(rootNote);
  return scale.intervals.map(interval => getNoteName(rootIndex + interval));
}

/**
 * Generate fretboard data for a scale
 */
export function generateFretboardData(scaleId, rootNote, fretCount = 12) {
  const scaleNotes = getScaleNotes(scaleId, rootNote);
  const rootIndex = getNoteIndex(rootNote);
  const fretboard = [];

  STRING_TUNINGS.forEach((string, stringIndex) => {
    const stringData = {
      name: string.name,
      frets: []
    };

    for (let fret = 0; fret <= fretCount; fret++) {
      const noteIndex = (string.semitones + fret) % 12;
      const noteName = NOTE_NAMES[noteIndex];

      if (scaleNotes.includes(noteName)) {
        const scale = scaleDefinitions[scaleId];
        const intervalIndex = scaleNotes.indexOf(noteName);

        stringData.frets.push({
          fret,
          note: noteName,
          isRoot: noteIndex === rootIndex,
          interval: scale.degrees[intervalIndex]
        });
      }
    }

    fretboard.push(stringData);
  });

  return fretboard;
}

/**
 * Calculate how well a scale fits a chord progression
 */
export function calculateScaleFitness(scaleId, rootNote, chords) {
  const scaleNotes = getScaleNotes(scaleId, rootNote);
  let totalNotes = 0;
  let matchedNotes = 0;

  chords.forEach(chord => {
    const chordNotes = chord.notes || [];
    chordNotes.forEach(note => {
      totalNotes++;
      // Check if note or its enharmonic is in scale
      const noteIndex = getNoteIndex(note);
      const scaleNoteIndexes = scaleNotes.map(n => getNoteIndex(n));
      if (scaleNoteIndexes.includes(noteIndex)) {
        matchedNotes++;
      }
    });
  });

  return totalNotes > 0 ? (matchedNotes / totalNotes) * 100 : 0;
}

/**
 * Get recommended scales for a progression
 */
export function getRecommendedScales(chords, detectedKey) {
  if (!chords || chords.length === 0) return [];

  const { root, mode } = detectedKey || { root: 'C', mode: 'major' };
  const results = [];

  // Test each scale with the detected key root
  Object.keys(scaleDefinitions).forEach(scaleId => {
    const fitness = calculateScaleFitness(scaleId, root, chords);

    if (fitness >= 75) { // Only include scales that fit well
      results.push({
        scaleId,
        root,
        fitness,
        scale: scaleDefinitions[scaleId],
        isRecommended: false
      });
    }
  });

  // Also test relative major/minor
  const relativeRoot = mode === 'minor'
    ? getNoteName(getNoteIndex(root) + 3) // Relative major
    : getNoteName(getNoteIndex(root) - 3); // Relative minor

  Object.keys(scaleDefinitions).forEach(scaleId => {
    const fitness = calculateScaleFitness(scaleId, relativeRoot, chords);

    if (fitness >= 75) {
      // Check if already added
      const existing = results.find(r => r.scaleId === scaleId && r.root === relativeRoot);
      if (!existing) {
        results.push({
          scaleId,
          root: relativeRoot,
          fitness,
          scale: scaleDefinitions[scaleId],
          isRecommended: false
        });
      }
    }
  });

  // Sort by fitness, then by difficulty (easier first)
  results.sort((a, b) => {
    if (b.fitness !== a.fitness) return b.fitness - a.fitness;
    const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    return difficultyOrder[a.scale.difficulty] - difficultyOrder[b.scale.difficulty];
  });

  // Mark the top recommendation - prefer pentatonic for beginners
  if (results.length > 0) {
    const pentatonic = results.find(r => r.scale.type === 'pentatonic');
    if (pentatonic) {
      pentatonic.isRecommended = true;
    } else {
      results[0].isRecommended = true;
    }
  }

  return results;
}

/**
 * Get scales for a specific chord (per-chord mode)
 */
export function getScalesForChord(chord) {
  const quality = chord.quality || 'major';
  const root = chord.root;

  const scaleIds = CHORD_TO_SCALES[quality] || ['major_pentatonic'];

  return scaleIds.map(scaleId => ({
    scaleId,
    root,
    scale: scaleDefinitions[scaleId],
    isRecommended: scaleIds.indexOf(scaleId) === 0
  }));
}

/**
 * Filter scales by criteria
 */
export function filterScales(scales, filters) {
  return scales.filter(item => {
    const scale = item.scale;

    // Difficulty filter
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(scale.difficulty)) return false;
    }

    // Mood filter
    if (filters.mood && filters.mood.length > 0) {
      if (!filters.mood.some(m => scale.moods.includes(m))) return false;
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(scale.type)) return false;
    }

    return true;
  });
}

/**
 * Get a display name for a scale with its root
 */
export function getScaleDisplayName(scaleId, root) {
  const scale = scaleDefinitions[scaleId];
  if (!scale) return '';
  return `${root} ${scale.name}`;
}

/**
 * Get explanation for why a scale works over a progression
 */
export function getScaleExplanation(scaleId, root, chords, detectedKey) {
  const scale = scaleDefinitions[scaleId];
  if (!scale) return '';

  const scaleNotes = getScaleNotes(scaleId, root);
  const mode = detectedKey?.mode || 'major';

  // Build explanation based on scale type and key
  if (scale.type === 'pentatonic') {
    return `${root} ${scale.name} contains the core notes of all chords in this progression. It's impossible to hit a wrong note!`;
  }

  if (scale.type === 'blues') {
    return `${root} Blues Scale adds the blue note for extra expressiveness. Great for adding grit and emotion to your solos.`;
  }

  if (scaleId === 'natural_minor' || scaleId === 'dorian') {
    return `${root} ${scale.name} contains all the notes needed for this ${mode} progression, with additional melodic options.`;
  }

  if (scale.type === 'mode') {
    return `${root} ${scale.name} gives this progression a unique color. Emphasize the characteristic intervals to bring out its flavor.`;
  }

  return `${root} ${scale.name} fits well with the chords in your progression, offering a ${scale.moods.join(' and ')} sound.`;
}
