import express, { Request, Response, NextFunction } from 'express';
import { TeleformData } from '../dataTypes/teleformData';
import { AnswerKey, AnswerKeyQuestion } from '../dataTypes/answerKey';
import { generateExamBreakdown } from '../services/examMarking';
import { ApiSuccessResponse } from '../dataTypes/apiSuccessResponse';
import { ExamBreakdown } from '../dataTypes/examBreakdown';
import {
    API_ERROR_CODE,
    API_ERROR_MESSAGE,
    API_SUCCESS_MESSAGE,
    HTTP_STATUS_CODE,
} from '../constants/constants';
import { exportGeneratedStats } from '../fileExporters/statsGenerator';
import config from '../config/config';
import ApiError from '../utils/apiError';
import { ApiErrorResponse } from '../dataTypes/apiErrorResponse';
import { uploadMarkingFiles } from '../middlewares/uploadMiddleware';
import {
    optionalSession,
    setSessionCookie,
    validateSession,
} from '../middlewares/sessionMiddleware';
import { SessionCreatedResponse } from '../dataTypes/session';
import sessionManager from '../services/sessionManager';
import {
    CorrectnessUpdateRequest,
    FeedbackUpdateRequest,
    UpdateRequest,
} from '../dataTypes/updateRequest';
import { indexToTeleformAnswer } from '../utils/answerKey';

const router = express.Router();

async function propagateApiError(res: globalThis.Response) {
    // Try to read body as { message, errorCode, ... }
    const errPayload = (await res.json().catch(() => null)) as Partial<ApiErrorResponse> | null;

    throw new ApiError(
        res.status,
        errPayload?.message ?? res.statusText,
        errPayload?.errorCode ?? API_ERROR_CODE.SERVER_ERROR,
        errPayload?.details,
        errPayload?.exposeDetails ?? false,
    );
}

router.post(
    '/upload',
    uploadMarkingFiles,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let answerKey: AnswerKey;

            // Process answer key file
            const answerKeyFileObj = (req.files as any)['answerKeyFile'][0];
            const answerKeyBuffer = answerKeyFileObj.buffer as Buffer;
            const answerKeyOriginalName = answerKeyFileObj.originalname as string;
            const answerKeyMimeType = answerKeyFileObj.mimetype as string;

            const answerKeyForm = new FormData();
            const answerKeyBlob = new Blob([answerKeyBuffer], { type: answerKeyMimeType });
            answerKeyForm.append('answerKeyFile', answerKeyBlob, answerKeyOriginalName);

            // Parse answer key
            const answerKeyRes = await fetch(
                `${config.server.internalApiUrl}${config.server.apiPrefix}/answer-key/upload`,
                {
                    method: 'POST',
                    body: answerKeyForm,
                },
            );

            if (!answerKeyRes.ok) await propagateApiError(answerKeyRes);

            const { data: answerKeyResponse } =
                (await answerKeyRes.json()) as ApiSuccessResponse<any>;

            answerKey = answerKeyResponse.answerKey;
            if (!answerKey) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.badRequest,
                    API_ERROR_CODE.BAD_REQUEST,
                    { message: 'No answer key detected' },
                );
            }

            // Forward the session cookie to the client
            const sessionId = answerKeyResponse.sessionId;
            if (sessionId) {
                setSessionCookie(res, sessionId);
                console.log(`Set session cookie for client: ${sessionId}`);
            }

            const teleformDataFileObj = (req.files as any)['teleformDataFile'][0];
            const teleformDataBuffer = teleformDataFileObj.buffer as Buffer;
            const teleformDataOriginalName = teleformDataFileObj.originalname as string;
            const teleformDataMimeType = teleformDataFileObj.mimetype as string;

            const teleformDataForm = new FormData();
            const teleformDataBlob = new Blob([teleformDataBuffer], { type: teleformDataMimeType });
            teleformDataForm.append('teleformDataFile', teleformDataBlob, teleformDataOriginalName);

            // Parse teleform data
            const teleformDataRes = await fetch(
                `${config.server.internalApiUrl}${config.server.apiPrefix}/teleform-data/upload`,
                {
                    method: 'POST',
                    body: teleformDataForm,
                },
            );

            if (!teleformDataRes.ok) await propagateApiError(teleformDataRes);

            const { data: teleformData } =
                (await teleformDataRes.json()) as ApiSuccessResponse<TeleformData>;

            if (!teleformData) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.badRequest,
                    API_ERROR_CODE.BAD_REQUEST,
                    { message: 'No teleform data detected' },
                );
            }
            const examBreakdown = generateExamBreakdown(answerKey, teleformData);

            // Store exam breakdown and teleform data in session
            if (sessionId) {
                sessionManager.addTeleformData(sessionId, teleformData, teleformDataOriginalName);
                sessionManager.updateExamBreakdown(sessionId, examBreakdown);
                console.log(`Stored exam breakdown and teleform data in session: ${sessionId}`);
            }

            const responseData = [{ stats: examBreakdown }, { questions: answerKey.source }] as [
                { stats: ExamBreakdown },
                { questions: AnswerKeyQuestion[] },
            ];

            const response: ApiSuccessResponse<
                [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }]
            > = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: responseData,
            };
            res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    },
);

/**
 * Generate stats from session data
 */
router.post(
    '/generate-stats-from-session',
    validateSession,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = req.examMarkingSession!;

            if (!session.teleformData) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.noTeleformData,
                    API_ERROR_CODE.MISSING_REQUIRED_DATA,
                );
            }

            const examBreakdown = generateExamBreakdown(session.answerKey, session.teleformData);
            sessionManager.updateExamBreakdown(session.sessionId, examBreakdown);

            const responseData = [
                { stats: examBreakdown },
                { questions: session.answerKey.source },
            ] as [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }];

            const response: ApiSuccessResponse<
                [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }]
            > = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: responseData,
            };
            res.status(response.status).json(response);
        } catch (err) {
            next(err);
        }
    },
);

router.post(
    '/generate-stats',
    validateSession,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = req.examMarkingSession!;

            if (!session.examBreakdown) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.noExamBreakdown,
                    API_ERROR_CODE.MISSING_REQUIRED_DATA,
                );
            }

            const examBreakdown = session.examBreakdown;

            const zipBuffer = await exportGeneratedStats(examBreakdown);

            res.status(HTTP_STATUS_CODE.OK)
                .set({
                    'Content-Type': 'application/zip',
                    'Content-Disposition': 'attachment; filename="stats_breakdown.zip"',
                    'Content-Length': zipBuffer.length,
                })
                .send(zipBuffer);
        } catch (err) {
            next(err);
        }
    },
);

router.post(
    '/update-dashboard',
    validateSession,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = req.examMarkingSession!;
            const updateRequest = req.body as UpdateRequest;

            // Check we have both answer key and teleform data
            if (!session.answerKey) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.missingRequiredData,
                    API_ERROR_CODE.MISSING_REQUIRED_DATA,
                    { message: 'Session does not contain answer key data' },
                );
            }

            if (!session.teleformData) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.missingRequiredData,
                    API_ERROR_CODE.MISSING_REQUIRED_DATA,
                    { message: 'Session does not contain teleform data' },
                );
            }

            // Check update request structure
            if (!updateRequest.type || !updateRequest.questionId) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.invalidEditInput,
                    API_ERROR_CODE.INVALID_EDIT_INPUT,
                    { message: 'Missing required fields: type and questionId' },
                );
            }

            // Handle correctness update
            if (updateRequest.type === 'correctness') {
                const correctnessUpdate = updateRequest as CorrectnessUpdateRequest;

                // Check if question exists in answer key
                const question = session.answerKey.source.find(
                    (q) => q.id === correctnessUpdate.questionId,
                );
                if (!question) {
                    throw new ApiError(
                        HTTP_STATUS_CODE.BAD_REQUEST,
                        API_ERROR_MESSAGE.editTargetNotFound,
                        API_ERROR_CODE.EDIT_TARGET_NOT_FOUND,
                        {
                            message: `Question with ID ${correctnessUpdate.questionId} not found in answer key`,
                        },
                    );
                }

                // Update version solutions for allTrue
                if (correctnessUpdate.allTrue) {
                    // Update answer key
                    session.answerKey.versionSolutions.forEach((version) => {
                        const questionSolution = version.questionSolutions.find(
                            (qs) => qs.questionId === correctnessUpdate.questionId,
                        );

                        if (questionSolution) {
                            // Set all options as correct
                            const numOptions = question.options.length;
                            const allAnswers = [];
                            for (let i = 0; i < numOptions; i++) {
                                allAnswers.push(indexToTeleformAnswer(i));
                            }

                            questionSolution.answers = allAnswers;
                        }
                    });
                }
                // TODO: Update where allTrue is false? i.e. reverting back to original answer key

                // Regenerate exam breakdown with new answer key
                const updatedExamBreakdown = generateExamBreakdown(
                    session.answerKey,
                    session.teleformData,
                );
                sessionManager.updateExamBreakdown(session.sessionId, updatedExamBreakdown);

                // Prepare response
                const responseData = [
                    { stats: updatedExamBreakdown },
                    { questions: session.answerKey.source },
                ] as [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }];

                const response: ApiSuccessResponse<
                    [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }]
                > = {
                    status: HTTP_STATUS_CODE.OK,
                    message: API_SUCCESS_MESSAGE.ok,
                    data: responseData,
                };
                res.status(response.status).json(response);
            } else if (updateRequest.type === 'feedback') {
                const feedbackUpdate = updateRequest as FeedbackUpdateRequest;
                const currentExamBreakdown = session.examBreakdown;

                if (!currentExamBreakdown) {
                    throw new ApiError(
                        HTTP_STATUS_CODE.BAD_REQUEST,
                        API_ERROR_MESSAGE.noExamBreakdown,
                        API_ERROR_CODE.MISSING_REQUIRED_DATA,
                        { message: 'Session does not contain exam breakdown data' },
                    );
                }

                // Find specified student
                const student = currentExamBreakdown.students.find(
                    (s) => s.auid === feedbackUpdate.auid,
                );
                if (!student) {
                    throw new ApiError(
                        HTTP_STATUS_CODE.BAD_REQUEST,
                        API_ERROR_MESSAGE.editTargetNotFound,
                        API_ERROR_CODE.EDIT_TARGET_NOT_FOUND,
                        {
                            message: `Student with AUID ${feedbackUpdate.auid} not found in exam breakdown`,
                        },
                    );
                }

                // Update students custom feedback
                const answer = student.answers.find(
                    (a) => a.questionId === feedbackUpdate.questionId,
                );
                if (!answer) {
                    throw new ApiError(
                        HTTP_STATUS_CODE.BAD_REQUEST,
                        API_ERROR_MESSAGE.editTargetNotFound,
                        API_ERROR_CODE.EDIT_TARGET_NOT_FOUND,
                        {
                            message: `Answer for question ${feedbackUpdate.questionId} not found for student ${feedbackUpdate.auid}`,
                        },
                    );
                }

                answer.customFeedback = feedbackUpdate.customFeedback;

                const responseData: [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }] =
                    [{ stats: currentExamBreakdown }, { questions: session.answerKey.source }];

                const response: ApiSuccessResponse<
                    [{ stats: ExamBreakdown }, { questions: AnswerKeyQuestion[] }]
                > = {
                    status: HTTP_STATUS_CODE.OK,
                    message: API_SUCCESS_MESSAGE.ok,
                    data: responseData,
                };
                res.status(response.status).json(response);
            } else {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.invalidEditInput,
                    API_ERROR_CODE.INVALID_EDIT_INPUT,
                    { message: 'Invalid update request type' },
                );
            }

            // Refresh cookie after successful update
            sessionManager.refreshSession(session.sessionId);
        } catch (err) {
            next(err);
        }
    },
);

export default router;
