"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import type {
  ExamBreakdown,
  Summary,
  QuestionBreakdown,
  StudentBreakdown,
  AnswerKeyQuestion,
} from "../dataTypes/examBreakdown";
import { toast } from "sonner";

interface ExamCtx {
  stats: ExamBreakdown | null;
  summary: Summary | null;
  questionStats: QuestionBreakdown[] | null;
  students: StudentBreakdown[] | null;
  answerKey: AnswerKeyQuestion[] | null;
  refresh: () => Promise<void>;
  updateQuestion: (
    questionId: number,
    updatedFields: Partial<QuestionBreakdown>,
  ) => Promise<void>;
  updateFeedback: (
    questionId: number,
    auid: string,
    customFeedback: string,
  ) => Promise<void>;
  handleResponse: (
    payload: [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }],
  ) => void;
}

const ExamContext = createContext<ExamCtx | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<ExamBreakdown | null>(null);
  const [answerKey, setAnswerKey] = useState<AnswerKeyQuestion[] | null>(null);

  const handleResponse = (
    payload: [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }],
  ) => {
    const statsPayload = payload[0].stats;
    const keyPayload = payload[1].questions;

    setAnswerKey(keyPayload);

    const keyById = Object.fromEntries(
      keyPayload.map((q) => [q.id, q]),
    ) as Record<number, AnswerKeyQuestion>;

    const enrichedQuestions = statsPayload.questions.map((qb) => {
      const meta = keyById[qb.questionId];

      // correctAnswers indices from optionBreakdown
      const correctAnswerIndices = qb.optionBreakdown
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.optionNumber);

      return {
        ...qb,
        questionText: meta.content,
        marks: meta.marks,
        options: meta.options,
        correctAnswers: correctAnswerIndices,
      };
    });

    const enrichedStudents = statsPayload.students;
    const enrichedSummary = statsPayload.summary;

    setStats({
      summary: enrichedSummary,
      students: enrichedStudents,
      questions: enrichedQuestions,
    });
  };
  // TODO: Aidan uncomment below make sure this is the JSON endpoint to fetch from
  const fetchExam = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/marking/generate-stats",
      );
      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.message);
        return;
      }
      const payload = (await res.json()) as [
        { stats: ExamBreakdown },
        { questions: AnswerKeyQuestion[] },
      ];
      handleResponse(payload);
      toast.success("Exam stats generated successfully");
    } catch (err) {
      console.error("Error fetching exam:", err);
      toast.error("Failed to connect to server");
    }
  };

  useEffect(() => {
    void fetchExam();
  }, []);

  const update = async (change: object) => {
    try {
      const res = await fetch(
        "http://localhost:8000/api/exam-breakdown/update-dashboard",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(change),
        },
      );
      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.message);
        return;
      }
      const payload = (await res.json()) as [
        { stats: ExamBreakdown },
        { questions: AnswerKeyQuestion[] },
      ];
      handleResponse(payload);
      toast.success("Dashboard updated successfully");
    } catch (err) {
      console.error("Error updating dashboard:", err);
      toast.error("Failed to connect to server");
    }
  };

  const updateQuestion = (questionId: number, updatedFields: any) =>
    update({
      type: "correctness",
      questionId,
      correctOptions: updatedFields.correctAnswers,
    });

  const updateFeedback = (
    questionId: number,
    auid: string,
    customFeedback: string,
  ) => update({ type: "feedback", questionId, auid, customFeedback });

  // derive slices
  const summary = stats?.summary ?? null;
  const questionStats = stats?.questions ?? null;
  const students = stats?.students ?? null;

  const value = useMemo(
    () => ({
      stats,
      summary,
      questionStats,
      students,
      answerKey,
      updateQuestion,
      updateFeedback,
      handleResponse,
    }),
    [stats, answerKey],
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
}
