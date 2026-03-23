import { z } from "zod";

export const uploadFileSchema = z.object({
	filename: z.string().min(1).max(255),
	contentType: z.string().min(1),
	size: z.number().positive(),
});

export const getFileSchema = z.object({
	key: z.string().min(1),
});

export const deleteFileSchema = z.object({
	key: z.string().min(1),
});

export const getPresignedUrlSchema = z.object({
	filename: z.string().min(1).max(255),
	contentType: z.string().min(1),
	expiresIn: z.number().min(60).max(3600).default(3600), // 1 minute to 1 hour
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type GetFileInput = z.infer<typeof getFileSchema>;
export type DeleteFileInput = z.infer<typeof deleteFileSchema>;
export type GetPresignedUrlInput = z.infer<typeof getPresignedUrlSchema>;
