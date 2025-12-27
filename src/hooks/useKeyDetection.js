import { useMemo } from 'react';
import { detectKey } from '../utils/musicTheory';
import { useApp } from '../context/AppContext';

export function useKeyDetection() {
  const { state, actions } = useApp();
  const { progression, detectedKey, settings } = state;

  const keyInfo = useMemo(() => {
    if (!settings.autoDetectKey && settings.manualKey) {
      return settings.manualKey;
    }

    if (progression.length === 0) {
      return { root: 'C', mode: 'major', confidence: 0 };
    }

    return detectKey(progression);
  }, [progression, settings.autoDetectKey, settings.manualKey]);

  return {
    key: keyInfo,
    setManualKey: actions.setManualKey,
    isAutoDetect: settings.autoDetectKey
  };
}

export default useKeyDetection;
