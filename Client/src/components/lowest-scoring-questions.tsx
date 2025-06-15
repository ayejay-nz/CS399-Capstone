"use client";

import * as React from "react";
import { Progress } from "../components/ui/progress";
import type { QuestionBreakdown } from "../dataTypes/examBreakdown";

/**
 * Props for LowestScoringQuestions:
 * - questionStats: array of per-question breakdown data (must include questionText and percentageCorrect)
 * - count: how many lowest items to show (default 5)
 */
interface LowestScoringQuestionsProps {
  questionStats: QuestionBreakdown[];
  count?: number;
}

export function LowestScoringQuestions({
  questionStats,
  count = 5,
}: LowestScoringQuestionsProps) {
  const lowest = React.useMemo(
    () =>
      [...questionStats]
        .sort((a, b) => a.percentageCorrect - b.percentageCorrect)
        .slice(0, count),
    [questionStats, count]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">
          Lowest Scoring Questions
        </h3>
        <span className="text-sm text-gray-400">Student’s correct %</span>
      </div>
      <div className="space-y-6">
        {lowest.map((q) => (
          <div key={q.questionId} className="space-y-2">
            <div className="flex justify-between items-start">
              <p className="text-sm flex-1 pr-4 text-white">
                {q.questionId}. {q.questionText}
              </p>
              <span className="text-sm font-medium text-white">
                {q.percentageCorrect}%
              </span>
            </div>
            <Progress
              value={q.percentageCorrect}
              className="
                h-1
                bg-[#27272A]
                rounded-full
                [&_div]:bg-white
              "
            />
          </div>
        ))}
      </div>
    </div>
  );
}