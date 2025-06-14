import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { ExamData } from '../dataTypes/examData';
import { VersionedExam } from '../dataTypes/versionedExam';
import { exportExamVersionsDocx } from './examVersionsDocx';
import path from 'path';
import { exportAnswerKeyXlsx } from './answerKeyXlsx';
import { AnswerKey } from '../dataTypes/answerKey';
import archiver from 'archiver';
import { PassThrough } from 'node:stream';
import PizZip from 'pizzip';
import { isCoverpage } from '../utils/typeGuards';
import { extractCoverpageBody, getCoverpageXml } from './coverpageDocx';
import ApiError from '../utils/apiError';
import { API_ERROR_CODE, API_ERROR_MESSAGE, HTTP_STATUS_CODE } from '../constants/constants';

export function injectCoverpage(
    examBuffer: Buffer,
    coverpageBodyContent: string,
    coverpageHeaderXml: string,
): Buffer {
    const zip = new PizZip(examBuffer);

    let examDocXml = zip.file('word/document.xml')!.asText();

    // Extract exam body content
    const examBodyMatch = examDocXml.match(/<w:body[^>]*>(.*)<\/w:body>/s);
    const examBodyContent = examBodyMatch ? examBodyMatch[1] || '' : '';

    // Combine: coverpage + page break + exam content
    const pageBreak = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
    const combinedBody = `<w:body>${coverpageBodyContent}${pageBreak}${examBodyContent}</w:body>`;

    // Replace the body in exam XML
    const combinedDocXml = examDocXml.replace(/<w:body[^>]*>.*<\/w:body>/s, combinedBody);

    // Update the files
    zip.file('word/document.xml', combinedDocXml);
    zip.file('word/header1.xml', coverpageHeaderXml); // Use coverpage header

    return zip.generate({ type: 'nodebuffer' });
}

export async function exportGeneratedExam(
    exam: ExamData,
    versions: VersionedExam[],
    answerKey: AnswerKey,
    unparsedCoverpageBuffer?: Buffer,
): Promise<Buffer> {
    // Check for parsed coverpage first
    const parsedCoverpage = exam.content.find(isCoverpage);
    console.log(`[DEBUG] Parsed coverpage: ${JSON.stringify(parsedCoverpage, null, 2)}`);

    // Check if coverpage is uploaded from the form editor
    let isJsonCoverpage = false;
    if (!!parsedCoverpage) {
        isJsonCoverpage = !parsedCoverpage.coverpage.isUploaded;
    }

    if (!isJsonCoverpage && !unparsedCoverpageBuffer) {
        throw new ApiError(
            HTTP_STATUS_CODE.BAD_REQUEST,
            API_ERROR_MESSAGE.examVersionGenerationFailed,
            API_ERROR_CODE.EXAM_VERSION_GENERATION_FAILED,
            { message: 'No coverpage found (parsed or unparsed)' },
        );
    }

    const versionParagraphs = exportExamVersionsDocx(versions, exam);

    // Generate exam documents (without coverpage if unparsed)
    const examBuffers = await Promise.all(
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
                        headers: {
                            // Initialise default header to automatically add relations
                            default: {
                                options: {
                                    children: [],
                                },
                            },
                        },
                        properties: {},
                        children,
                    },
                ],
            });

            let buffer = await Packer.toBuffer(doc);

            // Only inject coverpage if it's parsed, not unparsed
            if (parsedCoverpage && isJsonCoverpage) {
                // Inject coverpage
                parsedCoverpage.coverpage.content.versionNumber = v.versionNumber;
                const { documentXml, headerXml } = getCoverpageXml(parsedCoverpage);
                const coverpageBody = extractCoverpageBody(documentXml);
                buffer = injectCoverpage(buffer, coverpageBody, headerXml);
            }
            // Note: No injection for unparsed coverpage -- handled separately

            return { name: `exam_v${v.versionNumber}.docx`, buffer };
        }),
    );

    // Add single coverpage document if unparsed
    const coverpageFile = unparsedCoverpageBuffer
        ? [{ name: 'coverpage.docx', buffer: unparsedCoverpageBuffer }]
        : [];

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

    // Add exam files
    examBuffers.forEach(({ name, buffer }) => archive.append(buffer, { name }));

    // Add single coverpage file
    console.log(
        `[DEBUG] Adding coverpage file: ${coverpageFile[0]?.name} ${coverpageFile[0]?.buffer.length}`,
    );
    coverpageFile.forEach(({ name, buffer }) => archive.append(buffer, { name }));

    // Add answer key
    archive.append(answerKeyBuffer, { name: 'answer_key.xlsx' });

    await archive.finalize(); // Flush archive
    return finished;
}
