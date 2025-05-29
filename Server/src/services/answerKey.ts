import {
    VersionSolution,
    QuestionSolution,
    AnswerKey,
    AnswerKeyQuestion,
} from '../dataTypes/answerKey';
import { ExamData, Question } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { indexToTeleformAnswer } from '../utils/answerKey';
import { isImageURI, isQuestion, isQuestionText, isSection, isTableURI } from '../utils/typeGuards';

// TODO -- ADD TESTS AND DOCUMENTATION
export function examQuestionToAnswerKeyQuestion(question: Question): AnswerKeyQuestion {
    // Convert exam question content to answer key question content format
    let content = '';
    question.question.content.forEach((contentBlock) => {
        if (isQuestionText(contentBlock)) content += contentBlock.questionText;
        else if (isImageURI(contentBlock)) content += ' [image] ';
        else if (isTableURI(contentBlock)) content += ' [table] ';
    });

    const answerKeyQuestion: AnswerKeyQuestion = {
        marks: question.question.marks,
        id: question.question.id,
        feedback: question.question.feedback,
        content: content,
        options: question.question.options,
    };

    return answerKeyQuestion;
}

/**
 * Extracts parallel arrays of question marks and ids from supplied exam data.
 *
 * Interates through `examData.content`, skipping any sections and collecting
 * each questions `marks` and `id` into two arrays. The first element of the
 * returned array is an array of each questions marks and the second the ids.
 * Both are aligned by the original order of the questions.
 *
 * @param examData
 *  The parsed exam data containing the questions and sections.
 * @returns
 *  A tuple `[marks, ids]` where:
 *  - `marks`: `number[]` of each questions marks.
 *  - `ids`: `number[]` of each questions id.
 */
export function getMarksAndIds(examData: ExamData): [number[], number[]] {
    let marks: number[] = [];
    let ids: number[] = [];

    examData.content.forEach((contentBlock) => {
        if (isSection(contentBlock)) {
            return; // Skip sections
        }

        marks.push(contentBlock.question.marks);
        ids.push(contentBlock.question.id);
    });

    return [marks, ids];
}

/**
 * Generate the solution to each exam version for the answer key.
 *
 * For each `VersionedExam` in `versions`:
 *  1. Reads each versions `optionOrder` array
 *  2. Finds the index of the correct answer (assumed to be '0')
 *  3. Convert the correct option index into the teleform answer format
 *  4. Gets the corresponding question id and mark from `examData`
 *  5. Packages these into a `QuestionSolution`
 *
 * @param versions
 *  An array of `VersionExam` objects, each with its own `versionNumber` and randomised `optionOrders`.
 * @param examData
 *  The original parsed exam data, used to look up question marks and ids.
 * @returns
 *  An array of `VersionSolution`, one per version, each with its own
 *  `questionSolutions` detailing ids, answer(s), marks, and option sequences.
 */
export function generateVersionSolutions(
    versions: VersionedExam[],
    examData: ExamData,
): VersionSolution[] {
    let versionSolutions: VersionSolution[] = [];
    const [marks, ids] = getMarksAndIds(examData);

    versions.forEach((examVersion) => {
        const versionNumber = examVersion.versionNumber;
        let questionSolutions: QuestionSolution[] = [];

        examVersion.optionOrders.forEach((optionOrder, qIndex) => {
            const correctIndex = optionOrder.indexOf(0); // Get the index of the correct option
            const correctOption = indexToTeleformAnswer(correctIndex);

            const id = ids[qIndex]!;
            const mark = marks[qIndex]!;

            const questionSolution: QuestionSolution = {
                questionId: id,
                answers: [correctOption],
                mark: mark,
                optionSequence: optionOrder,
            };

            questionSolutions.push(questionSolution);
        });

        const versionSolution: VersionSolution = {
            versionNumber: versionNumber,
            questionSolutions: questionSolutions,
        };

        versionSolutions.push(versionSolution);
    });

    return versionSolutions;
}

function generateMetadata(examData: ExamData) {}

/**
 * Generate the full answer key for the given versioned exams and original exam.
 *
 * This function:
 *  1. Extracts all `Question` blocks from `examData.content`
 *  2. Generates per-version solutions using `generateVersionSolutions`
 *  3. Builds and returns an `AnswerKey` object containing:
 *   - `source`: the array of `Question` objects from `examData` (in order)
 *   - `versionSolutions`: the array of `VersionSolution` for each exam version.
 *
 * @param versions
 *  An array of `VersionExam` objects, each with its own `versionNumber` and randomised `optionOrders`.
 * @param examData
 *  The original parsed exam data.
 * @returns
 *  The generated `AnswerKey` with:
 *   - `source`: the array of `Question` objects from `examData`
 *   - `versionSolutions`: the array of `VersionSolution` for each exam version.
 */
export function generateAnswerKey(versions: VersionedExam[], examData: ExamData): AnswerKey {
    let questions: AnswerKeyQuestion[] = [];

    examData.content.forEach((contentBlock) => {
        if (isQuestion(contentBlock)) {
            questions.push(examQuestionToAnswerKeyQuestion(contentBlock));
        }
    });

    const versionSolutions = generateVersionSolutions(versions, examData);
    const answerKey: AnswerKey = {
        metadata: {},
        source: questions,
        versionSolutions: versionSolutions,
    };

    return answerKey;
}
