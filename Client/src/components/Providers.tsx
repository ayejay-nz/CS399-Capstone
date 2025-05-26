"use client";

import React from "react";
import { ExamProvider } from "../context/ExamContext";


export function Providers({ children }: { children: React.ReactNode }) {
  return <ExamProvider>{children}</ExamProvider>;
}