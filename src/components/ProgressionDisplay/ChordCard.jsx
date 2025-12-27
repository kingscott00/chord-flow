import React, { useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import FingeringDiagram from '../FingeringDiagram/FingeringDiagram';

function ChordCard({
  chord,
  index,
  isActive,
  showFingering,
  showFingerNumbers,
  showIntervals,
  compactMode,
  onHover,
  onLeave,
  onPlay,
  onDelete
}) {
  const cardRef = useRef(null);

  const handleMouseEnter = useCallback((e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onHover(index, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      });
    }
  }, [index, onHover]);

  const handlePlayClick = useCallback((e) => {
    e.stopPropagation();
    onPlay(chord);
  }, [chord, onPlay]);

  const handleDeleteClick = useCallback((e) => {
    e.stopPropagation();
    onDelete(index);
  }, [index, onDelete]);

  return (
    <motion.div
      ref={cardRef}
      className={`chord-card ${isActive ? 'active' : ''} ${compactMode ? 'compact' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="card-header">
        <span className="chord-symbol">{chord.symbol}</span>
        <div className="card-actions">
          <button
            className="card-action-btn play-btn"
            onClick={handlePlayClick}
            title="Play chord"
          >
            ▶
          </button>
          <button
            className="card-action-btn delete-btn"
            onClick={handleDeleteClick}
            title="Remove chord"
          >
            ×
          </button>
        </div>
      </div>

      {showFingering && !compactMode && (
        <div className="card-diagram">
          <FingeringDiagram
            frets={chord.frets}
            fingers={chord.fingers}
            barre={chord.barre}
            position={chord.position}
            showFingerNumbers={showFingerNumbers}
            size="medium"
          />
        </div>
      )}

      {showIntervals && !compactMode && (
        <div className="card-intervals">
          {chord.intervals?.map((interval, i) => (
            <span key={i} className="interval-badge">{interval}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <span className="chord-name">{chord.name}</span>
      </div>
    </motion.div>
  );
}

export default React.memo(ChordCard);
