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
import { FeedbackDefaults } from '../dataTypes/examData';

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
    answerKey: AnswerKey,
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

        // Find the question in the answer key to get feedback
        const question = answerKey.source.find(q => q.id === questionId);
        let feedback = 'No feedback available';
        
        if (question) {
            if (studentAnswer === NO_ANSWER) {
                // No answer provided
                feedback = question.feedback.incorrectFeedback || FeedbackDefaults.incorrectFeedback!;
            } else {
                // Check if the student answered correctly
                if (qSolution.answers.includes(studentAnswer)) {
                    mark += qSolution.mark;
                    totalCorrect += 1;
                    isCorrect = true;
                    feedback = question.feedback.correctFeedback || FeedbackDefaults.correctFeedback!;
                } else {
                    feedback = question.feedback.incorrectFeedback || FeedbackDefaults.incorrectFeedback!;
                }
                questionsAnswered += 1;
            }
        }

        answers.push({
            questionId: questionId,
            optionSelected: studentAnswer === NO_ANSWER ? undefined : studentAnswer,
            isCorrect: isCorrect,
            feedback: feedback,
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
                // Student selected more than one answer
                if (!Number.isInteger(optionIndex)) return;
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
  // Collect each student's raw mark (e.g. 1, 1 for two students who each got 1/2).
  const studentMarks = studentsBreakdown.map((student) => student.mark);

  // Total possible marks on the exam (e.g. 2).
  const examMarks = getExamMarks(questions);

  // Create studentScores = each student’s percentage to two decimal places
  //    (for example, mark=1 / examMarks=2 → 1/2 → 0.5 → 50.00).
  const studentScores = studentMarks.map((mark) =>
    toPercentage2dp(mark / examMarks)
  );

  // Sort the raw marks ascending so we can get min, max, median, quartiles on raw marks.
  const sortedMarks = [...studentMarks].sort((a, b) => a - b);
  const n = sortedMarks.length;

  // A small helper to compute median of a sorted array of numbers.
  //    If array is empty → return NaN.
  const medianOf = (arr: number[]): number => {
    const m = arr.length;
    if (m === 0) return NaN; // let JSON.stringify(NaN) become null
    const mid = Math.floor(m / 2);
    if (m % 2 === 0) {
      // even count → average of the two middle
      return (arr[mid - 1]! + arr[mid]!) / 2;
    } else {
      // odd count → middle element
      return arr[mid]!;
    }
  };

  const minRaw = sortedMarks[0]!;
  const maxRaw = sortedMarks[n - 1]!;
  const medianRaw = medianOf(sortedMarks);

  const halfIndex = Math.floor(n / 2);
  const lowerHalf = sortedMarks.slice(0, halfIndex);
  // If n is even, upperHalf is sortedMarks.slice(halfIndex). If n is odd, skip the middle element:
  const upperHalf =
    n % 2 === 0
      ? sortedMarks.slice(halfIndex)
      : sortedMarks.slice(halfIndex + 1);

  const lowerQuartileRaw = medianOf(lowerHalf);
  const upperQuartileRaw = medianOf(upperHalf);

  // Convert those raw “minRaw” etc. into percentages with two decimals:
  //    – minRaw/examMarks → percent
  //    – lowerQuartileRaw/examMarks → percent, etc.
  const lowestScore = toPercentage2dp(minRaw / examMarks);
  const lowerQuartile = toPercentage2dp(lowerQuartileRaw / examMarks);
  const median = toPercentage2dp(medianRaw / examMarks);
  const upperQuartile = toPercentage2dp(upperQuartileRaw / examMarks);
  const highestScore = toPercentage2dp(maxRaw / examMarks);

  const lowestScoringQuestions: number[] = [...questionsBreakdown]
    .sort((a, b) => a.percentageCorrect - b.percentageCorrect)
    .map((q) => q.questionId);

  return {
    lowestScore,           // e.g. 50
    lowerQuartile,         // e.g. 50
    median,                // e.g. 50
    upperQuartile,         // e.g. 50
    highestScore,          // e.g. 50
    examMarks,             // e.g. 2
    studentScores,         // e.g. [50.00, 50.00]
    lowestScoringQuestions // e.g. [1, 2]
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

        const studentBreakdown = generateStudentBreakdown(student, versionSolution, answerKey);
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
