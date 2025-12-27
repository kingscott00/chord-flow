import React, { useCallback } from 'react';
import { useApp } from './context/AppContext';
import { useAudio } from './hooks/useAudio';
import Header from './components/Header/Header';
import ProgressionDisplay from './components/ProgressionDisplay/ProgressionDisplay';
import StartingPanel from './components/StartingPanel/StartingPanel';
import ChordNetwork from './components/ChordNetwork/ChordNetwork';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import ScaleSection from './components/ScaleSection/ScaleSection';
import './App.css';

function App() {
  const { state, actions } = useApp();
  const {
    progression,
    networkOpen,
    activeChordIndex,
    networkPosition,
    settingsOpen,
    settings
  } = state;

  const {
    playChord,
    playArpeggio,
    playProgression,
    playScale,
    isPlaying
  } = useAudio(settings);

  // Get the active chord for the network
  const activeChord = activeChordIndex !== null ? progression[activeChordIndex] : null;

  // Handle playing a single chord
  const handlePlayChord = useCallback((chord) => {
    playChord(chord);
  }, [playChord]);

  // Handle preview (arpeggio)
  const handlePlayPreview = useCallback((chord) => {
    playArpeggio(chord);
  }, [playArpeggio]);

  // Handle playing the entire progression
  const handlePlayAll = useCallback(() => {
    playProgression(progression);
  }, [progression, playProgression]);

  // Handle selecting a chord from the network
  const handleSelectChord = useCallback((chord) => {
    actions.addChord(chord);
    playChord(chord);
  }, [actions, playChord]);

  // Handle playing a scale
  const handlePlayScale = useCallback((scaleId, root) => {
    playScale(scaleId, root);
  }, [playScale]);

  return (
    <div className="app">
      <Header
        onPlayAll={handlePlayAll}
        isPlaying={isPlaying}
      />

      <main className="main-content">
        {progression.length === 0 ? (
          <StartingPanel onPlayPreview={handlePlayPreview} />
        ) : (
          <>
            <ProgressionDisplay onPlayChord={handlePlayChord} />
            <ScaleSection onPlayScale={handlePlayScale} />
          </>
        )}
      </main>

      <ChordNetwork
        isOpen={networkOpen}
        sourceChord={activeChord}
        position={networkPosition}
        onSelectChord={handleSelectChord}
        onClose={actions.closeNetwork}
        onPlayPreview={handlePlayPreview}
      />

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={actions.closeSettings}
      />

      <footer className="app-footer">
        <span className="footer-text">
          ChordFlow - Build beautiful progressions
        </span>
        <span className="footer-hint">
          Hover over a chord to see suggestions
        </span>
      </footer>
    </div>
  );
}

export default App;
