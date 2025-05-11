import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { ExamData } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { exportExamVersionsDocx } from './examVersionsDocx';
import { promises as fs } from 'node:fs';
import path from 'path';
import { exportAnswerKeyXlsx } from './answerKeyXlsx';
import { AnswerKey } from '../dataTypes/answerKey';

export async function exportGeneratedExam(
    exam: ExamData,
    versions: VersionedExam[],
    answerKey: AnswerKey,
    outputDir: string,
): Promise<void> {
    const versionParagraphs = exportExamVersionsDocx(versions, exam);
    const answerKeyBuffer = await exportAnswerKeyXlsx(answerKey);

    // Promises for every version .docx file
    const docxPromises = versionParagraphs.map(async (version) => {
        const title = `Exam Version ${version.versionNumber}`;
        // Build the sections contents first
        const children: Paragraph[] = [
            // TODO -- ADD COVER PAGE
            ...version.paragraphs,
        ];

        // Create document
        const doc = new Document({
            title: title,
            sections: [
                {
                    properties: {},
                    children,
                },
            ],
        });

        const buffer = await Packer.toBuffer(doc);
        const fileName = `exam_v${version.versionNumber}.docx`;
        const filePath = path.join(outputDir, fileName);
        await fs.writeFile(filePath, buffer);
    });

    // Promises for the answer key .xlsx
    const fileName = 'answer_key.xlsx';
    const filePath = path.join(outputDir, fileName);
    const answerKeyPromise = fs.writeFile(filePath, answerKeyBuffer);

    // Wait for everything
    await Promise.all([...docxPromises, answerKeyPromise]);
}
