interface LampProps {
  colorFrom: string;
  colorTo: string;
  glow: string;
  gradientId: string;
  className?: string;
}

export default function Lamp({ colorFrom, colorTo, glow, gradientId, className }: LampProps) {
  const beamId = `${gradientId}-beam`;
  const glowId = `${gradientId}-glow`;

  return (
    <svg
      className={className}
      viewBox="0 0 320 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorTo} />
          <stop offset="100%" stopColor={colorFrom} />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor={glow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={beamId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={glow} stopOpacity="0.35" />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="120" r="150" fill={`url(#${glowId})`} />

      <path d="M120 330 L200 330 L188 350 L132 350 Z" fill="#26242c" />
      <rect x="150" y="230" width="20" height="102" rx="6" fill="#302d38" />

      <path d="M92 210 C92 150 118 108 160 108 C202 108 228 150 228 210 Z" fill={`url(#${beamId})`} />

      <g>
        <rect x="70" y="60" width="180" height="96" rx="26" fill={`url(#${gradientId})`} />
        <rect x="70" y="60" width="180" height="96" rx="26" fill="#0b0b0f" fillOpacity="0.05" />
        <rect x="92" y="82" width="136" height="52" rx="14" fill="white" fillOpacity="0.18" />
      </g>

      <circle cx="160" cy="168" r="7" fill={glow} />
    </svg>
  );
}
