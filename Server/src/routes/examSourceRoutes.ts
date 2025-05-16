import express, { Request, Response, NextFunction } from 'express';
import { uploadExamSourceFile } from '../middlewares/uploadMiddleware';
import ApiError from '../utils/apiError';
import {
    API_ERROR_CODE,
    API_ERROR_MESSAGE,
    API_SUCCESS_MESSAGE,
    HTTP_STATUS_CODE,
} from '../constants/constants';
import path from 'path';
import { ExamData } from '../dataTypes/examData';
import { ApiSuccessResponse } from '../dataTypes/apiSuccessResponse';
import { parseDocxFile } from '../parsers/docxParser';
import { parseTxtFile } from '../parsers/txtParser';
import fetch from 'node-fetch';
import { generateExamVersions } from '../services/examVersioning';
import { generateAnswerKey } from '../services/answerKey';
import config from '../config/config';

const router = express.Router();

router.post('/upload-json', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const exam = req.body as ExamData;

        if (!exam) {
            throw new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.invalidInputData,
                API_ERROR_CODE.INVALID_INPUT_DATA,
                { message: 'Malformed JSON' },
            );
        }

        const examVersions = generateExamVersions(exam);
        const answerKey = generateAnswerKey(examVersions, exam);

        // Generate randomised exam versions and answer key
        const generateRes = await fetch(
            `${req.protocol}://${req.get('host')}${config.server.apiPrefix}/exam-bundle`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exam: exam,
                    versions: examVersions,
                    answerKey: answerKey,
                }),
            },
        );

        const zipBuffer = Buffer.from(await generateRes.arrayBuffer());

        // Stream it back to the caller
        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': 'attachment; filename="exam_package.zip"',
            'Content-Length': zipBuffer.length,
        });
        res.send(zipBuffer);
    } catch (err) {
        next(err);
    }
});

router.post(
    '/upload-file',
    uploadExamSourceFile,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.noFileUpload,
                    API_ERROR_CODE.NO_FILE_UPLOAD,
                );
            }

            const fileBuffer = req.file.buffer;
            const originalFilename = req.file.originalname;
            const fileExt = path.extname(originalFilename).toLowerCase();

            let parseResult: ExamData;

            switch (fileExt) {
                case '.docx':
                    parseResult = await parseDocxFile(fileBuffer);
                    break;
                case '.txt':
                    parseResult = await parseTxtFile(fileBuffer);
                    break;
                case '.xml':
                    // parse xml
                    break;
                case '.tex':
                    // parse tex
                    break;
                default:
                    // Ideally should never be reached but is a safeguard
                    throw new ApiError(
                        HTTP_STATUS_CODE.UNSUPPORTED_MEDIA_TYPE,
                        API_ERROR_MESSAGE.unsupportedFileType,
                        API_ERROR_CODE.UNSUPPORTED_FILE_TYPE,
                        { receivedType: fileExt },
                    );
            }

            const response: ApiSuccessResponse<ExamData> = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: parseResult!,
            };
            res.status(response.status).json(response);
        } catch (error) {
            next(error);
        }
    },
);

export default router;
