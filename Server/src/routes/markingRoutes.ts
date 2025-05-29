import express, { Request, Response, NextFunction } from 'express';
import { TeleformData } from '../dataTypes/teleformData';
import { AnswerKey, AnswerKeyQuestion } from '../dataTypes/answerKey';
import { generateExamBreakdown } from '../services/examMarking';
import { ApiSuccessResponse } from '../dataTypes/apiSuccessResponse';
import { ExamBreakdown } from '../dataTypes/examBreakdown';
import {
    API_ERROR_CODE,
    API_ERROR_MESSAGE,
    API_SUCCESS_MESSAGE,
    HTTP_STATUS_CODE,
} from '../constants/constants';
import { exportGeneratedStats } from '../fileExporters/statsGenerator';
import config from '../config/config';
import ApiError from '../utils/apiError';
import { ApiErrorResponse } from '../dataTypes/apiErrorResponse';
import { uploadMarkingFiles } from '../middlewares/uploadMiddleware';

const router = express.Router();

async function propagateApiError(res: globalThis.Response) {
    // Try to read body as { message, errorCode, ... }
    const errPayload = (await res.json().catch(() => null)) as Partial<ApiErrorResponse> | null;

    throw new ApiError(
        res.status,
        errPayload?.message ?? res.statusText,
        errPayload?.errorCode ?? API_ERROR_CODE.SERVER_ERROR,
        errPayload?.details,
        errPayload?.exposeDetails ?? false,
    );
}

router.post(
    '/upload',
    uploadMarkingFiles,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const answerKeyFileObj = (req.files as any)['answerKeyFile'][0];
            const answerKeyBuffer = answerKeyFileObj.buffer as Buffer;
            const answerKeyOriginalName = answerKeyFileObj.originalname as string;
            const answerKeyMimeType = answerKeyFileObj.mimetype as string;

            const teleformDataFileObj = (req.files as any)['teleformDataFile'][0];
            const teleformDataBuffer = teleformDataFileObj.buffer as Buffer;
            const teleformDataOriginalName = teleformDataFileObj.originalname as string;
            const teleformDataMimeType = teleformDataFileObj.mimetype as string;

            const answerKeyForm = new FormData();
            const answerKeyBlob = new Blob([answerKeyBuffer], { type: answerKeyMimeType });
            answerKeyForm.append('answerKeyFile', answerKeyBlob, answerKeyOriginalName);

            const teleformDataForm = new FormData();
            const teleformDataBlob = new Blob([teleformDataBuffer], { type: teleformDataMimeType });
            teleformDataForm.append('teleformDataFile', teleformDataBlob, teleformDataOriginalName);

            // Parse answer key
            const answerKeyRes = await fetch(
                `${req.protocol}://${req.get('host')}${config.server.apiPrefix}/answer-key/upload`,
                {
                    method: 'POST',
                    body: answerKeyForm,
                },
            );

            if (!answerKeyRes.ok) await propagateApiError(answerKeyRes);

            const { data: answerKey } =
                (await answerKeyRes.json()) as ApiSuccessResponse<AnswerKey>;

            if (!answerKey) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.badRequest,
                    API_ERROR_CODE.BAD_REQUEST,
                    { message: 'No answer key detected' },
                );
            }

            // Parse teleform data
            const teleformDataRes = await fetch(
                `${req.protocol}://${req.get('host')}${
                    config.server.apiPrefix
                }/teleform-data/upload`,
                {
                    method: 'POST',
                    body: teleformDataForm,
                },
            );

            if (!teleformDataRes.ok) await propagateApiError(teleformDataRes);

            const { data: teleformData } =
                (await teleformDataRes.json()) as ApiSuccessResponse<TeleformData>;

            if (!teleformData) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.badRequest,
                    API_ERROR_CODE.BAD_REQUEST,
                    { message: 'No teleform data detected' },
                );
            }

            const examBreakdown = generateExamBreakdown(answerKey, teleformData);
            const responseData = [{ stats: examBreakdown }, { questions: answerKey.source }] as [
                { stats: ExamBreakdown },
                { questions: AnswerKeyQuestion[] },
            ];

            const response: ApiSuccessResponse<
                [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }]
            > = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: responseData,
            };
            res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    },
);

router.post(
    '/generate-stats',
    async (
        req: Request<Record<string, never>, unknown, { examBreakdown: ExamBreakdown }>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const examBreakdown = req.body.examBreakdown;

            const zipBuffer = await exportGeneratedStats(examBreakdown);

            res.status(HTTP_STATUS_CODE.OK)
                .set({
                    'Content-Type': 'application/zip',
                    'Content-Disposition': 'attachment; filename="stats_breakdown.zip"',
                    'Content-Length': zipBuffer.length,
                })
                .send(zipBuffer);
        } catch (err) {
            next(err);
        }
    },
);

export default router;
