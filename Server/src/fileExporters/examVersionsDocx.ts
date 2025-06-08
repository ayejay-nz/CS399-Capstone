import { Document, ImageRun, Paragraph } from 'docx';
import { ExamData, Question, Section } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { generateExamVersions } from '../services/examVersioning';
import {
    isAppendixPage,
    isAppendixText,
    isImageURI,
    isQuestion,
    isQuestionText,
    isSection,
    isSectionText,
    isTableURI,
} from '../utils/typeGuards';
import { imageSize } from 'image-size';
import ApiError from '../utils/apiError';
import { API_ERROR_CODE, API_ERROR_MESSAGE, HTTP_STATUS_CODE } from '../constants/constants';
import { AppendixPage } from '../dataTypes/coverpage';

function reorderQuestionOptions(options: string[], optionOrder: number[] | null): string[] {
    if (!optionOrder || optionOrder.length !== options.length) return options;

    return optionOrder.map((i) => options[i]!);
}

function imageFromBase64(b64: string): ImageRun {
    const cleaned = b64.replace(/^data:[^;]+;base64,/, '');
    const data = Buffer.from(cleaned, 'base64');

    const typeData = b64.match(/^data:image\/([\S]+);base64,/) || 'png';
    const type = typeData[1];

    if (!type) {
        throw new ApiError(
            HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY,
            API_ERROR_MESSAGE.examVersionGenerationFailed,
            API_ERROR_CODE.EXAM_VERSION_GENERATION_FAILED,
        );
    }

    if (type !== 'jpg' && type !== 'png' && type !== 'gif' && type !== 'bmp') {
        throw new ApiError(
            HTTP_STATUS_CODE.UNSUPPORTED_MEDIA_TYPE,
            API_ERROR_MESSAGE.invalidFileFormat,
            API_ERROR_CODE.INVALID_FILE_FORMAT,
        );
    }

    const { width, height } = imageSize(data);

    return new ImageRun({
        type,
        data,
        transformation: { width, height },
        altText: { name: 'image' },
    });
}

function renderExamQuestion(question: Question, optionOrder: number[] | null): Paragraph[] {
    const qParagraph: Paragraph[] = [];

    // Question stem
    question.question.content.forEach((contentBlock) => {
        if (isQuestionText(contentBlock)) {
            qParagraph.push(new Paragraph({ text: contentBlock.questionText }));
        } else if (isImageURI(contentBlock)) {
            const b64 = contentBlock.imageUri;
            const img = imageFromBase64(b64);
            qParagraph.push(
                new Paragraph({
                    children: [img],
                }),
            );
        } else if (isTableURI(contentBlock)) {
            qParagraph.push(new Paragraph({ text: '\n[table]\n' })); // TODO -- HANDLE TABLES
        }
    });

    // Question options
    const reorderedOptions = reorderQuestionOptions(question.question.options, optionOrder);
    reorderedOptions.forEach((option, idx) => {
        const optionLetter = String.fromCharCode(97 + idx);
        qParagraph.push(
            new Paragraph({
                text: `(${optionLetter}) ${option}`,
                indent: { left: 360 },
            }),
        );
    });

    // Spacing
    qParagraph.push(new Paragraph({}));

    return qParagraph;
}

function renderExamSection(section: Section): Paragraph[] {
    const sParagraph: Paragraph[] = [];

    section.section.content.forEach((contentBlock) => {
        if (isSectionText(contentBlock)) {
            sParagraph.push(new Paragraph({ text: contentBlock.sectionText }));
        } else if (isImageURI(contentBlock)) {
            const b64 = contentBlock.imageUri;
            const img = imageFromBase64(b64);
            sParagraph.push(
                new Paragraph({
                    children: [img],
                }),
            );
        } else if (isTableURI(contentBlock)) {
            sParagraph.push(new Paragraph({ text: '\n[table]\n' })); // TODO -- HANDLE TABLES
        }
    });

    // Spacing
    sParagraph.push(new Paragraph({}));

    return sParagraph;
}

function renderExamAppendix(appendix: AppendixPage): Paragraph[] {
    const aParagraph: Paragraph[] = [];

    appendix.appendix.content.forEach((contentBlock) => {
        if (isAppendixText(contentBlock)) {
            aParagraph.push(new Paragraph({ text: contentBlock.appendixText }));
        } else if (isImageURI(contentBlock)) {
            const b64 = contentBlock.imageUri;
            const img = imageFromBase64(b64);
            aParagraph.push(
                new Paragraph({
                    children: [img],
                }),
            );
        } else if (isTableURI(contentBlock)) {
            aParagraph.push(new Paragraph({ text: '\n[table]\n' })); // TODO -- HANDLE TABLES
        }
    });

    return aParagraph;
}

function renderExamContent(
    examData: ExamData,
    version: VersionedExam,
    qPtr: { current: number },
): Paragraph[] {
    const eParagraphs: Paragraph[] = [];

    examData.content.forEach((contentBlock) => {
        if (isSection(contentBlock)) { // Remove this later -- redundant with AppendixPage
            eParagraphs.push(...renderExamSection(contentBlock));
        } else if (isAppendixPage(contentBlock)) {
            eParagraphs.push(...renderExamAppendix(contentBlock));
        } else if (isQuestion(contentBlock)) {
            const optionOrder = version.optionOrders[qPtr.current]!;
            eParagraphs.push(...renderExamQuestion(contentBlock, optionOrder));
            qPtr.current += 1;
        }
    });

    return eParagraphs;
}

export function exportExamVersionsDocx(
    versions: VersionedExam[],
    exam: ExamData,
): { versionNumber: string; paragraphs: Paragraph[] }[] {
    const versionsParagraphs: { versionNumber: string; paragraphs: Paragraph[] }[] = [];

    versions.forEach((version) => {
        const qIndex = { current: 0 }; // TODO -- ADD PROPER QUESTION NUMBERING

        // Build the actual exam
        const vParagraphs = renderExamContent(exam, version, qIndex);
        versionsParagraphs.push({
            versionNumber: version.versionNumber,
            paragraphs: vParagraphs,
        });
    });

    return versionsParagraphs;
}
