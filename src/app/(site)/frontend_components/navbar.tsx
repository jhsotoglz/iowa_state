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
    { href: "/", label: "Home" },
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
                   bg-base-100/95 border border-base-300/80 
                   backdrop-blur-md shadow-xl rounded-xl 
                   px-3 sm:px-4 py-2 sm:py-3"
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
                "text-sm sm:text-base tracking-wide rounded-lg py-2",
                "transition-all duration-200 ease-in-out",
                "hover:bg-base-200 hover:text-primary hover:shadow-sm",
                active
                  ? "bg-base-200 text-primary font-semibold"
                  : "text-base-content/70",
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
