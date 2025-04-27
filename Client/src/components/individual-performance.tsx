"use client";

import React from "react";
import * as ReactTable from "@tanstack/react-table";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  RowSelectionState,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/src/components/ui/table";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "./ui/input";

export type Student = {
  auid: string;
  name: string;
  version: number;
  total: number;
  answers: Array<{
    question: string;
    marks: number;
    option: string;
    feedback: string;
  }>;
};

// dummy data, replace with real fetch later
const students: Student[] = [
  {
    auid: "10010234",
    name: "Alice Smith",
    version: 1,
    total: 3,
    answers: [
      { question: "1", marks: 1, option: "B", feedback: "Well done!" },
      { question: "2", marks: 1, option: "A", feedback: "Correct" },
      { question: "3", marks: 1, option: "C", feedback: "Perfect" },
    ],
  },
  {
    auid: "10010235",
    name: "Bob Johnson",
    version: 2,
    total: 2,
    answers: [
      { question: "1", marks: 1, option: "D", feedback: "Good job!" },
      { question: "2", marks: 0, option: "B", feedback: "Incorrect" },
      { question: "3", marks: 1, option: "C", feedback: "Well done!" },
    ],
  },
  {
    auid: "10010236",
    name: "Carol Lee",
    version: 1,
    total: 1,
    answers: [
      { question: "1", marks: 0, option: "A", feedback: "Incorrect" },
      { question: "2", marks: 1, option: "C", feedback: "Good job!" },
      { question: "3", marks: 0, option: "D", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010237",
    name: "David Kim",
    version: 3,
    total: 0,
    answers: [
      { question: "1", marks: 0, option: "B", feedback: "Incorrect" },
      { question: "2", marks: 0, option: "A", feedback: "Incorrect" },
      { question: "3", marks: 0, option: "C", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010238",
    name: "Eva González",
    version: 2,
    total: 2,
    answers: [
      { question: "1", marks: 1, option: "C", feedback: "Good job!" },
      { question: "2", marks: 1, option: "D", feedback: "Well done!" },
      { question: "3", marks: 0, option: "B", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010239",
    name: "Frank Zhang",
    version: 4,
    total: 3,
    answers: [
      { question: "1", marks: 1, option: "A", feedback: "Perfect" },
      { question: "2", marks: 1, option: "B", feedback: "Well done!" },
      { question: "3", marks: 1, option: "D", feedback: "Correct" },
    ],
  },
  {
    auid: "10010240",
    name: "Grace Patel",
    version: 3,
    total: 1,
    answers: [
      { question: "1", marks: 0, option: "D", feedback: "Incorrect" },
      { question: "2", marks: 1, option: "C", feedback: "Good job!" },
      { question: "3", marks: 0, option: "A", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010241",
    name: "Hiro Tanaka",
    version: 1,
    total: 2,
    answers: [
      { question: "1", marks: 1, option: "B", feedback: "Correct" },
      { question: "2", marks: 1, option: "A", feedback: "Well done!" },
      { question: "3", marks: 0, option: "C", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010242",
    name: "Isabel Rossi",
    version: 2,
    total: 0,
    answers: [
      { question: "1", marks: 0, option: "C", feedback: "Incorrect" },
      { question: "2", marks: 0, option: "D", feedback: "Incorrect" },
      { question: "3", marks: 0, option: "B", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010243",
    name: "Jack Müller",
    version: 4,
    total: 1,
    answers: [
      { question: "1", marks: 0, option: "A", feedback: "Incorrect" },
      { question: "2", marks: 1, option: "D", feedback: "Good job!" },
      { question: "3", marks: 0, option: "C", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010243",
    name: "Jack Müller",
    version: 4,
    total: 1,
    answers: [
      { question: "1", marks: 0, option: "A", feedback: "Incorrect" },
      { question: "2", marks: 1, option: "D", feedback: "Good job!" },
      { question: "3", marks: 0, option: "C", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010243",
    name: "Jack Müller",
    version: 4,
    total: 1,
    answers: [
      { question: "1", marks: 0, option: "A", feedback: "Incorrect" },
      { question: "2", marks: 1, option: "D", feedback: "Good job!" },
      { question: "3", marks: 0, option: "C", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010243",
    name: "Jack Müller",
    version: 4,
    total: 1,
    answers: [
      { question: "1", marks: 0, option: "A", feedback: "Incorrect" },
      { question: "2", marks: 1, option: "D", feedback: "Good job!" },
      { question: "3", marks: 0, option: "C", feedback: "Incorrect" },
    ],
  },
  {
    auid: "10010243",
    name: "Jack Müller",
    version: 4,
    total: 1,
    answers: [
      { question: "1", marks: 0, option: "A", feedback: "Incorrect" },
      { question: "2", marks: 1, option: "D", feedback: "Good job!" },
      { question: "3", marks: 0, option: "C", feedback: "Incorrect" },
    ],
  },
];

const studentColumns: ColumnDef<Student>[] = [
  { accessorKey: "auid", header: "AUID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "version", header: "Version" },
  { accessorKey: "total", header: "Total" },
];

type Answer = Student["answers"][0];
const answerColumns: ColumnDef<Answer>[] = [
  { accessorKey: "question", header: "Question" },
  { accessorKey: "marks", header: "Marks" },
  { accessorKey: "option", header: "Option" },
  { accessorKey: "feedback", header: "Feedback" },
];

export function IndividualPerformanceTab() {
  // single-row selection
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
  // column filter state for name
  const [columnFilters, setColumnFilters] = React.useState([]);

  const table = useReactTable({
    data: students,
    columns: studentColumns,
    state: {
      rowSelection: React.useState<RowSelectionState>({})[0],
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedStudent = selectedRowId
    ? table.getRowModel().rows.find((r) => r.id === selectedRowId)?.original
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
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
                const isSelected = row.id === selectedRowId;
                return (
                  <TableRow
                    key={row.id}
                    onClick={() => setSelectedRowId(row.id)}
                    className={`
                        border-b border-[#27272A]
                        cursor-pointer
                        ${
                          isSelected
                            ? "bg-[#27272A] text-white"
                            : "hover:bg-gray-800"
                        }
                      `}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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

      <div className="rounded-xl border border-[#27272A] p-4 min-h-[200px] overflow-auto">
        {selectedStudent ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#27272A]">
                {answerColumns.map((col) => (
                  <TableHead key={col.accessorKey} className="text-white">
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedStudent.answers.map((ans, i) => (
                <TableRow key={i} className="border-b border-[#27272A]">
                  {answerColumns.map((col) => (
                    <TableCell key={col.accessorKey as string}>
                      {(ans as any)[col.accessorKey!]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-gray-400">Select a student to view details</div>
        )}
      </div>
    </div>
  );
}
