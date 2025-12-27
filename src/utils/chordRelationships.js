// Chord Relationship Engine
// Generates chord suggestions based on music theory

import {
  NOTES,
  normalizeNote,
  transposeNote,
  getScaleNotes,
  getChordDegree,
  COMMON_MOVES,
  MAJOR_KEY_QUALITIES,
  MINOR_KEY_QUALITIES,
  buildChordSymbol
} from './musicTheory';

import { getAllChords, getUniqueChords } from '../data/chordData';

// Category types for suggestions
export const CATEGORIES = {
  DIATONIC: 'diatonic',
  COMMON: 'common',
  BORROWED: 'borrowed',
  SECONDARY_DOMINANT: 'secondary',
  TRITONE_SUB: 'tritone',
  DIMINISHED: 'diminished'
};

// Category colors
export const CATEGORY_COLORS = {
  diatonic: '#4A9EFF',
  common: '#4ADE80',
  borrowed: '#A855F7',
  secondary: '#FB923C',
  tritone: '#F43F5E',
  diminished: '#6B7280'
};

// Category labels
export const CATEGORY_LABELS = {
  diatonic: 'Diatonic',
  common: 'Common Moves',
  borrowed: 'Borrowed',
  secondary: 'Secondary Dominant',
  tritone: 'Tritone Sub',
  diminished: 'Diminished'
};

// Find a chord in the library by root and quality
function findChord(root, quality) {
  const allChords = getUniqueChords();
  const normalizedRoot = normalizeNote(root);

  // Try to find exact match
  let chord = allChords.find(c =>
    normalizeNote(c.root) === normalizedRoot && c.quality === quality
  );

  if (chord) return chord;

  // Try with quality variations
  const qualityVariants = {
    'major': ['major', 'major7'],
    'minor': ['minor', 'minor7'],
    'dominant7': ['dominant7', 'major'],
    'diminished': ['diminished', 'm7b5', 'dim7']
  };

  const variants = qualityVariants[quality] || [quality];
  for (const q of variants) {
    chord = allChords.find(c =>
      normalizeNote(c.root) === normalizedRoot && c.quality === q
    );
    if (chord) return chord;
  }

  return null;
}

// Generate diatonic suggestions
function getDiatonicSuggestions(currentChord, key) {
  const suggestions = [];
  const scaleNotes = getScaleNotes(key.root, key.mode);
  const qualities = key.mode === 'major' ? MAJOR_KEY_QUALITIES : MINOR_KEY_QUALITIES;

  scaleNotes.forEach((note, index) => {
    // Skip the current chord
    if (normalizeNote(note) === normalizeNote(currentChord.root)) return;

    const quality = qualities[index + 1];
    const chord = findChord(note, quality);

    if (chord) {
      suggestions.push({
        chord,
        category: CATEGORIES.DIATONIC,
        degree: index + 1,
        reason: `Scale degree ${index + 1}`
      });
    }
  });

  return suggestions;
}

// Generate common move suggestions
function getCommonMoveSuggestions(currentChord, key) {
  const suggestions = [];
  const degree = getChordDegree(currentChord.root, key.root, key.mode);

  if (!degree) return suggestions;

  const moves = COMMON_MOVES[key.mode]?.[degree] || [];
  const scaleNotes = getScaleNotes(key.root, key.mode);
  const qualities = key.mode === 'major' ? MAJOR_KEY_QUALITIES : MINOR_KEY_QUALITIES;

  moves.forEach(targetDegree => {
    const targetNote = scaleNotes[targetDegree - 1];
    const targetQuality = qualities[targetDegree];
    const chord = findChord(targetNote, targetQuality);

    if (chord) {
      suggestions.push({
        chord,
        category: CATEGORIES.COMMON,
        degree: targetDegree,
        reason: `Common move from ${degree} to ${targetDegree}`
      });
    }
  });

  return suggestions;
}

// Generate borrowed chord suggestions
function getBorrowedSuggestions(currentChord, key) {
  const suggestions = [];
  const parallelMode = key.mode === 'major' ? 'minor' : 'major';
  const parallelScaleNotes = getScaleNotes(key.root, parallelMode);
  const parallelQualities = parallelMode === 'major' ? MAJOR_KEY_QUALITIES : MINOR_KEY_QUALITIES;

  // Borrowed chords from parallel mode
  const borrowedDegrees = key.mode === 'major'
    ? [4, 6, 7, 1, 3]  // iv, bVI, bVII, i, bIII from minor
    : [4, 1, 5];        // IV, I, V from major

  borrowedDegrees.forEach(degree => {
    const note = parallelScaleNotes[degree - 1];
    const quality = parallelQualities[degree];
    const chord = findChord(note, quality);

    if (chord && normalizeNote(chord.root) !== normalizeNote(currentChord.root)) {
      suggestions.push({
        chord,
        category: CATEGORIES.BORROWED,
        degree,
        reason: `Borrowed from parallel ${parallelMode}`
      });
    }
  });

  // Add flat versions for major key
  if (key.mode === 'major') {
    // bVII (e.g., Bb in C major)
    const flatSeven = transposeNote(key.root, 10);
    const bVII = findChord(flatSeven, 'major');
    if (bVII) {
      suggestions.push({
        chord: bVII,
        category: CATEGORIES.BORROWED,
        reason: 'bVII borrowed chord'
      });
    }

    // bVI (e.g., Ab in C major)
    const flatSix = transposeNote(key.root, 8);
    const bVI = findChord(flatSix, 'major');
    if (bVI) {
      suggestions.push({
        chord: bVI,
        category: CATEGORIES.BORROWED,
        reason: 'bVI borrowed chord'
      });
    }

    // bIII (e.g., Eb in C major)
    const flatThree = transposeNote(key.root, 3);
    const bIII = findChord(flatThree, 'major');
    if (bIII) {
      suggestions.push({
        chord: bIII,
        category: CATEGORIES.BORROWED,
        reason: 'bIII borrowed chord'
      });
    }
  }

  return suggestions;
}

// Generate secondary dominant suggestions
function getSecondaryDominantSuggestions(currentChord, key) {
  const suggestions = [];
  const scaleNotes = getScaleNotes(key.root, key.mode);

  // V7 of each diatonic chord (except I and vii°)
  const targetDegrees = key.mode === 'major' ? [2, 3, 4, 5, 6] : [3, 4, 5, 6, 7];

  targetDegrees.forEach(degree => {
    const targetNote = scaleNotes[degree - 1];
    // V7 is a fifth above the target
    const dominantRoot = transposeNote(targetNote, 7);
    const chord = findChord(dominantRoot, 'dominant7');

    if (chord && normalizeNote(chord.root) !== normalizeNote(currentChord.root)) {
      suggestions.push({
        chord,
        category: CATEGORIES.SECONDARY_DOMINANT,
        targetDegree: degree,
        reason: `V7/${degree} (leads to ${targetNote})`
      });
    }
  });

  return suggestions;
}

// Generate tritone substitution suggestions
function getTritoneSuggestions(currentChord, key) {
  const suggestions = [];

  // Tritone sub of V7
  const dominant = transposeNote(key.root, 7); // V
  const tritoneSub = transposeNote(dominant, 6); // Tritone away
  const chord = findChord(tritoneSub, 'dominant7');

  if (chord) {
    suggestions.push({
      chord,
      category: CATEGORIES.TRITONE_SUB,
      reason: `Tritone sub for V7 (${dominant}7)`
    });
  }

  // Tritone subs of secondary dominants
  const scaleNotes = getScaleNotes(key.root, key.mode);
  [2, 5, 6].forEach(degree => {
    const targetNote = scaleNotes[degree - 1];
    const secDom = transposeNote(targetNote, 7);
    const triSub = transposeNote(secDom, 6);
    const subChord = findChord(triSub, 'dominant7');

    if (subChord && normalizeNote(subChord.root) !== normalizeNote(currentChord.root)) {
      suggestions.push({
        chord: subChord,
        category: CATEGORIES.TRITONE_SUB,
        reason: `Tritone sub for V7/${degree}`
      });
    }
  });

  return suggestions;
}

// Generate diminished chord suggestions
function getDiminishedSuggestions(currentChord, key) {
  const suggestions = [];

  // Passing diminished chords
  const passingRoots = [
    transposeNote(key.root, 1),  // #i dim
    transposeNote(key.root, 3),  // #ii dim (for major)
    transposeNote(key.root, 6)   // #iv dim
  ];

  passingRoots.forEach((root, index) => {
    const chord = findChord(root, 'diminished');
    if (chord) {
      suggestions.push({
        chord,
        category: CATEGORIES.DIMINISHED,
        reason: 'Passing diminished'
      });
    }

    // Also try dim7
    const dim7 = findChord(root, 'dim7');
    if (dim7) {
      suggestions.push({
        chord: dim7,
        category: CATEGORIES.DIMINISHED,
        reason: 'Passing diminished 7'
      });
    }
  });

  return suggestions;
}

// Main function to get all suggestions
export function getChordSuggestions(currentChord, key, theoryLevel = 'intermediate') {
  let suggestions = [];

  // Always include diatonic and common moves
  suggestions = [
    ...getDiatonicSuggestions(currentChord, key),
    ...getCommonMoveSuggestions(currentChord, key)
  ];

  // Add borrowed chords for intermediate+
  if (theoryLevel !== 'basic') {
    suggestions = [
      ...suggestions,
      ...getBorrowedSuggestions(currentChord, key)
    ];
  }

  // Add secondary dominants for intermediate+
  if (theoryLevel !== 'basic') {
    suggestions = [
      ...suggestions,
      ...getSecondaryDominantSuggestions(currentChord, key)
    ];
  }

  // Add advanced options
  if (theoryLevel === 'advanced') {
    suggestions = [
      ...suggestions,
      ...getTritoneSuggestions(currentChord, key),
      ...getDiminishedSuggestions(currentChord, key)
    ];
  }

  // Remove duplicates (by chord id)
  const seen = new Set();
  suggestions = suggestions.filter(s => {
    if (seen.has(s.chord.id)) return false;
    seen.add(s.chord.id);
    return true;
  });

  // Sort by category priority
  const categoryPriority = {
    [CATEGORIES.COMMON]: 0,
    [CATEGORIES.DIATONIC]: 1,
    [CATEGORIES.BORROWED]: 2,
    [CATEGORIES.SECONDARY_DOMINANT]: 3,
    [CATEGORIES.TRITONE_SUB]: 4,
    [CATEGORIES.DIMINISHED]: 5
  };

  suggestions.sort((a, b) => {
    const aPriority = categoryPriority[a.category] ?? 10;
    const bPriority = categoryPriority[b.category] ?? 10;
    return aPriority - bPriority;
  });

  return suggestions;
}

// Get ending suggestions (cadences)
export function getEndingSuggestions(progression, key) {
  const suggestions = [];

  if (progression.length === 0) return suggestions;

  // I chord (tonic) - authentic resolution
  const tonic = findChord(key.root, key.mode === 'major' ? 'major' : 'minor');
  if (tonic) {
    suggestions.push({
      chord: tonic,
      category: CATEGORIES.COMMON,
      reason: 'Resolve to tonic (I)'
    });
  }

  // V -> I cadence
  const dominant = transposeNote(key.root, 7);
  const V7 = findChord(dominant, 'dominant7');
  if (V7) {
    suggestions.push({
      chord: V7,
      category: CATEGORIES.DIATONIC,
      reason: 'Dominant (V7) for authentic cadence'
    });
  }

  // IV -> I (plagal cadence)
  const subdominant = transposeNote(key.root, 5);
  const IV = findChord(subdominant, 'major');
  if (IV) {
    suggestions.push({
      chord: IV,
      category: CATEGORIES.DIATONIC,
      reason: 'Subdominant (IV) for plagal cadence'
    });
  }

  // ii -> V -> I turnaround
  const supertonic = transposeNote(key.root, 2);
  const ii = findChord(supertonic, key.mode === 'major' ? 'minor' : 'diminished');
  if (ii) {
    suggestions.push({
      chord: ii,
      category: CATEGORIES.DIATONIC,
      reason: 'ii for ii-V-I turnaround'
    });
  }

  return suggestions;
}

// Organize suggestions into rings for the network display
export function organizeSuggestionsIntoRings(suggestions) {
  const innerRing = []; // Common moves, diatonic
  const middleRing = []; // Borrowed
  const outerRing = []; // Secondary dominants, tritone subs, diminished

  suggestions.forEach(s => {
    switch (s.category) {
      case CATEGORIES.COMMON:
      case CATEGORIES.DIATONIC:
        innerRing.push(s);
        break;
      case CATEGORIES.BORROWED:
        middleRing.push(s);
        break;
      case CATEGORIES.SECONDARY_DOMINANT:
      case CATEGORIES.TRITONE_SUB:
      case CATEGORIES.DIMINISHED:
        outerRing.push(s);
        break;
      default:
        middleRing.push(s);
    }
  });

  return { innerRing, middleRing, outerRing };
}
