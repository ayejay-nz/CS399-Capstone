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
import { exportSingleExamVersionDocx } from '../fileExporters/exportSingleExamVersionDocx';


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
  async (req: Request<{}, unknown, { exam: ExamData }>, res, next) => {
    try {
      const { exam } = req.body;
      const version: VersionedExam = {
        versionNumber: 'original',
        optionOrders: exam.content
          .filter(b => 'question' in b)
          .map((b: any) => b.question.options.map((_: any, i: number) => i)),
      };

      const docxBuffer = await exportSingleExamVersionDocx(exam, version);
      const pdfBuffer = await convertAsync(docxBuffer, '.pdf', undefined);

      res
        .status(HTTP_STATUS_CODE.OK)
        .set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="exam_preview.pdf"',
          'Content-Length': pdfBuffer.length,
        })
        .send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
