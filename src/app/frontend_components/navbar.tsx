// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const pathname = usePathname();

  const items = [
    { href: "/view_reviews", label: "Reviews", icon: "💬" },
    { href: "/", label: "Home", icon: "🏠", center: true }, // centered button
    { href: "/companies_list", label: "Companies", icon: "🏢" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav
      className={`fixed bottom-3 left-1/2 -translate-x-1/2 z-50
        w-[92vw] sm:w-[520px] max-w-md ${className}`}
    >
      <div
        className="flex items-center justify-center gap-x-5 sm:gap-x-8 bg-base-100/90 backdrop-blur 
                   border border-base-200 rounded-2xl shadow-lg px-6 py-3"
      >
        {items.map(({ href, label, icon, center }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex flex-col items-center justify-center gap-1 transition-all duration-150 rounded-xl px-3 py-1",
                "hover:bg-base-200/70",
                active
                  ? "text-primary font-semibold bg-base-200/70"
                  : "text-base-content/70 hover:text-primary",
                center ? "scale-110 -translate-y-2 shadow-md" : "",
              ].join(" ")}
            >
              <span
                className={`text-xl sm:text-2xl ${
                  center ? "text-3xl sm:text-4xl" : ""
                }`}
              >
                {icon}
              </span>
              <span
                className={`text-[0.7rem] sm:text-xs ${
                  center ? "font-semibold" : ""
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
