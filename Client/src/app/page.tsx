import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* nav bar */}
      <nav className="flex justify-between items-center px-8 md:px-12 lg:px-16 py-4">
        <div className="pl-2">
          <Image
            src="/assets/shuffleLogo.png"
            alt="Shuffle Logo"
            width={140}
            height={32}
            className="w-auto h-6 md:h-8"
          />
        </div>
        <div className="space-x-4 md:space-x-8 pr-2">
          <a href="/docs" className="hover:text-gray-300 text-sm md:text-base">Documentation</a>
          <a href="/about" className="hover:text-gray-300 text-sm md:text-base">About</a>
        </div>
      </nav>

      {/* hero */}
      <main className="flex-1 max-w-[1200px] mx-auto px-4 flex flex-col justify-center w-full">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-8 md:mb-16">
          The <span className="italic">easiest</span> way to create and
          <br />grade multiple-choice exams
        </h1>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-16 px-4">
          {/* generate mcq */}
          <div>
            <div className="bg-zinc-900/50 rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-2xl">
              <div className="relative w-full" style={{ paddingTop: '65%' }}>
                <Image
                  src="/assets/generateMockup.png"
                  alt="Generate MCQ Interface"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="flex items-center justify-center mt-4 md:mt-6 gap-2 text-base md:text-xl">
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Generate MCQ Exam
            </div>
          </div>

          {/* mark mcq/stats */}
          <div>
            <div className="bg-zinc-900/50 rounded-2xl md:rounded-[32px] p-4 md:p-6 shadow-2xl">
              <div className="relative w-full" style={{ paddingTop: '65%' }}>
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
              <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Mark MCQ Exam
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 py-4 text-right">
        <div className="text-xs md:text-sm text-gray-400">
          Happy Coders 2025 © All rights reserved
        </div>
      </footer>
    </div>
  );
}
