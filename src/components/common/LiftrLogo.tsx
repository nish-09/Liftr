import React from "react";

const MONOGRAM_PATH_RIGHT =
  "M 62.5 156 L 169 156 L 182.5 121 L 121 121 L 94 130.5 L 114 109 L 157 0 L 102 0 L 88.5 34 L 109.5 34 Z";

const MONOGRAM_PATH_LEFT =
  "M 0 156 L 48.5 156 L 90.5 48 L 54.5 48 L 41.5 83 L 59.5 83 L 45.5 120 L 43.5 120 L 43.5 95.5 L 23 95.5 Z";

const WORDMARK_PATHS = [
  // L
  "M 239 135.5 L 239 21 L 270.5 21 L 270.5 101 L 260 107.5 L 258.5 110 L 319 110 L 309 135.5 Z",
  // I
  "M 329.5 135.5 L 329.5 21 L 360.5 21 L 360.5 135.5 Z",
  // F
  "M 377.5 135.5 L 377.5 21 L 461.5 21 L 451 46 L 393.5 46 L 408.5 56 L 408.5 70 L 450.5 70 L 441 95 L 408.5 95 L 408.5 135.5 Z",
  // T
  "M 496 135.5 L 496 46 L 463.5 46 L 474 21 L 561.5 21 L 552 46 L 512.5 46 L 527.5 56 L 527.5 135.5 Z",
  // R (outer + counter hole with evenodd fillRule)
  "M 571.5 135.5 L 571.5 21 L 638 21 L 651 24.5 L 658.5 31 L 663.5 38 L 666.5 48 L 666.5 71 L 663.5 81 L 656 90.5 L 648.5 96 L 671 135.5 L 637 135.5 L 616 98.5 L 603 98.5 L 602.5 135.5 Z M 602.5 75.5 L 628 75 L 634.5 70 L 635.5 67 L 635.5 53 L 631 46.5 L 587.5 46 L 602.5 56 Z",
];

interface LiftrMarkProps {
  className?: string;
  color?: string;
}

/**
 * Standalone Liftr monogram icon mark.
 */
export function LiftrMark({ className = "w-8 h-8", color = "#142746" }: LiftrMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 183 157"
      fill="none"
      aria-label="Liftr Mark"
      className={className}
    >
      <path d={MONOGRAM_PATH_RIGHT} fill={color} />
      <path d={MONOGRAM_PATH_LEFT} fill={color} />
    </svg>
  );
}

interface LiftrLogoProps {
  className?: string;
  symbolColor?: string;
  textColor?: string;
}

/**
 * Full horizontal Liftr brand lockup (monogram + custom notched geometric wordmark).
 */
export function LiftrLogo({
  className = "h-9 w-auto",
  symbolColor = "#142746",
  textColor = "#142746",
}: LiftrLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 672 157"
      fill="none"
      role="img"
      aria-label="LIFTR"
      className={className}
    >
      <path d={MONOGRAM_PATH_RIGHT} fill={symbolColor} />
      <path d={MONOGRAM_PATH_LEFT} fill={symbolColor} />
      {WORDMARK_PATHS.map((d, idx) => (
        <path key={idx} d={d} fill={textColor} fillRule="evenodd" clipRule="evenodd" />
      ))}
    </svg>
  );
}
