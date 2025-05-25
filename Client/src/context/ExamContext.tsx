"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type {
  ExamBreakdown,
  Summary,
  QuestionBreakdown,
  StudentBreakdown,
  AnswerKeyQuestion,
} from "../dataTypes/examBreakdown";

import testPayload from "./test.json";


interface ExamCtx {
  stats: ExamBreakdown | null;
  summary: Summary | null;
  questionStats: QuestionBreakdown[] | null;
  students: StudentBreakdown[] | null;
  answerKey: AnswerKeyQuestion[] | null;
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

  const [stats, setStats] = useState<ExamBreakdown | null>(null);
  const [answerKey, setAnswerKey] = useState<AnswerKeyQuestion[] | null>(null);

  const handleResponse = (
    payload: [
      { stats: ExamBreakdown },
      { questions: AnswerKeyQuestion[] }
    ]
  ) => {
    const statsPayload = payload[0].stats;
    const keyPayload = payload[1].questions;

    setAnswerKey(keyPayload);

    const keyById = Object.fromEntries(
      keyPayload.map((q) => [q.id, q])
    ) as Record<number, AnswerKeyQuestion>;

    const enriched = statsPayload.questions.map((qb) => {
      const meta = keyById[qb.questionId];
      return {
        ...qb,
        questionText: meta.content,
        marks:        meta.marks,
        options:      meta.options,
      };
    });

    setStats({ ...statsPayload, questions: enriched });
  };

  // const fetchExam = async () => {
  //   const res = await fetch("http://localhost:8000/api/exam-breakdown");
  //   if (!res.ok) throw new Error("Failed to fetch exam");
  //   const payload = (await res.json()) as [
  //     { stats: ExamBreakdown },
  //     { questions: AnswerKeyQuestion[] }
  //   ];
  //   handleResponse(payload);
  // };

  // useEffect(() => {
  //   void fetchExam();
  // }, []);

  useEffect(() => {
    handleResponse(testPayload);
  }, []);

  const update = async (change: object) => {
    const res = await fetch(
      "http://localhost:8000/api/exam-breakdown/update-dashboard",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(change),
      }
    );
    if (!res.ok) {
      console.error("Failed to update exam");
      return;
    }
    const payload = (await res.json()) as [
      { stats: ExamBreakdown },
      { questions: AnswerKeyQuestion[] }
    ];
    handleResponse(payload);
  };

  const updateQuestion = (
    questionId: number,
    updatedFields: Partial<QuestionBreakdown>
  ) => update({ type: "correctness", questionId, correctOptions: (updatedFields as any).correctAnswers });

  const updateFeedback = (
    questionId: number,
    auid: string,
    customFeedback: string
  ) => update({ type: "feedback", questionId, auid, customFeedback });

  // derive slices
  const summary = useMemo<Summary | null>(() => stats?.summary ?? null, [stats]);
  const questionStats = useMemo<QuestionBreakdown[] | null>(() => stats?.questions ?? null, [stats]);
  const students = useMemo<StudentBreakdown[] | null>(() => stats?.students ?? null, [stats]);

  const value = useMemo(
    () => ({ stats, summary, questionStats, students, answerKey, updateQuestion, updateFeedback }),
    [stats, answerKey]
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
}