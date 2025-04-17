export interface ApiErrorResponse {
    status: number;
    message: string;
    errorCode: string;
    details?: any;
    exposeDetails?: boolean;
    stack?: string;
}
