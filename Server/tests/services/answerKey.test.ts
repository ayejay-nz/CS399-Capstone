import { ExamData } from '../../src/dataTypes/examData';
import { VersionedExam } from '../../src/dataTypes/versionedExam';
import {
    getMarksAndIds,
    generateVersionSolutions,
    generateAnswerKey,
} from '../../src/services/answerKey';

describe('getMarksAndIds()', () => {
    const examData: ExamData = {
        content: [
            {
                section: {
                    questionCount: 1,
                    content: [{ __type: 'SectionText', sectionText: 'What is 1+1?' }],
                },
            },
            {
                question: {
                    id: 10,
                    marks: 2,
                    feedback: {},
                    content: [{ __type: 'QuestionText', questionText: 'What is 1+1?' }],
                    options: ['1', '2', '3'],
                },
            },
            {
                question: {
                    id: 20,
                    marks: 5,
                    feedback: {},
                    content: [{ __type: 'QuestionText', questionText: 'What is 2x2?' }],
                    options: ['1', '2', '4', '8'],
                },
            },
        ],
    };

    it('gets ids and marks in the correct order, skipping sections', () => {
        const [marks, ids] = getMarksAndIds(examData);

        expect(marks).toEqual([2, 5]);
        expect(ids).toEqual([10, 20]);
    });
});

describe('generateVersionSolutions()', () => {
    const examData: ExamData = {
        content: [
            {
                question: {
                    id: 1,
                    marks: 1,
                    feedback: {},
                    content: [],
                    options: ['1', '2', '3'],
                },
            },
            {
                question: {
                    id: 2,
                    marks: 2,
                    feedback: {},
                    content: [],
                    options: ['a', 'b', 'c', 'd'],
                },
            },
        ],
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

    it('builds versionSolutions correctly', () => {
        const solutions = generateVersionSolutions(versions, examData);

        expect(solutions).toHaveLength(2);
        expect(solutions).toEqual([
            {
                versionNumber: '00000001',
                questionSolutions: [
                    {
                        questionId: 1,
                        answers: [2], // Answer stored in teleform format
                        mark: 1,
                        optionSequence: [1, 0, 2],
                    },
                    {
                        questionId: 2,
                        answers: [4], // Answer stored in teleform format
                        mark: 2,
                        optionSequence: [3, 2, 0, 1],
                    },
                ],
            },
            {
                versionNumber: '00000002',
                questionSolutions: [
                    {
                        questionId: 1,
                        answers: [1], // Answer stored in teleform format
                        mark: 1,
                        optionSequence: [0, 2, 1],
                    },
                    {
                        questionId: 2,
                        answers: [8], // Answer stored in teleform format
                        mark: 2,
                        optionSequence: [2, 3, 1, 0],
                    },
                ],
            },
        ]);
    });
});

describe('generateAnswerKey()', () => {
    const examData: ExamData = {
        content: [
            {
                section: {
                    questionCount: 1,
                    content: [{ __type: 'SectionText', sectionText: 'What is 1+1?' }],
                },
            },
            {
                question: {
                    id: 1,
                    marks: 1,
                    feedback: {},
                    content: [],
                    options: ['1', '2', '3'],
                },
            },
            {
                question: {
                    id: 2,
                    marks: 2,
                    feedback: {},
                    content: [],
                    options: ['a', 'b', 'c', 'd'],
                },
            },
        ],
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

    it('extracts all questions into source and generates versionSolutions via generateVersionSolutions', () => {
        const answerKey = generateAnswerKey(versions, examData);
        const expectedVersionSolutions = generateVersionSolutions(versions, examData);

        expect(answerKey.source).toEqual([
            {
                question: {
                    id: 1,
                    marks: 1,
                    feedback: {},
                    content: [],
                    options: ['1', '2', '3'],
                },
            },
            {
                question: {
                    id: 2,
                    marks: 2,
                    feedback: {},
                    content: [],
                    options: ['a', 'b', 'c', 'd'],
                },
            },
        ]);
        expect(answerKey.versionSolutions).toEqual(expectedVersionSolutions);
    });
});
