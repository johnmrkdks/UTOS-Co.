import { TRPCError } from '@trpc/server';
import { AppError, ErrorCode } from '@/types/errors';
import { ErrorFactory } from '@/utils/error-factory';

export const mapAppErrorToTRPC = (error: AppError): TRPCError => {
	const codeMap: Record<ErrorCode, TRPCError['code']> = {
		[ErrorCode.BAD_REQUEST]: 'BAD_REQUEST',
		[ErrorCode.VALIDATION_ERROR]: 'BAD_REQUEST',
		[ErrorCode.NOT_FOUND]: 'NOT_FOUND',
		[ErrorCode.UNAUTHORIZED]: 'UNAUTHORIZED',
		[ErrorCode.FORBIDDEN]: 'FORBIDDEN',
		[ErrorCode.CONFLICT]: 'CONFLICT',
		[ErrorCode.DUPLICATE_ENTRY]: 'CONFLICT',
		[ErrorCode.INTERNAL_ERROR]: 'INTERNAL_SERVER_ERROR'
	};

	return new TRPCError({
		code: codeMap[error.code] || 'INTERNAL_SERVER_ERROR',
		message: error.message,
		cause: error,
		...(error.details && {
			// Pass details in the TRPCError data field
			data: { details: error.details }
		})
	});
};

export const handleTRPCError = (error: unknown): never => {
	if (error instanceof AppError) {
		throw mapAppErrorToTRPC(error);
	}

	// Handle database/Drizzle errors
	if (error instanceof Error) {
		if (error.message?.includes('UNIQUE constraint failed') ||
			error.message?.includes('duplicate key')) {
			const appError = ErrorFactory.duplicateEntry('Resource');
			throw mapAppErrorToTRPC(appError);
		}

		// Handle Zod validation errors
		if (error.name === 'ZodError') {
			const zodError = error as any;
			const details = zodError.errors?.map((e: any) => ({
				field: e.path?.join('.'),
				message: e.message,
				code: e.code
			})) || [];
			const appError = ErrorFactory.validation('Validation failed', details);
			throw mapAppErrorToTRPC(appError);
		}
	}

	// Default to internal server error
	const appError = ErrorFactory.internal('Something went wrong');
	throw mapAppErrorToTRPC(appError);
};
