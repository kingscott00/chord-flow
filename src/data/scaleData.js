/**
 * Scale Data Library for ChordFlow
 * Contains scale definitions and constants for scale visualization
 */

export const scaleDefinitions = {
  minor_pentatonic: {
    id: "minor_pentatonic",
    name: "Minor Pentatonic",
    intervals: [0, 3, 5, 7, 10],
    degrees: ["1", "b3", "4", "5", "b7"],
    noteCount: 5,
    difficulty: "beginner",
    moods: ["dark", "bluesy"],
    type: "pentatonic",
    description: "The most popular scale for rock and blues soloing. Only 5 notes - very forgiving and always sounds good!",
    practiceTip: "This is THE scale to learn first. Works over almost any minor or bluesy progression.",
    relatedScales: ["blues", "natural_minor"]
  },

  major_pentatonic: {
    id: "major_pentatonic",
    name: "Major Pentatonic",
    intervals: [0, 2, 4, 7, 9],
    degrees: ["1", "2", "3", "5", "6"],
    noteCount: 5,
    difficulty: "beginner",
    moods: ["bright", "happy"],
    type: "pentatonic",
    description: "The happy version of pentatonic. Great for country, pop, and uplifting solos.",
    practiceTip: "Use this over major chord progressions for a safe, pleasant sound.",
    relatedScales: ["major", "mixolydian"]
  },

  blues: {
    id: "blues",
    name: "Blues Scale",
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ["1", "b3", "4", "b5", "5", "b7"],
    noteCount: 6,
    difficulty: "beginner",
    moods: ["bluesy", "gritty"],
    type: "blues",
    description: "Minor pentatonic plus the 'blue note' (b5). Adds grit and expression.",
    practiceTip: "Bend the blue note (b5) up toward the 5th for that classic blues sound.",
    relatedScales: ["minor_pentatonic", "natural_minor"]
  },

  natural_minor: {
    id: "natural_minor",
    name: "Natural Minor",
    altName: "Aeolian",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ["1", "2", "b3", "4", "5", "b6", "b7"],
    noteCount: 7,
    difficulty: "intermediate",
    moods: ["dark", "sad"],
    type: "full",
    description: "The full minor scale. More notes than pentatonic means more melodic options.",
    practiceTip: "The b6 can sound tense - use it as a passing tone to the 5th or b7.",
    relatedScales: ["minor_pentatonic", "dorian", "harmonic_minor"]
  },

  major: {
    id: "major",
    name: "Major Scale",
    altName: "Ionian",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
    noteCount: 7,
    difficulty: "intermediate",
    moods: ["bright", "happy"],
    type: "full",
    description: "The foundation of Western music. Bright, happy, resolved sound.",
    practiceTip: "The 4th and 7th are 'avoid notes' over the I chord - use them as passing tones.",
    relatedScales: ["major_pentatonic", "lydian", "mixolydian"]
  },

  harmonic_minor: {
    id: "harmonic_minor",
    name: "Harmonic Minor",
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: ["1", "2", "b3", "4", "5", "b6", "7"],
    noteCount: 7,
    difficulty: "intermediate",
    moods: ["exotic", "dramatic"],
    type: "full",
    description: "Natural minor with a raised 7th. Creates an exotic, classical sound.",
    practiceTip: "Use this when you hear a major V chord in a minor key (like E or E7 in A minor).",
    relatedScales: ["natural_minor", "phrygian_dominant"]
  },

  melodic_minor: {
    id: "melodic_minor",
    name: "Melodic Minor",
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degrees: ["1", "2", "b3", "4", "5", "6", "7"],
    noteCount: 7,
    difficulty: "advanced",
    moods: ["jazzy", "sophisticated"],
    type: "full",
    description: "Minor with raised 6th and 7th. Very jazzy and sophisticated.",
    practiceTip: "Think of it as a major scale with a b3. Popular in jazz improvisation.",
    relatedScales: ["natural_minor", "dorian"]
  },

  dorian: {
    id: "dorian",
    name: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ["1", "2", "b3", "4", "5", "6", "b7"],
    noteCount: 7,
    difficulty: "advanced",
    moods: ["jazzy", "funky"],
    type: "mode",
    description: "Like natural minor but with a major 6th. The 'jazzy minor' sound.",
    practiceTip: "Emphasize the major 6th to bring out the Dorian flavor. Great for funk and jazz.",
    relatedScales: ["natural_minor", "minor_pentatonic"]
  },

  phrygian: {
    id: "phrygian",
    name: "Phrygian",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degrees: ["1", "b2", "b3", "4", "5", "b6", "b7"],
    noteCount: 7,
    difficulty: "advanced",
    moods: ["exotic", "dark"],
    type: "mode",
    description: "Dark and Spanish-sounding. The b2 gives it an exotic flavor.",
    practiceTip: "The b2 is the signature note - emphasize it for that flamenco sound.",
    relatedScales: ["natural_minor", "phrygian_dominant"]
  },

  lydian: {
    id: "lydian",
    name: "Lydian",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degrees: ["1", "2", "3", "#4", "5", "6", "7"],
    noteCount: 7,
    difficulty: "advanced",
    moods: ["dreamy", "bright"],
    type: "mode",
    description: "Major scale with a raised 4th. Dreamy, floating, magical sound.",
    practiceTip: "The #4 creates a sense of wonder - let it ring out over major chords.",
    relatedScales: ["major", "major_pentatonic"]
  },

  mixolydian: {
    id: "mixolydian",
    name: "Mixolydian",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ["1", "2", "3", "4", "5", "6", "b7"],
    noteCount: 7,
    difficulty: "advanced",
    moods: ["bluesy", "rock"],
    type: "mode",
    description: "Major scale with a b7. Perfect for dominant 7th chords and blues-rock.",
    practiceTip: "Use over dominant 7 chords (like G7). The b7 is your friend here.",
    relatedScales: ["major", "blues", "major_pentatonic"]
  },

  locrian: {
    id: "locrian",
    name: "Locrian",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degrees: ["1", "b2", "b3", "4", "b5", "b6", "b7"],
    noteCount: 7,
    difficulty: "advanced",
    moods: ["dark", "unstable"],
    type: "mode",
    description: "The darkest mode. Very unstable due to the b5. Rarely used except in metal.",
    practiceTip: "Use sparingly over diminished or m7b5 chords. Very tense sound.",
    relatedScales: ["phrygian", "natural_minor"]
  },

  phrygian_dominant: {
    id: "phrygian_dominant",
    name: "Phrygian Dominant",
    intervals: [0, 1, 4, 5, 7, 8, 10],
    degrees: ["1", "b2", "3", "4", "5", "b6", "b7"],
    noteCount: 7,
    difficulty: "advanced",
    moods: ["exotic", "spanish"],
    type: "mode",
    description: "Phrygian with a major 3rd. Very Spanish/Middle Eastern sound.",
    practiceTip: "The b2 to major 3rd interval is the signature sound. Great for flamenco.",
    relatedScales: ["phrygian", "harmonic_minor"]
  }
};

// Note names for calculations
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic equivalents
export const ENHARMONICS = {
  'C#': 'Db', 'Db': 'C#',
  'D#': 'Eb', 'Eb': 'D#',
  'F#': 'Gb', 'Gb': 'F#',
  'G#': 'Ab', 'Ab': 'G#',
  'A#': 'Bb', 'Bb': 'A#'
};

// Guitar string tunings (semitones from C)
export const STRING_TUNINGS = [
  { name: 'E', semitones: 4 },   // Low E
  { name: 'A', semitones: 9 },
  { name: 'D', semitones: 2 },
  { name: 'G', semitones: 7 },
  { name: 'B', semitones: 11 },
  { name: 'e', semitones: 4 }    // High E
];

// Which scales work over which chord qualities
export const CHORD_TO_SCALES = {
  major: ['major', 'major_pentatonic', 'lydian', 'mixolydian'],
  major7: ['major', 'lydian', 'major_pentatonic'],
  dominant7: ['mixolydian', 'blues', 'major_pentatonic'],
  minor: ['natural_minor', 'dorian', 'minor_pentatonic', 'blues'],
  minor7: ['dorian', 'natural_minor', 'minor_pentatonic', 'blues'],
  minor6: ['dorian', 'melodic_minor'],
  diminished: ['locrian', 'harmonic_minor'],
  'm7b5': ['locrian'],
  augmented: ['lydian'],
  sus2: ['major_pentatonic', 'major'],
  sus4: ['mixolydian', 'major']
};

// Filter options
export const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];
export const MOOD_OPTIONS = ['dark', 'bright', 'bluesy', 'exotic', 'jazzy', 'happy', 'sad', 'dreamy', 'funky', 'gritty', 'sophisticated', 'dramatic', 'spanish', 'unstable', 'rock'];
export const TYPE_OPTIONS = ['pentatonic', 'blues', 'full', 'mode'];
