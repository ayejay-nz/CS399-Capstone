"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type {
  ExamBreakdown,
  Summary,
  QuestionBreakdown,
  StudentBreakdown,
} from "../dataTypes/examBreakdown";

interface ExamCtx {
  exam: ExamBreakdown | null;
  summary: Summary | null;
  questionStats: QuestionBreakdown[] | null;
  students: StudentBreakdown[] | null;
  // Reload the full exam JSON
  refresh: () => Promise<void>;
  updateQuestion: (
    questionId: number,
    updatedFields: Partial<QuestionBreakdown>
  ) => Promise<void>;
  updateFeedback: (
    questionId: number,
    auid: string,
    customFeedback: string
  ) => Promise<void>;
}

const ExamContext = createContext<ExamCtx | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [exam, setExam] = useState<ExamBreakdown | null>(null);

  const fetchExam = async () => {
    // TODO: update this fetch 
    const res = await fetch("http://localhost:8000/api/exam-breakdown");
    if (!res.ok) throw new Error("Failed to fetch exam");
    const data: ExamBreakdown = await res.json();
    setExam(data);
  };

  useEffect(() => {
    void fetchExam();
  }, []);

  const updateQuestion = async (
    questionId: number,
    updatedFields: Partial<QuestionBreakdown>
  ) => {
    // TODO: update this fetch 
    const res = await fetch(
      `http://localhost:8000/api/exam-breakdown/questions/${questionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      }
    );
    if (!res.ok) {
      console.error("Failed to update question");
      return;
    }
    const newExam: ExamBreakdown = await res.json();
    setExam(newExam);
  };

  const updateFeedback = async (
    questionId: number,
    auid: string,
    customFeedback: string
  ) => {
    const payload = { auid, customFeedback };
    // TODO: update this fetch 
    const res = await fetch(
      `http://localhost:8000/api/exam-breakdown/questions/${questionId}/feedback`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      console.error("Failed to update feedback");
      return;
    }
    const newExam: ExamBreakdown = await res.json();
    setExam(newExam);
  };

  // Derived slices
  const summary = useMemo<Summary | null>(() => exam?.summary ?? null, [exam]);
  const questionStats = useMemo<QuestionBreakdown[] | null>(
    () => exam?.questions ?? null,
    [exam]
  );
  const students = useMemo<StudentBreakdown[] | null>(
    () => exam?.students ?? null,
    [exam]
  );

  const value = useMemo(
    () => ({ exam, summary, questionStats, students, refresh: fetchExam, updateQuestion, updateFeedback }),
    [exam]
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
}