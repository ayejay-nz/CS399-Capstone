type BrandType<K, T> = K & { __type: T };
type ImageURI = BrandType<{ imageUri: string }, 'ImageURI'>;
type TableURI = BrandType<{ tableUri: string }, 'TableURI'>;
type QuestionText = BrandType<{ questionText: string }, 'QuestionText'>;
type SectionText = BrandType<{ sectionText: string }, 'SectionText'>;

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
        content: (QuestionText | ImageURI | TableURI)[];
        options: string[];
    };
}

export interface Section {
    section: {
        questionCount: number;
        content: (SectionText | ImageURI | TableURI)[];
    };
}

export interface ExamData {
    content: (Question | Section)[];
}
