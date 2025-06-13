import { AppendixPage, Coverpage } from './coverpage';

export type BrandType<K, T> = K & { __type: T };
export type ImageURI = BrandType<{ imageUri: string }, 'ImageURI'>;
export type TableURI = BrandType<{ tableUri: string }, 'TableURI'>;
export type QuestionText = BrandType<{ questionText: string }, 'QuestionText'>;
export type SectionText = BrandType<{ sectionText: string }, 'SectionText'>;

export const FeedbackDefaults: Feedback = {
    correctFeedback: 'Correct',
    incorrectFeedback: 'Incorrect',
};

export interface Feedback {
    correctFeedback?: string;
    incorrectFeedback?: string;
}

export interface Question {
    question: {
        marks: number;
        id: number;
        feedback: Feedback;
        content: (QuestionText | ImageURI | TableURI | MathBlock)[];
        options: string[]; // first option is correct
    };
}

export interface Section {
    section: {
        questionCount: number | null;
        content: (SectionText | ImageURI | TableURI)[];
    };
}

export interface ExamData {
    content: (Question | Section | AppendixPage | Coverpage)[]; // Remove Section later -- made redundant by AppendixPage, although may have to add attachments? Angela doesn't make it very clear. could be better to store a reference to once instead.
}

export interface MathBlock {
  mathXml: string;
  __type: "MathBlock";
}
