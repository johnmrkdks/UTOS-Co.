import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import type { CarImage } from "server/types"

type CarImageViewerProps = {
	images: CarImage[]
	carName: string
}

export function CarImageViewer({ images, carName }: CarImageViewerProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0)
	const [isFullscreen, setIsFullscreen] = useState(false)

	// Sort images by order, with main image first
	const sortedImages = [...images].sort((a, b) => {
		if (a.isMain) return -1
		if (b.isMain) return 1
		return a.order - b.order
	})

	const currentImage = sortedImages[currentImageIndex]
	const hasMultipleImages = sortedImages.length > 1

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length)
	}

	const prevImage = () => {
		setCurrentImageIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length)
	}

	if (sortedImages.length === 0) {
		return (
			<div className="w-full">
				{/* Main Image Area */}
				<div className="aspect-video bg-muted rounded-2xl flex items-center justify-center border-2 border-border">
					<div className="text-center text-muted-foreground">
						<div className="text-4xl mb-2">🚗</div>
						<p className="text-sm">No images available</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="w-full space-y-4">
				{/* Main Image Display */}
				<div className="relative group">
					<div className="aspect-video bg-muted rounded-2xl overflow-hidden border-2 border-border relative">
						<img
							src={currentImage?.url || "/placeholder.svg?height=400&width=600&query=luxury car"}
							alt={currentImage?.altText || `${carName} - Image ${currentImageIndex + 1}`}
							className="object-cover w-full h-full"
						/>

						{/* Navigation Arrows - Only show on hover and if multiple images */}
						{hasMultipleImages && (
							<>
								<Button
									variant="secondary"
									size="icon"
									className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
									onClick={prevImage}
								>
									<ChevronLeft className="w-5 h-5" />
								</Button>
								<Button
									variant="secondary"
									size="icon"
									className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
									onClick={nextImage}
								>
									<ChevronRight className="w-5 h-5" />
								</Button>
							</>
						)}

						{/* Fullscreen Button */}
						<Button
							variant="secondary"
							size="icon"
							className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
							onClick={() => setIsFullscreen(true)}
						>
							<Maximize2 className="w-4 h-4" />
						</Button>

						{/* Image Counter */}
						{hasMultipleImages && (
							<div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
								{currentImageIndex + 1} / {sortedImages.length}
							</div>
						)}

						{/* Main Image Indicator */}
						{currentImage?.isMain && (
							<div className="absolute top-4 left-4 bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium">
								Main Photo
							</div>
						)}
					</div>
				</div>

				{/* Thumbnail Navigation - Clean and Simple */}
				{hasMultipleImages && (
					<div className="flex gap-3 justify-center overflow-x-auto pb-2">
						{sortedImages.map((image, index) => (
							<button
								key={image.id}
								onClick={() => setCurrentImageIndex(index)}
								className={cn(
									"relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200",
									"hover:scale-105 hover:shadow-md",
									index === currentImageIndex
										? "border-primary ring-2 ring-primary/30 shadow-md"
										: "border-border hover:border-primary/50",
								)}
							>
								<img
									src={image.url || "/placeholder.svg"}
									alt={image.altText || `${carName} thumbnail ${index + 1}`}
									className="object-cover w-full h-full"
								/>

								{/* Active indicator */}
								{index === currentImageIndex && <div className="absolute inset-0 bg-primary/10" />}

								{/* Main image dot indicator */}
								{image.isMain && (
									<div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border border-white shadow-sm" />
								)}

								{/* Image number overlay */}
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent">
									<div className="text-white text-xs font-medium p-1 text-center">{index + 1}</div>
								</div>
							</button>
						))}
					</div>
				)}

				{/* Image Navigation Dots (Alternative for mobile) */}
				{hasMultipleImages && sortedImages.length <= 5 && (
					<div className="flex justify-center gap-2 md:hidden">
						{sortedImages.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentImageIndex(index)}
								className={cn(
									"w-2 h-2 rounded-full transition-all duration-200",
									index === currentImageIndex
										? "bg-primary scale-125"
										: "bg-muted-foreground/30 hover:bg-muted-foreground/50",
								)}
							/>
						))}
					</div>
				)}
			</div>

			{/* Enhanced Fullscreen Dialog */}
			<Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
				<DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
					<div className="relative w-full h-full flex items-center justify-center">
						{/* Close Button */}
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
							onClick={() => setIsFullscreen(false)}
						>
							<X className="w-5 h-5" />
						</Button>

						{/* Main Fullscreen Image */}
						<img
							src={currentImage?.url || "/placeholder.svg"}
							alt={currentImage?.altText || `${carName} - Fullscreen`}
							className="object-contain w-full h-full max-h-[90vh] max-w-[90vw]"
						/>

						{/* Fullscreen Navigation */}
						{hasMultipleImages && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 shadow-lg"
									onClick={prevImage}
								>
									<ChevronLeft className="w-6 h-6" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 shadow-lg"
									onClick={nextImage}
								>
									<ChevronRight className="w-6 h-6" />
								</Button>
							</>
						)}

						{/* Fullscreen Info Bar */}
						<div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-sm">
							<div className="flex items-center gap-4 text-sm">
								<span>
									{currentImageIndex + 1} / {sortedImages.length}
								</span>
								{currentImage?.isMain && (
									<>
										<span>•</span>
										<span className="text-blue-400">Main Photo</span>
									</>
								)}
							</div>
						</div>

						{/* Fullscreen Thumbnail Strip */}
						{hasMultipleImages && (
							<div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 bg-black/60 p-2 rounded-lg backdrop-blur-sm">
								{sortedImages.map((image, index) => (
									<button
										key={image.id}
										onClick={() => setCurrentImageIndex(index)}
										className={cn(
											"w-12 h-8 rounded overflow-hidden border transition-all",
											index === currentImageIndex
												? "border-white ring-1 ring-white/50"
												: "border-white/30 hover:border-white/60",
										)}
									>
										<img
											src={image.url || "/placeholder.svg"}
											alt={`Thumbnail ${index + 1}`}
											className="object-cover w-full h-full"
										/>
									</button>
								))}
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}

