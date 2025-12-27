# ChordFlow Phase 2 - Scale Display System

## Overview

Add a scale suggestion and fretboard visualization system to the existing ChordFlow app. When users build a chord progression, they can view scales that work over that progression, displayed on horizontal fretboard diagrams.

## What Already Exists (Don't Break These)

- Progression display with chord cards
- Chord network popup on hover
- Starting panel (random, search, mood, key)
- Settings panel
- Audio playback with Tone.js
- Key detection
- AppContext for state management

## New Features to Add

### 1. Scale Section (Below Progression)

Add a collapsible section below the progression display that shows:
- Scale selector with filters
- One or more fretboard diagrams (stacked vertically)
- Scale info panels

Only show this section when the progression has at least 1 chord.

### 2. Scale Selector Panel

```
┌─────────────────────────────────────────────────────────────────┐
│  SCALES FOR THIS PROGRESSION                     [Hide Scales] │
│                                                                 │
│  Click scales to add/remove from view:                         │
│                                                                 │
│  [A Minor Pentatonic ✓⭐] [A Natural Minor] [A Blues ✓]        │
│  [A Dorian] [C Major Pentatonic] [C Major]                     │
│                                                                 │
│  Filters:                                                       │
│  Difficulty: [Beginner ✓] [Intermediate] [Advanced]            │
│  Feel:       [Dark] [Bright] [Bluesy] [Exotic]                 │
│  Type:       [Pentatonic] [Full Scale] [Modes]                 │
│                                                                 │
│  [Per-chord scales: OFF 🔘 ON]                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Show all scales that fit the current progression (fitness score > 75%)
- Scales are toggleable buttons - click to add/remove from fretboard view
- Multiple scales can be selected (they stack vertically)
- Recommended scale marked with ⭐
- Filters reduce which scales are shown (AND logic)
- "Per-chord scales" toggle switches to per-chord mode

### 3. Fretboard Diagram Component

Horizontal guitar fretboard showing scale notes:

```
┌─────────────────────────────────────────────────────────────────┐
│  A MINOR PENTATONIC ⭐ Recommended                   [× Remove] │
│  Notes: A - C - D - E - G                        [▶ Play Scale] │
│                                                                 │
│     0   1   2   3   4   5   6   7   8   9  10  11  12          │
│  e  ○───────────────●───────○───────────────●───────────────○  │
│  B  ○───────────────●───────────────○───────────────●────────  │
│  G  ●───────────○───────────────●───────────────○────────────  │
│  D  ○───────────●───────────────○───────────────●───────────○  │
│  A  ●───────────────○───────●───────────────○───────────────●  │
│  E  ○───────────────●───────○───────────────●───────────────○  │
│                                                                 │
│  ○ = Scale note    ● = Root note (red)                         │
│                                                                 │
│  ▼ Why this works & Practice tips                              │
└─────────────────────────────────────────────────────────────────┘
```

**Visual Specifications:**
- Horizontal orientation (guitar lying flat, headstock on left)
- Show frets 0-12 (nut is thicker line at fret 0)
- String labels on left: E A D G B e (low to high, bottom to top)
- Fret numbers along top
- **Root notes: RED circles (#EF4444)**
- **Other scale notes: WHITE circles (#FFFFFF)**
- Fretboard background: Dark wood color (#1a1410 or similar)
- Fret lines: Subtle gray (#333)
- String lines: Lighter gray (#555)
- Note circles: ~20px diameter

**Settings that affect fretboard (from Settings panel):**
- Show note names inside circles (toggle, default OFF)
- Show intervals inside circles (toggle, default OFF)

### 4. Scale Info Panel (Collapsible)

Below each fretboard, a collapsible panel:

```
▼ Why this works & Practice tips
┌─────────────────────────────────────────────────────────────────┐
│  Why this scale works:                                          │
│  "A Minor Pentatonic contains the core notes of all chords      │
│   in this progression. It's impossible to hit a wrong note!"   │
│                                                                 │
│  Practice tip:                                                  │
│  "Start by playing the root note (A) when the Am chord plays,  │
│   then explore other notes in the scale."                      │
│                                                                 │
│  Intervals: 1 - b3 - 4 - 5 - b7                                │
│  Related scales: Natural Minor, Blues Scale                     │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Per-Chord Scales Mode

When toggled ON, the UI changes:

```
┌─────────────────────────────────────────────────────────────────┐
│  PER-CHORD SCALES                    [Per-chord scales: ON 🔘]  │
│                                                                 │
│  Click a chord to see its recommended scale:                    │
│                                                                 │
│  [Am ●] → [F] → [C] → [G]                                      │
│    ↑ selected                                                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  OVER Am: A Dorian                            [× Close] │   │
│  │  (fretboard diagram here)                               │   │
│  │                                                         │   │
│  │  Why A Dorian over Am?                                  │   │
│  │  "Dorian has a brighter sound than natural minor..."    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Scale Audio Playback

When user clicks [▶ Play Scale]:
- Play scale ascending from root to octave root
- One octave only
- Tempo: ~400ms per note
- Use existing Tone.js synth

```javascript
const playScaleAscending = async (scaleNotes, rootNote) => {
  // scaleNotes in order, e.g., ['A', 'C', 'D', 'E', 'G']
  // Add octave root at end: ['A', 'C', 'D', 'E', 'G', 'A']
  const notesWithOctave = [...scaleNotes, rootNote];
  
  for (let i = 0; i < notesWithOctave.length; i++) {
    const note = notesWithOctave[i];
    const octave = (i === notesWithOctave.length - 1) ? 4 : 3;
    synth.triggerAttackRelease(`${note}${octave}`, '8n');
    await new Promise(resolve => setTimeout(resolve, 400));
  }
};
```

---

## Scale Data

### Scale Definitions

Create `src/data/scaleData.js`:

```javascript
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
```

---

## Utility Functions

Create `src/utils/scaleUtils.js`:

```javascript
import { scaleDefinitions, NOTE_NAMES, STRING_TUNINGS } from '../data/scaleData';

/**
 * Get the index of a note (0-11)
 */
export function getNoteIndex(note) {
  const normalized = note.replace('b', '#'); // Handle flats
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
          isRoot: noteName === rootNote || getNoteIndex(noteName) === getNoteIndex(rootNote),
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
  
  // Test each scale
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
  
  // Sort by fitness, then by difficulty (easier first)
  results.sort((a, b) => {
    if (b.fitness !== a.fitness) return b.fitness - a.fitness;
    const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    return difficultyOrder[a.scale.difficulty] - difficultyOrder[b.scale.difficulty];
  });
  
  // Mark the top recommendation
  if (results.length > 0) {
    // Prefer pentatonic for beginners
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
    scale: scaleDefinitions[scaleId]
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
```

---

## Components to Create

### 1. ScaleSection Component

`src/components/ScaleSection/ScaleSection.jsx`

Main container that shows when progression has chords. Contains:
- Toggle to show/hide
- Scale selector
- Stacked fretboard diagrams

### 2. ScaleSelector Component

`src/components/ScaleSection/ScaleSelector.jsx`

- List of available scales as toggleable buttons
- Filter toggles (difficulty, mood, type)
- Per-chord mode toggle

### 3. Fretboard Component

`src/components/Fretboard/Fretboard.jsx`

The horizontal fretboard diagram showing:
- 6 strings (E A D G B e)
- Frets 0-12
- Scale notes as circles
- Root notes in RED (#EF4444)
- Other notes in WHITE (#FFFFFF)
- Play button
- Remove button
- Collapsible info section

### 4. ScaleInfo Component

`src/components/Fretboard/ScaleInfo.jsx`

Collapsible panel with:
- "Why this works" explanation
- Practice tip
- Intervals
- Related scales

---

## State Updates

Add to AppContext:

```javascript
// Add to initial state
scaleState: {
  showScales: true,
  selectedScales: [], // Array of { scaleId, root }
  filters: {
    difficulty: [],
    mood: [],
    type: []
  },
  perChordMode: false,
  selectedChordForScale: null // Index of chord in per-chord mode
}

// Add actions
setShowScales: (show) => {},
toggleScale: (scaleId, root) => {},
setScaleFilters: (filters) => {},
setPerChordMode: (enabled) => {},
setSelectedChordForScale: (index) => {}
```

---

## Settings Panel Updates

Add to settings panel:

```
Scale Display:
[✓] Show note names on fretboard
[ ] Show intervals on fretboard
```

Add to settings state:
```javascript
showScaleNoteNames: false,
showScaleIntervals: false
```

---

## Styling

Use the existing dark theme. Key colors:

```css
/* Fretboard */
--fretboard-bg: #1a1410;
--fret-line: #333;
--string-line: #555;
--note-root: #EF4444;      /* Red */
--note-scale: #FFFFFF;      /* White */
--note-text: #000000;       /* Black text on notes */

/* Scale selector */
--scale-btn-active: var(--accent-primary);
--scale-btn-inactive: var(--bg-elevated);
--recommended-badge: #FCD34D; /* Gold star */
```

---

## File Structure (New Files)

```
src/
├── components/
│   ├── ScaleSection/
│   │   ├── ScaleSection.jsx
│   │   ├── ScaleSection.css
│   │   └── ScaleSelector.jsx
│   └── Fretboard/
│       ├── Fretboard.jsx
│       ├── Fretboard.css
│       └── ScaleInfo.jsx
├── data/
│   └── scaleData.js (NEW)
└── utils/
    └── scaleUtils.js (NEW)
```

---

## Implementation Order

1. Create `scaleData.js` with all scale definitions
2. Create `scaleUtils.js` with utility functions
3. Update AppContext with scale state
4. Create Fretboard component (most complex)
5. Create ScaleInfo component
6. Create ScaleSelector component
7. Create ScaleSection container
8. Integrate into App.jsx (below ProgressionDisplay)
9. Update SettingsPanel with new options
10. Add audio playback for scales
11. Test and polish

---

## Example User Flow

1. User builds progression: Am → F → C → G
2. Below progression, "Scales" section appears
3. Shows recommended: A Minor Pentatonic ⭐
4. Also shows: A Natural Minor, A Blues, A Dorian, C Major, etc.
5. User clicks "A Minor Pentatonic" → fretboard appears
6. User clicks "A Blues" → second fretboard stacks below
7. User clicks [▶ Play Scale] → hears ascending scale
8. User toggles "Per-chord mode" ON
9. Clicks on "F" chord in progression
10. Shows "Over F: F Lydian" with fretboard

---

Build this complete scale system!
