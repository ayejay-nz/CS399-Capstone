"use client";

import { ImageUpload } from "../../components/ui/image-upload";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import Navbar from "@/src/components/layout/Navbar";

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
        <Navbar />
        {/* main content */}
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 flex flex-col items-center justify-center">
          {/* file uploads */}
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

          <div className="flex justify-center mt-8">
            <Link href="/mark-mcq/dashboard">
              <Button
                className="
                  border 
                  border-white 
                  text-white 
                  bg-transparent 
                  hover:bg-white/10 
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white
                  transition-colors
                "
              >
                Continue
              </Button>
            </Link>
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

