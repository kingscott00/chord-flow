import React, { useCallback } from 'react';
import { useScales } from '../../context/AppContext';
import { DIFFICULTY_OPTIONS, TYPE_OPTIONS } from '../../data/scaleData';
import { getScaleDisplayName } from '../../utils/scaleUtils';

const MOOD_FILTER_OPTIONS = ['dark', 'bright', 'bluesy', 'exotic', 'jazzy'];

function ScaleSelector({
  availableScales,
  selectedScales,
  onToggleScale,
  perChordMode,
  onPerChordModeChange
}) {
  const { scaleState, setScaleFilters } = useScales();
  const { filters } = scaleState;

  const toggleFilter = useCallback((category, value) => {
    const currentValues = filters[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];

    setScaleFilters({
      ...filters,
      [category]: newValues
    });
  }, [filters, setScaleFilters]);

  const isScaleSelected = useCallback((scaleId, root) => {
    return selectedScales.some(s => s.scaleId === scaleId && s.root === root);
  }, [selectedScales]);

  return (
    <div className="scale-selector">
      <p className="selector-hint">Click scales to add/remove from view:</p>

      {/* Scale buttons */}
      <div className="scale-buttons">
        {availableScales.map(({ scaleId, root, scale, isRecommended }) => {
          const isSelected = isScaleSelected(scaleId, root);
          const displayName = getScaleDisplayName(scaleId, root);

          return (
            <button
              key={`${scaleId}-${root}`}
              className={`scale-btn ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`}
              onClick={() => onToggleScale(scaleId, root)}
            >
              {displayName}
              {isSelected && <span className="check-mark">&#10003;</span>}
              {isRecommended && <span className="star">&#9733;</span>}
            </button>
          );
        })}
        {availableScales.length === 0 && (
          <p className="no-scales">No scales match your filters. Try removing some filters.</p>
        )}
      </div>

      {/* Filters */}
      <div className="scale-filters">
        <span className="filter-label">Filters:</span>

        <div className="filter-groups-row">
          <div className="filter-group">
            <span className="filter-category">Difficulty:</span>
            {DIFFICULTY_OPTIONS.map(diff => (
              <button
                key={diff}
                className={`filter-btn ${filters.difficulty?.includes(diff) ? 'active' : ''}`}
                onClick={() => toggleFilter('difficulty', diff)}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <span className="filter-category">Feel:</span>
            {MOOD_FILTER_OPTIONS.map(mood => (
              <button
                key={mood}
                className={`filter-btn ${filters.mood?.includes(mood) ? 'active' : ''}`}
                onClick={() => toggleFilter('mood', mood)}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <span className="filter-category">Type:</span>
            {TYPE_OPTIONS.map(type => (
              <button
                key={type}
                className={`filter-btn ${filters.type?.includes(type) ? 'active' : ''}`}
                onClick={() => toggleFilter('type', type)}
              >
                {type === 'full' ? 'Full Scale' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Per-chord mode toggle */}
      <div className="per-chord-toggle">
        <span className="toggle-label">Per-chord scales:</span>
        <button
          className={`mode-toggle ${perChordMode ? 'on' : 'off'}`}
          onClick={() => onPerChordModeChange(!perChordMode)}
        >
          <span className="toggle-option">OFF</span>
          <span className="toggle-knob"></span>
          <span className="toggle-option">ON</span>
        </button>
      </div>
    </div>
  );
}

export default ScaleSelector;
