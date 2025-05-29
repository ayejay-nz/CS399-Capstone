import express, { Request, Response, NextFunction } from 'express';
import { exportGeneratedExam } from '../fileExporters/examGenerator';
import { ExamData } from '../dataTypes/examData';
import { AnswerKey } from '../dataTypes/answerKey';
import { VersionedExam } from '../dataTypes/versionedExam';
import { HTTP_STATUS_CODE } from '../constants/constants';
import { isSection } from '../utils/typeGuards';
import { exportExamVersionsDocx } from '../fileExporters/examVersionsDocx';
import libre from 'libreoffice-convert';
import { Document, HeadingLevel, Packer, Paragraph } from 'docx';
import { promisify } from 'util';

const router = express.Router();

// TODO: Maybe move this over to dataTypes
interface PreviewBody {
    exam: ExamData;
}

const convertAsync = promisify(libre.convert);

router.post(
    '/',
    async (
        req: Request<
            Record<string, never>,
            unknown,
            { exam: ExamData; versions: VersionedExam[]; answerKey: AnswerKey }
        >,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const { exam, versions, answerKey } = req.body;

            const zipBuffer = await exportGeneratedExam(exam, versions, answerKey);

            res.status(HTTP_STATUS_CODE.OK)
                .set({
                    'Content-Type': 'application/zip',
                    'Content-Disposition': 'attachment; filename="exam_bundle.zip"',
                    'Content-Length': zipBuffer.length,
                })
                .send(zipBuffer);
        } catch (err) {
            next(err);
        }
    },
);

router.post(
    '/preview-pdf',
    async (req: Request<{}, unknown, PreviewBody>, res: Response, next: NextFunction) => {
        try {
            const { exam } = req.body;

            if (!exam || !Array.isArray(exam.content)) {
                throw new Error('Invalid exam payload');
            }

            const version: VersionedExam = {
                versionNumber: 'original',
                optionOrders: exam.content
                    .filter((b: any) => 'question' in b)
                    .map((b: any) => b.question.options.map((_: any, idx: number) => idx)),
            };

            // 3️⃣ Generate the styled .docx in memory
            const versionsOutput = exportExamVersionsDocx([version], exam);

            const doc = new Document({
                sections: versionsOutput.map((v) => ({
                    properties: {},
                    children: v.paragraphs,
                })),
            });

            const docxBuffer = await Packer.toBuffer(doc);

            const pdfBuffer = await convertAsync(docxBuffer, '.pdf', undefined);

            res.status(HTTP_STATUS_CODE.OK)
                .set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'inline; filename="exam_preview.pdf"',
                    'Content-Length': pdfBuffer.length,
                })
                .send(pdfBuffer);
        } catch (err) {
            next(err);
        }
    },
);

export default router;
