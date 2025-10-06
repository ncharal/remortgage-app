"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "px-2 py-1 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-100",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-6xl flex items-center justify-between p-3 md:p-4">
        {/* --- Logo + Brand --- */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.svg"
            alt="Remortgage Comparator Logo"
            width={32}
            height={32}
            priority
          />
          <span className="font-semibold text-base md:text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
            Remortgage Options Calculator
          </span>
        </Link>

        {/* --- Navigation --- */}
        <nav className="hidden sm:flex items-center gap-2">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/contact">Contact</NavLink>
          <NavLink href="/privacy">Privacy</NavLink>
        </nav>

        {/* --- Mobile Nav (simple emoji shortcuts) --- */}
        <nav className="sm:hidden flex gap-2 text-sm">
          <NavLink href="/">🏠</NavLink>
          <NavLink href="/contact">📩</NavLink>
          <NavLink href="/privacy">🔒</NavLink>
        </nav>
      </div>
    </header>
  );
}
