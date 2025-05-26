import { ExamBreakdown, QuestionBreakdown } from '../../src/dataTypes/examBreakdown';
import { generateStatsTxt } from '../../src/fileExporters/statsGenerator';

describe('generateStatsTxt', () => {
    let mockExamBreakdown: ExamBreakdown;

    beforeEach(() => {
        mockExamBreakdown = {
            summary: {
                lowestScore: 2,
                lowerQuartile: 3,
                median: 4,
                upperQuartile: 5,
                highestScore: 6,
                studentScores: [2, 3, 4, 5, 6],
                lowestScoringQuestions: [2],
            },
            students: [
                {
                    auid: '12345678',
                    lastName: 'Smith',
                    firstName: 'John',
                    versionNumber: '00000001',
                    totalCorrect: 2,
                    totalAnswered: 3,
                    mark: 2,
                    answers: [
                        { questionId: 1, optionSelected: 0, isCorrect: true },
                        { questionId: 2, optionSelected: 1, isCorrect: false },
                        { questionId: 3, optionSelected: 2, isCorrect: true },
                    ],
                },
                {
                    auid: '87654321',
                    lastName: 'Doe',
                    firstName: 'Jane',
                    versionNumber: '00000002',
                    totalCorrect: 3,
                    totalAnswered: 3,
                    mark: 3,
                    answers: [
                        { questionId: 1, optionSelected: 0, isCorrect: true },
                        { questionId: 2, optionSelected: 0, isCorrect: true },
                        { questionId: 3, optionSelected: 3, isCorrect: true },
                    ],
                },
            ],
            questions: [
                {
                    questionId: 1,
                    totalAnswers: 2,
                    totalCorrectAnswers: 2,
                    percentageCorrect: 100,
                    optionBreakdown: [
                        { optionNumber: 0, timesPicked: 2, pickPercentage: 100, isCorrect: true },
                        { optionNumber: 1, timesPicked: 0, pickPercentage: 0, isCorrect: false },
                        { optionNumber: 2, timesPicked: 0, pickPercentage: 0, isCorrect: false },
                        { optionNumber: 3, timesPicked: 0, pickPercentage: 0, isCorrect: false },
                    ],
                },
                {
                    questionId: 2,
                    totalAnswers: 2,
                    totalCorrectAnswers: 1,
                    percentageCorrect: 50,
                    optionBreakdown: [
                        { optionNumber: 0, timesPicked: 1, pickPercentage: 50, isCorrect: true },
                        { optionNumber: 1, timesPicked: 1, pickPercentage: 50, isCorrect: false },
                        { optionNumber: 2, timesPicked: 0, pickPercentage: 0, isCorrect: false },
                        { optionNumber: 3, timesPicked: 0, pickPercentage: 0, isCorrect: false },
                    ],
                },
                {
                    questionId: 3,
                    totalAnswers: 2,
                    totalCorrectAnswers: 2,
                    percentageCorrect: 100,
                    optionBreakdown: [
                        { optionNumber: 0, timesPicked: 0, pickPercentage: 0, isCorrect: true },
                        { optionNumber: 1, timesPicked: 0, pickPercentage: 0, isCorrect: false },
                        { optionNumber: 2, timesPicked: 1, pickPercentage: 50, isCorrect: false },
                        { optionNumber: 3, timesPicked: 1, pickPercentage: 50, isCorrect: false },
                    ],
                },
            ],
        };
    });

    it('should generate a stats text file from exam breakdown', () => {
        const result = generateStatsTxt(mockExamBreakdown);

        // Check that result is a Buffer
        expect(result).toBeInstanceOf(Buffer);

        const content = result.toString();

        // Check for essential content pieces
        // expect(content).toContain('Course: 000');
        expect(content).toContain('Students Count: 2');
        expect(content).toContain('Question Number : 1');
        expect(content).toContain('Question Number : 2');
        expect(content).toContain('Question Number : 3');

        // Check for formatting
        expect(content).toContain('Options :');
        expect(content).toContain('Answer\t\tNumber Of Answers\tPercentage');
        expect(content).toContain(
            '=====================================================================================================',
        );

        // Check for specific question stats
        expect(content).toContain('0) \t\t2\t\t\t100.00'); // Question 1, option 0
        expect(content).toContain('0) \t\t1\t\t\t50.00'); // Question 2, option 0
        expect(content).toContain('1) \t\t1\t\t\t50.00'); // Question 2, option 1
        expect(content).toContain('Total (without invalid answer):  2'); // Each question has 2 answers
    });

    it('should handle empty exam breakdown', () => {
        const emptyBreakdown: ExamBreakdown = {
            summary: {
                lowestScore: 0,
                lowerQuartile: 0,
                median: 0,
                upperQuartile: 0,
                highestScore: 0,
                studentScores: [],
                lowestScoringQuestions: [],
            },
            students: [],
            questions: [],
        };

        const result = generateStatsTxt(emptyBreakdown);
        expect(result).toBeInstanceOf(Buffer);
        expect(result.toString()).toBe('No student data available.');
    });

    it('should handle exam with no questions but with students', () => {
        mockExamBreakdown.questions = [];

        const result = generateStatsTxt(mockExamBreakdown);
        expect(result).toBeInstanceOf(Buffer);
        expect(result.toString()).toBe('No student data available.');
    });

    it('should handle exam with questions but no students', () => {
        mockExamBreakdown.students = [];

        const result = generateStatsTxt(mockExamBreakdown);
        expect(result).toBeInstanceOf(Buffer);
        expect(result.toString()).toBe('No student data available.');
    });

    it('should display correct percentage values', () => {
        // Add a question with specific distribution for testing percentage formatting
        const testQuestion: QuestionBreakdown = {
            questionId: 4,
            totalAnswers: 3,
            totalCorrectAnswers: 1,
            percentageCorrect: 33.33,
            optionBreakdown: [
                { optionNumber: 0, timesPicked: 1, pickPercentage: 33.33, isCorrect: true },
                { optionNumber: 1, timesPicked: 1, pickPercentage: 33.33, isCorrect: false },
                { optionNumber: 2, timesPicked: 1, pickPercentage: 33.34, isCorrect: false }, // Slightly different to test rounding
            ],
        };

        mockExamBreakdown.questions.push(testQuestion);

        const result = generateStatsTxt(mockExamBreakdown);
        const content = result.toString();

        expect(content).toContain('Question Number : 4');
        expect(content).toContain('0) \t\t1\t\t\t33.33');
        expect(content).toContain('1) \t\t1\t\t\t33.33');
        expect(content).toContain('2) \t\t1\t\t\t33.34');
        expect(content).toContain('Total (without invalid answer):  3');
    });
});

