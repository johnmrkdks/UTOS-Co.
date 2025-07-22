import { AppError, ErrorCode, type ErrorDetail } from "@/types/errors";

export class ErrorFactory {
	static badRequest(message: string, details?: ErrorDetail[]): AppError {
		return new AppError(message, ErrorCode.BAD_REQUEST, 400, details);
	}

	static notFound(resource: string): AppError {
		return new AppError(`${resource} not found`, ErrorCode.NOT_FOUND, 404);
	}

	static conflict(message: string, details?: ErrorDetail[]): AppError {
		return new AppError(message, ErrorCode.CONFLICT, 409, details);
	}

	static duplicateEntry(resource: string, field?: string): AppError {
		const details = field ? [{ field, message: `${field} already exists` }] : undefined;
		return new AppError(
			`${resource} already exists`,
			ErrorCode.DUPLICATE_ENTRY,
			409,
			details
		);
	}

	static validation(message: string, details: ErrorDetail[]): AppError {
		return new AppError(message, ErrorCode.VALIDATION_ERROR, 400, details);
	}

	static unauthorized(message: string = 'Unauthorized'): AppError {
		return new AppError(message, ErrorCode.UNAUTHORIZED, 401);
	}

	static forbidden(message: string = 'Forbidden'): AppError {
		return new AppError(message, ErrorCode.FORBIDDEN, 403);
	}

	static internal(message: string = 'Internal server error'): AppError {
		return new AppError(message, ErrorCode.INTERNAL_ERROR, 500, undefined, false);
	}
}
