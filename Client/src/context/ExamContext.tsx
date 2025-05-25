"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
// TODO: adjust import path, add the datatypes to client instead
// import { ExamBreakdown } from "../../../../Server/src/dataTypes/examBreakdown";

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
  // Reload full exam JSON 
  refresh: () => Promise<void>;
  // Update one question locally and persist back to server
  updateQuestion: (
    questionId: string,
    updatedFields: Partial<QuestionBreakdown>
  ) => Promise<void>;
}

const ExamContext = createContext<ExamCtx | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [exam, setExam] = useState<ExamBreakdown | null>(null);

  // Fetch the full exam breakdown JSON 
  const fetchExam = async () => {
    const res = await fetch("http://localhost:8000/api/exam-breakdown");
    if (!res.ok) throw new Error("Failed to fetch exam");
    const data: ExamBreakdown = await res.json();
    setExam(data);
  };

  useEffect(() => {
    fetchExam();
  }, []);

  const updateQuestion = async (
    questionId: string,
    updatedFields: Partial<QuestionBreakdown>
  ) => {
    if (!exam) return;

    // Locally update the exam object
    const updatedQuestions = exam.questions.map((q) =>
      q.questionId === questionId ? { ...q, ...updatedFields } : q
    );
    const updatedExam: ExamBreakdown = { ...exam, questions: updatedQuestions };
    setExam(updatedExam);

    // Persist the full JSON back to the server
    // TODO: Update fetch endpoint
    const res = await fetch("http://localhost:8000/api/exam-breakdown", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedExam),
    });
    if (!res.ok) {
      console.error("Failed to persist exam update");
      // TODO: handle this error 
    }
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
    () => ({ exam, summary, questionStats, students, refresh: fetchExam, updateQuestion }),
    [exam]
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
}
