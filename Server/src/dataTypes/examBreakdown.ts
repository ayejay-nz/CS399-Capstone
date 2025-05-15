export interface Summary {
    lowestScore: number;
    lowerQuartile: number;
    median: number;
    upperQuartile: number;
    highestScore: number;
    studentScores: number[];
    lowestScoringQuestions: number[]; // array of question ids with the lowest mark
}

export interface Answer {
    questionId: number;
    optionSelected?: number; // Teleform answer format (1, 2, 4, 8, 16)
    isCorrect: boolean;
    customFeedback?: string;
}

export interface StudentBreakdown {
    auid?: string;
    lastName?: string;
    firstName?: string;
    versionNumber: string;
    totalCorrect: number;
    totalAnswered: number;
    mark: number;
    answers: Answer[];
}

export interface OptionBreakdown {
    optionNumber: number; // Index format (0, 1, 2, 3, 4)
    timesPicked: number;
    pickPercentage: number;
    isCorrect: boolean;
}

export interface QuestionBreakdown {
    questionId: number;
    totalAnswers: number;
    totalCorrectAnswers: number;
    percentageCorrect: number;
    optionBreakdown: OptionBreakdown[];
}

export interface ExamBreakdown {
    summary: Summary;
    students: StudentBreakdown[];
    questions: QuestionBreakdown[];
}
