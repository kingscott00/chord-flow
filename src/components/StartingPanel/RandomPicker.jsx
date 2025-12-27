import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { getUniqueChords, getChordsByMood } from '../../data/chordData';

const MOODS = [
  { id: 'all', label: 'Any Mood' },
  { id: 'happy', label: 'Happy' },
  { id: 'sad', label: 'Sad' },
  { id: 'mysterious', label: 'Mysterious' },
  { id: 'dreamy', label: 'Dreamy' },
  { id: 'energetic', label: 'Energetic' },
  { id: 'peaceful', label: 'Peaceful' }
];

function RandomPicker({ onSelectChord }) {
  const [selectedMood, setSelectedMood] = useState('all');
  const [isRolling, setIsRolling] = useState(false);

  const handleRandom = useCallback(() => {
    setIsRolling(true);

    // Get chords based on mood filter
    const chords = selectedMood === 'all'
      ? getUniqueChords()
      : getChordsByMood(selectedMood);

    if (chords.length === 0) {
      setIsRolling(false);
      return;
    }

    // Animate the dice roll
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * chords.length);
      onSelectChord(chords[randomIndex]);
      setIsRolling(false);
    }, 500);
  }, [selectedMood, onSelectChord]);

  return (
    <div className="random-picker">
      <div className="picker-header">
        <span className="picker-icon">🎲</span>
        <span className="picker-title">Random Chord</span>
      </div>

      <div className="mood-filter">
        <select
          value={selectedMood}
          onChange={(e) => setSelectedMood(e.target.value)}
          className="mood-select"
        >
          {MOODS.map(mood => (
            <option key={mood.id} value={mood.id}>{mood.label}</option>
          ))}
        </select>
      </div>

      <motion.button
        className="random-btn"
        onClick={handleRandom}
        disabled={isRolling}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isRolling ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isRolling ? '🎲' : 'Roll the Dice'}
      </motion.button>
    </div>
  );
}

export default RandomPicker;
