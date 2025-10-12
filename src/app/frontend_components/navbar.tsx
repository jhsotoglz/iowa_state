"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const pathname = usePathname();

  const items = [
    { href: "/view_reviews", label: "Reviews" },
    { href: "/", label: "Home", center: true },
    { href: "/companies_list", label: "Companies" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50
        w-[92vw] sm:w-[500px] max-w-md ${className}`}
    >
      <div
        className="flex justify-between items-center gap-3 sm:gap-6 
                   bg-base-100/90 backdrop-blur-md border border-base-200
                   rounded-3xl shadow-xl px-6 py-3"
      >
        {items.map(({ href, label, center }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "transition-all duration-200 font-medium",
                "text-sm sm:text-base tracking-wide select-none",
                "px-4 py-2 rounded-xl",
                "hover:text-primary hover:bg-base-200/60",
                active
                  ? "text-primary bg-base-200/70 font-semibold"
                  : "text-base-content/70",
                center ? "scale-110 -translate-y-1.5 shadow-md" : "",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
