import type { Control } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { FormField, FormItem, FormControl, FormMessage } from "@workspace/ui/components/form"
import { cn } from "@workspace/ui/lib/utils"
import type { AddCarFormValues } from "../add-car-form"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon, StarIcon, InfoIcon, Loader2 } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVerticalIcon } from "lucide-react"
import { Badge } from "@workspace/ui/components/badge"
import type { z } from "zod/v3"
import { CarImageSchema } from "@/features/dashboard/_pages/car-management/_schemas/car-schema"
import { useState, useCallback, useMemo } from "react"
import { Progress } from "@workspace/ui/components/progress"
import { useProxyUploadMutation } from "@/hooks/query/file/use-proxy-upload-mutation"

type ImagesFormProps = {
	control: Control<AddCarFormValues>
	className?: string
}

type CarImage = z.infer<typeof CarImageSchema>

const UPLOAD_CONFIG = {
	maxSizeMB: 5,
	maxFiles: 6,
	acceptedTypes: "image/png,image/jpeg,image/jpg"
} as const

export function ImagesForm({ control, className, ...props }: ImagesFormProps) {
	const maxSize = UPLOAD_CONFIG.maxSizeMB * 1024 * 1024

	return (
		<Card className={cn("shadow-none", className)} {...props}>
			<CardHeader className="pb-4">
				<CardTitle className="text-lg">Car Images</CardTitle>
				<CardDescription className="text-sm">
					Upload at least 1 image (up to {UPLOAD_CONFIG.maxFiles} maximum). At least one image is required to add a car.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FormField
					control={control}
					name="images"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormControl>
								<ImagesUploader
									value={field.value || []}
									onChange={field.onChange}
									maxFiles={UPLOAD_CONFIG.maxFiles}
									maxSize={maxSize}
									maxSizeMB={UPLOAD_CONFIG.maxSizeMB}
									hasError={!!fieldState.error}
									errorMessage={fieldState.error?.message}
								/>
							</FormControl>
							<FormMessage />
							{/* Debug info in development - simplified */}
							{process.env.NODE_ENV === 'development' && fieldState.error && (
								<div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs">
									<details>
										<summary className="cursor-pointer font-medium text-red-800 dark:text-red-200">
											Debug Info
										</summary>
										<pre className="mt-1 text-red-700 dark:text-red-300 whitespace-pre-wrap">
											{JSON.stringify({
												error: fieldState.error,
												currentImages: field.value?.length || 0,
												hasOnChange: typeof field.onChange === 'function'
											}, null, 2)}
										</pre>
									</details>
								</div>
							)}
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}

type ImagesUploaderProps = {
	value: CarImage[]
	onChange: (images: CarImage[]) => void
	maxFiles: number
	maxSize: number
	maxSizeMB: number
	hasError?: boolean
	errorMessage?: string
}

function ImagesUploader({
	value,
	onChange,
	maxFiles,
	maxSize,
	maxSizeMB,
	hasError,
	errorMessage
}: ImagesUploaderProps) {
	const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
	const proxyUploadMutation = useProxyUploadMutation()

	// Memoize safe value to prevent unnecessary re-renders
	const safeValue = useMemo(() => Array.isArray(value) ? value : [], [value])

	// Helper function to update image order and main status
	const updateImageOrder = useCallback((images: CarImage[]) => {
		return images
			.filter((img): img is CarImage => img != null)
			.map((img, index) => ({
				...img,
				order: index + 1,
				isMain: index === 0,
				altText: img?.altText || `Car Image ${index + 1}`,
			}))
	}, [])

	// Optimized file upload handler
	const handleFilesChange = useCallback(async (newFiles: any[]) => {
		const remainingSlots = maxFiles - safeValue.length
		const filesToUpload = newFiles.slice(0, remainingSlots)

		if (filesToUpload.length === 0) return

		try {
			const uploadPromises = filesToUpload.map(async (fileWrapper) => {
				const file = fileWrapper.file as File
				const fileId = fileWrapper.id

				try {
					// Update progress for this file
					setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

					// Proxy upload via our API (avoids R2 CORS)
					const result = await proxyUploadMutation.mutateAsync({
						entityType: "cars",
						file,
					})

					setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))

					return {
						url: result.imageUrl,
						altText: `Car Image ${safeValue.length + 1}`,
						order: 0, // Will be updated by updateImageOrder
						isMain: false, // Will be updated by updateImageOrder
					} as CarImage

				} catch (error) {
					console.error(`Upload failed for ${file.name}:`, error)
					setUploadProgress(prev => {
						const newProgress = { ...prev }
						delete newProgress[fileId]
						return newProgress
					})
					removeFile(fileId)
					return null
				}
			})

			const uploadedImages = (await Promise.all(uploadPromises)).filter(
				(img): img is CarImage => img !== null
			)

			if (uploadedImages.length > 0) {
				const allImages = [...safeValue, ...uploadedImages]
				const orderedImages = updateImageOrder(allImages)
				onChange(orderedImages)
			}

		} catch (error) {
			console.error('Upload process failed:', error)
		}
	}, [safeValue, maxFiles, proxyUploadMutation, onChange, updateImageOrder, removeFile])

	// File upload hook configuration
	const [
		{ files, isDragging, errors: uploadErrors },
		{
			handleDragEnter,
			handleDragLeave,
			handleDragOver,
			handleDrop,
			openFileDialog,
			removeFile,
			clearFiles,
			reorderFiles,
			getInputProps,
		},
	] = useFileUpload({
		accept: UPLOAD_CONFIG.acceptedTypes,
		maxSize,
		multiple: true,
		maxFiles,
		onFilesAdded: handleFilesChange,
	})

	// Optimized remove image handler
	const handleRemoveImage = useCallback((index: number) => {
		const fileToRemove = files[index]
		if (fileToRemove) {
			removeFile(fileToRemove.id)
			// Clear progress for this file
			setUploadProgress(prev => {
				const newProgress = { ...prev }
				delete newProgress[fileToRemove.id]
				return newProgress
			})
		}

		const updatedImages = safeValue.filter((_, i) => i !== index)
		const reorderedImages = updateImageOrder(updatedImages)
		onChange(reorderedImages)
	}, [files, removeFile, safeValue, updateImageOrder, onChange])



	// Optimized drag end handler
	const handleDragEnd = useCallback((result: any) => {
		if (!result.destination) return

		const sourceIndex = result.source.index
		const destinationIndex = result.destination.index

		if (sourceIndex === destinationIndex) return

		reorderFiles(sourceIndex, destinationIndex)

		// Only update form value when we have matching data (files and safeValue in sync)
		if (safeValue.length === 0) return

		const reorderedImages = Array.from(safeValue)
		const [removedImage] = reorderedImages.splice(sourceIndex, 1)
		if (removedImage == null) return
		reorderedImages.splice(destinationIndex, 0, removedImage)

		const updatedImages = updateImageOrder(reorderedImages)
		onChange(updatedImages)
	}, [reorderFiles, safeValue, updateImageOrder, onChange])

	// Optimized clear all handler
	const handleClearAll = useCallback(() => {
		clearFiles()
		setUploadProgress({})
		onChange([])
	}, [clearFiles, onChange])

	// Memoize upload availability
	const canUpload = useMemo(() => files.length < maxFiles, [files.length, maxFiles])
	const showReorderInstructions = useMemo(() => files.length > 1, [files.length])

	return (
		<div className="space-y-3">
			{/* Drop area */}
			<div
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
				data-dragging={isDragging || undefined}
				className="bg-background border-input data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 relative flex min-h-32 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed p-4 transition-colors has-[input:focus]:ring-[3px]"
			>
				<input {...getInputProps()} className="sr-only" aria-label="Upload image file" />
				<div className="flex flex-col items-center justify-center text-center">
					<div className="mb-2 flex size-10 shrink-0 items-center justify-center rounded-full border" aria-hidden="true">
						<ImageIcon className="size-4 opacity-60" />
					</div>
					<p className="mb-1 text-sm font-medium">Drop your images here</p>
					<p className="text-muted-foreground text-xs mb-3">
						PNG or JPG (max. {maxSizeMB}MB each, up to {maxFiles} images)
					</p>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="bg-transparent"
						onClick={openFileDialog}
						disabled={!canUpload}
					>
						<UploadIcon className="size-3 mr-1" />
						Select images {!canUpload && `(${files.length}/${maxFiles})`}
					</Button>
				</div>
			</div>

			{/* Error messages */}
			{hasError && errorMessage && (
				<div className="text-destructive flex items-start gap-2 text-sm p-3 bg-destructive/10 rounded-md border border-destructive/20" role="alert">
					<AlertCircleIcon className="size-4 shrink-0 mt-0.5" />
					<div className="space-y-1">
						<div className="font-medium">Image Upload Error:</div>
						<div className="text-xs">{errorMessage}</div>
						{safeValue.length > 0 && (
							<div className="text-xs text-muted-foreground mt-2">
								Current images: {safeValue.length} uploaded
							</div>
						)}
					</div>
				</div>
			)}

			{uploadErrors.length > 0 && (
				<div className="text-destructive flex items-center gap-2 text-sm p-2 bg-destructive/10 rounded-md" role="alert">
					<AlertCircleIcon className="size-4 shrink-0" />
					<span><strong>Upload Error:</strong> {uploadErrors[0]}</span>
				</div>
			)}

			{/* Reorder instructions */}
			{showReorderInstructions && (
				<div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
					<InfoIcon className="size-3 shrink-0 text-blue-600 dark:text-blue-400" />
					<span>Drag images to reorder. The first image is automatically the main image.</span>
				</div>
			)}

			{/* File list */}
			{files.length > 0 && (
				<div className="space-y-2">
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="images">
							{(provided) => (
								<div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
									{files.map((file, index) => {
										const progress = uploadProgress[file.id]
										const isUploading = progress !== undefined && progress < 100
										const imageData = safeValue[index]
										const isMainImage = imageData?.isMain || index === 0

										return (
											<Draggable key={file.id} draggableId={file.id} index={index}>
												{(provided, snapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														className={cn(
															"bg-background rounded-md border transition-all duration-200 p-2",
															snapshot.isDragging ? "shadow-lg ring-2 ring-primary/20 scale-[1.01]" : "hover:shadow-sm",
														)}
													>
														<div className="flex items-center gap-2">
															{/* Drag handle */}
															<div
																{...provided.dragHandleProps}
																className="cursor-grab active:cursor-grabbing p-1 hover:bg-accent rounded transition-colors"
																title="Drag to reorder"
															>
																<GripVerticalIcon className="size-3 text-muted-foreground" />
															</div>

															{/* Image preview */}
															<div className="relative shrink-0">
																<img
																	src={file.preview || "/placeholder.svg"}
																	alt={`Car Image ${index + 1}`}
																	className="size-12 rounded object-cover border"
																/>
																{isUploading && (
																	<div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
																		<Loader2 className="size-4 text-white animate-spin" />
																	</div>
																)}
																<Badge
																	variant="secondary"
																	className="absolute -top-1 -left-1 size-4 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold"
																>
																	{index + 1}
																</Badge>
																{isMainImage && (
																	<div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
																		<StarIcon className="size-2 text-white fill-current" />
																	</div>
																)}
															</div>

															{/* File info and controls */}
															<div className="flex-1 min-w-0 space-y-2">
																<div className="flex items-center justify-between">
																	<div>
																		<p className="text-xs font-medium truncate">
																			{file.file instanceof File ? file.file.name : file.file.name}
																		</p>
																		<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
																			<span>
																				{formatBytes(file.file instanceof File ? file.file.size : file.file.size)}
																			</span>
																		</div>
																	</div>

																	<Button
																		type="button"
																		size="icon"
																		variant="ghost"
																		className="text-muted-foreground/80 hover:text-destructive hover:bg-destructive/10 size-6 shrink-0"
																		onClick={() => handleRemoveImage(index)}
																		aria-label="Remove file"
																		disabled={isUploading}
																	>
																		<XIcon className="size-3" />
																	</Button>
																</div>

																{isUploading ? (
																	<Progress value={progress} className="h-1" />
																) : (
																	<div className="flex items-center gap-2">
																		<div className="flex items-center space-x-1">
																			<Label
																				htmlFor={`main-image-${index}`}
																				className={cn(
																					"text-[10px] whitespace-nowrap",
																					index === 0 && "text-muted-foreground"
																				)}
																			>
																				{isMainImage && (
																					<>
																						<span className="text-yellow-600 dark:text-yellow-400 font-medium">
																							Main Image
																						</span>
																					</>
																				)}
																			</Label>
																		</div>
																	</div>
																)}
															</div>
														</div>
													</div>
												)}
											</Draggable>
										)
									})}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>

					{/* Clear all button */}
					{files.length > 1 && (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={handleClearAll}
							className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
						>
							Remove all files
						</Button>
					)}
				</div>
			)}
		</div>
	)
}
