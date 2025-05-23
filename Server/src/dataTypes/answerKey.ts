import { Feedback } from './examData';

export interface QuestionSolution {
    questionId: number;
    answers: number[];
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

export interface Metadata {
    courseName?: string;
}

export interface AnswerKey {
    metadata: Metadata;
    source: AnswerKeyQuestion[];
    versionSolutions: VersionSolution[];
}
