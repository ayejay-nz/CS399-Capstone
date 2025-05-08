import { isQuestion, isSection } from '../../src/utils/typeGuards';
import { Question, Section } from '../../src/dataTypes/examData';

describe('isSection() type-guard', () => {
    const exampleQuestion: Question = {
        question: {
            id: 1,
            marks: 2,
            feedback: {},
            content: [{ __type: 'QuestionText', questionText: 'What is 1+1?' }],
            options: ['1', '2', '3'],
        },
    };

    const exampleSection: Section = {
        section: {
            questionCount: 1,
            content: [{ __type: 'SectionText', sectionText: 'What is 1+1?' }],
        },
    };

    it('returns true for a Section block', () => {
        expect(isSection(exampleSection)).toBe(true);
    });

    it('returns false for a Question block', () => {
        expect(isSection(exampleQuestion)).toBe(false);
    });
});

describe('isQuestion() type-guard', () => {
    const exampleQuestion: Question = {
        question: {
            id: 1,
            marks: 2,
            feedback: {},
            content: [{ __type: 'QuestionText', questionText: 'What is 1+1?' }],
            options: ['1', '2', '3'],
        },
    };

    const exampleSection: Section = {
        section: {
            questionCount: 1,
            content: [{ __type: 'SectionText', sectionText: 'What is 1+1?' }],
        },
    };

    it('returns true for a Question block', () => {
        expect(isQuestion(exampleQuestion)).toBe(true);
    });

    it('returns false for a Section block', () => {
        expect(isQuestion(exampleSection)).toBe(false);
    });
});
