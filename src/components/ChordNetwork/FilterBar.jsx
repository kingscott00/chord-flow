import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORIES } from '../../utils/chordRelationships';

const FILTERS = [
  { id: 'all', label: 'All', color: '#ffffff' },
  { id: CATEGORIES.DIATONIC, label: 'Diatonic', color: CATEGORY_COLORS.diatonic },
  { id: CATEGORIES.BORROWED, label: 'Borrowed', color: CATEGORY_COLORS.borrowed },
  { id: CATEGORIES.SECONDARY_DOMINANT, label: 'Dominants', color: CATEGORY_COLORS.secondary },
  { id: CATEGORIES.DIMINISHED, label: 'Diminished', color: CATEGORY_COLORS.diminished },
  { id: 'bright', label: 'Bright', color: '#fbbf24' },
  { id: 'dark', label: 'Dark', color: '#8b5cf6' }
];

function FilterBar({ activeFilters, onFilterChange }) {
  const handleFilterClick = useCallback((filterId) => {
    if (filterId === 'all') {
      onFilterChange(['all']);
    } else {
      const newFilters = activeFilters.includes('all')
        ? [filterId]
        : activeFilters.includes(filterId)
          ? activeFilters.filter(f => f !== filterId)
          : [...activeFilters, filterId];

      // If no filters selected, default to 'all'
      onFilterChange(newFilters.length === 0 ? ['all'] : newFilters);
    }
  }, [activeFilters, onFilterChange]);

  return (
    <div className="filter-bar">
      {FILTERS.map(filter => {
        const isActive = activeFilters.includes(filter.id) ||
          (filter.id === 'all' && activeFilters.includes('all'));

        return (
          <motion.button
            key={filter.id}
            className={`filter-btn ${isActive ? 'active' : ''}`}
            onClick={() => handleFilterClick(filter.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              '--filter-color': filter.color,
              borderColor: isActive ? filter.color : 'transparent',
              color: isActive ? filter.color : 'var(--text-secondary)'
            }}
          >
            {filter.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default FilterBar;
