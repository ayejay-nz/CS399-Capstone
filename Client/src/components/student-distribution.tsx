"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import React from 'react';


type RangeCount = { range: string; count: number };

const BUCKET_DEFINITIONS: { min: number; max: number; label: string }[] = [
  { min: 0,  max:  9, label: "0-9%"   },
  { min: 10, max: 19, label: "10-19%" },
  { min: 20, max: 29, label: "20-29%" },
  { min: 30, max: 39, label: "30-39%" },
  { min: 40, max: 49, label: "40-49%" },
  { min: 50, max: 59, label: "50-59%" },
  { min: 60, max: 69, label: "60-69%" },
  { min: 70, max: 79, label: "70-79%" },
  { min: 80, max: 89, label: "80-89%" },
  { min: 90, max:100, label: "90-100%"},
];

function buildScoreDistribution(scores: number[]): RangeCount[] {
  const dist = BUCKET_DEFINITIONS.map(b => ({ range: b.label, count: 0 }));
  scores.forEach(raw => {
    const pct = Math.min(100, Math.max(0, raw));
    const idx = BUCKET_DEFINITIONS.findIndex(b => pct >= b.min && pct <= b.max);
    if (idx !== -1) dist[idx].count++;
  });
  return dist;
}

interface Props {
  studentScores: number[];
}

export function StudentDistribution({ studentScores }: Props) {

  const data = buildScoreDistribution(studentScores);

  return (
    <div className="space-y-15">
      <h3 className="text-lg font-medium text-white">
        Student Grade Distribution
      </h3>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 5 }}
            barCategoryGap="10%"
            barGap={4}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#333"
            />

            <XAxis
              dataKey="range"
              interval={0}
              height={30}
              tick={{ fill: "#FFFFFF", fontSize: 12 }}
              tickMargin={6}
            />

            <YAxis
              domain={[0, "dataMax"]}
              allowDecimals={false}
              tick={{ fill: "#FFFFFF", fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#222",
                border: "1px solid #333",
                borderRadius: "4px",
                color: "#fff",
              }}
            />

            <Bar dataKey="count" fill="#fff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}