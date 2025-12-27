import React from 'react';
import { motion } from 'framer-motion';
import { scaleDefinitions } from '../../data/scaleData';
import { getScaleExplanation } from '../../utils/scaleUtils';

function ScaleInfo({ scale, scaleId, root, chords, detectedKey }) {
  if (!scale) return null;

  const explanation = getScaleExplanation(scaleId, root, chords, detectedKey);
  const relatedScales = scale.relatedScales || [];

  return (
    <motion.div
      className="scale-info"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="info-section">
        <h4 className="info-label">Why this scale works:</h4>
        <p className="info-text">{explanation}</p>
      </div>

      <div className="info-section">
        <h4 className="info-label">Practice tip:</h4>
        <p className="info-text">{scale.practiceTip}</p>
      </div>

      <div className="info-row">
        <div className="info-section">
          <h4 className="info-label">Intervals:</h4>
          <p className="info-text intervals">{scale.degrees.join(' - ')}</p>
        </div>

        {relatedScales.length > 0 && (
          <div className="info-section">
            <h4 className="info-label">Related scales:</h4>
            <p className="info-text related">
              {relatedScales.map(id => scaleDefinitions[id]?.name).filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </div>

      <div className="info-section">
        <h4 className="info-label">Character:</h4>
        <div className="mood-tags">
          {scale.moods.map(mood => (
            <span key={mood} className="mood-tag">{mood}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default ScaleInfo;
