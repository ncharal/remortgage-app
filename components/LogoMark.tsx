"use client";

export default function LogoMark({
  className = "h-7 w-7",
}: {
  className?: string;
}) {
  // A simple “house & chart” motif. You can replace with your own paths.
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <rect x="4" y="8" width="40" height="32" rx="8" className="fill-current opacity-10" />
      <path
        d="M10 30c4-6 8-9 12-6 3 2 6-2 8-6 3-6 7-6 8 0"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 34h-4a2 2 0 0 1-2-2v-8m28 0v10a2 2 0 0 1-2 2h-8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-80"
      />
    </svg>
  );
}
