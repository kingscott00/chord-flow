import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { scaleDefinitions } from '../../data/scaleData';
import { generateFretboardData, getScaleNotes, getScaleExplanation } from '../../utils/scaleUtils';
import ScaleInfo from './ScaleInfo';
import './Fretboard.css';

const FRET_COUNT = 12;
const FRET_WIDTH = 50;
const STRING_SPACING = 28;
const NOTE_SIZE = 20;

function Fretboard({
  scaleId,
  root,
  isRecommended = false,
  onRemove,
  onPlayScale,
  chords,
  detectedKey
}) {
  const { state } = useApp();
  const { settings } = state;
  const [showInfo, setShowInfo] = useState(false);

  const scale = scaleDefinitions[scaleId];
  const fretboardData = generateFretboardData(scaleId, root, FRET_COUNT);
  const scaleNotes = getScaleNotes(scaleId, root);

  const handlePlayScale = useCallback(() => {
    if (onPlayScale) {
      onPlayScale(scaleId, root);
    }
  }, [onPlayScale, scaleId, root]);

  if (!scale) return null;

  // Reverse the fretboard data so high E is at top
  const reversedFretboard = [...fretboardData].reverse();

  return (
    <motion.div
      className="fretboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="fretboard-header">
        <div className="fretboard-title">
          <h3 className="scale-name">
            {root} {scale.name}
            {isRecommended && <span className="recommended-badge">Recommended</span>}
          </h3>
          <span className="scale-notes">
            Notes: {scaleNotes.join(' - ')}
          </span>
        </div>
        <div className="fretboard-actions">
          <button className="play-scale-btn" onClick={handlePlayScale}>
            <span className="play-icon">&#9654;</span> Play Scale
          </button>
          {onRemove && (
            <button className="remove-scale-btn" onClick={onRemove}>
              &times; Remove
            </button>
          )}
        </div>
      </div>

      {/* Fretboard Diagram */}
      <div className="fretboard-diagram">
        {/* Fret numbers */}
        <div className="fret-numbers">
          <span className="string-label-spacer"></span>
          {Array.from({ length: FRET_COUNT + 1 }, (_, i) => (
            <span key={i} className="fret-number" style={{ width: FRET_WIDTH }}>
              {i}
            </span>
          ))}
        </div>

        {/* Strings and notes */}
        <div className="fretboard-strings">
          {reversedFretboard.map((string, stringIndex) => (
            <div key={stringIndex} className="string-row">
              <span className="string-label">{string.name}</span>
              <div className="string-frets">
                {/* Nut (thicker line at fret 0) */}
                <div className="nut"></div>

                {/* Frets */}
                {Array.from({ length: FRET_COUNT + 1 }, (_, fretIndex) => {
                  const noteData = string.frets.find(f => f.fret === fretIndex);
                  return (
                    <div
                      key={fretIndex}
                      className={`fret ${fretIndex === 0 ? 'fret-open' : ''}`}
                      style={{ width: FRET_WIDTH }}
                    >
                      {/* String line */}
                      <div className="string-line"></div>

                      {/* Fret line */}
                      {fretIndex > 0 && <div className="fret-line"></div>}

                      {/* Note circle */}
                      {noteData && (
                        <div
                          className={`note-circle ${noteData.isRoot ? 'root-note' : 'scale-note'}`}
                          style={{
                            width: NOTE_SIZE,
                            height: NOTE_SIZE
                          }}
                        >
                          {settings.showScaleNoteNames && (
                            <span className="note-label">{noteData.note}</span>
                          )}
                          {settings.showScaleIntervals && !settings.showScaleNoteNames && (
                            <span className="note-label">{noteData.interval}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Fret markers (dots) */}
        <div className="fret-markers">
          <span className="string-label-spacer"></span>
          {Array.from({ length: FRET_COUNT + 1 }, (_, i) => (
            <div key={i} className="fret-marker-slot" style={{ width: FRET_WIDTH }}>
              {[3, 5, 7, 9].includes(i) && <div className="fret-marker single"></div>}
              {i === 12 && (
                <div className="fret-marker-double">
                  <div className="fret-marker"></div>
                  <div className="fret-marker"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="fretboard-legend">
        <span className="legend-item">
          <span className="legend-dot root"></span> Root note
        </span>
        <span className="legend-item">
          <span className="legend-dot scale"></span> Scale note
        </span>
      </div>

      {/* Collapsible Info Section */}
      <button
        className="info-toggle"
        onClick={() => setShowInfo(!showInfo)}
      >
        <span className={`toggle-arrow ${showInfo ? 'open' : ''}`}>&#9660;</span>
        Why this works & Practice tips
      </button>

      {showInfo && (
        <ScaleInfo
          scale={scale}
          scaleId={scaleId}
          root={root}
          chords={chords}
          detectedKey={detectedKey}
        />
      )}
    </motion.div>
  );
}

export default Fretboard;
