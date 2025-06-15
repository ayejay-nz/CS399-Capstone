export interface Feedback {
    correct: string;
    incorrect: string;
  }
  
  export interface Question {
    id: string;
    content: string;
    options: string[];
    marks?: number;
    feedback?: Feedback;
  }
  