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

const data = [
  { range: "0-9%",   count: 1 },
  { range: "10-19%", count: 3 },
  { range: "20-29%", count: 6 },
  { range: "30-39%", count: 20 },
  { range: "40-49%", count: 30 },
  { range: "50-59%", count: 32 },
  { range: "60-69%", count: 45 },
  { range: "70-79%", count: 30 },
  { range: "80-89%", count: 15 },
  { range: "90-100%",count: 3 },
]

export function StudentDistribution() {
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