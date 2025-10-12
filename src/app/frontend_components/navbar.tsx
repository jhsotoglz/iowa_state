import Link from "next/link";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-base-100 border-t border-gray-300 py-3 px-5">
      <ul className="flex justify-between sm:justify-around items-center max-w-md mx-auto">
        <li>
          <Link
            href="/review_feed"
            className="btn btn-outline btn-sm sm:btn-md md:btn-square md:w-24 md:h-24 text-xs sm:text-sm md:text-lg flex flex-col justify-center"
          >
            Review Feed
          </Link>
        </li>
        <li>
          <Link
            href="/companies_list"
            className="btn btn-outline btn-sm sm:btn-md md:btn-square md:w-24 md:h-24 text-xs sm:text-sm md:text-lg flex flex-col justify-center"
          >
            Companies
          </Link>
        </li>
        <li>
          <Link
            href="/profile"
            className="btn btn-outline btn-sm sm:btn-md md:btn-square md:w-24 md:h-24 text-xs sm:text-sm md:text-lg flex flex-col justify-center"
          >
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}
