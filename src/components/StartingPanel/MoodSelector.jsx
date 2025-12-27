import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChordsByMood, getUniqueChords } from '../../data/chordData';
import FingeringDiagram from '../FingeringDiagram/FingeringDiagram';

const MOODS = [
  { id: 'happy', label: 'Happy / Bright', emoji: '☀️', color: '#fbbf24' },
  { id: 'sad', label: 'Sad / Melancholy', emoji: '🌧️', color: '#60a5fa' },
  { id: 'mysterious', label: 'Mysterious / Dark', emoji: '🌙', color: '#a855f7' },
  { id: 'dreamy', label: 'Dreamy / Ethereal', emoji: '✨', color: '#f472b6' },
  { id: 'energetic', label: 'Energetic / Driving', emoji: '⚡', color: '#fb923c' },
  { id: 'peaceful', label: 'Jazzy / Sophisticated', emoji: '🎷', color: '#4ade80' }
];

function MoodSelector({ onSelectChord, onPlayPreview }) {
  const [selectedMood, setSelectedMood] = useState(null);

  // Get unique chords filtered by mood
  const moodChords = useMemo(() => {
    if (!selectedMood) return [];

    const allMoodChords = getChordsByMood(selectedMood);
    // Get unique by symbol
    const seen = new Set();
    return allMoodChords.filter(chord => {
      if (seen.has(chord.symbol)) return false;
      seen.add(chord.symbol);
      return true;
    }).slice(0, 12); // Limit to 12 chords
  }, [selectedMood]);

  const handleMoodClick = useCallback((moodId) => {
    setSelectedMood(moodId === selectedMood ? null : moodId);
  }, [selectedMood]);

  const handleChordClick = useCallback((chord) => {
    onSelectChord(chord);
    setSelectedMood(null);
  }, [onSelectChord]);

  const handleChordHover = useCallback((chord) => {
    if (onPlayPreview) {
      onPlayPreview(chord);
    }
  }, [onPlayPreview]);

  return (
    <div className="mood-selector">
      <div className="picker-header">
        <span className="picker-icon">🎭</span>
        <span className="picker-title">By Mood</span>
      </div>

      <div className="mood-grid">
        {MOODS.map(mood => (
          <motion.button
            key={mood.id}
            className={`mood-btn ${selectedMood === mood.id ? 'selected' : ''}`}
            onClick={() => handleMoodClick(mood.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              '--mood-color': mood.color,
              borderColor: selectedMood === mood.id ? mood.color : 'transparent'
            }}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedMood && moodChords.length > 0 && (
          <motion.div
            className="mood-chords"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="mood-chords-grid">
              {moodChords.map(chord => (
                <motion.button
                  key={chord.id}
                  className="mood-chord-btn"
                  onClick={() => handleChordClick(chord)}
                  onMouseEnter={() => handleChordHover(chord)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="chord-symbol">{chord.symbol}</span>
                  <FingeringDiagram
                    frets={chord.frets}
                    fingers={chord.fingers}
                    barre={chord.barre}
                    position={chord.position}
                    showFingerNumbers={false}
                    size="small"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MoodSelector;
