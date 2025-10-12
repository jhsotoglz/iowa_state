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
    { href: "/home", label: "Home" },
    { href: "/companies_list", label: "Companies" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 
        w-[92vw] sm:w-[500px] max-w-md ${className}`}
    >
      <div
        className="flex justify-between items-center
                   bg-white/10 backdrop-blur-xl 
                   border border-white/40
                   rounded-lg shadow-lg
                   px-4 py-2 sm:px-6 sm:py-3
                   transition-all duration-300
                   text-white"
      >
        {items.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex-1 text-center font-medium select-none",
                "text-sm sm:text-base tracking-wide rounded-md py-2",
                "transition-all duration-300 ease-in-out",
                active
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10",
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
