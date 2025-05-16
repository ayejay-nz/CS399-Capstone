import express, { Request, Response, NextFunction } from 'express';
import { exportGeneratedExam } from '../fileExporters/examGenerator';
import { ExamData } from '../dataTypes/examData';
import { AnswerKey } from '../dataTypes/answerKey';
import { VersionedExam } from '../dataTypes/versionedExam';
import { HTTP_STATUS_CODE } from '../constants/constants';

const router = express.Router();

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

export default router;
