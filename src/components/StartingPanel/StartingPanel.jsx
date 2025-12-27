import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import RandomPicker from './RandomPicker';
import ChordSearch from './ChordSearch';
import MoodSelector from './MoodSelector';
import KeySelector from './KeySelector';
import './StartingPanel.css';

function StartingPanel({ onPlayPreview }) {
  const { actions } = useApp();

  const handleSelectChord = (chord) => {
    actions.addChord(chord);
  };

  return (
    <motion.div
      className="starting-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="starting-header">
        <h2 className="starting-title">Start Your Progression</h2>
        <p className="starting-subtitle">
          Choose your first chord to begin building
        </p>
      </div>

      <div className="starting-methods">
        <div className="method-column">
          <RandomPicker onSelectChord={handleSelectChord} />
          <ChordSearch onSelectChord={handleSelectChord} />
        </div>

        <div className="method-column">
          <MoodSelector
            onSelectChord={handleSelectChord}
            onPlayPreview={onPlayPreview}
          />
        </div>

        <div className="method-column">
          <KeySelector onSelectChord={handleSelectChord} />
        </div>
      </div>
    </motion.div>
  );
}

export default StartingPanel;
