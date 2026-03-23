import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useState } from "react";
import type { CarImage } from "server/types";

type CarImageViewerProps = {
	images: CarImage[];
	carName: string;
};

export function CarImageViewer({ images, carName }: CarImageViewerProps) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);

	// Sort images by order, with main image first
	const sortedImages = [...images].sort((a, b) => {
		if (a.isMain) return -1;
		if (b.isMain) return 1;
		return a.order - b.order;
	});

	const currentImage = sortedImages[currentImageIndex];
	const hasMultipleImages = sortedImages.length > 1;

	const nextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % sortedImages.length);
	};

	const prevImage = () => {
		setCurrentImageIndex(
			(prev) => (prev - 1 + sortedImages.length) % sortedImages.length,
		);
	};

	if (sortedImages.length === 0) {
		return (
			<div className="w-full">
				{/* Main Image Area */}
				<div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-border bg-muted">
					<div className="text-center text-muted-foreground">
						<div className="mb-2 text-4xl">🚗</div>
						<p className="text-sm">No images available</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="w-full space-y-4">
				{/* Main Image Display */}
				<div className="group relative">
					<div className="relative aspect-video overflow-hidden rounded-2xl border-2 border-border bg-muted">
						<img
							src={
								currentImage?.url ||
								"/placeholder.svg?height=400&width=600&query=luxury car"
							}
							alt={
								currentImage?.altText ||
								`${carName} - Image ${currentImageIndex + 1}`
							}
							className="h-full w-full object-cover"
						/>

						{/* Navigation Arrows - Only show on hover and if multiple images */}
						{hasMultipleImages && (
							<>
								<Button
									variant="secondary"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 left-4 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100"
									onClick={prevImage}
								>
									<ChevronLeft className="h-5 w-5" />
								</Button>
								<Button
									variant="secondary"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 right-4 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100"
									onClick={nextImage}
								>
									<ChevronRight className="h-5 w-5" />
								</Button>
							</>
						)}

						{/* Fullscreen Button */}
						<Button
							variant="secondary"
							size="icon"
							className="absolute top-4 right-4 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100"
							onClick={() => setIsFullscreen(true)}
						>
							<Maximize2 className="h-4 w-4" />
						</Button>

						{/* Image Counter */}
						{hasMultipleImages && (
							<div className="absolute right-4 bottom-4 rounded-full bg-black/80 px-3 py-1 text-sm text-white backdrop-blur-sm">
								{currentImageIndex + 1} / {sortedImages.length}
							</div>
						)}

						{/* Main Image Indicator */}
						{currentImage?.isMain && (
							<div className="absolute top-4 left-4 rounded-full bg-blue-600 px-3 py-1 font-medium text-white text-xs">
								Main Photo
							</div>
						)}
					</div>
				</div>

				{/* Thumbnail Navigation - Clean and Simple */}
				{hasMultipleImages && (
					<div className="flex justify-center gap-3 overflow-x-auto pb-2">
						{sortedImages.map((image, index) => (
							<button
								key={image.id}
								onClick={() => setCurrentImageIndex(index)}
								className={cn(
									"relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
									"hover:scale-105 hover:shadow-md",
									index === currentImageIndex
										? "border-primary shadow-md ring-2 ring-primary/30"
										: "border-border hover:border-primary/50",
								)}
							>
								<img
									src={image.url || "/placeholder.svg"}
									alt={image.altText || `${carName} thumbnail ${index + 1}`}
									className="h-full w-full object-cover"
								/>

								{/* Active indicator */}
								{index === currentImageIndex && (
									<div className="absolute inset-0 bg-primary/10" />
								)}

								{/* Main image dot indicator */}
								{image.isMain && (
									<div className="absolute top-1 right-1 h-2 w-2 rounded-full border border-white bg-blue-600 shadow-sm" />
								)}

								{/* Image number overlay */}
								<div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent">
									<div className="p-1 text-center font-medium text-white text-xs">
										{index + 1}
									</div>
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
									"h-2 w-2 rounded-full transition-all duration-200",
									index === currentImageIndex
										? "scale-125 bg-primary"
										: "bg-muted-foreground/30 hover:bg-muted-foreground/50",
								)}
							/>
						))}
					</div>
				)}
			</div>

			{/* Enhanced Fullscreen Dialog */}
			<Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
				<DialogContent className="max-h-[95vh] max-w-[95vw] border-0 bg-black/95 p-0">
					<div className="relative flex h-full w-full items-center justify-center">
						{/* Close Button */}
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
							onClick={() => setIsFullscreen(false)}
						>
							<X className="h-5 w-5" />
						</Button>

						{/* Main Fullscreen Image */}
						<img
							src={currentImage?.url || "/placeholder.svg"}
							alt={currentImage?.altText || `${carName} - Fullscreen`}
							className="h-full max-h-[90vh] w-full max-w-[90vw] object-contain"
						/>

						{/* Fullscreen Navigation */}
						{hasMultipleImages && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 left-4 text-white shadow-lg hover:bg-white/20"
									onClick={prevImage}
								>
									<ChevronLeft className="h-6 w-6" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="-translate-y-1/2 absolute top-1/2 right-4 text-white shadow-lg hover:bg-white/20"
									onClick={nextImage}
								>
									<ChevronRight className="h-6 w-6" />
								</Button>
							</>
						)}

						{/* Fullscreen Info Bar */}
						<div className="-translate-x-1/2 absolute bottom-4 left-1/2 rounded-full bg-black/80 px-4 py-2 text-white backdrop-blur-sm">
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
							<div className="-translate-x-1/2 absolute bottom-20 left-1/2 flex gap-2 rounded-lg bg-black/60 p-2 backdrop-blur-sm">
								{sortedImages.map((image, index) => (
									<button
										key={image.id}
										onClick={() => setCurrentImageIndex(index)}
										className={cn(
											"h-8 w-12 overflow-hidden rounded border transition-all",
											index === currentImageIndex
												? "border-white ring-1 ring-white/50"
												: "border-white/30 hover:border-white/60",
										)}
									>
										<img
											src={image.url || "/placeholder.svg"}
											alt={`Thumbnail ${index + 1}`}
											className="h-full w-full object-cover"
										/>
									</button>
								))}
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
