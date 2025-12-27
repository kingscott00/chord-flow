import React from 'react';
import { useApp } from '../../context/AppContext';
import './Header.css';

function Header({ onPlayAll, isPlaying }) {
  const { state, actions } = useApp();
  const { progression, detectedKey, settings } = state;

  const handleKeyChange = () => {
    // Toggle key mode or open key selector
    const newMode = detectedKey.mode === 'major' ? 'minor' : 'major';
    actions.setManualKey({ ...detectedKey, mode: newMode });
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">CF</span>
          <h1 className="logo-text">ChordFlow</h1>
        </div>
      </div>

      <div className="header-center">
        {progression.length > 0 && (
          <div className="key-indicator">
            <span className="key-label">Detected:</span>
            <button
              className="key-value"
              onClick={handleKeyChange}
              title="Click to toggle major/minor"
            >
              {detectedKey.root} {detectedKey.mode}
            </button>
            {detectedKey.confidence > 0 && (
              <span className="key-confidence">
                ({Math.round(detectedKey.confidence * 100)}%)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="header-right">
        {progression.length > 0 && (
          <>
            <button
              className="header-btn play-all-btn"
              onClick={onPlayAll}
              disabled={isPlaying}
              title="Play entire progression"
            >
              {isPlaying ? (
                <span className="btn-icon">⏹</span>
              ) : (
                <span className="btn-icon">▶</span>
              )}
              <span className="btn-text">Play All</span>
            </button>

            <button
              className="header-btn clear-btn"
              onClick={actions.clearProgression}
              title="Clear progression"
            >
              <span className="btn-icon">🗑</span>
              <span className="btn-text">Clear</span>
            </button>
          </>
        )}

        <button
          className="header-btn settings-btn"
          onClick={actions.openSettings}
          title="Settings"
        >
          <span className="btn-icon">⚙</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
