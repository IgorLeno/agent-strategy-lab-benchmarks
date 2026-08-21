// Small inline icon set. All decorative — hidden from assistive tech via
// aria-hidden and focusable="false" so screen readers skip straight to the
// adjacent text label.

import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}

const wrap = (children: ReactNode, className?: string) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

export function SpectrumIcon({ className }: IconProps) {
  return wrap(
    <>
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16 5a11 11 0 0 1 0 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="4" fill="currentColor" />
    </>,
    className,
  );
}

export function PresenceIcon({ className }: IconProps) {
  return wrap(
    <>
      <circle cx="16" cy="11" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7 26c0-5 4-8.5 9-8.5s9 3.5 9 8.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 9c1.6 1.6 1.6 5.4 0 7M27 6c3 3 3 11 0 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </>,
    className,
  );
}

export function PaletteIcon({ className }: IconProps) {
  return wrap(
    <>
      <path
        d="M16 6a10.5 10.5 0 1 0 0 21c1.4 0 2.4-1.1 2.1-2.4-.2-.9.4-1.8 1.3-1.8h1.9A5.7 5.7 0 0 0 27 17.1C27 10.9 22.1 6 16 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="14" r="1.6" fill="currentColor" />
      <circle cx="17" cy="11.5" r="1.6" fill="currentColor" />
      <circle cx="21.5" cy="15" r="1.6" fill="currentColor" />
      <circle cx="13" cy="20" r="1.6" fill="currentColor" />
    </>,
    className,
  );
}

export function AppIcon({ className }: IconProps) {
  return wrap(
    <>
      <rect x="9" y="4" width="14" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
      <line x1="9" y1="22" x2="23" y2="22" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="25" r="1.4" fill="currentColor" />
    </>,
    className,
  );
}

export function QuietIcon({ className }: IconProps) {
  return wrap(
    <>
      <path d="M6 13v6h4l6 5V8l-6 5H6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M22 12c1.8 1.1 1.8 6.8 0 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M25 9c3.3 2 3.3 12 0 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>,
    className,
  );
}

export function CableIcon({ className }: IconProps) {
  return wrap(
    <>
      <path
        d="M8 8c-3 3-3 8 0 11l3 3c3 3 8 3 11 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M13 6l3 3-6 6-3-3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M19 12l3 3-6 6-3-3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </>,
    className,
  );
}

export function SunIcon({ className }: IconProps) {
  return wrap(
    <>
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="3" x2="16" y2="7" />
        <line x1="16" y1="25" x2="16" y2="29" />
        <line x1="3" y1="16" x2="7" y2="16" />
        <line x1="25" y1="16" x2="29" y2="16" />
        <line x1="6.5" y1="6.5" x2="9.2" y2="9.2" />
        <line x1="22.8" y1="22.8" x2="25.5" y2="25.5" />
        <line x1="6.5" y1="25.5" x2="9.2" y2="22.8" />
        <line x1="22.8" y1="9.2" x2="25.5" y2="6.5" />
      </g>
    </>,
    className,
  );
}

export function FocusIcon({ className }: IconProps) {
  return wrap(
    <>
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="4.5" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="24" x2="16" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>,
    className,
  );
}

export function EveningIcon({ className }: IconProps) {
  return wrap(
    <>
      <path
        d="M8 17a8 8 0 0 0 12 6.9A9.5 9.5 0 0 1 15.5 6 8 8 0 0 0 8 17Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="4" y1="26" x2="26" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>,
    className,
  );
}

export function NightIcon({ className }: IconProps) {
  return wrap(
    <>
      <path
        d="M9 17a9 9 0 0 0 13.5 7.8A10.5 10.5 0 0 1 16 5.5 9 9 0 0 0 9 17Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="9" r="1.2" fill="currentColor" />
      <circle cx="27" cy="14" r="0.9" fill="currentColor" />
      <circle cx="21" cy="6" r="0.9" fill="currentColor" />
    </>,
    className,
  );
}

export function ChevronIcon({ className }: IconProps) {
  return wrap(
    <path
      d="M9 12l7 7 7-7"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    className,
  );
}

export function CheckIcon({ className }: IconProps) {
  return wrap(
    <path
      d="M7 16.5l6 6 12-13"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    className,
  );
}
