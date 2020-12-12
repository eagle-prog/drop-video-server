import { Response } from 'express';
import { response_status_codes } from './model';

export function successResponse(message: string, data: any, res: Response) {
    res.status(response_status_codes.success).json({
        success: true,
        message,
        data
    });
}

export function failureResponse(message: string, data: any, res: Response) {
    res.status(response_status_codes.success).json({
        success: false,
        message,
        data
    });
}

export function insufficientParameters(res: Response) {
    res.status(response_status_codes.bad_request).json({
        success: false,
        message: 'Insufficient parameters',
        data: {}
    });
}

export function mongoError(err: any, res: Response) {
    res.status(response_status_codes.internal_server_error).json({
        success: false,
        message: 'MongoDB error',
        data: err
    });
}