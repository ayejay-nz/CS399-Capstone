export interface ApiSuccessResponse<T = any> {
    status: number;
    message: string;
    data?: T;
}
