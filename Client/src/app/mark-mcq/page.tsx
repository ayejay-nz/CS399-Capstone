"use client";

import { ImageUpload } from "../../components/ui/image-upload";
import Image from "next/image";
import Link from "next/link";

export default function MarkMCQ() {
  const handleStudentAnswersUpload = (url: string): void => {
    console.log("Student answers uploaded:", url);
  };

  const handleAnswerKeyUpload = (url: string): void => {
    console.log("Answer key uploaded:", url);
  };

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
            <Link href="/docs" className="hover:text-gray-300 text-sm md:text-base">Documentation</Link>
            <Link href="/about" className="hover:text-gray-300 text-sm md:text-base">About</Link>
          </div>
        </nav>

        <main className="flex-1 max-w-[1200px] mx-auto w-full flex items-center justify-center px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            <div className="aspect-[4/3] relative">
              <ImageUpload
                title="Upload Student Answers"
                subtitle="Supported format: TXT"
                onUpload={handleStudentAnswersUpload}
                accept="text/plain"
                maxSizeMB={5}
                className="h-full"
              />
            </div>
            
            <div className="aspect-[4/3] relative">
              <ImageUpload
                title="Upload Answer Key"
                subtitle="Supported format: XLSX"
                onUpload={handleAnswerKeyUpload}
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                maxSizeMB={5}
                className="h-full"
              />
            </div>
          </div>
        </main>

        <footer className="px-8 py-4 text-right">
          <div className="text-xs md:text-sm text-gray-400">
            Happy Coders 2025 © All rights reserved
          </div>
        </footer>
      </div>
    </div>
  );
} 