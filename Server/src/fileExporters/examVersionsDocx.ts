import { Document, Paragraph } from 'docx';
import { ExamData, Question, Section } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { generateExamVersions } from '../services/examVersioning';
import {
    isImageURI,
    isQuestionText,
    isSection,
    isSectionText,
    isTableURI,
} from '../utils/typeGuards';

function reorderQuestionOptions(options: string[], optionOrder: number[] | null): string[] {
    if (!optionOrder || optionOrder.length !== options.length) return options;

    return optionOrder.map((i) => options[i]!);
}

function renderExamQuestion(question: Question, optionOrder: number[] | null): Paragraph[] {
    const qParagraph: Paragraph[] = [];

    // Question stem
    question.question.content.forEach((contentBlock) => {
        if (isQuestionText(contentBlock)) {
            qParagraph.push(new Paragraph({ text: contentBlock.questionText }));
        } else if (isImageURI(contentBlock)) {
            qParagraph.push(new Paragraph({ text: '\n[image]\n' })); // TODO -- HANDLE IMAGES
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
            sParagraph.push(new Paragraph({ text: '\n[image]\n' })); // TODO -- HANDLE IMAGES
        } else if (isTableURI(contentBlock)) {
            sParagraph.push(new Paragraph({ text: '\n[table]\n' })); // TODO -- HANDLE TABLES
        }
    });

    // Spacing
    sParagraph.push(new Paragraph({}));

    return sParagraph;
}

function renderExamContent(
    examData: ExamData,
    version: VersionedExam,
    qPtr: { current: number },
): Paragraph[] {
    const eParagraphs: Paragraph[] = [];

    examData.content.forEach((contentBlock) => {
        if (isSection(contentBlock)) {
            eParagraphs.push(...renderExamSection(contentBlock));
        } else {
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
