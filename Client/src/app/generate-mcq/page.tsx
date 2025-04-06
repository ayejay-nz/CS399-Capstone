"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
export default function GenerateMCQ() {
  const [activeButton, setActiveButton] = useState("form");
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

        <div
          className="flex-grow p-4 md:p-6 lg:p-8"
          style={{ backgroundColor: "oklch(18% 0 0)" }}
        >
          <div className="flex justify-between items-center gap-4 mb-8">
            <div className="flex bg-white rounded-3xl p-1">
              <Button
                variant={activeButton === "text" ? "switch" : "secondary"}
                onClick={() => setActiveButton("text")}
              >
                text editor
              </Button>
              <Button
                variant={activeButton === "form" ? "switch" : "secondary"}
                onClick={() => setActiveButton("form")}
              >
                form editor
              </Button>
            </div>
            <div className="pr-8 flex gap-2">
              <Button variant="secondary">upload file</Button>
              <Button variant="secondary">generate exam</Button>
            </div>
          </div>

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
                <div className="space-y-3"></div>

                {/* Add Question Button */}
                <div className="flex justify-end mt-6">
                  <Button size="lg" variant="secondary">
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
              <div className="space-y-4"></div>
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
