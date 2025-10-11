import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="fixed bottom-0 left-0 w-full bg-base-200 border-t border-gray-300 p-4">
        <ul className="flex justify-center items-center space-x-16">
            <li>
            <Link
                href="/review_feed"
                className="btn btn-outline btn-square w-28 h-28 text-lg"
            >
                Review Feed
            </Link>
            </li>
            <li>
            <Link
                href="/companies"
                className="btn btn-outline btn-square w-28 h-28 text-lg"
            >
                Companies
            </Link>
            </li>
            <li>
            <Link
                href="/profile"
                className="btn btn-outline btn-square w-28 h-28 text-lg"
            >
                Profile
            </Link>
            </li>
        </ul>
        </nav>
    );
}
