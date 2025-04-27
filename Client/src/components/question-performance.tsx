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

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

type QuestionPerf = {
  id: number;
  text: string;
  marks: number;
  correctPct: number;
};

const questions: QuestionPerf[] = [
  {
    id: 1,
    text: "What decimal number is equivalent to the binary number 1110112?",
    marks: 2,
    correctPct: 45,
  },
  {
    id: 2,
    text: "How much memory is required to represent an image that is 8 pixels high and 3 pixels wide and uses 8 colours?",
    marks: 3,
    correctPct: 53,
  },
  {
    id: 3,
    text: "What is the ASCII code for the word 'READ'?",
    marks: 1,
    correctPct: 61,
  },
  {
    id: 4,
    text: "Which of the following prefixes is the largest?",
    marks: 2,
    correctPct: 71,
  },
  {
    id: 5,
    text: "Software that you can download for free, but have to pay to continue to use after a trial period is what kind of software?",
    marks: 1,
    correctPct: 74,
  },
];

const columns: ColumnDef<QuestionPerf>[] = [
  { accessorKey: "id", header: "#" },
  { accessorKey: "text", header: "Question" },
  { accessorKey: "marks", header: "Marks" },
  {
    accessorKey: "correctPct",
    header: "% Correct",
    cell: ({ getValue }) => `${getValue<number>()}%`,
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

  // Build a single‐point dataset for the radial chart:
  const radialData = selectedQuestion
    ? [
        {
          correct: selectedQuestion.correctPct,
          incorrect: 100 - selectedQuestion.correctPct,
        },
      ]
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
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b border-[#27272A]">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="text-white">
                      {!h.isPlaceholder &&
                        flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
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

            <div className="rounded-xl border border-[#27272A] bg-black p-4">
              <h5 className="text-white font-medium mb-4">
                Correct vs Incorrect
              </h5>

              <RadialBarChart
                width={250}
                height={150}
                data={radialData}
                startAngle={180}
                endAngle={0}
                innerRadius={60}
                outerRadius={100}
              >
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) =>
                      viewBox && "cx" in viewBox && "cy" in viewBox ? (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 8}
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
                  className="stroke-transparent stroke-2"
                  clockWise={false}
                />
                <RadialBar
                  dataKey="incorrect"
                  stackId="a"
                  cornerRadius={5}
                  fill="#EF4444"
                  className="stroke-transparent stroke-2"
                  clockWise={false}
                />
              </RadialBarChart>
            </div>
          </div>
        ) : (
          <div className="text-gray-400">Select a question to view details</div>
        )}
      </div>
    </div>
  );
}
