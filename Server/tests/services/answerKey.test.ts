import { ExamData, Section, Question } from '../../src/dataTypes/examData';
import { VersionedExam } from '../../src/dataTypes/versionedExam';
import {
    getMarksAndIds,
    generateVersionSolutions,
    generateAnswerKey,
} from '../../src/services/answerKey';

const sampleSection: Section = {
    section: {
        questionCount: 1,
        content: [{ __type: 'SectionText', sectionText: 'Blah Blah Blah' }],
    },
};
const sampleQuestions: Question[] = [
    {
        question: {
            id: 10,
            marks: 2,
            feedback: {},
            content: [{ __type: 'QuestionText', questionText: 'Pick the smallest number.' }],
            options: ['1', '2', '3'],
        },
    },
    {
        question: {
            id: 20,
            marks: 5,
            feedback: {},
            content: [
                {
                    __type: 'QuestionText',
                    questionText: 'What is the first letter of the alphabet?',
                },
            ],
            options: ['a', 'b', 'c', 'd'],
        },
    },
];
const examData: ExamData = {
    content: [sampleSection, ...sampleQuestions],
};
const versions: VersionedExam[] = [
    {
        versionNumber: '00000001',
        optionOrders: [
            [1, 0, 2], // Correct option in index 1
            [3, 2, 0, 1], // Correct option in index 2
        ],
    },
    {
        versionNumber: '00000002',
        optionOrders: [
            [0, 2, 1], // Correct option in index 0
            [2, 3, 1, 0], // Correct option in index 3
        ],
    },
];

describe('getMarksAndIds()', () => {
    it('gets ids and marks in the correct order, skipping sections', () => {
        const [marks, ids] = getMarksAndIds(examData);

        expect(marks).toEqual([2, 5]);
        expect(ids).toEqual([10, 20]);
    });

    it('returns two empty arrays if there are no questions', () => {
        const [marks, ids] = getMarksAndIds({ content: [sampleSection] });

        expect(marks).toEqual([]);
        expect(ids).toEqual([]);
    });
});

describe('generateVersionSolutions()', () => {
    it('builds versionSolutions correctly', () => {
        const solutions = generateVersionSolutions(versions, examData);

        expect(solutions).toHaveLength(2);
        expect(solutions).toEqual([
            {
                versionNumber: '00000001',
                questionSolutions: [
                    {
                        questionId: 10,
                        answers: [2], // Answer stored in teleform format
                        mark: 2,
                        optionSequence: [1, 0, 2],
                    },
                    {
                        questionId: 20,
                        answers: [4], // Answer stored in teleform format
                        mark: 5,
                        optionSequence: [3, 2, 0, 1],
                    },
                ],
            },
            {
                versionNumber: '00000002',
                questionSolutions: [
                    {
                        questionId: 10,
                        answers: [1], // Answer stored in teleform format
                        mark: 2,
                        optionSequence: [0, 2, 1],
                    },
                    {
                        questionId: 20,
                        answers: [8], // Answer stored in teleform format
                        mark: 5,
                        optionSequence: [2, 3, 1, 0],
                    },
                ],
            },
        ]);
    });
});

describe('generateAnswerKey()', () => {
    it('extracts all questions into source and generates versionSolutions via generateVersionSolutions', () => {
        const answerKey = generateAnswerKey(versions, examData);
        const expectedVersionSolutions = generateVersionSolutions(versions, examData);

        expect(answerKey.source).toEqual(sampleQuestions);
        expect(answerKey.versionSolutions.length).toEqual(versions.length);
        expect(answerKey.versionSolutions).toEqual(expectedVersionSolutions);
    });
});
