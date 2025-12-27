import React, { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import ChordCard from './ChordCard';
import './ProgressionDisplay.css';

function ProgressionDisplay({ onPlayChord }) {
  const { state, actions } = useApp();
  const { progression, activeChordIndex, settings } = state;

  const handleDelete = useCallback((index) => {
    actions.removeChord(index);
  }, [actions]);

  const handleAddClick = useCallback(() => {
    // If there's at least one chord, open network on the last chord
    if (progression.length > 0) {
      const lastIndex = progression.length - 1;
      // Calculate approximate position for the add button
      const container = document.querySelector('.progression-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        actions.openNetwork(lastIndex, {
          x: rect.right - 100,
          y: rect.top + rect.height / 2
        });
      }
    }
  }, [progression, actions]);

  if (progression.length === 0) {
    return null; // StartingPanel will be shown instead
  }

  return (
    <div className="progression-display">
      <div className="progression-container">
        <AnimatePresence mode="popLayout">
          {progression.map((chord, index) => (
            <React.Fragment key={chord.id + '-' + index}>
              <ChordCard
                chord={chord}
                index={index}
                isActive={activeChordIndex === index}
                showFingering={settings.showFingering}
                showFingerNumbers={settings.showFingerNumbers}
                showIntervals={settings.showIntervals}
                compactMode={settings.compactMode}
                onPlay={onPlayChord}
                onDelete={handleDelete}
              />
              {index < progression.length - 1 && (
                <motion.div
                  className="chord-arrow"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  →
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </AnimatePresence>

        <motion.button
          className="add-chord-btn"
          onClick={handleAddClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Add next chord"
        >
          <span className="add-icon">+</span>
          <span className="add-text">Add</span>
        </motion.button>
      </div>
    </div>
  );
}

export default ProgressionDisplay;
