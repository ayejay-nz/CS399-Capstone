import React from "react";
import Image from "next/image";
import Link from "next/link";

import { MetricCards } from "../../../components/metric-cards";
import { StudentDistribution } from "../../../components/student-distribution";
import { LowestScoringQuestions } from "../../../components/lowest-scoring-questions";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Download } from "lucide-react";
import { IndividualPerformanceTab } from "@/src/components/individual-performance";
import { QuestionPerformanceTab } from "@/src/components/question-performance";
import { DownloadAnswers } from "@/src/components/download-answers";
import Navbar from "@/src/components/layout/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 w-full px-8 md:px-12 lg:px-16">
          <div className="flex flex-1 flex-col p-6 space-y-6 border border-[#27272A] rounded-xl">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <DownloadAnswers />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="summary" className="space-y-6">
              <TabsList className="bg-[#27272A] rounded-lg p-1 w-max">
                <TabsTrigger
                  value="summary"
                  className="text-[#4C4C52] data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
                >
                  Summary
                </TabsTrigger>
                <TabsTrigger
                  value="question-performance"
                  className="text-[#4C4C52] data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
                >
                  Question Performance
                </TabsTrigger>
                <TabsTrigger
                  value="individual-performance"
                  className="text-[#4C4C52] data-[state=active]:bg-black data-[state=active]:text-white rounded-md"
                >
                  Individual Performance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary">
                <MetricCards />

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    className="md:col-span-2 rounded-lg p-4"
                    style={{
                      backgroundColor: "#000",
                      border: "1px solid #27272A",
                      color: "#fff",
                    }}
                  >
                    <StudentDistribution />
                  </div>
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: "#000",
                      border: "1px solid #27272A",
                      color: "#fff",
                    }}
                  >
                    <LowestScoringQuestions />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="question-performance">
                <QuestionPerformanceTab />
              </TabsContent>

              <TabsContent value="individual-performance">
                <IndividualPerformanceTab />
              </TabsContent>
            </Tabs>
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
