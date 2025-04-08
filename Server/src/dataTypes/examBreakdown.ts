interface Summary {
    lowestScore: number;
    lowerQuartile: number;
    median: number;
    upperQuartile: number;
    highestScore: number;
    lowestScoringQuestions: number[]; // array of question ids with the lowest mark
}

interface Answer {
    questionId: number;
    optionSelected?: number;
    isCorrect: boolean;
    customFeedback?: string;
}

interface StudentBreakdown {
    auid?: string;
    lastName?: string;
    firstName?: string;
    versionNumber: string;
    totalCorrect: number;
    totalAnswered: number;
    mark: number;
    answers: Answer[];
}

interface OptionBreakdown {
    optionNumber: number;
    timesPicked: number;
    pickPercentage: number;
    isCorrect: boolean;
}

interface QuestionBreakdown {
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
