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
  Label as ChartLabel,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

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
    answerCounts: { A: 12, B: 45, C: 18, D: 15, E: 10 },
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
    answerCounts: { A: 8, B: 53, C: 20, D: 7, E: 12 },
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
    answerCounts: { A: 61, B: 15, C: 10, D: 8, E: 6 },
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
    answerCounts: { A: 10, B: 5, C: 8, D: 6, E: 71 },
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
    answerCounts: { A: 74, B: 10, C: 6, D: 5, E: 5 },
    answerOptions: {
      A: "Shareware",
      B: "Freeware",
      C: "Open source",
      D: "Adware",
      E: "Public domain",
    },
    correctOption: "A",
  },
  {
    id: 6,
    text: "Convert the hexadecimal number 3F to decimal.",
    marks: 1,
    correctPct: 68,
    answerCounts: { A: 68, B: 10, C: 9, D: 6, E: 7 },
    answerOptions: {
      A: "63",
      B: "58",
      C: "65",
      D: "61",
      E: "60",
    },
    correctOption: "A",
  },
  {
    id: 7,
    text: "Which layer of the OSI model is responsible for routing?",
    marks: 2,
    correctPct: 58,
    answerCounts: { A: 12, B: 15, C: 58, D: 10, E: 5 },
    answerOptions: {
      A: "Physical",
      B: "Data Link",
      C: "Network",
      D: "Transport",
      E: "Application",
    },
    correctOption: "C",
  },
  {
    id: 8,
    text: "What is the time complexity of binary search?",
    marks: 1,
    correctPct: 80,
    answerCounts: { A: 5, B: 80, C: 7, D: 3, E: 5 },
    answerOptions: {
      A: "O(n)",
      B: "O(log n)",
      C: "O(n log n)",
      D: "O(1)",
      E: "O(n²)",
    },
    correctOption: "B",
  },
  {
    id: 9,
    text: "In CSS, specificity is highest for which selector?",
    marks: 2,
    correctPct: 50,
    answerCounts: { A: 5, B: 20, C: 15, D: 50, E: 10 },
    answerOptions: {
      A: "Type",
      B: "Class",
      C: "ID",
      D: "Inline",
      E: "Pseudo-class",
    },
    correctOption: "D",
  },
  {
    id: 10,
    text: "Which SQL clause is used to filter grouped records?",
    marks: 2,
    correctPct: 55,
    answerCounts: { A: 15, B: 55, C: 10, D: 10, E: 10 },
    answerOptions: {
      A: "WHERE",
      B: "HAVING",
      C: "GROUP BY",
      D: "ORDER BY",
      E: "SELECT",
    },
    correctOption: "B",
  },
  {
    id: 11,
    text: "What does ACID stand for in databases?",
    marks: 3,
    correctPct: 40,
    answerCounts: { A: 40, B: 20, C: 15, D: 10, E: 15 },
    answerOptions: {
      A: "Atomicity, Consistency, Isolation, Durability",
      B: "Accessibility, Concurrency, Integrity, Durability",
      C: "Atomicity, Consistency, Integration, Durability",
      D: "Atomicity, Consistency, Isolation, Dependability",
      E: "Atomicity, Consistency, Isolation, Distribution",
    },
    correctOption: "A",
  },
  {
    id: 12,
    text: "Which HTTP status code indicates a 'Not Found' error?",
    marks: 1,
    correctPct: 75,
    answerCounts: { A: 5, B: 5, C: 75, D: 5, E: 10 },
    answerOptions: {
      A: "200",
      B: "301",
      C: "404",
      D: "500",
      E: "302",
    },
    correctOption: "C",
  },
  {
    id: 13,
    text: "Which JavaScript method converts JSON text to a JavaScript object?",
    marks: 1,
    correctPct: 62,
    answerCounts: { A: 62, B: 10, C: 8, D: 12, E: 8 },
    answerOptions: {
      A: "JSON.parse()",
      B: "JSON.stringify()",
      C: "toJSON()",
      D: "eval()",
      E: "parseJSON()",
    },
    correctOption: "A",
  },
  {
    id: 14,
    text: "In Git, which command creates a new branch?",
    marks: 1,
    correctPct: 85,
    answerCounts: { A: 85, B: 5, C: 3, D: 4, E: 3 },
    answerOptions: {
      A: "git checkout -b",
      B: "git branch -d",
      C: "git merge",
      D: "git init",
      E: "git clone",
    },
    correctOption: "A",
  },
  {
    id: 15,
    text: "What is the output of 7 % 3 in JavaScript?",
    marks: 1,
    correctPct: 70,
    answerCounts: { A: 10, B: 70, C: 5, D: 10, E: 5 },
    answerOptions: {
      A: "1",
      B: "2",
      C: "0",
      D: "3",
      E: "4",
    },
    correctOption: "B",
  },
  {
    id: 16,
    text: "Which data structure uses FIFO ordering?",
    marks: 2,
    correctPct: 60,
    answerCounts: { A: 20, B: 60, C: 5, D: 8, E: 7 },
    answerOptions: {
      A: "Stack",
      B: "Queue",
      C: "Tree",
      D: "Graph",
      E: "Hash Table",
    },
    correctOption: "B",
  },
  {
    id: 17,
    text: "What does DNS stand for?",
    marks: 2,
    correctPct: 65,
    answerCounts: { A: 65, B: 10, C: 10, D: 5, E: 10 },
    answerOptions: {
      A: "Domain Name System",
      B: "Data Network Service",
      C: "Digital Network System",
      D: "Domain Number System",
      E: "Data Name Service",
    },
    correctOption: "A",
  },
  {
    id: 18,
    text: "Which HTML tag is used for the largest heading?",
    marks: 1,
    correctPct: 90,
    answerCounts: { A: 90, B: 2, C: 2, D: 3, E: 3 },
    answerOptions: {
      A: "<h1>",
      B: "<h2>",
      C: "<h3>",
      D: "<header>",
      E: "<title>",
    },
    correctOption: "A",
  },
  {
    id: 19,
    text: "Which AWS service is used for object storage?",
    marks: 2,
    correctPct: 50,
    answerCounts: { A: 20, B: 50, C: 10, D: 10, E: 10 },
    answerOptions: {
      A: "EC2",
      B: "S3",
      C: "RDS",
      D: "Lambda",
      E: "VPC",
    },
    correctOption: "B",
  },
  {
    id: 20,
    text: "What protocol does HTTPS use to encrypt data?",
    marks: 2,
    correctPct: 77,
    answerCounts: { A: 77, B: 5, C: 2, D: 8, E: 8 },
    answerOptions: {
      A: "SSL/TLS",
      B: "FTP",
      C: "HTTP",
      D: "SSH",
      E: "TCP",
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
  const [columnFilters, setColumnFilters] = React.useState<any[]>([]);
  const [percentageView, setPercentageView] = React.useState(true);

  const columns = React.useMemo<ColumnDef<QuestionPerf>[]>(
    () => [
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
        id: "correct",
        header: percentageView ? "% Correct" : "# Correct",
        cell: ({ row }) => {
          const q = row.original;
          return percentageView ? (
            <div className="w-16 text-center">{q.correctPct}%</div>
          ) : (
            <div className="w-16 text-center">
              {q.answerCounts[q.correctOption]}
            </div>
          );
        },
      },
    ],
    [percentageView],
  );

  const table = useReactTable({
    data: questions,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
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

  const RED_SHADES = ["#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D"];
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
        <div className="flex items-center space-x-9">
          <Input
            placeholder="Search by question…"
            value={(table.getColumn("text")?.getFilterValue() as string) ?? ""}
            onChange={(e) =>
              table.getColumn("text")?.setFilterValue(e.target.value)
            }
            className="w-full md:w-2/3 border border-[#27272A] focus:ring-0 text-white"
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="percentage-view"
              checked={percentageView}
              onCheckedChange={setPercentageView}
            />
            <Label htmlFor="percentage-view" className="text-white">
              Percentage View
            </Label>
          </div>
        </div>

        <div className="rounded-xl border border-[#27272A] overflow-auto">
          <Table className="table-auto w-full">
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
                Question {selectedQuestion.id} Details:
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

            <div className="rounded-xl border border-[#27272A] bg-black p-4">
              <h5 className="text-white font-medium mb-12 flex justify-center">
                % of Students Who Answered Correctly
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
                    <ChartLabel
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
          </div>
        ) : (
          <div className="text-gray-400">Select a question to view details</div>
        )}
      </div>
    </div>
  );
}
