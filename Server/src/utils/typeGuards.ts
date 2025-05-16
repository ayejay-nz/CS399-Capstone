import {
    ImageURI,
    Question,
    QuestionText,
    Section,
    SectionText,
    TableURI,
} from '../dataTypes/examData';

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

function isBrandType(content: unknown, type: String) {
    // prettier-ignore
    return (
        typeof content === 'object' &&
        content !== null &&
        (content as any).__type === type
    )
}

export function isQuestionText(content: object): content is QuestionText {
    return isBrandType(content, 'QuestionText');
}

export function isSectionText(content: object): content is SectionText {
    return isBrandType(content, 'SectionText');
}

export function isTableURI(content: object): content is TableURI {
    return isBrandType(content, 'TableURI');
}

export function isImageURI(content: object): content is ImageURI {
    return isBrandType(content, 'ImageURI');
}
