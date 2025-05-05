"use client";

import React from "react";
import { Button } from "./ui/button";
import { Download } from "lucide-react";
import questions from "../app/mark-mcq/dashboard/data.json";

export function DownloadAnswers() {
  function formatDownloadText() {
    const courseCode = "COMPSCI105";
    const studentCount = 2;
    let txt = `Course: ${courseCode}\n`;
    txt += `Students Count: ${studentCount}\n\n`;

    (questions.forEach((q) => {
      const total = Object.values(q.answerCounts).reduce((a: number, b: number) => a + b, 0);
      txt += `Question Number : ${q.id}\n`;
      txt += `Stem : [${q.marks} mark${q.marks > 1 ? "s" : ""}] ${q.text}\n\n`;
      txt += `Options : \n`;
      Object.entries(q.answerOptions).forEach(([opt, label], idx) => {
        txt += `${idx}) ${label}\n`;
      });
      txt += `\nAnswer        Number Of Answers    Percentage\n`;
      Object.entries(q.answerCounts).forEach(([opt, count], idx) => {
        const pct = total ? ((count / total) * 100).toFixed(2) : "0.00";
        txt += `${idx})         ${count}            ${pct}\n`;
      });
      txt += `Total (without invalid answer):  ${total}\n`;
      txt += `${"=".repeat(100)}\n\n`;
    }));

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
      className="gap-2 border-black text-black"
      onClick={handleClick}
    >
      <Download className="h-4 w-4" style={{ color: "#000" }} />
      Download
    </Button>
  );
}