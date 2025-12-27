import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import FingeringDiagram from '../FingeringDiagram/FingeringDiagram';
import { CATEGORY_COLORS } from '../../utils/chordRelationships';

function NetworkNode({
  suggestion,
  angle,
  radius,
  delay,
  onSelect,
  onHover,
  onLeave,
  isHovered
}) {
  const { chord, category, reason } = suggestion;

  // Calculate position
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const color = CATEGORY_COLORS[category] || '#ffffff';

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onSelect(chord);
  }, [chord, onSelect]);

  return (
    <motion.g
      className="network-node"
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: 1,
        x,
        y
      }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
        delay
      }}
      style={{ cursor: 'pointer' }}
      onClick={handleClick}
      onMouseEnter={() => onHover(suggestion)}
      onMouseLeave={onLeave}
    >
      {/* Connection line to center */}
      <motion.line
        x1={0}
        y1={0}
        x2={-x}
        y2={-y}
        stroke={color}
        strokeWidth={1}
        strokeOpacity={0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay }}
      />

      {/* Node background */}
      <motion.circle
        r={isHovered ? 38 : 32}
        fill="rgba(26, 26, 36, 0.95)"
        stroke={color}
        strokeWidth={isHovered ? 2 : 1}
        filter={isHovered ? `drop-shadow(0 0 8px ${color})` : 'none'}
        transition={{ duration: 0.15 }}
      />

      {/* Chord symbol */}
      <text
        y={-6}
        textAnchor="middle"
        fill="white"
        fontSize={isHovered ? 14 : 12}
        fontWeight="600"
        fontFamily="Inter, sans-serif"
      >
        {chord.symbol}
      </text>

      {/* Category indicator */}
      <text
        y={10}
        textAnchor="middle"
        fill={color}
        fontSize={8}
        fontFamily="Inter, sans-serif"
        opacity={0.8}
      >
        {category}
      </text>
    </motion.g>
  );
}

export default React.memo(NetworkNode);
