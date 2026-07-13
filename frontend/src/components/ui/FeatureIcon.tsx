import type { SVGProps } from 'react';

export type FeatureIconName =
  | 'clipboard-check'
  | 'users'
  | 'award'
  | 'book-open'
  | 'users-group'
  | 'graduation'
  | 'tag'
  | 'credit-card'
  | 'shield-check'
  | 'clock'
  | 'building'
  | 'mail'
  | 'list'
  | 'info'
  | 'percent';

interface FeatureIconProps extends SVGProps<SVGSVGElement> {
  name: FeatureIconName;
  size?: number;
}

function IconPath({ name }: { name: FeatureIconName }) {
  switch (name) {
    case 'clipboard-check':
      return (
        <>
          <path d="M9 4h6v2h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2V4z" />
          <path d="M9 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2H9V4z" />
          <path d="m9 13 2 2 4-4" />
        </>
      );
    case 'users':
      return (
        <>
          <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
          <circle cx="10" cy="8" r="3" />
          <path d="M20 19v-1a3 3 0 0 0-2-2.83" />
          <path d="M16 4.17a3 3 0 0 1 0 5.66" />
        </>
      );
    case 'award':
      return (
        <>
          <circle cx="12" cy="9" r="4" />
          <path d="M8.5 14.5 7 21l5-2.5L17 21l-1.5-6.5" />
        </>
      );
    case 'book-open':
      return (
        <>
          <path d="M12 6.5V19" />
          <path d="M6 8.5c0-1.1.9-2 2-2h2v12.5H8a2 2 0 0 1-2-2V8.5z" />
          <path d="M18 8.5c0-1.1-.9-2-2-2h-2v12.5h2a2 2 0 0 0 2-2V8.5z" />
        </>
      );
    case 'users-group':
      return (
        <>
          <path d="M17 19v-1a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v1" />
          <circle cx="10.5" cy="8" r="2.5" />
          <path d="M20 19v-1a2.5 2.5 0 0 0-2-2.45" />
          <path d="M15.5 5.55a2.5 2.5 0 0 1 0 4.9" />
        </>
      );
    case 'graduation':
      return (
        <>
          <path d="M3 9.5 12 5l9 4.5-9 4.5-9-4.5z" />
          <path d="M6 12.5V16a6 6 0 0 0 12 0v-3.5" />
          <path d="M21 10v5" />
        </>
      );
    case 'tag':
      return (
        <>
          <path d="M20 12 12 20l-8-8V4h8l8 8z" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
        </>
      );
    case 'credit-card':
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        </>
      );
    case 'shield-check':
      return (
        <>
          <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3z" />
          <path d="m9 12 2 2 4-4" />
        </>
      );
    case 'clock':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </>
      );
    case 'building':
      return (
        <>
          <path d="M4 20V8l8-4 8 4v12" />
          <path d="M9 20v-6h6v6" />
          <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
        </>
      );
    case 'mail':
      return (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="m3 8 9 6 9-6" />
        </>
      );
    case 'list':
      return (
        <>
          <path d="M9 6h12M9 12h12M9 18h12" />
          <circle cx="5" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="5" cy="18" r="1" fill="currentColor" stroke="none" />
        </>
      );
    case 'info':
      return (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 11v5" />
          <circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" />
        </>
      );
    case 'percent':
      return (
        <>
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <path d="m19 5-14 14" />
        </>
      );
  }
}

export function FeatureIcon({ name, size = 20, className, ...props }: FeatureIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <IconPath name={name} />
    </svg>
  );
}
