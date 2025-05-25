export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface Answer {
  questionId: number;
  optionSelected?: number;
  isCorrect: boolean;
  mark: number;
}

export interface StudentBreakdown {
  auid: string;
  lastName: string;
  firstName: string;
  versionNumber: string;
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
  questionId: number;
  questionText: string;
  marks: number;
  totalAnswers: number;
  totalCorrectAnswers: number;
  percentageCorrect: number;
  optionBreakdown: OptionBreakdown[];
  correctAnswers: number[];
}

export interface Summary {
  lowestScore: number;
  lowerQuartile: number;
  median: number;
  upperQuartile: number | null;
  highestScore: number;
  examMarks: number;
  studentScores: number[];
  lowestScoringQuestions: number[];
}

export interface ExamBreakdown {
  summary: Summary;
  students: StudentBreakdown[];
  questions: QuestionBreakdown[];
}
