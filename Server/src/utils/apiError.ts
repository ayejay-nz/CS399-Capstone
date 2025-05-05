import { API_ERROR_CODE, API_ERROR_MESSAGE, HTTP_STATUS_CODE } from '../constants/constants';

class ApiError extends Error {
    public readonly status: number;
    public readonly errorCode: string;
    public readonly details?: any;
    public readonly exposeDetails: boolean;

    constructor(
        status: number = HTTP_STATUS_CODE.SERVER_ERROR,
        message: string = API_ERROR_MESSAGE.serverError,
        errorCode: string = API_ERROR_CODE.SERVER_ERROR,
        details?: any,
        exposeDetails: boolean = false,
    ) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
        this.details = details;
        this.exposeDetails = exposeDetails;

        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;
