import Image from "next/image";
import Link from "next/link";
import Navbar from "@/src/components/layout/Navbar";
export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/homepageBackgroundImage.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 1,
        }}
      ></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* nav bar */}
        <Navbar />

        {/* hero */}
        <main className="flex-1 max-w-[1200px] mx-auto px-4 flex flex-col justify-center w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 md:mb-16">
            The <span className="italic">easiest</span> way to create and
            <br />
            grade multiple-choice exams
          </h1>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-16 px-4">
            {/* generate mcq */}
            <div>
              <Link href="/generate-mcq" className="block">
                <div className="bg-zinc-900/50 rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-2xl backdrop-blur-sm transition-transform hover:scale-[1.02]">
                  <div
                    className="relative w-full"
                    style={{ paddingTop: "65%" }}
                  >
                    <Image
                      src="/assets/shuffleQuestionEditor.png"
                      alt="Generate MCQ Interface"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center mt-4 md:mt-6 gap-2 text-base md:text-xl">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M12 4V20M4 12H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Generate MCQ Exam
                </div>
              </Link>
            </div>

            {/* mark mcq/stats */}
            <div>
              <Link href="/mark-mcq" className="block">
                <div className="bg-zinc-900/50 rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-2xl backdrop-blur-sm transition-transform hover:scale-[1.02]">
                  <div
                    className="relative w-full"
                    style={{ paddingTop: "65%" }}
                  >
                    <Image
                      src="/assets/statsMockup.png"
                      alt="Mark MCQ Interface"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center mt-4 md:mt-6 gap-2 text-base md:text-xl">
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Mark MCQ Exam
                </div>
              </Link>
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
