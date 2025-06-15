"use client";

import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useExam } from "@/src/context/ExamContext";
import { formatStatsTxt, formatStudentResultText } from "@/src/utils/statsFormatter";

export function DownloadAnswers() {
  const { stats: exam } = useExam();

  async function handleClick() {
    try {
      const res = await fetch(
        "/api/v1/marking/generate-stats",
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || `${res.status} ${res.statusText}`);
      }
      const blob = await res.blob();

      const zip = await JSZip.loadAsync(blob);

      if (!exam) throw new Error("Exam data not available");
      zip.file("original_stats.txt", formatStatsTxt(exam));

      exam.students.forEach((student) => {
        const txt = formatStudentResultText(student);
        zip.file(`students/${student.auid}.txt`, txt);
      });

      const finalBlob = await zip.generateAsync({ type: "blob" });
      saveAs(finalBlob, "stats_with_students.zip");
      toast.success("Download completed successfully");
    } catch (err: any) {
      console.error("Error downloading answers:", err);
      toast.error(
        "Network error or unexpected response format. Please try again."
      );
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="
        gap-2
        border-black
        text-black
        hover:bg-black
        hover:text-white
        hover:border-white
        transition-colors
        duration-200
        ease-in-out
      "
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  );
}