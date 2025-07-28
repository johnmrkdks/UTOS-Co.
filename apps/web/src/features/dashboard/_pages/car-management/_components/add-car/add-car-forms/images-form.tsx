import type React from "react"

import { type Control, useFieldArray } from "react-hook-form"
import { useState } from "react"
import { Upload, X, ImageIcon, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { AddCarFormValues } from "../add-car-form"

type ImagesFormProps = {
	control: Control<AddCarFormValues>
	className?: string
}

export function ImagesForm({ control, className, ...props }: ImagesFormProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: "images",
	})
	const [dragActive, setDragActive] = useState(false)

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true)
		} else if (e.type === "dragleave") {
			setDragActive(false)
		}
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setDragActive(false)

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFiles(e.dataTransfer.files)
		}
	}

	const handleFiles = (files: FileList) => {
		Array.from(files).forEach((file, index) => {
			if (file.type.startsWith("image/")) {
				// In a real implementation, you would upload to R2 here
				// For now, we'll create a placeholder URL
				const placeholderUrl = URL.createObjectURL(file)
				append({
					url: placeholderUrl,
					altText: file.name,
					order: fields.length + index,
					isMain: fields.length === 0 && index === 0, // First image is main by default
				})
			}
		})
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			handleFiles(e.target.files)
		}
	}

	return (
		<Card className={cn("shadow-none", className)} {...props}>
			<CardHeader>
				<CardTitle className="text-lg">Car Images</CardTitle>
				<CardDescription>Upload images of the car. The first image will be used as the main image.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Upload Area */}
				<div
					className={cn(
						"relative border-2 border-dashed rounded-lg p-6 transition-colors bg-background",
						dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
						"hover:border-primary hover:bg-primary/5",
					)}
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
				>
					<input
						type="file"
						multiple
						accept="image/*"
						onChange={handleFileInput}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					<div className="flex flex-col items-center justify-center text-center">
						<Upload className="h-10 w-10 text-muted-foreground mb-4" />
						<p className="text-sm font-medium">Drop images here or click to upload</p>
						<p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB each</p>
					</div>
				</div>

				{/* Image List */}
				{fields.length > 0 && (
					<div className="space-y-3">
						<h4 className="font-medium">Images ({fields.length})</h4>
						{fields.map((field, index) => (
							<div key={field.id} className="bg-background border rounded-lg p-3">
								<div className="flex items-start gap-3">
									{/* Image Preview */}
									<div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
										{field.url ? (
											<img
												src={field.url || "/placeholder.svg"}
												alt={field.altText || `Car image ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<ImageIcon className="h-6 w-6 text-muted-foreground" />
											</div>
										)}
									</div>

									{/* Image Details */}
									<div className="flex-1 space-y-2">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">Image {index + 1}</span>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => remove(index)}
												className="h-8 w-8 p-0"
											>
												<X className="h-4 w-4" />
											</Button>
										</div>

										<FormField
											control={control}
											name={`images.${index}.altText`}
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input placeholder="Image description (optional)" className="h-8 text-xs" {...field} />
													</FormControl>
												</FormItem>
											)}
										/>

										<div className="flex items-center justify-between">
											<FormField
												control={control}
												name={`images.${index}.order`}
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<div className="flex items-center gap-2">
																<span className="text-xs text-muted-foreground">Order:</span>
																<Input
																	type="number"
																	min="0"
																	className="h-8 w-16 text-xs"
																	{...field}
																	onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
																/>
															</div>
														</FormControl>
													</FormItem>
												)}
											/>

											<FormField
												control={control}
												name={`images.${index}.isMain`}
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<div className="flex items-center space-x-2">
																<Checkbox checked={field.value} onCheckedChange={field.onChange} />
																<span className="text-xs text-muted-foreground flex items-center gap-1">
																	<Star className="h-3 w-3" />
																	Main
																</span>
															</div>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{fields.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						<ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p className="text-sm">No images uploaded yet</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

