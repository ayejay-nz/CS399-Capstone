export interface Answer {
  questionId: string;
  optionSelected?: string;
  isCorrect: boolean;
}

export interface StudentBreakdown {
  auid: string;
  lastName: string;
  firstName: string;
  versionNumber: number;
  totalCorrect: number;
  totalAnswered: number;
  mark: number;
  answers: Answer[];
}

export interface OptionBreakdown {
  optionNumber: number;
  timesPicked: number;
  pickPercentage: number;
  isCorrect: boolean;
}

export interface QuestionBreakdown {
  questionId: string;
  totalAnswers: number;
  totalCorrectAnswers: number;
  percentageCorrect: number;
  optionBreakdown: OptionBreakdown[];
}

export interface Summary {
  lowestScore: number;
  lowerQuartile: number;
  median: number;
  upperQuartile: number;
  highestScore: number;
  examMarks: number;
  studentScores: number[];
  lowestScoringQuestions: string[];
}

export interface ExamBreakdown {
  summary: Summary;
  students: StudentBreakdown[];
  questions: QuestionBreakdown[];
}