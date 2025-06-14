import express, { Request, Response, NextFunction } from 'express';
import { uploadCoverPageFile } from '../middlewares/uploadMiddleware';
import ApiError from '../utils/apiError';
import {
    API_ERROR_CODE,
    API_ERROR_MESSAGE,
    API_SUCCESS_MESSAGE,
    HTTP_STATUS_CODE,
} from '../constants/constants';
import path from 'path';
import { ApiSuccessResponse } from '../dataTypes/apiSuccessResponse';
import { Coverpage, CoverpageDocx, AppendixPage } from '../dataTypes/coverpage';
import { parseCoverPage } from '../parsers/coverPageParser';
import { parseCoverpageDocx } from '../services/coverpageDocxParser';
import sessionManager from '../services/sessionManager';
import { extractSessionCookie, setSessionCookie } from '../middlewares/sessionMiddleware';

const router = express.Router();

// Uploading a coverpage JSON made in the frontend editor
router.post('/upload-json', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const coverpage = req.body as Coverpage;

        if (!coverpage || !coverpage.coverpage || !coverpage.coverpage.content) {
            throw new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.invalidInputData,
                API_ERROR_CODE.INVALID_INPUT_DATA,
                { message: 'Malformed coverpage JSON' },
            );
        }

        // Validate required fields
        const { content } = coverpage.coverpage;
        const requiredFields = [
            'semester',
            'campus',
            'department',
            'courseCode',
            'examTitle',
            'duration',
            'noteContent',
            'courseName',
        ];
        const missingFields = requiredFields.filter((field) => {
            const value = content[field as keyof typeof content];
            return !value || value.trim() === '';
        });

        if (missingFields.length > 0) {
            throw new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.missingRequiredData,
                API_ERROR_CODE.MISSING_REQUIRED_DATA,
                { missingFields },
            );
        }

        const response: ApiSuccessResponse<Coverpage> = {
            status: HTTP_STATUS_CODE.OK,
            message: API_SUCCESS_MESSAGE.ok,
            data: coverpage,
        };
        res.status(response.status).json(response);
    } catch (error) {
        next(error);
    }
});

// Uploading a coverpage DOCX file (including appendices)
router.post(
    '/upload-file',
    uploadCoverPageFile,
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

            switch (fileExt) {
                case '.docx':
                    const parseResult = await parseCoverpageDocx(fileBuffer);

                    // Create a new session if no session exists, or refresh existing session
                    let sessionId = extractSessionCookie(req);
                    if (!sessionId) {
                        sessionId = sessionManager.createSession();
                    } else {
                        // Check if session still exists and refresh it
                        const refreshed = sessionManager.refreshSession(sessionId);
                        if (!refreshed) {
                            // Session doesn't exist anymore, create a new one
                            console.log(`Session ${sessionId} not found, creating new session`);
                            sessionId = sessionManager.createSession();
                        }
                    }

                    // Check if parsing was successful (returned CoverpageDocx object, not Buffer)
                    if (Buffer.isBuffer(parseResult)) {
                        // Store the buffer in session
                        sessionManager.addUnparsedCoverpage(
                            sessionId,
                            parseResult,
                            originalFilename,
                        );

                        // Set session cookie in the response
                        setSessionCookie(res, sessionId);

                        const response: ApiSuccessResponse = {
                            status: HTTP_STATUS_CODE.ACCEPTED,
                            message: API_SUCCESS_MESSAGE.coverpageStoredInSession,
                        };
                        res.status(response.status).json(response);
                    } else {
                        // Handle mixed results (coverpage failed, appendices succeeded)
                        if ('unparsedCoverpageBuffer' in parseResult) {
                            sessionManager.addUnparsedCoverpage(
                                sessionId,
                                parseResult.unparsedCoverpageBuffer!,
                                originalFilename,
                            );

                            // Set session cookie in the response
                            setSessionCookie(res, sessionId);
                        }

                        // Return ONLY the parsed content (appendices) - no buffer sent to frontend
                        const response: ApiSuccessResponse<{
                            content: (Coverpage | AppendixPage)[];
                        }> = {
                            status: HTTP_STATUS_CODE.OK,
                            message: API_SUCCESS_MESSAGE.ok,
                            data: { content: parseResult.content },
                        };
                        res.status(response.status).json(response);
                    }
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
        } catch (error) {
            next(error);
        }
    },
);

export default router;
