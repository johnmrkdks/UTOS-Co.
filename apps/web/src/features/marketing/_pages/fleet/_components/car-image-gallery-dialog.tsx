import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import placeHolder from "@/assets/placeholder.svg";

type CarImageGalleryDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	images: { url: string; altText?: string | null }[];
	carName: string;
};

export function CarImageGalleryDialog({
	open,
	onOpenChange,
	images,
	carName,
}: CarImageGalleryDialogProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const displayImages =
		images?.length > 0 ? images : [{ url: placeHolder, altText: carName }];
	const currentImage = displayImages[currentIndex];

	const goNext = () => {
		setCurrentIndex((i) => (i + 1) % displayImages.length);
	};

	const goPrev = () => {
		setCurrentIndex(
			(i) => (i - 1 + displayImages.length) % displayImages.length,
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
				<DialogHeader className="p-4 pb-0">
					<DialogTitle className="text-lg">
						{carName} — Image {currentIndex + 1} of {displayImages.length}
					</DialogTitle>
				</DialogHeader>
				<div className="relative flex min-h-[400px] items-center justify-center bg-black/5 p-4">
					{displayImages.length > 1 && (
						<Button
							variant="secondary"
							size="icon"
							className="-translate-y-1/2 absolute top-1/2 left-4 z-10 h-10 w-10 rounded-full"
							onClick={goPrev}
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
					)}
					<img
						src={currentImage.url}
						alt={currentImage.altText || `${carName} image ${currentIndex + 1}`}
						className="max-h-[60vh] w-auto rounded-lg object-contain"
						onError={(e) => {
							e.currentTarget.src = placeHolder;
						}}
					/>
					{displayImages.length > 1 && (
						<Button
							variant="secondary"
							size="icon"
							className="-translate-y-1/2 absolute top-1/2 right-4 z-10 h-10 w-10 rounded-full"
							onClick={goNext}
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					)}
				</div>
				{displayImages.length > 1 && (
					<div className="flex justify-center gap-2 overflow-x-auto p-4">
						{displayImages.map((img, i) => (
							<button
								key={i}
								type="button"
								onClick={() => setCurrentIndex(i)}
								className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
									i === currentIndex
										? "border-primary"
										: "border-transparent hover:border-muted-foreground/30"
								}`}
							>
								<img
									src={img.url}
									alt=""
									className="h-full w-full object-cover"
									onError={(e) => {
										e.currentTarget.src = placeHolder;
									}}
								/>
							</button>
						))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
