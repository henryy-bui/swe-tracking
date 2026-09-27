import type { SVGProps } from 'react';

/* Hand-drawn stroke icons in the Lucide style: 24px grid, 1.75px stroke, round caps, currentColor.
   Decorative by default (aria-hidden); pass a `title` for a standalone meaningful icon. */

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  size?: number;
  title?: string;
  filled?: boolean;
}

const make = (name: string, paths: string[]) => {
  const Icon = ({ size = 18, title, filled, className, ...rest }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon icon-${name}${className ? ' ' + className : ''}`}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title && <title>{title}</title>}
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
  Icon.displayName = `Icon${name}`;
  return Icon;
};

export const LayoutDashboard = make('layout', ['M3 4a1 1 0 0 1 1-1h5v9H4a1 1 0 0 1-1-1V4Z', 'M13 3h7a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-7V3Z', 'M13 12h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-7v-9Z', 'M3 16h6v5H4a1 1 0 0 1-1-1v-4Z']);
export const ListChecks = make('list-checks', ['m3 7 2 2 4-4', 'm3 17 2 2 4-4', 'M13 6h8', 'M13 12h8', 'M13 18h8']);
export const Clock = make('clock', ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2']);
export const Flag = make('flag', ['M5 21V4', 'M5 4h12l-2 4 2 4H5']);
export const Braces = make('braces', ['M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1', 'M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1']);
export const FolderKanban = make('folder-kanban', ['M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6Z', 'M8 10v6', 'M12 10v3', 'M16 10v5']);
export const BookOpen = make('book-open', ['M12 7v14', 'M3 5h6a3 3 0 0 1 3 3 3 3 0 0 1 3-3h6v13h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3H3V5Z']);
export const Settings = make('settings', ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z']);
export const Sun = make('sun', ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 2v2', 'M12 20v2', 'm4.9 4.9 1.4 1.4', 'm17.7 17.7 1.4 1.4', 'M2 12h2', 'M20 12h2', 'm6.3 17.7-1.4 1.4', 'm19.1 4.9-1.4 1.4']);
export const Moon = make('moon', ['M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z']);
export const Monitor = make('monitor', ['M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z', 'M8 21h8', 'M12 16v5']);
export const Play = make('play', ['M7 4.5v15l12-7.5-12-7.5Z']);
export const Square = make('square', ['M5 5h14v14H5z']);
export const Check = make('check', ['m4 12.5 5 5L20 6.5']);
export const CircleDot = make('circle-dot', ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z']);
export const Circle = make('circle', ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z']);
export const Minus = make('minus', ['M5 12h14']);
export const X = make('x', ['M18 6 6 18', 'm6 6 12 12']);
export const AlertTriangle = make('alert-triangle', ['m10.3 3.9-8.1 14A2 2 0 0 0 3.9 21h16.2a2 2 0 0 0 1.7-3.1l-8.1-14a2 2 0 0 0-3.4 0Z', 'M12 9v4', 'M12 17h.01']);
export const RefreshCw = make('refresh', ['M21 12a9 9 0 0 1-15.5 6.2L3 16', 'M3 21v-5h5', 'M3 12a9 9 0 0 1 15.5-6.2L21 8', 'M21 3v5h-5']);
export const Cloud = make('cloud', ['M17.5 19a4.5 4.5 0 0 0 .5-9 7 7 0 0 0-13.4 2A4 4 0 0 0 6 19h11.5Z']);
export const CloudOff = make('cloud-off', ['m2 2 20 20', 'M5.8 5.8A7 7 0 0 0 4.6 12 4 4 0 0 0 6 19h11', 'M9.6 4.2A7 7 0 0 1 18 10a4.5 4.5 0 0 1 2.6 7.6']);
export const ChevronLeft = make('chevron-left', ['m15 6-6 6 6 6']);
export const ChevronRight = make('chevron-right', ['m9 6 6 6-6 6']);
export const Star = make('star', ['m12 3 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.4l-5.7 3.1 1.2-6.4L2.8 9.7l6.4-.8L12 3Z']);
export const TrendingUp = make('trending-up', ['m3 17 6-6 4 4 8-8', 'M14 7h7v7']);
export const TrendingDown = make('trending-down', ['m3 7 6 6 4-4 8 8', 'M14 17h7v-7']);
export const Target = make('target', ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z', 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z']);
export const Menu = make('menu', ['M4 7h16', 'M4 12h16', 'M4 17h16']);
export const CalendarCheck = make('calendar-check', ['M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z', 'M16 2v4', 'M8 2v4', 'M4 10h16', 'm9 15 2 2 4-4']);
export const Search = make('search', ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm20 20-4-4']);
export const Trophy = make('trophy', ['M8 21h8', 'M12 17v4', 'M7 4h10v5a5 5 0 0 1-10 0V4Z', 'M7 6H4v2a3 3 0 0 0 3 3', 'M17 6h3v2a3 3 0 0 1-3 3']);
export const Copy = make('copy', ['M9 9h10v11H9z', 'M5 15V4h10']);
export const Download = make('download', ['M12 4v11', 'm7 10 5 5 5-5', 'M4 19h16']);
export const FileText = make('file-text', ['M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5Z', 'M14 3v5h5', 'M9 13h6', 'M9 17h6']);
export const ExternalLink = make('external-link', ['M14 4h6v6', 'M20 4 10 14', 'M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6']);
