"use client";

import Image from "next/image";
import { ImageUpload } from "../../components/ui/image-upload";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import Navbar from "@/src/components/layout/Navbar";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useExam } from "@/src/context/ExamContext";
import { ApiSuccessResponse } from "../../../../Server/src/dataTypes/apiSuccessResponse";
import { ExamBreakdown } from "@/src/dataTypes/examBreakdown";
import type { AnswerKeyQuestion } from "@/src/dataTypes/examBreakdown";
import { toast } from "sonner";

export default function MarkMCQ() {
  const { handleResponse } = useExam();
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);
  const [teleformDataFile, setTeleformDataFile] = useState<File | null>(null);
  const router = useRouter();
  const ready = !!answerKeyFile && !!teleformDataFile;

async function handleMarkingUpload() {
  if (!ready) {
    toast.error("Please upload both files first.");
    return;
  }

  try {
    const form = new FormData();
    form.append("answerKeyFile", answerKeyFile!);
    form.append("teleformDataFile", teleformDataFile!);

    const res = await fetch("/api/v1/marking/upload", {
      method: "POST",
      body: form,
      credentials: "include",
    });

    const responseData = await (async () => {
      const contentType = res.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        return (await res.json()) as ApiSuccessResponse<
          [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }]
        >;
      } else {
        return { status: res.status, message: await res.text(), data: null } as any;
      }
    })();

    if (!res.ok) {
      if (responseData && typeof responseData === "object" && responseData.message) {
        toast.error(responseData.message);
      } else {
        toast.error(`Server error: ${res.status} ${res.statusText}`);
      }
      return;
    }

    const payload = responseData.data;
    if (!payload) {
      toast.error("No payload from server");
      return;
    }

    await handleResponse(payload, true);
    router.push("/mark-mcq/dashboard");
  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("Network error or unexpected response format. Please try again.");
  }
}

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* nav bar */}
        <Navbar />

        {/* main content */}
        <main className="flex-1 max-w-[1200px] mx-auto w-full px-4 flex flex-col items-center justify-center">
          {/* file uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            <div className="aspect-[4/3] relative w-full max-w-[400px] mx-auto">
              <ImageUpload
                title="Upload Student Answers"
                subtitle="Supported format: TXT"
                onUpload={(file) => setTeleformDataFile(file)}
                accept="text/plain"
                maxSizeMB={5}
                className="h-full"
              />
            </div>

            <div className="aspect-[4/3] relative w-full max-w-[400px] mx-auto">
              <ImageUpload
                title="Upload Answer Key"
                subtitle="Supported format: XLSX"
                onUpload={(file) => setAnswerKeyFile(file)}
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                maxSizeMB={5}
                className="h-full"
              />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button
              disabled={!ready}
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
              onClick={handleMarkingUpload}
            >
              Continue
            </Button>
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