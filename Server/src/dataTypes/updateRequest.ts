export interface CorrectnessUpdateRequest {
    type: 'correctness';
    questionId: number;
    allTrue: boolean;
    originalValue: number;
}

export interface FeedbackUpdateRequest {
    type: 'feedback';
    questionId: number;
    auid: string;
    customFeedback: string;
}

export type UpdateRequest = CorrectnessUpdateRequest | FeedbackUpdateRequest;
