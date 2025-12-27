import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUniqueChords } from '../../data/chordData';
import FingeringDiagram from '../FingeringDiagram/FingeringDiagram';

function ChordSearch({ onSelectChord }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const allChords = useMemo(() => getUniqueChords(), []);

  const filteredChords = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    return allChords
      .filter(chord => {
        return (
          chord.symbol.toLowerCase().includes(q) ||
          chord.name.toLowerCase().includes(q) ||
          chord.altSymbols?.some(alt => alt.toLowerCase().includes(q))
        );
      })
      .slice(0, 8); // Limit results
  }, [query, allChords]);

  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(0);
  }, []);

  const handleSelectChord = useCallback((chord) => {
    onSelectChord(chord);
    setQuery('');
    setIsOpen(false);
  }, [onSelectChord]);

  const handleKeyDown = useCallback((e) => {
    if (!isOpen || filteredChords.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => (i + 1) % filteredChords.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => (i - 1 + filteredChords.length) % filteredChords.length);
        break;
      case 'Enter':
        e.preventDefault();
        handleSelectChord(filteredChords[highlightedIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  }, [isOpen, filteredChords, highlightedIndex, handleSelectChord]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="chord-search">
      <div className="picker-header">
        <span className="picker-icon">🔍</span>
        <span className="picker-title">Search</span>
      </div>

      <div className="search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Type chord name... (Am, G7, Cmaj7)"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
        />

        <AnimatePresence>
          {isOpen && filteredChords.length > 0 && (
            <motion.ul
              ref={listRef}
              className="search-results"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {filteredChords.map((chord, index) => (
                <motion.li
                  key={chord.id}
                  className={`search-result-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                  onClick={() => handleSelectChord(chord)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                >
                  <div className="result-info">
                    <span className="result-symbol">{chord.symbol}</span>
                    <span className="result-name">{chord.name}</span>
                  </div>
                  <div className="result-diagram">
                    <FingeringDiagram
                      frets={chord.frets}
                      fingers={chord.fingers}
                      barre={chord.barre}
                      position={chord.position}
                      showFingerNumbers={false}
                      size="small"
                    />
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ChordSearch;
