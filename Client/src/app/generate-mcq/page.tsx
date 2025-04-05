import Image from "next/image";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";
export default function GenerateMCQ() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* nav bar */}
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
            <Link
              href="/docs"
              className="hover:text-gray-300 text-sm md:text-base"
            >
              Documentation
            </Link>
            <Link
              href="/about"
              className="hover:text-gray-300 text-sm md:text-base"
            >
              About
            </Link>
          </div>
        </nav>

        {/* Main */}
        <div
          className="flex-grow p-4 md:p-6 lg:p-8"
          style={{ backgroundColor: "oklch(18% 0 0)" }}
        >
          <div className="flex flex-col lg:flex-row gap-6 h-full mx-auto w-[95%] max-w-[1800px]">
            {/* Left box */}
            <div
              className="flex-1 rounded-lg p-6"
              style={{ backgroundColor: "oklch(23% 0 0)" }}
            >
              <h1 className="text-2xl font-bold mb-6">Questions</h1>

              {/* Question */}
              <div className="flex items-center gap-4 mb-4">
                <span className="font-medium w-8">1.</span>
                <div
                  className="flex-1 flex justify-between items-center p-3"
                  style={{
                    backgroundColor: "oklch(35% 0 0)",
                    borderRadius: "0.375rem",
                    border: "1px solid oklch(40% 0 0)",
                  }}
                >
                  <button className="text-sm text-gray-300 hover:text-white">
                    Add Options
                  </button>
                </div>
              </div>

              {/* Options Section */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-4">Options</h2>
                <div className="space-y-3">
                  {["a", "b", "c", "d", "e"].map((option) => (
                    <div key={option} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`option-${option}`}
                        className="h-4 w-4 rounded border-gray-500 focus:ring-0"
                        style={{
                          backgroundColor: "oklch(28% 0 0)",
                          borderColor: "oklch(40% 0 0)",
                        }}
                      />
                      <input
                        type="text"
                        placeholder={`Option ${option}`}
                        className="flex-1 p-2 rounded"
                        style={{
                          backgroundColor: "oklch(35% 0 0)",
                          border: "1px solid oklch(40% 0 0)",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Add Question Button */}
                <div className="flex justify-end mt-6">
                  <Button size="sm" variant="destructive">
                    Add Question
                  </Button>
                </div>
              </div>
            </div>

            {/* Right box*/}
            <div
              className="lg:w-[400px] rounded-lg p-6"
              style={{ backgroundColor: "oklch(23% 0 0)" }}
            >
              <div className="space-y-4">
                <button
                  className="w-full py-3 rounded-md flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "oklch(35% 0 0)",
                    border: "1px solid oklch(40% 0 0)",
                  }}
                >
                  <span className="text-gray-200">Edit</span>
                </button>
                <button
                  className="w-full py-3 rounded-md"
                  style={{
                    backgroundColor: "oklch(35% 0 0)",
                    border: "1px solid oklch(40% 0 0)",
                  }}
                >
                  <span className="text-gray-200">Delete</span>
                </button>
              </div>
            </div>
          </div>

          <footer className="px-8 py-4 text-right mt-6">
            <div className="text-xs md:text-sm text-gray-400">
              Happy Coders 2025 © All rights reserved
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
