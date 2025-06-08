"use client";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 md:px-12 lg:px-16 py-4">
      <div className="pl-2">
        <Link href="/" className="block">
          <Image
            src="/assets/shuffleLogo.png"
            alt="Shuffle Logo"
            width={140}
            height={32}
            className="w-auto h-6 md:h-8"
          />
        </Link>
      </div>
      <div className="space-x-4 md:space-x-8 pr-2">
        <Link href="/docs" className="hover:text-gray-300 text-white text-sm md:text-base">
          Demo
        </Link>
        <Link
          href="/documentation"
          className="hover:text-gray-300 text-white text-sm md:text-base"
        >
          Documentation
        </Link>
      </div>
    </nav>
  );
}
