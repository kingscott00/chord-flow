import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import './SettingsPanel.css';

const TONES = [
  { id: 'acoustic', label: 'Acoustic Guitar' },
  { id: 'electric', label: 'Clean Electric' },
  { id: 'jazz', label: 'Jazz Tone' }
];

const THEORY_LEVELS = [
  { id: 'basic', label: 'Basic', description: 'Diatonic + common borrowed chords' },
  { id: 'intermediate', label: 'Intermediate', description: '+ Secondary dominants, more borrowed' },
  { id: 'advanced', label: 'Advanced', description: '+ Tritone subs, diminished, modal interchange' }
];

function SettingsPanel({ isOpen, onClose }) {
  const { state, actions } = useApp();
  const { settings, detectedKey } = state;

  const handleSettingChange = useCallback((key, value) => {
    actions.updateSettings({ [key]: value });
  }, [actions]);

  const handleKeyChange = useCallback((root, mode) => {
    actions.setManualKey({ root, mode, confidence: 1 });
  }, [actions]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="settings-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="settings-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="settings-header">
              <h2 className="settings-title">Settings</h2>
              <button className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="settings-content">
              {/* Display Settings */}
              <section className="settings-section">
                <h3 className="section-title">Display</h3>

                <label className="setting-toggle">
                  <span className="setting-label">Show fingering diagrams</span>
                  <input
                    type="checkbox"
                    checked={settings.showFingering}
                    onChange={(e) => handleSettingChange('showFingering', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                </label>

                <label className="setting-toggle">
                  <span className="setting-label">Show finger numbers</span>
                  <input
                    type="checkbox"
                    checked={settings.showFingerNumbers}
                    onChange={(e) => handleSettingChange('showFingerNumbers', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                </label>

                <label className="setting-toggle">
                  <span className="setting-label">Show intervals</span>
                  <input
                    type="checkbox"
                    checked={settings.showIntervals}
                    onChange={(e) => handleSettingChange('showIntervals', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                </label>

                <label className="setting-toggle">
                  <span className="setting-label">Compact mode</span>
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                </label>
              </section>

              {/* Audio Settings */}
              <section className="settings-section">
                <h3 className="section-title">Audio</h3>

                <div className="setting-slider">
                  <div className="slider-header">
                    <span className="setting-label">Volume</span>
                    <span className="slider-value">{settings.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) => handleSettingChange('volume', parseInt(e.target.value))}
                    className="volume-slider"
                  />
                </div>

                <div className="setting-select">
                  <span className="setting-label">Tone</span>
                  <div className="tone-options">
                    {TONES.map(tone => (
                      <button
                        key={tone.id}
                        className={`tone-btn ${settings.tone === tone.id ? 'selected' : ''}`}
                        onClick={() => handleSettingChange('tone', tone.id)}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Theory Level */}
              <section className="settings-section">
                <h3 className="section-title">Theory Level</h3>
                <p className="section-description">
                  Controls which chord suggestions appear in the network
                </p>

                <div className="theory-options">
                  {THEORY_LEVELS.map(level => (
                    <button
                      key={level.id}
                      className={`theory-btn ${settings.theoryLevel === level.id ? 'selected' : ''}`}
                      onClick={() => handleSettingChange('theoryLevel', level.id)}
                    >
                      <span className="theory-label">{level.label}</span>
                      <span className="theory-description">{level.description}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Key Detection */}
              <section className="settings-section">
                <h3 className="section-title">Key Detection</h3>

                <label className="setting-toggle">
                  <span className="setting-label">Auto-detect key</span>
                  <input
                    type="checkbox"
                    checked={settings.autoDetectKey}
                    onChange={(e) => handleSettingChange('autoDetectKey', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                </label>

                {!settings.autoDetectKey && (
                  <motion.div
                    className="manual-key-selector"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="key-row">
                      <span className="setting-label">Key</span>
                      <select
                        value={detectedKey.root}
                        onChange={(e) => handleKeyChange(e.target.value, detectedKey.mode)}
                        className="key-select"
                      >
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>

                      <select
                        value={detectedKey.mode}
                        onChange={(e) => handleKeyChange(detectedKey.root, e.target.value)}
                        className="mode-select"
                      >
                        <option value="major">Major</option>
                        <option value="minor">Minor</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </section>

              {/* Scale Display */}
              <section className="settings-section">
                <h3 className="section-title">Scale Display</h3>

                <label className="setting-toggle">
                  <span className="setting-label">Show note names on fretboard</span>
                  <input
                    type="checkbox"
                    checked={settings.showScaleNoteNames}
                    onChange={(e) => handleSettingChange('showScaleNoteNames', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                </label>

                <label className="setting-toggle">
                  <span className="setting-label">Show intervals on fretboard</span>
                  <input
                    type="checkbox"
                    checked={settings.showScaleIntervals}
                    onChange={(e) => handleSettingChange('showScaleIntervals', e.target.checked)}
                  />
                  <span className="toggle-switch"></span>
                </label>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SettingsPanel;
