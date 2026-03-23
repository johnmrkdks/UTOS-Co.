import { TRPCError } from '@trpc/server';
import { AppError, ErrorCode } from '@/types/errors';
import { ErrorFactory } from '@/utils/error-factory';

export const mapAppErrorToTRPC = (error: AppError): TRPCError => {
	const codeMap: Record<ErrorCode, TRPCError['code']> = {
		[ErrorCode.MISSING_ENTRY]: 'NOT_FOUND',
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
	console.error("🔴 handleTRPCError - Error caught:", error);

	if (error instanceof AppError) {
		console.error("🔴 Error is AppError:", error.code, error.message);
		throw mapAppErrorToTRPC(error);
	}

	// Handle database/Drizzle errors
	if (error instanceof Error) {
		console.error("🔴 Error is standard Error:", error.name, error.message);

		if (error.message?.includes('UNIQUE constraint failed') ||
			error.message?.includes('duplicate key')) {
			console.error("🔴 Duplicate entry error detected");
			const appError = ErrorFactory.duplicateEntry('Resource');
			throw mapAppErrorToTRPC(appError);
		}

		// Handle known quote/config errors as BAD_REQUEST (client can show message)
		if (
			error.message?.includes('No pricing configuration') ||
			error.message?.includes('Google Maps API key') ||
			error.message?.includes('API key')
		) {
			console.error("🔴 Config/quote error:", error.message);
			const appError = ErrorFactory.badRequest(error.message);
			throw mapAppErrorToTRPC(appError);
		}

		// Handle Zod validation errors
		if (error.name === 'ZodError') {
			const zodError = error as any;
			console.error("🔴 Zod validation error detected");
			console.error("🔴 Zod errors:", JSON.stringify(zodError.errors, null, 2));

			const details = zodError.errors?.map((e: any) => ({
				field: e.path?.join('.'),
				message: e.message,
				code: e.code,
				received: e.received,
				expected: e.expected,
			})) || [];

			console.error("🔴 Formatted validation errors:", JSON.stringify(details, null, 2));

			const appError = ErrorFactory.validation('Validation failed', details);
			throw mapAppErrorToTRPC(appError);
		}
	}

	// Default to internal server error - preserve original message when meaningful
	const message =
		error instanceof Error && error.message && !error.message.includes("at ")
			? error.message
			: "Something went wrong";
	console.error("🔴 Falling back to internal server error:", message);
	const appError = ErrorFactory.internal(message);
	throw mapAppErrorToTRPC(appError);
};
