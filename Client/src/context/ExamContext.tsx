// ExamContext.tsx
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
  UpdateQuestionFields,
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
    updatedFields: UpdateQuestionFields
  ) => Promise<void>;
  updateFeedback: (
    questionId: number,
    auid: string,
    customFeedback: string
  ) => Promise<void>;

  handleResponse: (
    payload: [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }],
    newSession?: boolean
  ) => void;

  setSessionInfo: (sessionId: string, expiry: Date) => void;
  clearSession: () => void;
  checkSessionStatus: () => Promise<boolean>;
  loadSessionData: () => Promise<void>;
}

const ExamContext = createContext<ExamCtx | undefined>(undefined);

function trimAtQuestion(text: string): string {
  const withoutMarkBlock = text.replace(
    /^\s*\[\s*(?:\d+\s*)?marks?\s*\]\s*/i,
    ""
  );
  const idx = withoutMarkBlock.lastIndexOf("?");
  if (idx === -1) {
    return withoutMarkBlock;
  }
  const upToQuestion = withoutMarkBlock.slice(0, idx + 1);
  const firstLetterIdx = upToQuestion.search(/[A-Za-z]/);
  if (firstLetterIdx === -1) {
    return "";
  }
  return upToQuestion.slice(firstLetterIdx);
}

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<ExamBreakdown | null>(null);
  const [answerKey, setAnswerKey] = useState<AnswerKeyQuestion[] | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);


  const handleResponse = async (
    payload: [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }],
    newSession: boolean = false
  ) => {
    if (newSession) {
      console.log("is this the old sessionID or the new one? " + sessionId);
      if (sessionId) {
        localStorage.removeItem(`dashboardAllTrueMap_${sessionId}`);
      }
      // 2) Clear out old session info
      setSessionId(null);
      setSessionExpiry(null);
      localStorage.removeItem("answerkey_session_id");
      localStorage.removeItem("answerkey_session_expiry");

      const ok = await checkSessionStatus();
      if (!ok) {
        console.warn("handleResponse: server did not return a valid new session.");
      }
    }

    // Now proceed to process the payload (stats + answerKey)
    const statsPayload = payload[0].stats;
    const keyPayload = payload[1].questions;

    setAnswerKey(keyPayload);

    const keyById = Object.fromEntries(
      keyPayload.map((q) => [q.id, q])
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
        const feedback = meta.feedback?.[student.auid] ?? ans.feedback ?? "";
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
    if (sessionId) {
      localStorage.removeItem(`dashboardAllTrueMap_${sessionId}`);
    }

    localStorage.setItem(`dashboardAllTrueMap_${newSessionId}`, JSON.stringify({}));

    setSessionId(newSessionId);
    setSessionExpiry(expiry);
    localStorage.setItem("answerkey_session_id", newSessionId);
    localStorage.setItem("answerkey_session_expiry", expiry.toISOString());
  };

  const clearSession = () => {
    if (sessionId) {
      localStorage.removeItem(`dashboardAllTrueMap_${sessionId}`);
    }
    setSessionId(null);
    setSessionExpiry(null);
    localStorage.removeItem("answerkey_session_id");
    localStorage.removeItem("answerkey_session_expiry");
  };

  // ─── Check server for “current session” (cookie-based). If found, store it.
  const checkSessionStatus = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/sessions/current", {
        credentials: "include",
      });
      if (res.ok) {
        const { data } = await res.json();
        console.log(`Active session found on server: ${data.sessionId}`);

        // If server‐returned session differs from local state, remove old map
        if (data.sessionId !== sessionId && sessionId) {
          localStorage.removeItem(`dashboardAllTrueMap_${sessionId}`);
        }

        // Store server’s session info in React + localStorage
        setSessionId(data.sessionId);
        setSessionExpiry(new Date(data.expiresAt));
        localStorage.setItem("answerkey_session_id", data.sessionId);
        localStorage.setItem("answerkey_session_expiry", data.expiresAt);

        // Initialize its “all-true” map if missing
        const mapKey = `dashboardAllTrueMap_${data.sessionId}`;
        if (!localStorage.getItem(mapKey)) {
          localStorage.setItem(mapKey, JSON.stringify({}));
        }

        return data.hasAnswerKey && data.hasTeleformData;
      }
    } catch (err) {
      console.error("No active session found or session check failed:", err);
      clearSession();
    }
    return false;
  };

  // ─── Load exam data from the current session on the server ───
  const loadSessionData = async (): Promise<void> => {
    try {
      const res = await fetch(
        "/api/v1/marking/generate-stats-from-session",
        {
          method: "POST",
          credentials: "include",
        }
      );
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
      toast.success("Exam data loaded from session");
    } catch (err) {
      console.error("Error loading session data:", err);
      toast.error("Failed to load session data");
    }
  };

  // ─── On mount: check if localStorage has a valid (unexpired) sessionId/expiry ───
  useEffect(() => {
    const storedSessionId = localStorage.getItem("answerkey_session_id");
    const storedSessionExpiry = localStorage.getItem("answerkey_session_expiry");

    if (storedSessionId && storedSessionExpiry) {
      const expiryDate = new Date(storedSessionExpiry);
      // If expiry is still in the future, restore that session:
      if (expiryDate > new Date()) {
        setSessionId(storedSessionId);
        setSessionExpiry(expiryDate);

        // Ensure its “all-true” map exists (init if missing)
        const mapKey = `dashboardAllTrueMap_${storedSessionId}`;
        if (!localStorage.getItem(mapKey)) {
          localStorage.setItem(mapKey, JSON.stringify({}));
        }

        // Then verify with server and load data if ready
        checkSessionStatus().then((hasData) => {
          if (hasData) {
            console.log("Complete session found, loading data");
            loadSessionData();
          }
        });
      } else {
        // Already expired locally → clear everything
        clearSession();
      }
    } else {
      // No stored session → ask server if a cookie-based session exists
      checkSessionStatus();
    }
  }, []);

  // ─── “Update dashboard” endpoint ───
  const update = async (change: object) => {
    const test_data_stuff = JSON.stringify(change);
    try {
      const res = await fetch(
        "/api/v1/marking/update-dashboard",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(change),
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        const errorJson = JSON.parse(errorText);
        toast.error(errorJson.message);
        return;
      }
      const json = await res.json();
      console.log(json.data);
      const payload = json.data as [
        { stats: ExamBreakdown },
        { questions: AnswerKeyQuestion[] }
      ];

      // Remove later it's just testing
      // const updatedStats = payload[0].stats;
      // const updatedQuestions = updatedStats.questions;

      // console.log("Test is:", test_data_stuff);
      // console.log("Updated question details:");

      // for (const question of updatedQuestions) {
      //   const questionId = question.questionId;
      //   console.log(`- Question ID: ${questionId}`);
      //   console.log("  Percentage Correct:", question.percentageCorrect);
      // }
      // to here
      console.log(payload);
      handleResponse(payload);
      toast.success("Dashboard updated successfully");
    } catch (err) {
      console.error("Error updating dashboard:", err);
      toast.error("Failed to connect to server");
    }
  };

  const updateQuestion = (
    questionId: number,
    updatedFields: UpdateQuestionFields
  ) => {
    update({
      type: "correctness",
      questionId,
      allTrue: updatedFields.allTrue,
      originalValue: updatedFields.originalValue,
    });
  };

  const updateFeedback = (
    questionId: number,
    auid: string,
    customFeedback: string
  ) =>
    update({
      type: "feedback",
      questionId,
      auid,
      customFeedback,
    });

  // ─── Derived slices for easier consumption in components ───
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
    [stats, answerKey, sessionId, sessionExpiry]
  );

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const ctx = useContext(ExamContext);
  if (!ctx) throw new Error("useExam must be inside ExamProvider");
  return ctx;
}
