"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/session", label: "Post-Sesion" },
  { href: "/briefs/new", label: "Nuevo Guion" },
  { href: "/references", label: "Referencias" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex gap-4 text-sm">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`transition-colors ${
              isActive(pathname, href)
                ? "text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="md:hidden flex flex-col justify-center gap-1.5 w-8 h-8"
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <span
          className={`block h-0.5 w-full bg-zinc-400 transition-transform duration-200 ${
            open ? "translate-y-2 rotate-45" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-full bg-zinc-400 transition-opacity duration-200 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-full bg-zinc-400 transition-transform duration-200 ${
            open ? "-translate-y-2 -rotate-45" : ""
          }`}
        />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <nav className="md:hidden absolute left-0 top-full w-full border-b border-zinc-800 bg-zinc-950 px-6 py-4 flex flex-col gap-3 text-sm z-50">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`transition-colors ${
                isActive(pathname, href)
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
