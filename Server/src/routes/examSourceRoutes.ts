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
import { generateExamVersions } from '../services/examVersioning';
import { generateAnswerKey } from '../services/answerKey';
import config from '../config/config';
import { xmlParser } from '../parsers/xmlParser';

const router = express.Router();

/**
 * @swagger
 * /exam-source/upload-json:
 *   post:
 *     summary: Upload exam data in JSON format
 *     description: Accepts exam data as JSON, generates exam versions and answer key
 *     tags:
 *       - Exam Source
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExamData'
 *           example:
 *             content:
 *               - question:
 *                   id: 1
 *                   marks: 2
 *                   feedback:
 *                     correctFeedback: "Correct answer!"
 *                     incorrectFeedback: "Sorry, that's wrong."
 *                   content:
 *                     - questionText: "What is 2+2?"
 *                   options: ["4", "3", "5", "6"]
 *               - section:
 *                   questionCount: null
 *                   content:
 *                     - sectionText: "Mathematics Section"
 *     responses:
 *       200:
 *         description: Exam package (ZIP file) containing exam versions and answer key
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request - invalid input data
 *       500:
 *         description: Internal server error
 */
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

        // Dynamic import of fetch
        const { default: fetch } = await import('node-fetch');

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

/**
 * @swagger
 * /exam-source/upload-file:
 *   post:
 *     summary: Upload exam source file
 *     description: Upload and parse exam source files (DOCX, TXT, XML, TEX)
 *     tags:
 *       - Exam Source
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               examSourceFile:
 *                 type: string
 *                 format: binary
 *                 description: Exam source file (DOCX, TXT, XML, TEX)
 *     responses:
 *       200:
 *         description: Successfully parsed exam data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiSuccessResponse'
 *       400:
 *         description: Bad request - no file uploaded
 *       415:
 *         description: Unsupported file type
 *       500:
 *         description: Internal server error
 */
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
                    parseResult = await xmlParser(fileBuffer);
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

/**
 * @swagger
 * components:
 *   schemas:
 *     ExamData:
 *       type: object
 *       required: [content]
 *       properties:
 *         content:
 *           type: array
 *           items:
 *             oneOf:
 *               - $ref: '#/components/schemas/Question'
 *               - $ref: '#/components/schemas/Section'
 *     Question:
 *       type: object
 *       required: [question]
 *       properties:
 *         question:
 *           type: object
 *           required: [id, marks, feedback, content, options]
 *           properties:
 *             id:
 *               type: integer
 *               description: Unique identifier for the question
 *             marks:
 *               type: number
 *               description: Points awarded for correct answer
 *             feedback:
 *               type: object
 *               required: [correctFeedback, incorrectFeedback]
 *               properties:
 *                 correctFeedback:
 *                   type: string
 *                   description: Feedback shown for correct answer
 *                 incorrectFeedback:
 *                   type: string
 *                   description: Feedback shown for incorrect answer
 *             content:
 *               type: array
 *               description: Question text and media content
 *               items:
 *                 type: object
 *                 properties:
 *                   questionText:
 *                     type: string
 *             options:
 *               type: array
 *               description: Answer options (first one is correct)
 *               items:
 *                 type: string
 *               minItems: 2
 *     Section:
 *       type: object
 *       required: [section]
 *       properties:
 *         section:
 *           type: object
 *           required: [content]
 *           properties:
 *             questionCount:
 *               type: integer
 *               nullable: true
 *               description: Number of questions in this section or null if not applicable
 *             content:
 *               type: array
 *               required: true
 *               description: Section text and media content
 *               items:
 *                 type: object
 *                 properties:
 *                   sectionText:
 *                     type: string
 *     ApiSuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *         message:
 *           type: string
 *         data:
 *           type: object
 */

export default router;
