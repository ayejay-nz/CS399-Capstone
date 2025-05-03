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

const router = express.Router();

router.post(
    '/upload',
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
                    // cover page stuff
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

            const response: ApiSuccessResponse = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
            };
            res.status(response.status).json(response);
        } catch (error) {
            next(error);
        }
    },
);

export default router;
