import { Question } from "./examData";

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

export interface SolutionKey {
    source: Question[];
    versionSolutions: VersionSolution[];
}
