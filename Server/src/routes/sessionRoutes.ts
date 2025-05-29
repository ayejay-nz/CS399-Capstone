import express, { Request, Response, NextFunction } from 'express';
import sessionManager from '../services/sessionManager';
import { validateSession, clearSessionCookie } from '../middlewares/sessionMiddleware';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE, API_SUCCESS_MESSAGE } from '../constants/constants';
import ApiError from '../utils/apiError';
import { ApiSuccessResponse } from '../dataTypes/apiSuccessResponse';
import { SessionStatusResponse } from '../dataTypes/session';
import config from '../config/config';

const router = express.Router();

/**
 * Retrieve answer key by session ID
 */
router.get(
    '/:sessionId',
    validateSession,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = req.answerKeySession!;

            const response: ApiSuccessResponse<typeof session.answerKey> = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: session.answerKey,
            };
            res.status(response.status).json(response);
        } catch (error) {
            next(error);
        }
    },
);

/**
 * Delete session by session ID
 */
router.delete(
    '/:sessionId',
    validateSession,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionId = req.sessionId!;

            const deleted = sessionManager.deleteSession(sessionId);
            if (deleted) {
                clearSessionCookie(res);
            }

            const response: ApiSuccessResponse<{ deleted: boolean }> = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: { deleted },
            };
            res.status(response.status).json(response);
        } catch (error) {
            next(error);
        }
    },
);

/**
 * Get session information
 */
router.get(
    '/status', 
    validateSession, 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = req.answerKeySession!;

            const statusResponse: SessionStatusResponse = {
                sessionId: session.sessionId,
                isValid: true,
                expiresAt: session.expiresAt,
                lastAccessedAt: session.lastAccessedAt,
            };

            const response: ApiSuccessResponse<SessionStatusResponse> = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: statusResponse,
            };
            res.status(response.status).json(response);
        } catch (error) {
            next(error);
        }
    },
);

/**
 * Refresh session expiry
 */
router.post(
    '/refresh',
    validateSession,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionId = req.sessionId!;

            const refreshed = sessionManager.refreshSession(sessionId);

            if (!refreshed) {
                throw new ApiError(
                    HTTP_STATUS_CODE.BAD_REQUEST,
                    API_ERROR_MESSAGE.sessionNotFound,
                    API_ERROR_CODE.SESSION_NOT_FOUND,
                    { sessionId }
                );
            }

            const session = sessionManager.getSession(sessionId)!;

            const statusResponse: SessionStatusResponse = {
                sessionId: session.sessionId,
                isValid: true,
                expiresAt: session.expiresAt,
                lastAccessedAt: session.lastAccessedAt,
            };

            const response: ApiSuccessResponse<SessionStatusResponse> = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: statusResponse,
            };
            res.status(response.status).json(response);
        } catch (error) {
            next(error);
        }
    }
)

/**
 * Get session statistics (for monitoring)
 */
router.get(
    '/stats',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = {
                activeSessionCount: sessionManager.getActiveSessionCount(),
                memoryUsageMB: Math.round(sessionManager.getMemoryUsage() * 100) / 100,
                maxSessions: config.session.maxSessions,
                maxMemoryUsageMB: config.session.maxMemoryUsageMB,
            }

            const response: ApiSuccessResponse<typeof stats> = {
                status: HTTP_STATUS_CODE.OK,
                message: API_SUCCESS_MESSAGE.ok,
                data: stats,
            }
            res.status(response.status).json(response);
        } catch (error) {
            next(error);
        }
    }
)

export default router;
