type BrandType<K, T> = K & { __type: T };
type ImageURI = BrandType<{ imageUri: string }, "ImageURI">;
type QuestionText = BrandType<{ questionText: string }, "QuestionText">;
type SectionText = BrandType<{ sectionText: string }, "SectionText">;

export const FeedbackDefaults: Feedback = {
    correctFeedback: "Correct",
    incorrectFeedback: "Incorrect",
};

interface Feedback {
    correctFeedback?: string;
    incorrectFeedback?: string;
}

interface Question {
    question: {
        marks: number;
        id: number;
        feedback: Feedback;
        content: (QuestionText | ImageURI)[];
        options: string[];
    }
}

interface Section {
    section: {
        questionCount: number;
        content: (SectionText | ImageURI)[];
    };
}

export interface ExamData {
    content: (Question | Section)[];
}
