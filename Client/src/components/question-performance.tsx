"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Input } from "./ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/src/components/ui/table";

import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

type QuestionPerf = {
  id: number;
  text: string;
  marks: number;
  correctPct: number;
  answerCounts: { A: number; B: number; C: number; D: number; E: number };
  answerOptions: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctOption: keyof QuestionPerf["answerOptions"];
};

const questions: QuestionPerf[] = [
  {
    id: 1,
    text: "What decimal number is equivalent to the binary number 111011₂?",
    marks: 2,
    correctPct: 45,
    answerCounts: { A: 12, B: 37, C: 18, D: 23, E: 10 },
    answerOptions: {
      A: "58",
      B: "59",
      C: "61",
      D: "57",
      E: "60",
    },
    correctOption: "B",
  },
  {
    id: 2,
    text: "How much memory is required to represent an image that is 8 pixels high and 3 pixels wide and uses 8 colours?",
    marks: 3,
    correctPct: 53,
    answerCounts: { A: 8, B: 24, C: 32, D: 12, E: 16 },
    answerOptions: {
      A: "8 bytes",
      B: "24 bytes",
      C: "32 bytes",
      D: "12 bytes",
      E: "16 bytes",
    },
    correctOption: "B",
  },
  {
    id: 3,
    text: "What is the ASCII code for the word 'READ'?",
    marks: 1,
    correctPct: 61,
    answerCounts: { A: 52616, B: 52546, C: 52645, D: 52555, E: 52655 },
    answerOptions: {
      A: "82 69 65 68",
      B: "82 65 69 68",
      C: "68 65 69 82",
      D: "69 82 65 68",
      E: "65 82 69 68",
    },
    correctOption: "A",
  },
  {
    id: 4,
    text: "Which of the following prefixes is the largest?",
    marks: 2,
    correctPct: 71,
    answerCounts: { A: 15, B: 10, C: 30, D: 25, E: 20 },
    answerOptions: {
      A: "kilo- (10³)",
      B: "mega- (10⁶)",
      C: "giga- (10⁹)",
      D: "tera- (10¹²)",
      E: "peta- (10¹⁵)",
    },
    correctOption: "E",
  },
  {
    id: 5,
    text: "Software that you can download for free, but have to pay to continue to use after a trial period is what kind of software?",
    marks: 1,
    correctPct: 74,
    answerCounts: { A: 40, B: 10, C: 5, D: 3, E: 2 },
    answerOptions: {
      A: "Shareware",
      B: "Freeware",
      C: "Open source",
      D: "adware",
      E: "public domain",
    },
    correctOption: "A",
  },
];

const columns: ColumnDef<QuestionPerf>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => (
      <div className="w-8 text-center">{getValue<number>()}</div>
    ),
  },
  {
    accessorKey: "text",
    header: "Question",
    cell: ({ getValue }) => {
      const txt = getValue<string>();
      return (
        <div className="truncate max-w-[400px]" title={txt}>
          {txt}
        </div>
      );
    },
  },
  {
    accessorKey: "marks",
    header: "Marks",
    cell: ({ getValue }) => (
      <div className="w-12 text-center">{getValue<number>()}</div>
    ),
  },
  {
    accessorKey: "correctPct",
    header: "% Correct",
    cell: ({ getValue }) => (
      <div className="w-16 text-center">{getValue<number>()}%</div>
    ),
  },
];

export function QuestionPerformanceTab() {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [columnFilters, setColumnFilters] = React.useState([]);

  const table = useReactTable({
    data: questions,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedQuestion = selectedId
    ? table.getRowModel().rows.find((r) => r.id === selectedId)?.original
    : null;

  const radialData = selectedQuestion
    ? [
        {
          correct: selectedQuestion.correctPct,
          incorrect: 100 - selectedQuestion.correctPct,
        },
      ]
    : [];

  const RED_SHADES = [
    "#EF4444", 
    "#DC2626", 
    "#B91C1C", 
    "#991B1B", 
    "#7F1D1D", 
  ];

  const pieData = selectedQuestion
    ? Object.entries(selectedQuestion.answerCounts).map(
        ([option, count], idx) => ({
          name: option,
          value: count,
          fill:
            option === selectedQuestion.correctOption
              ? "#10B981" 
              : RED_SHADES[idx], 
        }),
      )
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Input
          placeholder="Search by question…"
          value={(table.getColumn("text")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("text")?.setFilterValue(e.target.value)
          }
          className="w-full border border-[#27272A] focus:border-[#27272A] focus:ring-0 text-white"
        />

        <div className="rounded-xl border border-[#27272A] overflow-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b border-[#27272A]">
                  {hg.headers.map((h) => {
                    const id = h.column.id;
                    let extra = "";
                    if (id === "id") extra = "w-12";
                    if (id === "marks") extra = "w-20";
                    if (id === "correctPct") extra = "w-25";
                    return (
                      <TableHead key={h.id} className={`text-white ${extra}`}>
                        {!h.isPlaceholder &&
                          flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const isSel = row.id === selectedId;
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelectedId(row.id)}
                    className={`
                      border-b border-[#27272A] cursor-pointer
                      ${isSel ? "bg-[#27272A] text-white" : "hover:bg-gray-800"}
                    `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-white">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-xl border border-[#27272A] bg-black p-4 min-h-[200px]">
        {selectedQuestion ? (
          <div className="space-y-6">
            <div className="text-white">
              <h4 className="font-semibold mb-2">
                Q{selectedQuestion.id} Details
              </h4>
              <p>
                <span className="font-medium">Question:</span>{" "}
                {selectedQuestion.text}
              </p>
              <p>
                <span className="font-medium">Marks:</span>{" "}
                {selectedQuestion.marks}
              </p>
              <p>
                <span className="font-medium">Percentage Correct:</span>{" "}
                {selectedQuestion.correctPct}%
              </p>
            </div>

            <div className="space-y-1">
              {(["A", "B", "C", "D", "E"] as const).map((opt) => (
                <p
                  key={opt}
                  className={
                    opt === selectedQuestion.correctOption
                      ? "font-semibold text-green-400"
                      : ""
                  }
                >
                  <span className="font-medium">{opt}.</span>{" "}
                  {selectedQuestion.answerOptions[opt]}
                </p>
              ))}
            </div>

            <div className="rounded-xl border border-[#27272A] bg-black p-4">
              <h5 className="text-white font-medium mb-4 flex justify-center">
                Correct vs Incorrect
              </h5>

              <div className="flex justify-center">
                <RadialBarChart
                  width={250}
                  height={150}
                  data={radialData}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={100}
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <PolarRadiusAxis
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  >
                    <Label
                      content={({ viewBox }) =>
                        viewBox?.cx != null && viewBox?.cy != null ? (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy - 8}
                              className="fill-white text-2xl font-bold"
                            >
                              {selectedQuestion.correctPct}%
                            </tspan>
                          </text>
                        ) : null
                      }
                    />
                  </PolarRadiusAxis>

                  <RadialBar
                    dataKey="correct"
                    stackId="a"
                    cornerRadius={5}
                    fill="#10B981"
                    clockWise={false}
                    className="stroke-transparent stroke-2"
                  />
                  <RadialBar
                    dataKey="incorrect"
                    stackId="a"
                    cornerRadius={5}
                    fill="#EF4444"
                    clockWise={false}
                    className="stroke-transparent stroke-2"
                  />
                </RadialBarChart>
              </div>
            </div>
            <div className="rounded-xl border border-[#27272A] bg-black p-6">
              <h5 className="text-white font-medium mb-4 flex justify-center">
                Answer Distribution
              </h5>
              <ChartContainer
                config={{ theme: "dark" }}
                className="mx-auto w-full max-w-[350px] h-[350px] [&_.recharts-pie-label-text]:fill-white"
              >
                <PieChart width={350} height={350}>
                  <ChartTooltip content={<ChartTooltipContent />} />

                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label={{ fill: "#fff", fontSize: 12 }}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`slice-${idx}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Select a question to view details</div>
        )}
      </div>
    </div>
  );
}
