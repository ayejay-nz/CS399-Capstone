import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { ExamData } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { exportExamVersionsDocx } from './examVersionsDocx';
import { promises as fs } from 'node:fs';
import path from 'path';
import { exportAnswerKeyXlsx } from './answerKeyXlsx';
import { AnswerKey } from '../dataTypes/answerKey';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';

export async function exportGeneratedExam(
    exam: ExamData,
    versions: VersionedExam[],
    answerKey: AnswerKey,
): Promise<Buffer> {
    const versionParagraphs = exportExamVersionsDocx(versions, exam);

    // Generate every version's .docx buffer
    const docxBuffers = await Promise.all(
        versionParagraphs.map(async (v) => {
            // Build the sections contents first
            const children: Paragraph[] = [
                // TODO -- ADD COVER PAGE
                ...v.paragraphs,
            ];

            // Create document
            const doc = new Document({
                title: `Exam Version ${v.versionNumber}`,
                sections: [
                    {
                        properties: {},
                        children,
                    },
                ],
            });

            const buffer = await Packer.toBuffer(doc);
            return { name: `exam_v${v.versionNumber}.docx`, buffer };
        }),
    );

    // Generates answer key .xlsx buffer
    const answerKeyBuffer = await exportAnswerKeyXlsx(answerKey);

    // ZIP everything
    const archive = archiver('zip', { zlib: { level: 9 } });
    const pass = new PassThrough();
    const chunks: Buffer[] = [];

    // Collect the streamed bytes
    pass.on('data', (chunk) => chunks.push(chunk));

    const finished = new Promise<Buffer>((resolve, reject) => {
        pass.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);
    });

    archive.pipe(pass);

    docxBuffers.forEach(({ name, buffer }) => archive.append(buffer, { name }));
    archive.append(answerKeyBuffer, { name: 'answer_key.xlsx' });

    await archive.finalize(); // Flush archive
    return finished;
}
