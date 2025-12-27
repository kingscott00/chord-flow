import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useChordSuggestions } from '../../hooks/useChordSuggestions';
import NetworkNode from './NetworkNode';
import FilterBar from './FilterBar';
import FingeringDiagram from '../FingeringDiagram/FingeringDiagram';
import { CATEGORY_COLORS } from '../../utils/chordRelationships';
import './ChordNetwork.css';

const RING_RADII = {
  inner: 120,
  middle: 190,
  outer: 260
};

function ChordNetwork({ isOpen, sourceChord, position, onSelectChord, onClose, onPlayPreview }) {
  const { state, actions } = useApp();
  const { networkFilters } = state;
  const { organizedSuggestions, endingSuggestions } = useChordSuggestions(sourceChord);

  const [hoveredSuggestion, setHoveredSuggestion] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEnding, setShowEnding] = useState(false);

  const networkRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (networkRef.current && !networkRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectChord = useCallback((chord) => {
    onSelectChord(chord);
    onClose();
  }, [onSelectChord, onClose]);

  const handleHover = useCallback((suggestion) => {
    setHoveredSuggestion(suggestion);
    if (onPlayPreview && suggestion.chord) {
      onPlayPreview(suggestion.chord);
    }
  }, [onPlayPreview]);

  const handleLeave = useCallback(() => {
    setHoveredSuggestion(null);
  }, []);

  // Organize nodes into rings with angles
  const nodesWithPositions = useMemo(() => {
    const { innerRing, middleRing, outerRing } = organizedSuggestions;
    const nodes = [];

    // Distribute inner ring
    innerRing.forEach((s, i) => {
      const angle = (i / Math.max(innerRing.length, 1)) * 2 * Math.PI - Math.PI / 2;
      nodes.push({ ...s, angle, radius: RING_RADII.inner, ring: 'inner' });
    });

    // Distribute middle ring
    middleRing.forEach((s, i) => {
      const angle = (i / Math.max(middleRing.length, 1)) * 2 * Math.PI - Math.PI / 2;
      nodes.push({ ...s, angle, radius: RING_RADII.middle, ring: 'middle' });
    });

    // Distribute outer ring
    outerRing.forEach((s, i) => {
      const angle = (i / Math.max(outerRing.length, 1)) * 2 * Math.PI - Math.PI / 2;
      nodes.push({ ...s, angle, radius: RING_RADII.outer, ring: 'outer' });
    });

    return nodes;
  }, [organizedSuggestions]);

  // Calculate position for the network popup
  const networkStyle = useMemo(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const networkSize = 600;

    let left = position.x - networkSize / 2;
    let top = position.y - networkSize / 2;

    // Keep within viewport
    left = Math.max(20, Math.min(left, viewportWidth - networkSize - 20));
    top = Math.max(80, Math.min(top, viewportHeight - networkSize - 20));

    return { left, top };
  }, [position]);

  if (!isOpen || !sourceChord) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="chord-network-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      <motion.div
        ref={networkRef}
        className="chord-network"
        style={networkStyle}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* SVG Network */}
        <svg
          className="network-svg"
          viewBox="-300 -300 600 600"
          width="600"
          height="600"
        >
          {/* Ring guides */}
          <circle r={RING_RADII.inner} fill="none" stroke="rgba(255,255,255,0.05)" />
          <circle r={RING_RADII.middle} fill="none" stroke="rgba(255,255,255,0.03)" />
          <circle r={RING_RADII.outer} fill="none" stroke="rgba(255,255,255,0.02)" />

          {/* Center chord */}
          <g className="center-chord">
            <circle
              r={45}
              fill="var(--bg-card)"
              stroke="var(--accent-primary)"
              strokeWidth={2}
              filter="drop-shadow(0 0 15px rgba(99, 102, 241, 0.5))"
            />
            <text
              y={-8}
              textAnchor="middle"
              fill="white"
              fontSize={18}
              fontWeight="700"
              fontFamily="Inter, sans-serif"
            >
              {sourceChord.symbol}
            </text>
            <text
              y={12}
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize={10}
              fontFamily="Inter, sans-serif"
            >
              Current
            </text>
          </g>

          {/* Suggestion nodes */}
          <AnimatePresence>
            {nodesWithPositions.map((node, i) => (
              <NetworkNode
                key={node.chord.id}
                suggestion={node}
                angle={node.angle}
                radius={node.radius}
                delay={i * 0.02}
                onSelect={handleSelectChord}
                onHover={handleHover}
                onLeave={handleLeave}
                isHovered={hoveredSuggestion?.chord.id === node.chord.id}
              />
            ))}
          </AnimatePresence>
        </svg>

        {/* Hover tooltip */}
        <AnimatePresence>
          {hoveredSuggestion && (
            <motion.div
              className="network-tooltip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="tooltip-header">
                <span
                  className="tooltip-symbol"
                  style={{ color: CATEGORY_COLORS[hoveredSuggestion.category] }}
                >
                  {hoveredSuggestion.chord.symbol}
                </span>
                <span className="tooltip-name">{hoveredSuggestion.chord.name}</span>
              </div>
              <div className="tooltip-diagram">
                <FingeringDiagram
                  frets={hoveredSuggestion.chord.frets}
                  fingers={hoveredSuggestion.chord.fingers}
                  barre={hoveredSuggestion.chord.barre}
                  position={hoveredSuggestion.chord.position}
                  showFingerNumbers={true}
                  size="medium"
                />
              </div>
              <div className="tooltip-reason">{hoveredSuggestion.reason}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom controls */}
        <div className="network-controls">
          <FilterBar
            activeFilters={networkFilters}
            onFilterChange={actions.setNetworkFilters}
          />

          <div className="network-actions">
            <button
              className={`ending-btn ${showEnding ? 'active' : ''}`}
              onClick={() => setShowEnding(!showEnding)}
            >
              🎵 Help me end this
            </button>

            <div className="network-search">
              <input
                type="text"
                placeholder="Search any chord..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="network-search-input"
              />
            </div>
          </div>

          {/* Ending suggestions */}
          <AnimatePresence>
            {showEnding && (
              <motion.div
                className="ending-suggestions"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="ending-title">Ending Suggestions</div>
                <div className="ending-grid">
                  {endingSuggestions.map(s => (
                    <button
                      key={s.chord.id}
                      className="ending-chord-btn"
                      onClick={() => handleSelectChord(s.chord)}
                    >
                      <span className="chord-symbol">{s.chord.symbol}</span>
                      <span className="chord-reason">{s.reason}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ChordNetwork;
