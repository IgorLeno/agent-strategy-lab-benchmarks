import type { JSX } from 'react';

interface IconProps {
  className?: string;
}

const shared = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true as const,
  focusable: false as const,
};

export function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
    </svg>
  );
}

export function PaletteIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 1.3-3.1 1.8 1.8 0 0 1 1.3-3.1H17a3 3 0 0 0 3-3c0-4.9-3.8-8.8-8-8.8Z" />
      <circle cx="7.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RadarIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <path d="M12 12 L18 7" />
    </svg>
  );
}

export function TargetIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AppIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.4" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

export function WaveIcon({ className }: IconProps) {
  return (
    <svg className={className} {...shared}>
      <path d="M2.5 12c1.6 0 1.6-4 3.2-4s1.6 4 3.2 4 1.6-4 3.2-4 1.6 4 3.2 4 1.6-4 3.2-4 1.6 4 3.2 4" />
    </svg>
  );
}

export const featureIcons: Record<string, (props: IconProps) => JSX.Element> = {
  sun: SunIcon,
  palette: PaletteIcon,
  radar: RadarIcon,
  target: TargetIcon,
  app: AppIcon,
  wave: WaveIcon,
};
