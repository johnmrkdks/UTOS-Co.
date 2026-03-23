export enum ErrorCode {
	MISSING_ENTRY = "MISSING_ENTRY",
	VALIDATION_ERROR = "VALIDATION_ERROR",
	NOT_FOUND = "NOT_FOUND",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	CONFLICT = "CONFLICT",
	INTERNAL_ERROR = "INTERNAL_ERROR",
	BAD_REQUEST = "BAD_REQUEST",
	DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
}

export interface ErrorDetail {
	field?: string;
	message: string;
	code?: string;
}

export class AppError extends Error {
	public readonly code: ErrorCode;
	public readonly statusCode: number;
	public readonly details?: ErrorDetail[];
	public readonly isOperational: boolean;

	constructor(
		message: string,
		code: ErrorCode,
		statusCode = 500,
		details?: ErrorDetail[],
		isOperational = true,
	) {
		super(message);
		this.code = code;
		this.statusCode = statusCode;
		this.details = details;
		this.isOperational = isOperational;

		Error.captureStackTrace(this, this.constructor);
	}
}
