import multer, { MulterError } from 'multer';
import { Request } from 'express';
import path from 'path';
import ApiError from '../utils/apiError';
import config from '../config/config';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE } from '../constants/constants';

const memoryStorage = multer.memoryStorage();

function unsupportedFileTypeApiError(supportedTypes: string[]) {
    return new ApiError(
        HTTP_STATUS_CODE.UNSUPPORTED_MEDIA_TYPE,
        API_ERROR_MESSAGE.unsupportedFileType,
        API_ERROR_CODE.UNSUPPORTED_FILE_TYPE,
        { allowedTypes: supportedTypes },
        true
    );
}

const createExtensionFilter = (allowedExt: string[]) => {
    return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedExt.includes(ext)) {
            cb(null, true);
        } else {
            cb(unsupportedFileTypeApiError(allowedExt));
        }
    };
};

const createMimeTypeFilter = (allowedMimeTypes: string[]) => {
    return (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        const mimeType = file.mimetype;

        if (allowedMimeTypes.includes(mimeType)) {
            cb(null, true);
        } else {
            cb(unsupportedFileTypeApiError(allowedMimeTypes));
        }
    };
};

const sourceFileFilter = createExtensionFilter(['.docx', '.xml', '.txt', '.tex']);
const coverPageFileFilter = createExtensionFilter(['.docx']);
const markingFileFilter = createExtensionFilter(['.txt']);
const assetFileFilter = createMimeTypeFilter(['image/png', 'image/jpeg']);

export const uploadSourceFile = multer({
    storage: memoryStorage,
    limits: { fileSize: config.upload.maxSourceFileSize },
    fileFilter: sourceFileFilter
}).single('examSourceFile');

export const uploadCoverPageFile = multer({
    storage: memoryStorage,
    limits: { fileSize: config.upload.maxCoverPageFileSize },
    fileFilter: coverPageFileFilter,
}).single('coverPageFile');

export const uploadMarkingFile = multer({
    storage: memoryStorage,
    limits: { fileSize: config.upload.maxMarkingFileSize },
    fileFilter: markingFileFilter,
}).single('markingFile');

export const uploadAssetFile = multer({
    storage: memoryStorage,
    limits: { fileSize: config.upload.maxAssetFileSize },
    fileFilter: assetFileFilter,
}).single('assetFile') 
