const PATHS = {
  calendar: "M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zM8 13h3v3H8z",
  split: "M12 3v18M5 8h5a2 2 0 010 4H7a2 2 0 000 4h5M14 8h5M14 16h5",
  map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14",
  meal: "M4 11h16a8 8 0 01-16 0zM12 3v3M8 4v2M16 4v2M3 21h18",
  list: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  quote: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  check: "M4 12l5 5L20 6",
  pay: "M3 7h18v10H3zM3 11h18M7 15h3",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1",
  bed: "M3 18V8M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5M7 11.5a1.5 1.5 0 100-.01",
  pack: "M6 8h12l-1 12H7zM9 8V6a3 3 0 016 0v2",
};
export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
