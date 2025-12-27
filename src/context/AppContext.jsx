import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { detectKey } from '../utils/musicTheory';

// Initial state
const initialState = {
  // Progression
  progression: [],

  // UI State
  settingsOpen: false,
  networkOpen: false,
  activeChordIndex: null,
  networkPosition: { x: 0, y: 0 },

  // Settings
  settings: {
    showFingering: true,
    showFingerNumbers: true,
    showIntervals: false,
    compactMode: false,
    volume: 70,
    tone: 'acoustic',
    theoryLevel: 'intermediate',
    autoDetectKey: true,
    manualKey: null,
    showScaleNoteNames: false,
    showScaleIntervals: false
  },

  // Detected/Selected Key
  detectedKey: { root: 'C', mode: 'major', confidence: 0 },

  // Network State
  networkFilters: ['all'],

  // Scale State
  scaleState: {
    showScales: true,
    selectedScales: [], // Array of { scaleId, root }
    filters: {
      difficulty: [],
      mood: [],
      type: []
    },
    perChordMode: false,
    selectedChordForScale: null // Index of chord in per-chord mode
  }
};

// Action types
const ActionTypes = {
  ADD_CHORD: 'ADD_CHORD',
  REMOVE_CHORD: 'REMOVE_CHORD',
  CLEAR_PROGRESSION: 'CLEAR_PROGRESSION',
  SET_ACTIVE_CHORD: 'SET_ACTIVE_CHORD',
  OPEN_NETWORK: 'OPEN_NETWORK',
  CLOSE_NETWORK: 'CLOSE_NETWORK',
  OPEN_SETTINGS: 'OPEN_SETTINGS',
  CLOSE_SETTINGS: 'CLOSE_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_DETECTED_KEY: 'SET_DETECTED_KEY',
  SET_MANUAL_KEY: 'SET_MANUAL_KEY',
  SET_NETWORK_FILTERS: 'SET_NETWORK_FILTERS',
  SET_SHOW_SCALES: 'SET_SHOW_SCALES',
  TOGGLE_SCALE: 'TOGGLE_SCALE',
  SET_SCALE_FILTERS: 'SET_SCALE_FILTERS',
  SET_PER_CHORD_MODE: 'SET_PER_CHORD_MODE',
  SET_SELECTED_CHORD_FOR_SCALE: 'SET_SELECTED_CHORD_FOR_SCALE',
  CLEAR_SELECTED_SCALES: 'CLEAR_SELECTED_SCALES'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_CHORD: {
      const newProgression = [...state.progression, action.payload];
      const newKey = state.settings.autoDetectKey
        ? detectKey(newProgression)
        : state.detectedKey;
      return {
        ...state,
        progression: newProgression,
        detectedKey: newKey,
        networkOpen: false,
        activeChordIndex: null
      };
    }

    case ActionTypes.REMOVE_CHORD: {
      const newProgression = state.progression.filter((_, i) => i !== action.payload);
      const newKey = state.settings.autoDetectKey && newProgression.length > 0
        ? detectKey(newProgression)
        : newProgression.length === 0
          ? { root: 'C', mode: 'major', confidence: 0 }
          : state.detectedKey;
      return {
        ...state,
        progression: newProgression,
        detectedKey: newKey
      };
    }

    case ActionTypes.CLEAR_PROGRESSION:
      return {
        ...state,
        progression: [],
        detectedKey: { root: 'C', mode: 'major', confidence: 0 },
        networkOpen: false,
        activeChordIndex: null
      };

    case ActionTypes.SET_ACTIVE_CHORD:
      return {
        ...state,
        activeChordIndex: action.payload
      };

    case ActionTypes.OPEN_NETWORK:
      return {
        ...state,
        networkOpen: true,
        activeChordIndex: action.payload.index,
        networkPosition: action.payload.position
      };

    case ActionTypes.CLOSE_NETWORK:
      return {
        ...state,
        networkOpen: false,
        activeChordIndex: null
      };

    case ActionTypes.OPEN_SETTINGS:
      return {
        ...state,
        settingsOpen: true
      };

    case ActionTypes.CLOSE_SETTINGS:
      return {
        ...state,
        settingsOpen: false
      };

    case ActionTypes.UPDATE_SETTINGS: {
      const newSettings = { ...state.settings, ...action.payload };
      let newKey = state.detectedKey;

      // Re-detect key if auto-detect was just enabled
      if (action.payload.autoDetectKey && !state.settings.autoDetectKey && state.progression.length > 0) {
        newKey = detectKey(state.progression);
      }

      return {
        ...state,
        settings: newSettings,
        detectedKey: newKey
      };
    }

    case ActionTypes.SET_DETECTED_KEY:
      return {
        ...state,
        detectedKey: action.payload
      };

    case ActionTypes.SET_MANUAL_KEY:
      return {
        ...state,
        detectedKey: action.payload,
        settings: {
          ...state.settings,
          autoDetectKey: false,
          manualKey: action.payload
        }
      };

    case ActionTypes.SET_NETWORK_FILTERS:
      return {
        ...state,
        networkFilters: action.payload
      };

    case ActionTypes.SET_SHOW_SCALES:
      return {
        ...state,
        scaleState: {
          ...state.scaleState,
          showScales: action.payload
        }
      };

    case ActionTypes.TOGGLE_SCALE: {
      const { scaleId, root } = action.payload;
      const existing = state.scaleState.selectedScales.find(
        s => s.scaleId === scaleId && s.root === root
      );
      const newSelectedScales = existing
        ? state.scaleState.selectedScales.filter(
            s => !(s.scaleId === scaleId && s.root === root)
          )
        : [...state.scaleState.selectedScales, { scaleId, root }];

      return {
        ...state,
        scaleState: {
          ...state.scaleState,
          selectedScales: newSelectedScales
        }
      };
    }

    case ActionTypes.SET_SCALE_FILTERS:
      return {
        ...state,
        scaleState: {
          ...state.scaleState,
          filters: action.payload
        }
      };

    case ActionTypes.SET_PER_CHORD_MODE:
      return {
        ...state,
        scaleState: {
          ...state.scaleState,
          perChordMode: action.payload,
          selectedChordForScale: action.payload ? 0 : null,
          selectedScales: [] // Clear when switching modes
        }
      };

    case ActionTypes.SET_SELECTED_CHORD_FOR_SCALE:
      return {
        ...state,
        scaleState: {
          ...state.scaleState,
          selectedChordForScale: action.payload
        }
      };

    case ActionTypes.CLEAR_SELECTED_SCALES:
      return {
        ...state,
        scaleState: {
          ...state.scaleState,
          selectedScales: []
        }
      };

    default:
      return state;
  }
}

// Context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const actions = useMemo(() => ({
    addChord: (chord) => dispatch({ type: ActionTypes.ADD_CHORD, payload: chord }),

    removeChord: (index) => dispatch({ type: ActionTypes.REMOVE_CHORD, payload: index }),

    clearProgression: () => dispatch({ type: ActionTypes.CLEAR_PROGRESSION }),

    setActiveChord: (index) => dispatch({ type: ActionTypes.SET_ACTIVE_CHORD, payload: index }),

    openNetwork: (index, position) => dispatch({
      type: ActionTypes.OPEN_NETWORK,
      payload: { index, position }
    }),

    closeNetwork: () => dispatch({ type: ActionTypes.CLOSE_NETWORK }),

    openSettings: () => dispatch({ type: ActionTypes.OPEN_SETTINGS }),

    closeSettings: () => dispatch({ type: ActionTypes.CLOSE_SETTINGS }),

    updateSettings: (settings) => dispatch({ type: ActionTypes.UPDATE_SETTINGS, payload: settings }),

    setDetectedKey: (key) => dispatch({ type: ActionTypes.SET_DETECTED_KEY, payload: key }),

    setManualKey: (key) => dispatch({ type: ActionTypes.SET_MANUAL_KEY, payload: key }),

    setNetworkFilters: (filters) => dispatch({ type: ActionTypes.SET_NETWORK_FILTERS, payload: filters }),

    setShowScales: (show) => dispatch({ type: ActionTypes.SET_SHOW_SCALES, payload: show }),

    toggleScale: (scaleId, root) => dispatch({ type: ActionTypes.TOGGLE_SCALE, payload: { scaleId, root } }),

    setScaleFilters: (filters) => dispatch({ type: ActionTypes.SET_SCALE_FILTERS, payload: filters }),

    setPerChordMode: (enabled) => dispatch({ type: ActionTypes.SET_PER_CHORD_MODE, payload: enabled }),

    setSelectedChordForScale: (index) => dispatch({ type: ActionTypes.SET_SELECTED_CHORD_FOR_SCALE, payload: index }),

    clearSelectedScales: () => dispatch({ type: ActionTypes.CLEAR_SELECTED_SCALES })
  }), []);

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Convenience hooks for specific state slices
export function useProgression() {
  const { state, actions } = useApp();
  return {
    progression: state.progression,
    addChord: actions.addChord,
    removeChord: actions.removeChord,
    clearProgression: actions.clearProgression
  };
}

export function useSettings() {
  const { state, actions } = useApp();
  return {
    settings: state.settings,
    updateSettings: actions.updateSettings,
    settingsOpen: state.settingsOpen,
    openSettings: actions.openSettings,
    closeSettings: actions.closeSettings
  };
}

export function useNetwork() {
  const { state, actions } = useApp();
  return {
    networkOpen: state.networkOpen,
    activeChordIndex: state.activeChordIndex,
    networkPosition: state.networkPosition,
    networkFilters: state.networkFilters,
    openNetwork: actions.openNetwork,
    closeNetwork: actions.closeNetwork,
    setNetworkFilters: actions.setNetworkFilters
  };
}

export function useKey() {
  const { state, actions } = useApp();
  return {
    detectedKey: state.detectedKey,
    setDetectedKey: actions.setDetectedKey,
    setManualKey: actions.setManualKey,
    autoDetectKey: state.settings.autoDetectKey
  };
}

export function useScales() {
  const { state, actions } = useApp();
  return {
    scaleState: state.scaleState,
    setShowScales: actions.setShowScales,
    toggleScale: actions.toggleScale,
    setScaleFilters: actions.setScaleFilters,
    setPerChordMode: actions.setPerChordMode,
    setSelectedChordForScale: actions.setSelectedChordForScale,
    clearSelectedScales: actions.clearSelectedScales
  };
}
