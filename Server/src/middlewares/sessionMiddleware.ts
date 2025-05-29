import { Request, Response, NextFunction } from 'express';
import sessionManager from '../services/sessionManager';
import config from '../config/config';
import ApiError from '../utils/apiError';
import { HTTP_STATUS_CODE, API_ERROR_MESSAGE, API_ERROR_CODE } from '../constants/constants';
import { ExamMarkingSession } from '../dataTypes/session';

// Extend Request interface to include session
declare global {
    namespace Express {
        interface Request {
            sessionId?: string;
            examMarkingSession?: ExamMarkingSession;
        }
    }
}

/**
 * Set session cookie in response
 */
export function setSessionCookie(res: Response, sessionId: string): void {
    res.cookie(config.session.cookieName, sessionId, {
        httpOnly: config.session.cookieHttpOnly,
        secure: config.session.cookieSecure,
        sameSite: config.session.cookieSameSite,
        maxAge: config.session.defaultExpiryHours * 60 * 60 * 1000,
    });
}

/**
 * Extract session ID from cookie or header
 */
export function extractSessionCookie(req: Request): string | null {
    // Try cookie first
    const cookieSessionId = req.cookies?.[config.session.cookieName];
    if (cookieSessionId) {
        return cookieSessionId;
    }

    // Try header as fallback
    const headerSessionId = req.headers['x-session-id'] as string;
    if (headerSessionId) {
        return headerSessionId;
    }

    return null;
}

/**
 * Middleware to validate sessions
 */
export function validateSession(req: Request, res: Response, next: NextFunction): void {
    const sessionId = extractSessionCookie(req);
    if (!sessionId) {
        return next(new ApiError(
            HTTP_STATUS_CODE.UNAUTHORIZED,
            API_ERROR_MESSAGE.noSessionId,
            API_ERROR_CODE.NO_SESSION_ID,
            { message: 'No session cookie or header found' }
        ));
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
        return next(new ApiError(
            HTTP_STATUS_CODE.UNAUTHORIZED,
            API_ERROR_MESSAGE.sessionNotFound,
            API_ERROR_CODE.SESSION_NOT_FOUND,
            { sessionId }
        ));
    }

    sessionManager.updateSessionAccess(sessionId);

    // Attach session to request
    req.sessionId = sessionId;
    req.examMarkingSession = session;

    next();
}

/**
 * Middleware for optional session (won't fail is there is no session)
 */
export function optionalSession(req: Request, res: Response, next: NextFunction): void {
    const sessionId = extractSessionCookie(req);

    if (sessionId) {
        const session = sessionManager.getSession(sessionId);

        if (session) {
            sessionManager.updateSessionAccess(sessionId);
            req.sessionId = sessionId;
            req.examMarkingSession = session;
        }
    }

    next();
}

/**
 * Middleware to clear session cookie
 */
export function clearSessionCookie(res: Response): void {
    res.clearCookie(config.session.cookieName, {
        httpOnly: config.session.cookieHttpOnly,
        secure: config.session.cookieSecure,
        sameSite: config.session.cookieSameSite,
    });
}
