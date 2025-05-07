import ApiError from './apiError';
import { HTTP_STATUS_CODE, API_ERROR_CODE } from '../constants/constants';
import { ParsingErrorCode } from '../constants/parsingErrors';

export default class ParserError extends ApiError {
    constructor(errorCode: ParsingErrorCode, message: string, details?: any) {
        super(HTTP_STATUS_CODE.BAD_REQUEST, message, errorCode, details, false);
    }
}
