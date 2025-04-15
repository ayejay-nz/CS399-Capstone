import Image from "next/image";
import Link from "next/link";

import { MetricCards } from "../../../components/metric-cards";
import { StudentDistribution } from "../../../components/student-distribution";
import { LowestScoringQuestions } from "../../../components/lowest-scoring-questions";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Download } from "lucide-react";

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

        <main className="flex-1 max-w-[1200px] mx-auto px-4 w-full">
          <div className="flex flex-1 flex-col p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary">
              <TabsList>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="question-performance">
                  Question Performance
                </TabsTrigger>
                <TabsTrigger value="individual-performance">
                  Individual Performance
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Metric Cards */}
            <MetricCards />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Student Distribution Chart - Takes up 2/3 of the space */}
              <div className="md:col-span-2 rounded-lg border bg-card p-4">
                <StudentDistribution />
              </div>

              {/* Lowest Scoring Questions - Takes up 1/3 of the space */}
              <div className="rounded-lg border bg-card p-4">
                <LowestScoringQuestions />
              </div>
            </div>
          </div>
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
