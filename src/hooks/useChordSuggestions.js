import { useMemo } from 'react';
import { getChordSuggestions, getEndingSuggestions, organizeSuggestionsIntoRings } from '../utils/chordRelationships';
import { useApp } from '../context/AppContext';

export function useChordSuggestions(chord) {
  const { state } = useApp();
  const { detectedKey, settings, networkFilters } = state;

  const allSuggestions = useMemo(() => {
    if (!chord) return [];
    return getChordSuggestions(chord, detectedKey, settings.theoryLevel);
  }, [chord, detectedKey, settings.theoryLevel]);

  const endingSuggestions = useMemo(() => {
    return getEndingSuggestions(state.progression, detectedKey);
  }, [state.progression, detectedKey]);

  const filteredSuggestions = useMemo(() => {
    if (networkFilters.includes('all')) {
      return allSuggestions;
    }

    return allSuggestions.filter(s => {
      // Check category filters
      if (networkFilters.includes(s.category)) return true;

      // Check mood filters
      if (networkFilters.includes('bright')) {
        const brightMoods = ['happy', 'energetic', 'peaceful', 'romantic'];
        return s.chord.categories?.moods?.some(m => brightMoods.includes(m));
      }

      if (networkFilters.includes('dark')) {
        const darkMoods = ['sad', 'mysterious', 'tense'];
        return s.chord.categories?.moods?.some(m => darkMoods.includes(m));
      }

      return false;
    });
  }, [allSuggestions, networkFilters]);

  const organizedSuggestions = useMemo(() => {
    return organizeSuggestionsIntoRings(filteredSuggestions);
  }, [filteredSuggestions]);

  return {
    suggestions: filteredSuggestions,
    organizedSuggestions,
    endingSuggestions,
    allSuggestions
  };
}

export default useChordSuggestions;
