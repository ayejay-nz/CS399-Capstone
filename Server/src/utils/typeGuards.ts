import { Question, Section } from '../dataTypes/examData';

/**
 * Type-guard: true if the `contentBlock` is a `Section`.
 *
 * @param contentBlock
 *  A question or section block from the exam content.
 * @returns
 *  `true` if `contentBlock` has a `section` property.
 */
export function isSection(contentBlock: Question | Section) {
    return 'section' in contentBlock;
}

/**
 * Type-guard: true if the `contentBlock` is a `Question`.
 *
 * @param contentBlock
 *  A question or section block from the exam content.
 * @returns
 *  `true` if `contentBlock` has a `question` property.
 */
export function isQuestion(contentBlock: Question | Section) {
    return 'question' in contentBlock;
}
