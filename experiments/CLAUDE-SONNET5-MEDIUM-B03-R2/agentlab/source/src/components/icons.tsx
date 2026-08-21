import type { ReactElement } from 'react';
import type { Feature } from '../data/features';

type IconProps = { className?: string };

function Sun({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="8" fill="currentColor" />
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 20 + Math.cos(angle) * 13;
        const y1 = 20 + Math.sin(angle) * 13;
        const x2 = 20 + Math.cos(angle) * 18;
        const y2 = 20 + Math.sin(angle) * 18;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function Motion({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="14" r="6" fill="currentColor" />
      <path
        d="M8 34c1-8 6-13 12-13s11 5 12 13"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M4 22c3-2 6-2 8 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M36 22c-3-2-6-2-8 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function Wave({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.65" />
      <circle cx="20" cy="20" r="4" fill="currentColor" />
    </svg>
  );
}

function App({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <rect x="10" y="4" width="20" height="32" rx="4" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="20" cy="30" r="1.6" fill="currentColor" />
      <path d="M15 12h10M15 17h10M15 22h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Eye({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path
        d="M4 20c4-7 10-11 16-11s12 4 16 11c-4 7-10 11-16 11S8 27 4 20Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="20" cy="20" r="5" fill="currentColor" />
    </svg>
  );
}

function Leaf({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path
        d="M10 32C6 20 12 8 30 6c2 18-8 26-20 26Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M10 32c4-8 10-14 18-20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const ICONS: Record<Feature['icon'], (props: IconProps) => ReactElement> = {
  sun: Sun,
  motion: Motion,
  wave: Wave,
  app: App,
  eye: Eye,
  leaf: Leaf,
};

export function FeatureIcon({ icon, className }: { icon: Feature['icon']; className?: string }) {
  const Component = ICONS[icon];
  return <Component className={className} />;
}
