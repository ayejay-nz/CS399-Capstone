"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export interface Summary {
  lowestScore: number;
  lowerQuartile: number;
  median: number;
  upperQuartile: number;
  highestScore: number;
}

const summaryData: Summary = {
  lowestScore: 2,
  lowerQuartile: 35,
  median: 60,
  upperQuartile: 75,
  highestScore: 95,
};

const metrics = [
  { label: "Lowest Score (%)", value: summaryData.lowestScore },
  { label: "Lower Quartile (%)", value: summaryData.lowerQuartile },
  { label: "Median (%)", value: summaryData.median },
  { label: "Upper Quartile (%)", value: summaryData.upperQuartile },
  { label: "Highest score (%)", value: summaryData.highestScore },
];

export function MetricCards() {
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