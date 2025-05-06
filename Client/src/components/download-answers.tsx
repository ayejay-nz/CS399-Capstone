"use client";

import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import questions from "../app/mark-mcq/dashboard/data";

export function DownloadAnswers() {
  function formatDownloadText() {
    const courseCode = "COMPSCI105";
    const studentCount = 81;
    let txt = `Course: ${courseCode}\n`;
    txt += `Students Count: ${studentCount}\n\n`;

    const col1 = 12;
    const col2 = 20;
    const col3 = 12;

    for (const q of questions) {
      const total = Object.values(q.answerCounts).reduce((a, b) => a + b, 0);
      txt += `Question Number : ${q.id}\n`;
      txt += `Question : [${q.marks} mark${q.marks > 1 ? "s" : ""}] ${q.text}\n\n`;

      txt +=
        "Answer".padStart(col1) +
        " " +
        "Number Of Answers".padStart(col2) +
        " " +
        "Percentage".padStart(col3) +
        "\n";

      for (const [opt, count] of Object.entries(q.answerCounts)) {
        const pct = total ? ((count / total) * 100).toFixed(2) : "0.00";
        txt +=
          `${opt})`.padStart(col1) +
          " " +
          `${count}`.padStart(col2) +
          " " +
          `${pct}`.padStart(col3) +
          "\n";
      }

      txt += `Total (without invalid answer):  ${total}\n`;
      txt += `${"=".repeat(100)}\n\n`;
    }

    return txt;
  }

  function handleClick() {
    const text = formatDownloadText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_answers.txt";
    a.click();
    URL.revokeObjectURL(url);
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
