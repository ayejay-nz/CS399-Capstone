import { createExamVersions } from '../../src/services/examVersioning';
import { ExamData, FeedbackDefaults, Question, Section } from '../../src/dataTypes/examData';
import { VersionedExam } from '../../src/dataTypes/versionedExam';
import { padTo8 } from '../../src/utils/format';
import * as shuffleUtils from '../../src/utils/shuffle';
import { DEFAULT_EXAM_VERSIONS } from '../../src/constants/constants';

describe('createExamVersions()', () => {
    let generateOptionOrderSpy: jest.SpyInstance;

    beforeEach(() => {
        generateOptionOrderSpy = jest.spyOn(shuffleUtils, 'generateOptionOrder');
    });

    afterEach(() => {
        generateOptionOrderSpy.mockRestore();
    });

    it('creates the correct number of versions with the padded version numbers', () => {
        const emptyData: ExamData = { content: [] };
        const result = createExamVersions(emptyData);

        expect(result).toHaveLength(DEFAULT_EXAM_VERSIONS);
        expect(result.map((v) => v.versionNumber)).toEqual(
            Array.from({ length: DEFAULT_EXAM_VERSIONS }, (_, i) => padTo8(i + 1)),
        );
        expect(generateOptionOrderSpy).not.toHaveBeenCalled();
    });

    it('should skip Section blocks', () => {
        const examData: ExamData = {
            content: [
                {
                    section: {
                        questionCount: 1,
                        content: [{ __type: 'SectionText', sectionText: 'S1' }],
                    },
                },
            ],
        };

        createExamVersions(examData);

        expect(generateOptionOrderSpy).not.toHaveBeenCalled();
    });

    it('should call generateOptionOrder for each question in each version', () => {
        const examData: ExamData = {
            content: [
                {
                    question: {
                        marks: 1,
                        id: 1,
                        feedback: FeedbackDefaults,
                        content: [{ __type: 'QuestionText', questionText: 'Q1' }],
                        options: ['a', 'b', 'c'],
                    },
                },
                {
                    question: {
                        marks: 1,
                        id: 2,
                        feedback: FeedbackDefaults,
                        content: [{ __type: 'QuestionText', questionText: 'Q1' }],
                        options: ['a', 'b', 'c', 'd', 'e'],
                    },
                },
            ],
        };

        createExamVersions(examData);

        // Called for both Q1 and Q2
        expect(generateOptionOrderSpy).toHaveBeenCalledTimes(DEFAULT_EXAM_VERSIONS * 2);
        expect(generateOptionOrderSpy).toHaveBeenCalledWith(3); // Q1 has 3 options
        expect(generateOptionOrderSpy).toHaveBeenCalledWith(5); // Q2 has 5 options
    });

    it('should correctly assign generated option orders to each version', () => {
        const q1Options = ['a', 'b', 'c'];
        const q2Options = ['a', 'b', 'c', 'd', 'e'];
        const expectedQ1Order = Array.from({ length: q1Options.length }, (_, i) => i + 1); // Array of 1 to q1Options.length
        const expectedQ2Order = Array.from({ length: q2Options.length }, (_, i) => i + 1); // Array of 1 to q2Options.length
        const examData: ExamData = {
            content: [
                {
                    question: {
                        marks: 1,
                        id: 1,
                        feedback: FeedbackDefaults,
                        content: [{ __type: 'QuestionText', questionText: 'Q1' }],
                        options: q1Options,
                    },
                },
                {
                    section: {
                        questionCount: 1,
                        content: [{ __type: 'SectionText', sectionText: 'S1' }],
                    },
                },
                {
                    question: {
                        marks: 1,
                        id: 2,
                        feedback: FeedbackDefaults,
                        content: [{ __type: 'QuestionText', questionText: 'Q1' }],
                        options: q2Options,
                    },
                },
            ],
        };

        const examVersions = createExamVersions(examData);

        expect(examVersions).toHaveLength(DEFAULT_EXAM_VERSIONS);
        expect(generateOptionOrderSpy).toHaveBeenCalledTimes(DEFAULT_EXAM_VERSIONS * 2);

        // Check properties of each version
        examVersions.forEach((version) => {
            expect(version.optionOrder).toHaveLength(2);

            // Check properties for Q1
            const q1Order = version.optionOrder[0];
            expect(q1Order).toBeInstanceOf(Array);
            expect(q1Order).toHaveLength(q1Options.length);
            expect([...q1Order!].sort((a, b) => a - b)).toEqual(expectedQ1Order); // q1Order contains all 1 to the number of Q1 options

            // Check properties for Q2
            const q2Order = version.optionOrder[1];
            expect(q2Order).toBeInstanceOf(Array);
            expect(q2Order).toHaveLength(q2Options.length);
            expect([...q2Order!].sort((a, b) => a - b)).toEqual(expectedQ2Order); // q2Order contains all 1 to the number of Q2 options
        });
    });
});
