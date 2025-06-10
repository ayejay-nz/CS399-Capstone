"use client";

import { ReactNode } from "react";
import { ExamProvider } from "@/src/context/ExamContext";

export default function MarkMcqLayout({ children }: { children: ReactNode }) {
  return <ExamProvider>{children}</ExamProvider>;
}
