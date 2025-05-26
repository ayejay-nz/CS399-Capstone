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
import { AppendixPage } from '../dataTypes/coverpage';
import { parseAppendicePage } from '../parsers/appendiceParser';

const router = express.Router();

// Uploading an appendix JSON made in the frontend editor
router.post('/upload-json', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const appendix = req.body as AppendixPage;

        if (!appendix || !appendix.appendix || !appendix.appendix.content) {
            throw new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.invalidInputData,
                API_ERROR_CODE.INVALID_INPUT_DATA,
                { message: 'Malformed appendix JSON' },
            );
        }

        // Validate that content array is not empty
        const { content } = appendix.appendix;
        if (!Array.isArray(content) || content.length === 0) {
            throw new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.missingRequiredData,
                API_ERROR_CODE.MISSING_REQUIRED_DATA,
                { message: 'Appendix content cannot be empty' },
            );
        }

        const response: ApiSuccessResponse<AppendixPage> = {
            status: HTTP_STATUS_CODE.OK,
            message: API_SUCCESS_MESSAGE.ok,
            data: appendix,
        };
        res.status(response.status).json(response);
    } catch (error) {
        next(error);
    }
});

// Uploading an appendix DOCX file
router.post(
    '/upload-file',
    uploadCoverPageFile, // Reuse the same middleware since it accepts .docx files -- make a new one later
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
                    const parseResult = await parseAppendicePage(fileBuffer);
                    
                    const response: ApiSuccessResponse<AppendixPage> = {
                        status: HTTP_STATUS_CODE.OK,
                        message: API_SUCCESS_MESSAGE.ok,
                        data: parseResult,
                    };
                    res.status(response.status).json(response);
                    break;
                default:
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