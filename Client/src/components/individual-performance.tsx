"use client";

import React from "react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
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
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import type {
  StudentBreakdown,
  Answer,
} from "@/src/dataTypes/examBreakdown";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Download } from "lucide-react";


interface IndividualPerformanceTabProps {
  students: StudentBreakdown[];
  examMarks: number;
  onFeedbackChange: (
    questionId: number,
    auid: string,
    customFeedback: string
  ) => Promise<void>;
}

export function IndividualPerformanceTab({
  students,
  examMarks,
  onFeedbackChange,
}: IndividualPerformanceTabProps) {
  const [columnFilters, setColumnFilters] = React.useState<any[]>([]);
  const [percentageView, setPercentageView] = React.useState(true);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);

  const columns = React.useMemo<ColumnDef<StudentBreakdown>[]>(
    () => [
      {
        accessorKey: "auid",
        header: "AUID",
        cell: ({ getValue }) => <div className="w-24">{getValue<string>()}</div>,
      },
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>{`${row.original.firstName} ${row.original.lastName}`}</div>
        ),
      },
      {
        accessorKey: "versionNumber",
        header: "Version",
        cell: ({ getValue }) => (
          <div className="w-20 text-center">{getValue<string>()}</div>
        ),
      },
      {
        id: "score",
        header: percentageView ? "% Score" : "Score",
        cell: ({ row }) => {
          const marks = row.original.mark;
          return percentageView ? (
            <div className="w-20 text-center">{Math.round((marks / examMarks) * 100)}%</div>
          ) : (
            <div className="w-20 text-center">{marks}</div>
          );
        },
      },
    ],
    [percentageView, examMarks]
  );

  const table = useReactTable({
    data: students,
    columns,
    getRowId: (row) => row.auid,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const selectedStudent = React.useMemo(
    () =>
      selectedRowId
        ? students.find((s) => s.auid === selectedRowId) || null
        : null,
    [selectedRowId, students]
  );

async function handleDownloadStudent() {
  if (!selectedStudent) return;

  try {
    const res = await fetch(
      `http://localhost:8000/api/v1/marking/download-student/${selectedStudent.auid}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `${res.status} ${res.statusText}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedStudent.auid}_stats.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Downloaded student stats");
  } catch (err: any) {
    console.error("Download failed:", err);
    toast.error(`Failed to download: ${err.message}`);
  }
}



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-9">
          <Input
            placeholder="Search by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
            className="w-full md:w-2/3 border border-[#27272A] focus:ring-0 text-white"
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="score-view"
              checked={percentageView}
              onCheckedChange={setPercentageView}
            />
            <Label htmlFor="score-view" className="text-white">
              Percentage View
            </Label>
          </div>
        </div>

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
                    className={`border-b border-[#27272A] cursor-pointer ${
                      isSelected ? "bg-[#27272A] text-white" : "hover:bg-gray-800"
                    }`}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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

      <div className="rounded-xl border border-[#27272A] p-4 min-h-[200px] overflow-auto">
       <div className="mb-4">
  {selectedStudent && (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownloadStudent}
      className="
        gap-2
        border-black
        text-black
        hover:bg-black
        hover:text-white
        hover:border-white
        transition-colors
        duration-200
        ease-in-out
      "
    >
      <Download className="h-4 w-4" />
      Download This Student’s Stats
    </Button>
  )}
</div>
        {selectedStudent ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#27272A]">
                {["Question","Marks","Option","Feedback"].map((h) => (
                  <TableHead key={h} className="text-white">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedStudent.answers.map((ans: Answer) => {
                const letter = ans.optionSelected != null
                  // Options are 1, 2, 4, 8, 16 so we're taking them back to 1, 2, 3, 4, 5 with log
                  ? String.fromCharCode(65 + Math.log2(ans.optionSelected))
                  : "";
                return (
                  <TableRow key={ans.questionId} className="border-b border-[#27272A]">
                    <TableCell>{ans.questionId}</TableCell>
                    <TableCell>{ans.mark}</TableCell>
                    <TableCell>{letter}</TableCell>
                    <TableCell>
                      <Input
                        key={ans.feedback ?? ""}
                        defaultValue={ans.feedback ?? ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value;
                            onFeedbackChange(
                              ans.questionId,
                              selectedStudent.auid,
                              val
                            );
                            // blur to remount with new feedback or revert on cancel
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                       className="w-full border border-[#27272A] text-white"
                     />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-gray-400">Select a student to view details</div>
          

        )}
      </div>
    </div>
  );
}
