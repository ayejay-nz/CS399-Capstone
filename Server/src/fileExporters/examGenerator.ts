import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { ExamData } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { exportExamVersionsDocx } from './examVersionsDocx';
import { promises as fs } from 'node:fs';
import path from 'path';

export async function exportGeneratedExam(
    exam: ExamData,
    versions: VersionedExam[],
    outputDir: string,
): Promise<void> {
    const versionParagraphs = exportExamVersionsDocx(versions, exam);

    await Promise.all(
        versionParagraphs.map(async (version) => {
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
        }),
    );
}
