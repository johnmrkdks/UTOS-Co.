import type { Control } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import type { AddCarFormValues } from "../add-car-form"
import { formatBytes, useFileUpload } from "@/hooks/use-file-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircleIcon, ImageIcon, UploadIcon, XIcon, StarIcon, InfoIcon } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVerticalIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { z } from "zod/v3"
import type { CarImageSchema } from "../../../_schemas/car-schema"

type ImagesFormProps = {
	control: Control<AddCarFormValues>
	className?: string
}

type CarImage = z.infer<typeof CarImageSchema>

export function ImagesForm({ control, className, ...props }: ImagesFormProps) {
	const maxSizeMB = 5
	const maxSize = maxSizeMB * 1024 * 1024 // 5MB default
	const maxFiles = 6

	return (
		<Card className={cn("shadow-none", className)} {...props}>
			<CardHeader className="pb-4">
				<CardTitle className="text-lg">Car Images</CardTitle>
				<CardDescription className="text-sm">
					Upload up to {maxFiles} images of the car. The first image will be used as the main image.
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
									maxFiles={maxFiles}
									maxSize={maxSize}
									maxSizeMB={maxSizeMB}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	)
}

interface ImagesUploaderProps {
	value: CarImage[]
	onChange: (images: CarImage[]) => void
	maxFiles: number
	maxSize: number
	maxSizeMB: number
}

function ImagesUploader({ value, onChange, maxFiles, maxSize, maxSizeMB }: ImagesUploaderProps) {
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
		accept: "image/png,image/jpeg,image/jpg",
		maxSize,
		multiple: true,
		maxFiles,
		onFilesChange: (newFiles) => {
			const schemaImages = newFiles.map((fileWithPreview, index) => ({
				url: fileWithPreview.preview || "",
				altText: (fileWithPreview.file instanceof File ? fileWithPreview.file.name : fileWithPreview.file.name).replace(
					/\.[^/.]+$/,
					"",
				),
				order: index + 1,
				isMain: index === 0,
			}))
			onChange(schemaImages)
		},
	})

	const handleRemoveImage = (index: number) => {
		const fileToRemove = files[index]
		if (fileToRemove) {
			removeFile(fileToRemove.id)
		}
	}

	const handleSetMainImage = (index: number) => {
		const updatedImages = value.map((img, i) => ({
			...img,
			isMain: i === index,
		}))
		onChange(updatedImages)
	}

	const handleAltTextChange = (index: number, altText: string) => {
		const updatedImages = value.map((img, i) => (i === index ? { ...img, altText } : img))
		onChange(updatedImages)
	}

	const handleDragEnd = (result: any) => {
		if (!result.destination) return

		const sourceIndex = result.source.index
		const destinationIndex = result.destination.index

		if (sourceIndex === destinationIndex) return

		// Reorder files using the hook function
		reorderFiles(sourceIndex, destinationIndex)

		// Update form value with new order
		const reorderedImages = Array.from(value)
		const [removedImage] = reorderedImages.splice(sourceIndex, 1)
		reorderedImages.splice(destinationIndex, 0, removedImage)

		// Update order numbers
		const updatedImages = reorderedImages.map((img, index) => ({
			...img,
			order: index + 1,
		}))

		onChange(updatedImages)
	}

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
					<div
						className="mb-2 flex size-10 shrink-0 items-center justify-center rounded-full border"
						aria-hidden="true"
					>
						<ImageIcon className="size-4 opacity-60" />
					</div>
					<p className="mb-1 text-sm font-medium">Drop your images here</p>
					<p className="text-muted-foreground text-xs mb-3">
						PNG or JPG (max. {maxSizeMB}MB each, up to {maxFiles} images)
					</p>
					<Button type="button" variant="outline" size="sm" className="bg-transparent" onClick={openFileDialog}>
						<UploadIcon className="size-3 mr-1" />
						Select images
					</Button>
				</div>
			</div>

			{/* Display upload errors */}
			{uploadErrors.length > 0 && (
				<div className="text-destructive flex items-center gap-2 text-sm p-2 bg-destructive/10 rounded-md" role="alert">
					<AlertCircleIcon className="size-4 shrink-0" />
					<span>{uploadErrors[0]}</span>
				</div>
			)}

			{/* Drag and drop instructions */}
			{files.length > 1 && (
				<div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
					<InfoIcon className="size-3 shrink-0 text-blue-600 dark:text-blue-400" />
					<span>Drag and drop images using the grip handle to reorder them</span>
				</div>
			)}

			{/* File list with drag-and-drop reordering */}
			{files.length > 0 && (
				<div className="space-y-2">
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="images">
							{(provided) => (
								<div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
									{files.map((file, index) => (
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
																alt={file.file instanceof File ? file.file.name : file.file.name}
																className="size-12 rounded object-cover border"
															/>
															{/* Order badge */}
															<Badge
																variant="secondary"
																className="absolute -top-1 -left-1 size-4 rounded-full p-0 flex items-center justify-center text-[10px] font-semibold"
															>
																{index + 1}
															</Badge>
															{/* Main image indicator */}
															{value[index]?.isMain && (
																<div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
																	<StarIcon className="size-2 text-white fill-current" />
																</div>
															)}
														</div>

														{/* File info and controls */}
														<div className="flex-1 min-w-0 space-y-2">
															{/* File name and size */}
															<div className="flex items-center justify-between">
																<div>
																	<p className="text-xs font-medium truncate">
																		{file.file instanceof File ? file.file.name : file.file.name}
																	</p>
																	<div className="flex items-center gap-1 text-[10px] text-muted-foreground">
																		<span>
																			{formatBytes(file.file instanceof File ? file.file.size : file.file.size)}
																		</span>
																		{value[index]?.isMain && (
																			<>
																				<span>•</span>
																				<span className="text-yellow-600 dark:text-yellow-400 font-medium">
																					Main Image
																				</span>
																			</>
																		)}
																	</div>
																</div>

																<div className="flex items-start">
																	{/* Remove button */}
																	<Button
																		type="button"
																		size="icon"
																		variant="ghost"
																		className="text-muted-foreground/80 hover:text-destructive hover:bg-destructive/10 size-6 shrink-0"
																		onClick={() => handleRemoveImage(index)}
																		aria-label="Remove file"
																	>
																		<XIcon className="size-3" />
																	</Button>
																</div>
															</div>

															{/* Controls row */}
															<div className="flex items-center gap-2">
																{/* Alt text input - inline and compact */}
																<div className="flex-1">
																	<Input
																		placeholder="Alt text..."
																		value={value[index]?.altText || ""}
																		onChange={(e) => handleAltTextChange(index, e.target.value)}
																		className="h-8 text-xs"
																	/>
																</div>

																{/* Main image checkbox */}
																<div className="flex items-center space-x-1">
																	<Checkbox
																		id={`main-image-${index}`}
																		checked={value[index]?.isMain || false}
																		onCheckedChange={() => handleSetMainImage(index)}
																		className="size-3.5"
																	/>
																	<Label htmlFor={`main-image-${index}`} className="text-[10px] whitespace-nowrap">
																		Main
																	</Label>
																</div>
															</div>
														</div>

													</div>
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>

					{/* Remove all files button */}
					{files.length > 1 && (
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={() => {
								clearFiles()
								onChange([])
							}}
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

