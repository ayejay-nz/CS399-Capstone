import Image from "next/image";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* nav bar */}
        <nav className="flex justify-between items-center px-8 md:px-12 lg:px-16 py-4">
          <div className="pl-2">
            <Link href="/">
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
            <Link href="/docs" className="hover:text-gray-300 text-sm md:text-base">
              Documentation
            </Link>
            <Link href="/about" className="hover:text-gray-300 text-sm md:text-base">
              About
            </Link>
          </div>
        </nav>

        {/* main content */}
        <main className="flex-1 max-w-[1200px] mx-auto px-4 flex flex-col justify-center w-full">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-300">
            Placeholder content for the Dashboard page.
          </p>
        </main>

        {/* footer */}
        <footer className="px-8 py-4 text-right">
          <div className="text-xs md:text-sm text-gray-400">
            Happy Coders 2025 © All rights reserved
          </div>
        </footer>
      </div>
    </div>
  );
}