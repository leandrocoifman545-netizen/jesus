"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/briefs/new", label: "Nuevo Guion" },
  { href: "/references", label: "Referencias" },
  { href: "/session", label: "Post-Sesion" },
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
      <nav className="hidden md:flex gap-1 text-sm">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`font-medium rounded-xl px-3 py-1.5 transition-colors ${
              isActive(pathname, href)
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
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
        <nav className="md:hidden absolute left-0 top-full w-full border-b border-white/[0.06] backdrop-blur-xl bg-zinc-950/95 px-6 py-4 flex flex-col gap-1 text-sm z-50">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`font-medium rounded-xl px-3 py-2 transition-colors ${
                isActive(pathname, href)
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
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
