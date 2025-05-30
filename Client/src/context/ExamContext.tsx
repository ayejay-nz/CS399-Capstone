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
  sessionId: string | null;
  sessionExpiry: Date | null;
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
  setSessionInfo: (sessionId: string, expiry: Date) => void;
  clearSession: () => void;
  checkSessionStatus: () => Promise<boolean>;
  loadSessionData: () => Promise<void>;
}

const ExamContext = createContext<ExamCtx | undefined>(undefined);

function trimAtQuestion(text: string): string {
  const idx = text.indexOf('?');
  return idx === -1 ? text : text.slice(0, idx + 1);
}

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<ExamBreakdown | null>(null);
  const [answerKey, setAnswerKey] = useState<AnswerKeyQuestion[] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  const handleResponse = (
    payload: [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }],
  ) => {

    console.log("handleResponse payload:", payload);
    const statsPayload = payload[0].stats;
    const keyPayload = payload[1].questions;

    setAnswerKey(keyPayload);

    const keyById = Object.fromEntries(
      keyPayload.map((q) => [q.id, q]),
    ) as Record<number, AnswerKeyQuestion>;

    const enrichedQuestions = statsPayload.questions.map((qb) => {
      const meta = keyById[qb.questionId];

      const correctAnswerIndices = qb.optionBreakdown
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.optionNumber);

      return {
        ...qb,
        questionText: trimAtQuestion(meta.content),
        marks: meta.marks,
        options: meta.options,
        correctAnswers: correctAnswerIndices,
      };
    });

 const enrichedStudents = statsPayload.students.map((student) => ({
    ...student,
    answers: student.answers.map((ans) => {
      const meta = keyById[ans.questionId];

      const mark = ans.isCorrect ? meta.marks : 0;

      const feedback =
        meta.feedback?.[student.auid] ?? ans.feedback ?? "";

      return {
        ...ans,
        mark,
        feedback,
      };
    }),
  }));
    const enrichedSummary = statsPayload.summary;

    setStats({
      summary: enrichedSummary,
      students: enrichedStudents,
      questions: enrichedQuestions,
    });
  };

  const setSessionInfo = (newSessionId: string, expiry: Date) => {
    setSessionId(newSessionId);
    setSessionExpiry(expiry);

    // Set session in local storage
    localStorage.setItem('answerkey_session_id', newSessionId);
    localStorage.setItem('answerkey_session_expiry', expiry.toISOString());
  };

  const clearSession = () => {
    setSessionId(null);
    setSessionExpiry(null);

    // Clear from local storage
    localStorage.removeItem('answerkey_session_id');
    localStorage.removeItem('answerkey_session_expiry');
  };

  // Check if there's and active session on the server
  const checkSessionStatus = async (): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/sessions/current', {
        credentials: 'include',
      });

      if (res.ok) {
        const { data } = await res.json();
        console.log(`Active session found on server: ${data.sessionId}`);

        // Update local session info
        setSessionId(data.sessionId);
        setSessionExpiry(new Date(data.expiresAt));

        // Set session in local storage
        localStorage.setItem('answerkey_session_id', data.sessionId);
        localStorage.setItem('answerkey_session_expiry', data.expiresAt);

        return data.hasAnswerKey && data.hasTeleformData;
      }
    } catch (err) {
      console.error('No active session found or session check failed:', err);
      clearSession();
    }

    return false;
  }

  // Load exam data from session
  const loadSessionData = async (): Promise<void> => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/marking/generate-stats-from-session', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (errorData?.message) {
          toast.error(errorData.message);
        } else {
          toast.error(`Server error: ${res.status} ${res.statusText}`);
        }
        return;
      }

      const { data } = await res.json();
      handleResponse(data);
      toast.success('Exam data loaded from session');
    } catch (err) {
      console.error('Error loading session data:', err);
      toast.error('Failed to load session data');
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('answerkey_session_id');
    const storedSessionExpiry = localStorage.getItem('answerkey_session_expiry');

    if (storedSessionId && storedSessionExpiry) {
      const expiryDate = new Date(storedSessionExpiry);

      // Check if expiry date is still valid
      if (expiryDate > new Date()) {
        setSessionId(storedSessionId);
        setSessionExpiry(expiryDate);

        // Verify session with server and potentially load data
        checkSessionStatus().then((hasData) => {
          if (hasData) {
            console.log('Complete session found, loading data');
            loadSessionData(); // Maybe remove this?
          }
        });
      } else {
        clearSession();
      }
    } else {
      // No stored session, check if the server has one anyway (cookie-based)
      checkSessionStatus();
    }
  }, []);

  // TODO: Aidan uncomment below make sure this is the JSON endpoint to fetch from
  // const fetchExam = async () => {
  //   try {
  //     const res = await fetch(
  //       "http://localhost:8000/api/v1/marking/generate-stats-from-session",
  //       {
  //         method: "POST",
  //         credentials: 'include',
  //       },
  //     );
  //     let responseData;
  //     const contentType = res.headers.get("Content-Type");
  //     if (contentType && contentType.includes("application/json")) {
  //       responseData = await res.json();
  //     } else {
  //       responseData = await res.text();
  //     }
  //     if (!res.ok) {
  //       if (
  //         responseData &&
  //         typeof responseData === "object" &&
  //         responseData.message
  //       ) {
  //         toast.error(responseData.message);
  //       } else if (
  //         typeof responseData === "string" &&
  //         responseData.length > 0
  //       ) {
  //         toast.error(`Server error: ${responseData}`);
  //       } else {
  //         toast.error(`Server error: ${res.status} ${res.statusText}`);
  //       }
  //       return;
  //     }
  //     const payload = (await res.json()) as [
  //       { stats: ExamBreakdown },
  //       { questions: AnswerKeyQuestion[] },
  //     ];
  //     handleResponse(payload);
  //     toast.success("Exam stats generated successfully");
  //   } catch (err) {
  //     console.error("Error fetching exam:", err);
  //     toast.error("Failed to connect to server");
  //   }
  // };

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
      sessionId,
      sessionExpiry,
      updateQuestion,
      updateFeedback,
      handleResponse,
      setSessionInfo,
      clearSession,
      checkSessionStatus,
      loadSessionData,
    }),
    [stats, answerKey, sessionId, sessionExpiry],
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
}
