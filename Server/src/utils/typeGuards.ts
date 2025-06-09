import { AppendixPage, AppendixText, Coverpage } from '../dataTypes/coverpage';
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
export function isSection(contentBlock: Question | Section | AppendixPage | Coverpage) {
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
export function isQuestion(contentBlock: Question | Section | AppendixPage | Coverpage) {
    return 'question' in contentBlock;
}

export function isAppendixPage(contentBlock: Question | Section | AppendixPage | Coverpage) {
    return 'appendix' in contentBlock;
}

export function isCoverpage(contentBlock: Question | Section | AppendixPage | Coverpage) {
    return 'coverpage' in contentBlock;
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
    return (
        isBrandType(content, 'ImageURI') &&
        (content as ImageURI).imageUri !== undefined &&
        typeof (content as ImageURI).imageUri === 'string'
    );
}

export function isAppendixText(content: object): content is AppendixText {
    return isBrandType(content, 'AppendixText');
}
