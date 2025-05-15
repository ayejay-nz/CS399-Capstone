import { Feedback } from './examData';

export interface QuestionSolution {
    questionId: number;
    answers: number[]; // Teleform answer format (1, 2, 4, 8, 16)
    mark: number;
    optionSequence: number[];
}

export interface VersionSolution {
    versionNumber: string;
    questionSolutions: QuestionSolution[];
}

export interface AnswerKeyQuestion {
    marks: number;
    id: number;
    feedback: Feedback;
    content: string;
    options: string[];
}

export interface AnswerKey {
    source: AnswerKeyQuestion[];
    versionSolutions: VersionSolution[];
}
