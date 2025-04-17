import ApiError from "../../src/utils/apiError";
import { HTTP_STATUS_CODE, API_ERROR_CODE, API_ERROR_MESSAGE } from "../../src/constants/constants";

describe("ApiError", () => {
    it("should create an instance with default values if none are provided", () => {
        const error = new ApiError();

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.status).toBe(HTTP_STATUS_CODE.SERVER_ERROR);
        expect(error.message).toBe(API_ERROR_MESSAGE.serverError);
        expect(error.errorCode).toBe(API_ERROR_CODE.SERVER_ERROR);
        expect(error.details).toBeUndefined();
        expect(error.exposeDetails).toBe(false);
        expect(error.stack).toBeDefined();
    });

    it('should create an instance with custom values', () => {
        const customStatus = HTTP_STATUS_CODE.BAD_REQUEST;
        const customMessage = API_ERROR_MESSAGE.badRequest;
        const customErrorCode = API_ERROR_CODE.BAD_REQUEST;
        const customDetails = { reason: "Error occurred on line 13" };
        const customExposeDetails = true;

        const error = new ApiError(
            customStatus,
            customMessage,
            customErrorCode,
            customDetails,
            customExposeDetails
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.message).toBe(customMessage);
        expect(error.errorCode).toBe(customErrorCode);
        expect(error.details).toEqual(customDetails);
        expect(error.exposeDetails).toBe(customExposeDetails);
        expect(error.stack).toBeDefined();
    });
});
