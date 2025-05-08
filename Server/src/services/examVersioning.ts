import { DEFAULT_EXAM_VERSIONS } from '../constants/constants';
import { ExamData, Question, Section } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { padTo8 } from '../utils/format';
import { generateOptionOrder } from '../utils/shuffle';
import { isSection } from '../utils/typeGuards';

/**
 * Create an array of empty exam versions, each with a unique, zero-padded
 * version identifier and an empty `optionOrder` list.
 *
 * Uses `DEFAULT_EXAM_VERSIONS` to determine how many `VersionedExams` to make.
 *
 * @returns
 *  An array of `VersionedExam` objects, length of `DEFAULT_EXAM_VERSIONS`,
 *  ready to have per-question `optionOrder` arrays appended.
 */
function initialiseEmptyExams() {
    return Array.from(
        { length: DEFAULT_EXAM_VERSIONS },
        (_, v) =>
            ({
                versionNumber: padTo8(v + 1),
                optionOrders: [],
            }) as VersionedExam,
    );
}

/**
 * Build multiple exam versions by generating a randomised option order
 * for each question across all versions.
 *
 * For the data in the provided ExamData:
 *  1. Skip all `Section` blocks
 *  2. Determine how many options each question has
 *  3. For each version (upto `DEFAULT_EXAM_VERSIONS`),
 *     generate a random permutation of option indicies and
 *     store it in that version's `optionOrder` array.
 *
 * @param examData
 *  The parsed exam data containing a list of questions and sections.
 *  Only the question blocks are processed.
 *
 * @returns
 *  An array of `ExamVersion` objects (length = `DEFAULT_EXAM_VERSIONS`),
 *  each with an `optionOrder` property that is a `number[][]`.
 *  Each inner array represents the shuffled indicies for that question's
 *  options in that version.
 */
export function generateExamVersions(examData: ExamData) {
    let examVersions = initialiseEmptyExams();

    examData.content.forEach((contentBlock) => {
        if (isSection(contentBlock)) {
            return; // Skip sections
        }

        const optionCount = contentBlock.question.options.length;
        // Create randomised option orders for each version
        for (let i = 0; i < DEFAULT_EXAM_VERSIONS; i++) {
            const optionOrder = generateOptionOrder(optionCount);
            examVersions[i]!.optionOrders.push(optionOrder);
        }
    });

    return examVersions;
}
