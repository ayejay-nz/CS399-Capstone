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

type QuestionPerf = {
  id: number
  text: string
  marks: number
  correctPct: number
};

const questions: QuestionPerf[] = [
  {
    id: 1,
    text: "What decimal number is equivalent to binary 1110112?",
    marks: 2,
    correctPct: 45,
  },
  {
    id: 2,
    text: "How much memory for an 8×3 pixel image using 8 colours?",
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
    text: "Which of the following prefixes is largest? (kilo, mega, giga, tera)",
    marks: 2,
    correctPct: 71,
  },
  {
    id: 5,
    text: "Software you download free but pay after trial is called?",
    marks: 1,
    correctPct: 74,
  },
];

const columns: ColumnDef<QuestionPerf>[] = [
  { accessorKey: "id",         header: "#"               },
  { accessorKey: "text",       header: "Question"        },
  { accessorKey: "marks",      header: "Marks"           },
  {
    accessorKey: "correctPct",
    header: "% Correct",
    cell: ({ getValue }) => `${getValue<number>()}%`,
  },
];

export function QuestionPerformanceTab() {
  // track which question row is clicked
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  // filter by text
  const [columnFilters, setColumnFilters] = React.useState([])

  const table = useReactTable({
    data: questions,
    columns,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // find the selected question
  const selectedQuestion = selectedId
    ? table
        .getRowModel()
        .rows.find((r) => r.id === selectedId)?.original
    : null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: search + question list */}
      <div className="space-y-4">
        <Input
          placeholder="Search by question…"
          value={(table.getColumn("text")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("text")?.setFilterValue(e.target.value)
          }
          className="w-full border border-[#27272A] focus:border-[#27272A]"
        />

        <div className="rounded-xl border border-[#27272A] overflow-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="border-b border-[#27272A]">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="text-white">
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => {
                const isSel = row.id === selectedId
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
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Right: detail pane */}
      <div className="rounded-xl border border-[#27272A] p-4 min-h-[200px] overflow-auto">
        {selectedQuestion ? (
          <div className="text-white">
            {/* Replace with whatever detailed UI you need */}
            <h4 className="font-semibold mb-2">
              Q{selectedQuestion.id} details
            </h4>
            <p>Question: {selectedQuestion.text}</p>
            <p>Marks: {selectedQuestion.marks}</p>
            <p>Correct %: {selectedQuestion.correctPct}%</p>
          </div>
        ) : (
          <div className="text-gray-400">
            Select a question to view details
          </div>
        )}
      </div>
    </div>
  )
}