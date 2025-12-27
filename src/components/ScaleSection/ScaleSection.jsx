import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, useScales } from '../../context/AppContext';
import { getRecommendedScales, getScalesForChord, filterScales } from '../../utils/scaleUtils';
import ScaleSelector from './ScaleSelector';
import Fretboard from '../Fretboard/Fretboard';
import './ScaleSection.css';

function ScaleSection({ onPlayScale }) {
  const { state } = useApp();
  const { progression, detectedKey } = state;
  const {
    scaleState,
    setShowScales,
    toggleScale,
    setPerChordMode,
    setSelectedChordForScale
  } = useScales();

  const {
    showScales,
    selectedScales,
    filters,
    perChordMode,
    selectedChordForScale
  } = scaleState;

  // Get recommended scales for the progression
  const recommendedScales = useMemo(() => {
    if (perChordMode) return [];
    const allScales = getRecommendedScales(progression, detectedKey);
    return filterScales(allScales, filters);
  }, [progression, detectedKey, filters, perChordMode]);

  // Get scales for selected chord in per-chord mode
  const chordScales = useMemo(() => {
    if (!perChordMode || selectedChordForScale === null) return [];
    const chord = progression[selectedChordForScale];
    if (!chord) return [];
    const scales = getScalesForChord(chord);
    return filterScales(scales, filters);
  }, [perChordMode, selectedChordForScale, progression, filters]);

  // Available scales based on mode
  const availableScales = perChordMode ? chordScales : recommendedScales;

  // Handle scale toggle
  const handleToggleScale = useCallback((scaleId, root) => {
    toggleScale(scaleId, root);
  }, [toggleScale]);

  // Handle per-chord mode change
  const handlePerChordModeChange = useCallback((enabled) => {
    setPerChordMode(enabled);
  }, [setPerChordMode]);

  // Handle chord selection in per-chord mode
  const handleChordSelect = useCallback((index) => {
    setSelectedChordForScale(index);
  }, [setSelectedChordForScale]);

  // Handle removing a scale from view
  const handleRemoveScale = useCallback((scaleId, root) => {
    toggleScale(scaleId, root);
  }, [toggleScale]);

  // Don't show if no progression
  if (progression.length === 0) return null;

  return (
    <div className="scale-section">
      {/* Section Header */}
      <div className="scale-section-header">
        <h2 className="section-title">
          {perChordMode ? 'PER-CHORD SCALES' : 'SCALES FOR THIS PROGRESSION'}
        </h2>
        <button
          className="toggle-scales-btn"
          onClick={() => setShowScales(!showScales)}
        >
          {showScales ? 'Hide Scales' : 'Show Scales'}
        </button>
      </div>

      <AnimatePresence>
        {showScales && (
          <motion.div
            className="scale-section-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Per-chord mode: Chord selector */}
            {perChordMode && (
              <div className="chord-selector">
                <p className="chord-selector-hint">Click a chord to see its recommended scale:</p>
                <div className="chord-selector-buttons">
                  {progression.map((chord, index) => (
                    <React.Fragment key={index}>
                      <button
                        className={`chord-select-btn ${selectedChordForScale === index ? 'selected' : ''}`}
                        onClick={() => handleChordSelect(index)}
                      >
                        {chord.symbol}
                        {selectedChordForScale === index && <span className="selected-dot"></span>}
                      </button>
                      {index < progression.length - 1 && (
                        <span className="chord-arrow">&#8594;</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Scale Selector */}
            <ScaleSelector
              availableScales={availableScales}
              selectedScales={selectedScales}
              onToggleScale={handleToggleScale}
              perChordMode={perChordMode}
              onPerChordModeChange={handlePerChordModeChange}
            />

            {/* Fretboard diagrams */}
            <div className="fretboard-list">
              <AnimatePresence>
                {selectedScales.map(({ scaleId, root }) => (
                  <Fretboard
                    key={`${scaleId}-${root}`}
                    scaleId={scaleId}
                    root={root}
                    isRecommended={availableScales.find(
                      s => s.scaleId === scaleId && s.root === root
                    )?.isRecommended}
                    onRemove={() => handleRemoveScale(scaleId, root)}
                    onPlayScale={onPlayScale}
                    chords={progression}
                    detectedKey={detectedKey}
                  />
                ))}
              </AnimatePresence>

              {selectedScales.length === 0 && (
                <div className="no-scales-selected">
                  <p>Click on a scale above to view it on the fretboard</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ScaleSection;
