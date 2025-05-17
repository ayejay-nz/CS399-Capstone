import { teleformParser } from '../parsers/teleformParser';
import { parseAnswerKeyXLSX } from '../parsers/answerKeyParser';
import {
    Answer,
    ExamBreakdown,
    OptionBreakdown,
    QuestionBreakdown,
    StudentBreakdown,
    Summary,
} from '../dataTypes/examBreakdown';
import { AnswerKey, AnswerKeyQuestion, VersionSolution } from '../dataTypes/answerKey';
import { StudentTeleformData, TeleformData } from '../dataTypes/teleformData';
import ApiError from '../utils/apiError';
import {
    API_ERROR_CODE,
    API_ERROR_MESSAGE,
    HTTP_STATUS_CODE,
    NO_ANSWER,
} from '../constants/constants';
import { teleformAnswerToIndex } from '../utils/answerKey';
import { toPercentage2dp } from '../utils/format';

function getExamMarks(questions: AnswerKeyQuestion[]) {
    let marks = 0;
    questions.forEach((question) => {
        marks += question.marks;
    });

    return marks;
}

function generateStudentBreakdown(
    studentData: StudentTeleformData,
    versionSolution: VersionSolution,
): StudentBreakdown {
    let mark = 0;
    let totalCorrect = 0;
    let questionsAnswered = 0;
    let answers: Answer[] = [];

    const studentAnswers = studentData.answers;

    versionSolution.questionSolutions.forEach((qSolution, qIdx) => {
        const questionId = qSolution.questionId;
        const studentAnswer = studentAnswers[qIdx] || NO_ANSWER;
        let isCorrect = false;

        // Check if the student answered
        if (studentAnswer === NO_ANSWER) {
            answers.push({
                questionId: questionId,
                optionSelected: undefined,
                isCorrect: false,
            });
            return;
        }

        // Check if the student answered correctly
        if (qSolution.answers.includes(studentAnswer)) {
            mark += qSolution.mark;
            totalCorrect += 1;
            isCorrect = true;
        }

        questionsAnswered += 1;

        answers.push({
            questionId: questionId,
            optionSelected: studentAnswer,
            isCorrect: isCorrect,
        });
    });

    const studentBreakdown: StudentBreakdown = {
        auid: studentData.auid,
        lastName: studentData.lastName,
        firstName: studentData.firstName,
        versionNumber: studentData.versionNumber,
        totalCorrect: totalCorrect,
        totalAnswered: questionsAnswered,
        mark: mark,
        answers: answers,
    };

    return studentBreakdown;
}

function generateQuestionsBreakdown(
    studentsBreakdown: StudentBreakdown[],
    answerKey: AnswerKey,
): QuestionBreakdown[] {
    const questionsBreakdown: QuestionBreakdown[] = [];
    const source = answerKey.source;
    const versionSolutions = answerKey.versionSolutions;

    // Create skeleton structure for each question
    source.forEach((question) => {
        const optionsBreakdown: OptionBreakdown[] = [];

        // Create skeleton structure for each option
        question.options.forEach((_, optionIdx) => {
            const isCorrect = optionIdx === 0; // First option is correct
            optionsBreakdown.push({
                optionNumber: optionIdx,
                timesPicked: 0,
                pickPercentage: 0,
                isCorrect: isCorrect,
            });
        });

        questionsBreakdown.push({
            questionId: question.id,
            totalAnswers: 0,
            totalCorrectAnswers: 0,
            percentageCorrect: 0,
            optionBreakdown: optionsBreakdown,
        });
    });

    // Populate question breakdown
    studentsBreakdown.forEach((studentBreakdown) => {
        const versionNumber = studentBreakdown.versionNumber;
        const studentSolutions = versionSolutions.find(
            (v) => v.versionNumber === versionNumber,
        )!.questionSolutions;

        studentBreakdown.answers.forEach((answer) => {
            const qId = answer.questionId;
            const optionSelected = answer.optionSelected;
            const isCorrect = answer.isCorrect;

            // Find the question answered by the student in the questions breakdown
            const qBreakdown = questionsBreakdown.find((question) => question.questionId === qId);

            // Get the randomised option order for this question
            const optionOrder = studentSolutions.find((q) => q.questionId === qId)!.optionSequence;

            // Question doesn't exist
            if (!qBreakdown) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.markingProcessFailed,
                    API_ERROR_CODE.MARKING_PROCESS_FAILED,
                );
            }

            qBreakdown.totalAnswers += 1;
            if (isCorrect) qBreakdown.totalCorrectAnswers += 1;
            if (optionSelected) {
                const optionIndex = teleformAnswerToIndex(optionSelected);
                const originalIndex = optionOrder[optionIndex]; // Get option in source exam
                // Find the option selected by the student in the question breakdown
                const oBreakdown = qBreakdown.optionBreakdown.find(
                    (option) => option.optionNumber === originalIndex,
                );

                // Option doesn't exist
                if (!oBreakdown) {
                    throw new ApiError(
                        HTTP_STATUS_CODE.BAD_REQUEST,
                        API_ERROR_MESSAGE.markingProcessFailed,
                        API_ERROR_CODE.MARKING_PROCESS_FAILED,
                    );
                }

                oBreakdown.timesPicked += 1;
            }
        });
    });

    // Update percentage values
    questionsBreakdown.forEach((qBreakdown) => {
        qBreakdown.percentageCorrect = toPercentage2dp(
            qBreakdown.totalCorrectAnswers / qBreakdown.totalAnswers,
        );

        // Update option percentage values
        qBreakdown.optionBreakdown.forEach((oBreakdown) => {
            oBreakdown.pickPercentage = toPercentage2dp(
                oBreakdown.timesPicked / qBreakdown.totalAnswers,
            );
        });
    });

    return questionsBreakdown;
}

function generateSummary(
    studentsBreakdown: StudentBreakdown[],
    questionsBreakdown: QuestionBreakdown[],
    questions: AnswerKeyQuestion[],
): Summary {
    const studentMarks = studentsBreakdown.map((student) => student.mark);
    const examMarks = getExamMarks(questions);

    const studentScores = studentMarks.map((mark) => toPercentage2dp(mark / examMarks));

    const sortedStudentMarks = [...studentMarks].sort((a, b) => a - b);
    const n = sortedStudentMarks.length;

    const median = (a: number[]): number => {
        const m = a.length;
        const mid = Math.floor(m / 2);
        return m % 2 === 0 ? (a[mid - 1]! + a[mid]!) / 2 : a[mid]!;
    };

    const min = sortedStudentMarks[0];
    const max = sortedStudentMarks[n - 1];

    const med = median(sortedStudentMarks);

    const midIndex = Math.floor(n);
    const lowerHalf = sortedStudentMarks.slice(0, midIndex);
    const upperHalf = sortedStudentMarks.slice(n % 2 === 0 ? midIndex : midIndex + 1);

    const lowerQuartile = median(lowerHalf);
    const upperQuartile = median(upperHalf);

    const lowestScoringQuestions: number[] = [...questionsBreakdown]
        .sort((a, b) => a.percentageCorrect - b.percentageCorrect)
        .map((question) => question.questionId);

    return {
        lowestScore: min,
        lowerQuartile: lowerQuartile,
        median: med,
        upperQuartile: upperQuartile,
        highestScore: max,
        examMarks: examMarks,
        studentScores: studentScores,
        lowestScoringQuestions: lowestScoringQuestions,
    } as Summary;
}

export function generateExamBreakdown(
    answerKey: AnswerKey,
    teleformData: TeleformData,
): ExamBreakdown {
    const versionSolutions = answerKey.versionSolutions;
    const questions = answerKey.source;
    const studentsBreakdown: StudentBreakdown[] = [];

    // Generate students breakdown
    teleformData.studentAnswers.forEach((student) => {
        const examVersion = student.versionNumber;
        const versionSolution = versionSolutions.find((v) => v.versionNumber === examVersion);

        if (!versionSolution) {
            throw new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.markingProcessFailed,
                API_ERROR_CODE.MARKING_PROCESS_FAILED,
            );
        }

        const studentBreakdown = generateStudentBreakdown(student, versionSolution);
        studentsBreakdown.push(studentBreakdown);
    });

    const questionsBreakdown = generateQuestionsBreakdown(studentsBreakdown, answerKey);
    const summary = generateSummary(studentsBreakdown, questionsBreakdown, questions);

    return {
        summary: summary,
        students: studentsBreakdown,
        questions: questionsBreakdown,
    } as ExamBreakdown;
}
