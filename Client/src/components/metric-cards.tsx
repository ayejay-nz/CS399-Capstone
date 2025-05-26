"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { useExam } from "@/src/context/ExamContext";

export function MetricCards() {
  const { summary } = useExam();

  if (!summary) {
    return null;
  }

  const metrics = [
    { label: "Lowest Score (%)", value: summary.lowestScore },
    { label: "Lower Quartile (%)", value: summary.lowerQuartile },
    { label: "Median (%)", value: summary.median },
    { label: "Upper Quartile (%)", value: summary.upperQuartile ?? 0 },
    { label: "Highest Score (%)", value: summary.highestScore },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metrics.map((c) => (
        <Card
          key={c.label}
          style={{
            backgroundColor: "#000000",
            border: "1px solid #27272A",
          }}
        >
          <CardHeader className="!pb-0">
            <CardDescription className="text-white">
              {c.label}
            </CardDescription>
          </CardHeader>

          <CardContent className="!pt-0">
            <CardTitle className="text-3xl text-white">
              {c.value}
            </CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
