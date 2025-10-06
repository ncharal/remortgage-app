"use client";

export default function SiteFooter() {
  return (
    <footer className="border-t mt-10 py-6 text-sm text-center text-muted-foreground">
      <p>
        <a href="/privacy" className="underline mx-2">Privacy Policy</a>
        |
        <a href="/contact" className="underline mx-2">Contact</a>
        |
        <button
          onClick={() => (window as any).openCookieSettings?.()}
          className="underline mx-2"
        >
          Cookie settings
        </button>
      </p>
      <p className="mt-2 text-xs text-gray-500">
        © {new Date().getFullYear()} Remortgage Options Calculator — All rights reserved.
      </p>
    </footer>
  );
}
