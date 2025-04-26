"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/src/components/ui/table";

type QuestionPerf = {
  id: number;
  text: string;
  marks: number;
  correctPct: number;
};

const data: QuestionPerf[] = [
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
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-b border-[#27272A] hover:bg-gray-800 cursor-pointer"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
