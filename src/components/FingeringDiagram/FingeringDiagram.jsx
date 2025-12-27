import React, { useMemo } from 'react';
import './FingeringDiagram.css';

const SIZES = {
  small: { width: 50, fretHeight: 12, stringSpacing: 8, dotSize: 6, fontSize: 8 },
  medium: { width: 70, fretHeight: 16, stringSpacing: 11, dotSize: 9, fontSize: 10 },
  large: { width: 100, fretHeight: 22, stringSpacing: 16, dotSize: 12, fontSize: 13 }
};

function FingeringDiagram({
  frets = [],
  fingers = [],
  barre = null,
  position = 1,
  showFingerNumbers = true,
  size = 'medium'
}) {
  const config = SIZES[size] || SIZES.medium;
  const { width, fretHeight, stringSpacing, dotSize, fontSize } = config;

  // Calculate diagram dimensions based on chord
  const diagramInfo = useMemo(() => {
    const playedFrets = frets.filter(f => f > 0);
    if (playedFrets.length === 0) {
      return { minFret: 0, maxFret: 4, numFrets: 4, startFret: 1 };
    }

    const minFret = Math.min(...playedFrets);
    const maxFret = Math.max(...playedFrets);
    const range = maxFret - minFret;

    // At least 4 frets, but show more if needed
    const numFrets = Math.max(4, range + 1);

    // If all frets are within first 4, show from fret 1
    // Otherwise, start from the minimum fret
    const startFret = maxFret <= 4 ? 1 : minFret;

    return { minFret, maxFret, numFrets, startFret };
  }, [frets]);

  const { numFrets, startFret } = diagramInfo;
  const showNut = startFret === 1;

  // Calculate total height
  const topMargin = 20; // For open/muted indicators
  const bottomMargin = 10;
  const totalHeight = topMargin + (numFrets * fretHeight) + bottomMargin;

  // Calculate string positions (low E on left, high E on right when viewed)
  // But in fingering diagrams, low E is typically on left
  const stringPositions = Array.from({ length: 6 }, (_, i) => {
    return 10 + (5 - i) * stringSpacing; // Reversed: 5,4,3,2,1,0
  });

  // Render open/muted string indicators
  const renderStringIndicators = () => {
    return frets.map((fret, stringIndex) => {
      const x = stringPositions[5 - stringIndex]; // Reverse for display

      if (fret === -1) {
        // Muted string
        return (
          <text
            key={`ind-${stringIndex}`}
            x={x}
            y={14}
            className="string-indicator muted"
            fontSize={fontSize}
          >
            ×
          </text>
        );
      } else if (fret === 0) {
        // Open string
        return (
          <circle
            key={`ind-${stringIndex}`}
            cx={x}
            cy={10}
            r={dotSize / 2.5}
            className="string-indicator open"
          />
        );
      }
      return null;
    });
  };

  // Render fret lines
  const renderFrets = () => {
    const fretLines = [];
    for (let i = 0; i <= numFrets; i++) {
      const y = topMargin + (i * fretHeight);
      const isNut = i === 0 && showNut;
      fretLines.push(
        <line
          key={`fret-${i}`}
          x1={stringPositions[0]}
          y1={y}
          x2={stringPositions[5]}
          y2={y}
          className={isNut ? 'nut' : 'fret'}
          strokeWidth={isNut ? 3 : 1}
        />
      );
    }
    return fretLines;
  };

  // Render strings
  const renderStrings = () => {
    return stringPositions.map((x, i) => (
      <line
        key={`string-${i}`}
        x1={x}
        y1={topMargin}
        x2={x}
        y2={topMargin + (numFrets * fretHeight)}
        className="string"
      />
    ));
  };

  // Render finger positions
  const renderFingerDots = () => {
    return frets.map((fret, stringIndex) => {
      if (fret <= 0) return null;

      // Calculate position relative to startFret
      const relativeFret = fret - startFret + 1;
      if (relativeFret < 1 || relativeFret > numFrets) return null;

      const x = stringPositions[5 - stringIndex]; // Reverse for display
      const y = topMargin + ((relativeFret - 0.5) * fretHeight);
      const finger = fingers[stringIndex];

      // Skip if this position is covered by barre
      if (barre && stringIndex >= barre.fromString && stringIndex <= barre.toString && fret === barre.fret) {
        return null;
      }

      return (
        <g key={`dot-${stringIndex}`}>
          <circle
            cx={x}
            cy={y}
            r={dotSize / 2}
            className="finger-dot"
          />
          {showFingerNumbers && finger > 0 && (
            <text
              x={x}
              y={y + (fontSize / 3.5)}
              className="finger-number"
              fontSize={fontSize - 1}
            >
              {finger}
            </text>
          )}
        </g>
      );
    });
  };

  // Render barre
  const renderBarre = () => {
    if (!barre) return null;

    const relativeFret = barre.fret - startFret + 1;
    if (relativeFret < 1 || relativeFret > numFrets) return null;

    const y = topMargin + ((relativeFret - 0.5) * fretHeight);
    const x1 = stringPositions[5 - barre.toString];
    const x2 = stringPositions[5 - barre.fromString];

    return (
      <g className="barre">
        <rect
          x={Math.min(x1, x2) - dotSize / 2}
          y={y - dotSize / 2.5}
          width={Math.abs(x2 - x1) + dotSize}
          height={dotSize / 1.2}
          rx={dotSize / 2.5}
          className="barre-rect"
        />
        {showFingerNumbers && (
          <text
            x={Math.min(x1, x2) + Math.abs(x2 - x1) / 2}
            y={y + fontSize / 4}
            className="finger-number barre-number"
            fontSize={fontSize - 1}
          >
            1
          </text>
        )}
      </g>
    );
  };

  // Render position marker (when not starting at fret 1)
  const renderPositionMarker = () => {
    if (showNut) return null;

    return (
      <text
        x={2}
        y={topMargin + fretHeight / 2 + fontSize / 3}
        className="position-marker"
        fontSize={fontSize - 1}
      >
        {startFret}
      </text>
    );
  };

  return (
    <svg
      className={`fingering-diagram size-${size}`}
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
    >
      {renderFrets()}
      {renderStrings()}
      {renderStringIndicators()}
      {renderBarre()}
      {renderFingerDots()}
      {renderPositionMarker()}
    </svg>
  );
}

export default React.memo(FingeringDiagram);
