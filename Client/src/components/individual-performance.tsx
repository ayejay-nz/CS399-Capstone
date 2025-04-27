"use client";

import React from "react";
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
import { Input } from "./ui/input";

// dummy data, replace with real fetch later
export type Student = {
  auid: string;
  name: string;
  version: number;
  total: number;
  answers: {
    question: string;
    marks: 0 | 1;
    option: "A" | "B" | "C" | "D" | "E";
    feedback: "Well Done!" | "Incorrect.";
  }[];
};

const students: Student[] = [
  {
    auid: "10010234",
    name: "Alice Smith",
    version: 2,
    total: 10,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const isCorrect = q % 2 === 1; // 10 correct (odd IDs)
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },

  {
    auid: "10010235",
    name: "Bob Johnson",
    version: 1,
    total: 12,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const isCorrect = [1, 2, 5, 6, 7, 8, 12, 13, 16, 17, 20, 19].includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },

  {
    auid: "10010236",
    name: "Carol Lee",
    version: 1,
    total: 8,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctIds = [2, 4, 6, 7, 8, 12, 14, 18];
      const isCorrect = correctIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },

  {
    auid: "10010237",
    name: "David Kim",
    version: 3,
    total: 15,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const incorrectIds = [2, 5, 9, 13, 20]; // 5 wrong
      const isCorrect = !incorrectIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },

  {
    auid: "10010238",
    name: "Eva González",
    version: 4,
    total: 5,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctIds = [3, 7, 12, 16, 19];
      const isCorrect = correctIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },

  {
    auid: "10010239",
    name: "Frank Zhang",
    version: 4,
    total: 20,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctOpt = correctMap[q];
      return {
        question: String(q),
        marks: 1,
        option: correctOpt,
        feedback: "Well Done!",
      };
    }),
  },

  {
    auid: "10010240",
    name: "Grace Patel",
    version: 1,
    total: 0,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: 0,
        option: wrongOpt,
        feedback: "Incorrect.",
      };
    }),
  },

  {
    auid: "10010241",
    name: "Hiro Tanaka",
    version: 3,
    total: 14,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const incorrectIds = [4, 9, 13, 18, 20, 11];
      const isCorrect = !incorrectIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },

  {
    auid: "10010242",
    name: "Isabel Rossi",
    version: 1,
    total: 7,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctIds = [3, 7, 12, 15, 16, 17, 19];
      const isCorrect = correctIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },
  {
    auid: "10010243",
    name: "John Doe",
    version: 2,
    total: 10,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctIds = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
      const isCorrect = correctIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },
  {
    auid: "10010244",
    name: "Lina Martinez",
    version: 3,
    total: 8,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctIds = [2, 4, 6, 8, 10, 12, 14, 16];
      const isCorrect = correctIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },
  {
    auid: "10010245",
    name: "Michael Brown",
    version: 4,
    total: 15,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const incorrectIds = [1, 2, 3, 4, 5];
      const isCorrect = !incorrectIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },
  {
    auid: "10010246",
    name: "Zoe Singh",
    version: 1,
    total: 2,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctIds = [1, 20];
      const isCorrect = correctIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
  },
  {
    auid: "10010247",
    name: "Lucas Williams",
    version: 4,
    total: 4,
    answers: Array.from({ length: 20 }, (_, i) => {
      const q = i + 1;
      const correctMap: Record<number, keyof Student["answers"][0]> = {
        1: "B",
        2: "B",
        3: "A",
        4: "E",
        5: "A",
        6: "A",
        7: "C",
        8: "B",
        9: "D",
        10: "B",
        11: "A",
        12: "C",
        13: "A",
        14: "A",
        15: "B",
        16: "B",
        17: "A",
        18: "A",
        19: "B",
        20: "A",
      };
      const correctIds = [5, 10, 15, 20];
      const isCorrect = correctIds.includes(q);
      const correctOpt = correctMap[q];
      const wrongOpt = (["A", "B", "C", "D", "E"] as const).find(
        (o) => o !== correctOpt,
      )!;
      return {
        question: String(q),
        marks: isCorrect ? 1 : 0,
        option: isCorrect ? correctOpt : wrongOpt,
        feedback: isCorrect ? "Well Done!" : "Incorrect.",
      };
    }),
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
