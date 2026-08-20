import type { ReactElement } from 'react';
import type { Feature } from '../data/content';

type IconProps = { className?: string };

function SunIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <circle cx="24" cy="24" r="9" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="24"
          y1="6"
          x2="24"
          y2="12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
    </svg>
  );
}

function PaletteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M24 6C13.5 6 6 13.8 6 23c0 6.5 4.4 9.5 8.4 9.5 1.9 0 2.9-1 2.9-2.4 0-1.2-.8-2-.8-3.6 0-2.4 2.1-4.4 5.5-4.4 8 0 12-4 12-10.4C34 8.9 29.9 6 24 6Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M24 6C13.5 6 6 13.8 6 23c0 6.5 4.4 9.5 8.4 9.5 1.9 0 2.9-1 2.9-2.4 0-1.2-.8-2-.8-3.6 0-2.4 2.1-4.4 5.5-4.4 8 0 12-4 12-10.4C34 8.9 29.9 6 24 6Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <circle cx="16" cy="19" r="2.4" fill="currentColor" />
      <circle cx="24" cy="14" r="2.4" fill="currentColor" />
      <circle cx="30" cy="19" r="2.4" fill="currentColor" />
      <circle cx="17" cy="27" r="2.4" fill="currentColor" />
    </svg>
  );
}

function PresenceIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <circle cx="24" cy="16" r="6" fill="currentColor" />
      <path d="M12 38c1.2-8 6-11.5 12-11.5S34.8 30 36 38" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 24c0-4 2-7 4-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      <path d="M42 24c0-4-2-7-4-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
      <path d="M4 18c0-6 3-10.5 6-13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.3" />
      <path d="M44 18c0-6-3-10.5-6-13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

function AppIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
      <rect x="12" y="4" width="24" height="40" rx="5" stroke="currentColor" strokeWidth="2.2" />
      <line x1="20" y1="38" x2="28" y2="38" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="24" cy="19" r="6" fill="currentColor" opacity="0.2" />
      <circle cx="24" cy="19" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="M24 15v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS: Record<Feature['icon'], (props: IconProps) => ReactElement> = {
  sun: SunIcon,
  palette: PaletteIcon,
  presence: PresenceIcon,
  app: AppIcon,
};

export function FeatureIcon({ icon, className }: { icon: Feature['icon']; className?: string }) {
  const Component = ICONS[icon];
  return <Component className={className} />;
}

export function ChevronIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M4 12.5l5 5L20 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
