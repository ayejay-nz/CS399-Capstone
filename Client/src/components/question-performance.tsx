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
import type {
  QuestionBreakdown,
  AnswerKeyQuestion,
} from "@/src/dataTypes/examBreakdown";
import { useExam } from "@/src/context/ExamContext";

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
  onFeedbackChange?: (
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
  // ─── Get current sessionId from context ───
  const { sessionId } = useExam();

  // ─── Table/filter state ───
  const [columnFilters, setColumnFilters] = React.useState<any[]>([]);
  const [percentageView, setPercentageView] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // ─── UI mode state ───
  // mode = "view" | "editSetAllTrue" | "editRevert"
  const [mode, setMode] = React.useState<
    "view" | "editSetAllTrue" | "editRevert"
  >("view");
  const [subActionDone, setSubActionDone] = React.useState(false);

  React.useEffect(() => {
    setMode("view");
    setSubActionDone(false);
  }, [selectedId]);

  // ─── Build questions array ───
  const questions = React.useMemo<QuestionPerf[]>(() => {
    return questionStats.map((qb) => {
      const meta = answerKey.find((q) => q.id === qb.questionId)!;
      const counts: Record<string, number> = {};
      qb.optionBreakdown.forEach((opt) => {
        const letter = String.fromCharCode(65 + opt.optionNumber);
        counts[letter] = opt.timesPicked;
      });
      const opts: Record<string, string> = {};
      meta.options.forEach((content, idx) => {
        opts[String.fromCharCode(65 + idx)] = content;
      });
      const computedCorrectOptions = qb.correctAnswers.map((i) =>
        String.fromCharCode(65 + i)
      );
      return {
        questionId: qb.questionId,
        questionText: qb.questionText,
        marks: qb.marks,
        correctPct: qb.percentageCorrect,
        correctNumber: qb.totalCorrectAnswers,
        answerCounts: counts,
        answerOptions: opts,
        correctOptions: computedCorrectOptions,
      };
    });
  }, [questionStats, answerKey]);

  // ─── allTrueMap keyed by questionId, but namespaced by sessionId ───
  // Use a Record<questionId, boolean>, persisted under "dashboardAllTrueMap_<sessionId>"
  const [allTrueMap, setAllTrueMap] = React.useState<Record<number, boolean>>(
    {}
  );

  // Whenever sessionId changes, load that session’s map from localStorage
  React.useEffect(() => {
    if (!sessionId) {
      setAllTrueMap({});
      return;
    }
    const key = `dashboardAllTrueMap_${sessionId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setAllTrueMap(JSON.parse(raw));
      } else {
        setAllTrueMap({});
      }
    } catch (e) {
      console.warn("Could not parse allTrueMap from localStorage:", e);
      setAllTrueMap({});
    }
  }, [sessionId]);

  // Helper to toggle a question’s allTrue flag and persist under the current session’s key
  const toggleAllTrue = (questionId: number, flag: boolean) => {
    if (!sessionId) return; // no session ⇒ do nothing
    setAllTrueMap((prev) => {
      const updated = { ...prev, [questionId]: flag };
      try {
        const key = `dashboardAllTrueMap_${sessionId}`;
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to write allTrueMap to localStorage:", e);
      }
      return updated;
    });
  };

  // ─── Table columns ───
  const columns = React.useMemo<ColumnDef<QuestionPerf>[]>(() => [
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
  ], [percentageView]);

  const table = useReactTable({
    data: questions,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedQuestion =
    selectedId != null
      ? questions.find((q) => q.questionId === selectedId)!
      : null;

  if (!selectedQuestion) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: search + table */}
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
                  const isSel = row.original.questionId === selectedId;
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => {
                        setSelectedId(row.original.questionId);
                        setMode("view");
                        setSubActionDone(false);
                      }}
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

        {/* Right: placeholder */}
        <div className="rounded-xl border border-[#27272A] bg-black p-4 min-h-[200px]">
          <div className="text-gray-400">Select a question to view details</div>
        </div>
      </div>
    );
  }

  // ─── Build pieData … ───
  const defaultCorrectSet = new Set(selectedQuestion.correctOptions);
  const isAllTrue = Boolean(allTrueMap[selectedQuestion.questionId]);
  const wrongColors = ["#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1B"];
  const pieData = allLabels.map((letter, idx) => {
    const fill = isAllTrue
      ? "#10B981"
      : defaultCorrectSet.has(letter)
      ? "#10B981"
      : wrongColors[idx];
    return { name: letter, value: selectedQuestion.answerCounts[letter] || 0, fill };
  });
  const radialData = [
    { correct: selectedQuestion.correctPct, incorrect: 100 - selectedQuestion.correctPct },
  ];

  // ─── Render options using text‐color highlight only ───
  const renderOptions = (highlightAll: boolean, highlightDefaults: boolean) => {
    return (
      <div className="flex flex-col space-y-2">
        {allLabels.map((letter) => {
          const isDefaultCorrect = defaultCorrectSet.has(letter);
          const textColor = highlightAll
            ? "text-green-600"
            : highlightDefaults && isDefaultCorrect
            ? "text-green-600"
            : "text-white";
          return (
            <div key={letter} className={`flex space-x-2 ${textColor}`}>
              <span className="font-bold">{letter}.</span>
              <span>{selectedQuestion.answerOptions[letter]}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left column: search + table */}
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
                const isSel = row.original.questionId === selectedId;
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => {
                      setSelectedId(row.original.questionId);
                      setMode("view");
                      setSubActionDone(false);
                    }}
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

          {/* ─── EDIT / REVERT & CANCEL UI ─── */}
          <div className="space-y-4">
            {/* Case A: not allTrue, mode = "view" */}
            {!isAllTrue && mode === "view" && (
              <>
                {renderOptions(false, true)}
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    setMode("editSetAllTrue");
                    setSubActionDone(false);
                  }}
                >
                  Edit
                </button>
              </>
            )}

            {/* Case B: not allTrue, mode = "editSetAllTrue" */}
            {!isAllTrue && mode === "editSetAllTrue" && (
              <>
                {!subActionDone && (
                  <>
                    {renderOptions(false, true)}
                    <div className="flex space-x-4">
                      <button
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                        onClick={() => {
                          setSubActionDone(true);
                        }}
                      >
                        Set All True
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => {
                          setMode("view");
                          setSubActionDone(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {subActionDone && (
                  <>
                    {renderOptions(true, false)}
                    <div className="flex space-x-4">
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => {
                          toggleAllTrue(selectedQuestion.questionId, true);
                          onCorrectnessChange(selectedQuestion.questionId, {
                            allTrue: true,
                            originalValue: 0,
                          });
                          setMode("view");
                          setSubActionDone(false);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => {
                          setMode("view");
                          setSubActionDone(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Case C: isAllTrue, mode = "view" */}
            {isAllTrue && mode === "view" && (
              <>
                {renderOptions(true, false)}
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    setMode("editRevert");
                    setSubActionDone(false);
                  }}
                >
                  Edit
                </button>
              </>
            )}

            {/* Case D: isAllTrue, mode = "editRevert" */}
            {isAllTrue && mode === "editRevert" && (
              <>
                {!subActionDone && (
                  <>
                    {renderOptions(true, false)}
                    <div className="flex space-x-4">
                      <button
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                        onClick={() => {
                          setSubActionDone(true);
                        }}
                      >
                        Revert
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => {
                          setMode("view");
                          setSubActionDone(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {subActionDone && (
                  <>
                    {renderOptions(false, true)}
                    <div className="flex space-x-4">
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        onClick={() => {
                          toggleAllTrue(selectedQuestion.questionId, false);
                          onCorrectnessChange(selectedQuestion.questionId, {
                            allTrue: false,
                            originalValue: 0,
                          });
                          setMode("view");
                          setSubActionDone(false);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => {
                          setMode("view");
                          setSubActionDone(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* ─── PIE CHART ─── */}
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

          {/* ─── RADIAL BAR ─── */}
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
      </div>
    </div>
  );
}
