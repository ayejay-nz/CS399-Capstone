import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE } from '../constants/constants';
import ApiError from '../utils/apiError';
import { ApiErrorResponse } from '../dataTypes/apiErrorResponse';
import config from '../config/config';

const errorHandler = (
    error: Error | ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const isDev = config.server.nodeEnv === 'development';

    let responseStatus: number;
    let responseMessage: string;
    let responseErrorCode: string;
    let responseDetails: any | undefined;
    let responseExposeDetails: boolean;

    if (error instanceof ApiError) {
        responseStatus = error.status;
        responseMessage = error.message;
        responseErrorCode = error.errorCode;
        // Show details if in development or exposeDetails is true
        responseDetails = (
            isDev || error.exposeDetails
        ) ? error.details : undefined;
        responseExposeDetails = error.exposeDetails;
    } else {
        responseStatus = HTTP_STATUS_CODE.SERVER_ERROR;
        responseMessage = API_ERROR_MESSAGE.serverError;
        responseErrorCode = API_ERROR_CODE.SERVER_ERROR;
        // Only include Error details in development
        responseDetails = isDev
            ? { 
                name: error.name,
                message: error.message 
            } 
            : undefined;
        responseExposeDetails = false;
    }

    const errorResponse: ApiErrorResponse = {
        status: responseStatus,
        message: responseMessage,
        errorCode: responseErrorCode,
        details: responseDetails,
        // Only include exposeDetails in development
        exposeDetails: isDev ? responseExposeDetails : undefined,
        // Only include stack in development
        stack: isDev ? error.stack : undefined,
    };

    res.status(responseStatus).json(errorResponse);
};

export default errorHandler;
