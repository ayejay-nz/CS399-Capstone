jest.mock('../../src/config/config', () => ({
    __esModule: true,
    default: {
        server: {
            port: 8000,
            nodeEnv: 'development',
        },
    },
}));

import config from '../../src/config/config';
import { Request, Response, NextFunction } from 'express';
import errorHandler from '../../src/middlewares/errorHandler';
import ApiError from '../../src/utils/apiError';
import { API_ERROR_CODE, API_ERROR_MESSAGE, HTTP_STATUS_CODE } from '../../src/constants/constants';
import { ApiErrorResponse } from '../../src/dataTypes/apiErrorResponse';

describe('errorHandler middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let responseStatus: number;
    let responseJson: ApiErrorResponse | {};

    const createMockResponse = () => {
        const res: Partial<Response> = {};
        res.status = jest.fn().mockImplementation((status) => {
            responseStatus = status;
            return res;
        });
        res.json = jest.fn().mockImplementation((json) => {
            responseJson = json;
            return res;
        });
        return res;
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        jest.resetModules();
        mockRequest = {};
        mockResponse = createMockResponse();
        mockNext = jest.fn();
        responseStatus = 0;
        responseJson = {};
    });

    describe('in development environment', () => {
        beforeAll(() => {
            // Set NODE_ENV to 'development'
            config.server.nodeEnv = 'development';
        });

        it('should handle generic Error correctly', () => {
            const error = new Error('Generic error 123');
            error.stack = 'Error: Generic error 123\n    at test (test.js.1.1)';

            errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

            expect(responseStatus).toBe(HTTP_STATUS_CODE.SERVER_ERROR);
            expect(responseJson).toEqual({
                status: HTTP_STATUS_CODE.SERVER_ERROR,
                message: API_ERROR_MESSAGE.serverError,
                errorCode: API_ERROR_CODE.SERVER_ERROR,
                details: { name: error.name, message: error.message },
                exposeDetails: false,
                stack: error.stack,
            });
            expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.SERVER_ERROR);
            expect(mockResponse.json).toHaveBeenCalledTimes(1);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle ApiError with exposeDetails=false correctly', () => {
            const details = { reason: 'Error on line 13' };
            const error = new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.badRequest,
                API_ERROR_CODE.BAD_REQUEST,
                details,
                false,
            );
            error.stack = 'ApiError: Bad Request\n    at test (test.js:1:1)';

            errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

            expect(responseStatus).toBe(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(responseJson).toEqual({
                status: HTTP_STATUS_CODE.BAD_REQUEST,
                message: API_ERROR_MESSAGE.badRequest,
                errorCode: API_ERROR_CODE.BAD_REQUEST,
                details: details,
                exposeDetails: false,
                stack: error.stack,
            });
            expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledTimes(1);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle ApiError with exposeDetails=true correctly', () => {
            const details = { info: 'sensitive data' };
            const error = new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.badRequest,
                API_ERROR_CODE.BAD_REQUEST,
                details,
                true,
            );
            error.stack = 'ApiError: Bad Request\n    at test (test.js:1:1)';

            errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

            expect(responseStatus).toBe(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(responseJson).toEqual({
                status: HTTP_STATUS_CODE.BAD_REQUEST,
                message: API_ERROR_MESSAGE.badRequest,
                errorCode: API_ERROR_CODE.BAD_REQUEST,
                details: details,
                exposeDetails: true,
                stack: error.stack,
            });
            expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledTimes(1);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('in production environment', () => {
        beforeAll(() => {
            // Set NODE_ENV to 'production'
            config.server.nodeEnv = 'production';
        });

        it('should handle generic Error correctly', () => {
            const error = new Error('Generic error 123');
            error.stack = 'Error: Generic error 123\n    at prod (prod.js:1:1)';

            errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

            expect(responseStatus).toBe(HTTP_STATUS_CODE.SERVER_ERROR);
            expect(responseJson).toEqual({
                status: HTTP_STATUS_CODE.SERVER_ERROR,
                message: API_ERROR_MESSAGE.serverError,
                errorCode: API_ERROR_CODE.SERVER_ERROR,
                details: undefined, // details hidden for generic Error in prod
                exposeDetails: undefined, // exposeDetails hidden for generic Error in prod
                stack: undefined, // stack hidden for generic Error in prod
            });
            expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.SERVER_ERROR);
            expect(mockResponse.json).toHaveBeenCalledTimes(1);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle ApiError with exposeDetails=false correctly', () => {
            const details = { info: 'Error on line 13' };
            const error = new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.badRequest,
                API_ERROR_CODE.BAD_REQUEST,
                details,
                false,
            );
            error.stack = 'ApiError: Bad Request\n    at prod (prod.js:1:1)';

            errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

            expect(responseStatus).toBe(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(responseJson).toEqual({
                status: HTTP_STATUS_CODE.BAD_REQUEST,
                message: API_ERROR_MESSAGE.badRequest,
                errorCode: API_ERROR_CODE.BAD_REQUEST,
                details: undefined, // details hidden in prod as exposeDetails is false
                exposeDetails: undefined, // exposeDetails hidden in prod
                stack: undefined, // stack hidden in prod
            });
            expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledTimes(1);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle ApiError with exposeDetails=true correctly', () => {
            const details = { info: 'Error on line 13' };
            const error = new ApiError(
                HTTP_STATUS_CODE.BAD_REQUEST,
                API_ERROR_MESSAGE.badRequest,
                API_ERROR_CODE.BAD_REQUEST,
                details,
                true,
            );
            error.stack = 'ApiError: Bad Request\n    at prod (prod.js:1:1)';

            errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

            expect(responseStatus).toBe(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(responseJson).toEqual({
                status: HTTP_STATUS_CODE.BAD_REQUEST,
                message: API_ERROR_MESSAGE.badRequest,
                errorCode: API_ERROR_CODE.BAD_REQUEST,
                details: details, // details included in prod as exposeDetails is true
                exposeDetails: undefined, // exposeDetails hidden in prod
                stack: undefined, // stack hidden in prod
            });
            expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS_CODE.BAD_REQUEST);
            expect(mockResponse.json).toHaveBeenCalledTimes(1);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
