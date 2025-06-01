// QuestionPerformanceTab.tsx
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
import { AnswerOptionsEditor } from "@/src/components/AnswerOptionsEditor";
import type {
  QuestionBreakdown,
  AnswerKeyQuestion,
} from "@/src/dataTypes/examBreakdown";

// We know each label is one of these:
const allLabels = ["A", "B", "C", "D", "E"] as const;
type Label = typeof allLabels[number];

type QuestionPerf = {
  questionId: number;
  questionText: string;
  marks: number;
  correctPct: number;
  correctNumber: number;
  answerCounts: Record<string, number>;
  answerOptions: Record<string, string>;
  correctOptions: string[]; // e.g. ["A"] or ["A","B","C","D","E"]
};

interface QuestionPerformanceTabProps {
  questionStats: QuestionBreakdown[];
  answerKey: AnswerKeyQuestion[];
  onCorrectnessChange: (
    questionId: number,
    updatedFields: { allTrue: boolean; originalValue: number }
  ) => Promise<void>;
  onFeedbackChange: (
    questionId: number,
    auid: string,
    customFeedback: string
  ) => Promise<void>;
}

export function QuestionPerformanceTab({
  questionStats,
  answerKey,
  onCorrectnessChange,
}: QuestionPerformanceTabProps) {
  const [columnFilters, setColumnFilters] = React.useState<any[]>([]);
  const [percentageView, setPercentageView] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // Build array of question data
  const questions = React.useMemo<QuestionPerf[]>(
    () =>
      questionStats.map((qb) => {
        const meta = answerKey.find((q) => q.id === qb.questionId)!;

        // Build a map of how many times each letter was picked
        const counts: Record<string, number> = {};
        qb.optionBreakdown.forEach((opt) => {
          const letter = String.fromCharCode(65 + opt.optionNumber);
          counts[letter] = opt.timesPicked;
        });

        // Build a map letter→full option text
        const opts: Record<string, string> = {};
        meta.options.forEach((content, idx) => {
          opts[String.fromCharCode(65 + idx)] = content;
        });

        return {
          questionId: qb.questionId,
          questionText: qb.questionText,
          marks: qb.marks,
          correctPct: qb.percentageCorrect,
          correctNumber: qb.totalCorrectAnswers,
          answerCounts: counts,
          answerOptions: opts,
          // correctAnswers is an array of indices; we convert to ["A","C",…] etc.
          correctOptions: qb.correctAnswers.map((i) =>
            String.fromCharCode(65 + i)
          ),
        };
      }),
    [questionStats, answerKey]
  );

  // Table columns (ID, Question text, Marks, % or # correct)
  const columns = React.useMemo<ColumnDef<QuestionPerf>[]>(
    () => [
      {
        accessorKey: "questionId",
        header: "ID",
        cell: ({ getValue }) => (
          <div className="w-8 text-center">{getValue<number>()}</div>
        ),
      },
      {
        accessorKey: "questionText",
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
            <div className="w-16 text-center">{q.correctNumber}</div>
          );
        },
      },
    ],
    [percentageView]
  );

  const table = useReactTable({
    data: questions,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Which question is currently selected in the table?
  const selectedQuestion =
    selectedId != null
      ? questions.find((q) => q.questionId === selectedId)!
      : null;

  // Data for the radial bar
  const radialData = selectedQuestion
    ? [
        {
          correct: selectedQuestion.correctPct,
          incorrect: 100 - selectedQuestion.correctPct,
        },
      ]
    : [];

  // Original red/orange palette for incorrect slices
  const wrongColors = ["#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1B"];

  // Build pieData: each slice is letter A–E, green if in correctOptions, else red‐orange
  const pieData = selectedQuestion
    ? allLabels.map((letter, idx) => ({
        name: letter,
        value: selectedQuestion.answerCounts[letter] || 0,
        fill: selectedQuestion.correctOptions.includes(letter)
          ? "#10B981"
          : wrongColors[idx],
      }))
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column: search box + table */}
      <div className="space-y-4">
        <div className="flex items-center space-x-9">
          <Input
            placeholder="Search by question…"
            value={
              (table.getColumn("questionText")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table.getColumn("questionText")?.setFilterValue(e.target.value)
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
                    if (id === "questionId") extra = "w-12";
                    if (id === "marks") extra = "w-20";
                    if (id === "correct") extra = "w-25";
                    return (
                      <TableHead
                        key={h.id}
                        className={`text-white ${extra}`}
                      >
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
                const isSel = row.original.questionId === selectedId;
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelectedId(row.original.questionId)}
                    className={`border-b border-[#27272A] cursor-pointer ${
                      isSel ? "bg-[#27272A] text-white" : "hover:bg-gray-800"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-white">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Right column: details + editor + charts */}
      <div className="rounded-xl border border-[#27272A] bg-black p-4 min-h-[200px]">
        {selectedQuestion ? (
          <div className="space-y-6">
            <div className="text-white">
              <h4 className="font-semibold mb-2">
                Question {selectedQuestion.questionId} Details:
              </h4>
              <p>
                <span className="font-medium">Question:</span>{" "}
                {selectedQuestion.questionText}
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

            {/* ANSWER OPTIONS EDITOR */}
            <div className="space-y-1">
              {(() => {
                // We always start editing from whatever correctOptions currently are.
                // When we call onSave, we send allTrue = true (since clicking Update
                // implies “set every option to true”).
                return (
                  <AnswerOptionsEditor
                    answerOptions={selectedQuestion.answerOptions}
                    correctOptions={
                      selectedQuestion.correctOptions as Label[]
                    }
                    onSave={() => {
                      // Always persist allTrue = true on “Update”
                      onCorrectnessChange(selectedQuestion.questionId, {
                        allTrue: true,
                        originalValue: 0,
                      });
                    }}
                  />
                );
              })()}
            </div>

            {/* ANSWER DISTRIBUTION PIE CHART */}
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

            {/* RADIAL BAR FOR % CORRECT */}
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
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
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
