import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getUniqueChords } from '../../data/chordData';
import { normalizeNote } from '../../utils/musicTheory';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MODES = [
  { id: 'major', label: 'Major' },
  { id: 'minor', label: 'Minor' }
];

function KeySelector({ onSelectChord }) {
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedMode, setSelectedMode] = useState('major');

  const handleSelectKey = useCallback(() => {
    // Find the tonic chord for the selected key
    const allChords = getUniqueChords();
    const quality = selectedMode === 'major' ? 'major' : 'minor';

    const tonicChord = allChords.find(chord =>
      normalizeNote(chord.root) === normalizeNote(selectedKey) &&
      chord.quality === quality
    );

    if (tonicChord) {
      onSelectChord(tonicChord);
    } else {
      // Fallback: try to find any chord with this root
      const fallback = allChords.find(chord =>
        normalizeNote(chord.root) === normalizeNote(selectedKey)
      );
      if (fallback) {
        onSelectChord(fallback);
      }
    }
  }, [selectedKey, selectedMode, onSelectChord]);

  return (
    <div className="key-selector">
      <div className="picker-header">
        <span className="picker-icon">🎼</span>
        <span className="picker-title">By Key</span>
      </div>

      <div className="key-selector-content">
        <div className="key-buttons">
          {KEYS.map(key => (
            <motion.button
              key={key}
              className={`key-btn ${selectedKey === key ? 'selected' : ''}`}
              onClick={() => setSelectedKey(key)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {key}
            </motion.button>
          ))}
        </div>

        <div className="mode-toggle">
          {MODES.map(mode => (
            <button
              key={mode.id}
              className={`mode-btn ${selectedMode === mode.id ? 'selected' : ''}`}
              onClick={() => setSelectedMode(mode.id)}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <motion.button
          className="select-key-btn"
          onClick={handleSelectKey}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Start with {selectedKey} {selectedMode}
        </motion.button>
      </div>
    </div>
  );
}

export default KeySelector;
