"use client";

export default function OpenCookieSettingsButton({
  className = "underline",
  children = "Cookie settings",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => (window as any).openCookieSettings?.()}
      className={className}
    >
      {children}
    </button>
  );
}
