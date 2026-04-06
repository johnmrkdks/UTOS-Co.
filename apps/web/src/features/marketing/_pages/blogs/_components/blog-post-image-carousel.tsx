import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type BlogPostImageCarouselProps = {
	imageUrls: string[];
	className?: string;
	/** Shown when imageUrls is empty */
	fallbackUrl?: string | null;
};

const SWIPE_MIN_PX = 48;

export function BlogPostImageCarousel({
	imageUrls,
	className,
	fallbackUrl,
}: BlogPostImageCarouselProps) {
	const urls =
		imageUrls.length > 0 ? imageUrls : fallbackUrl ? [fallbackUrl] : [];
	const [index, setIndex] = useState(0);
	const touchStartX = useRef<number | null>(null);

	const count = urls.length;
	const safeIndex = count > 0 ? ((index % count) + count) % count : 0;
	const currentUrl = urls[safeIndex];

	const goPrev = useCallback(() => {
		if (count < 2) return;
		setIndex((i) => (i - 1 + count) % count);
	}, [count]);

	const goNext = useCallback(() => {
		if (count < 2) return;
		setIndex((i) => (i + 1) % count);
	}, [count]);

	const onTouchStart = (e: React.TouchEvent) => {
		touchStartX.current = e.touches[0]?.clientX ?? null;
	};

	const onTouchEnd = (e: React.TouchEvent) => {
		if (touchStartX.current == null || count < 2) return;
		const endX = e.changedTouches[0]?.clientX;
		if (endX === undefined) return;
		const dx = endX - touchStartX.current;
		touchStartX.current = null;
		if (Math.abs(dx) < SWIPE_MIN_PX) return;
		if (dx < 0) goNext();
		else goPrev();
	};

	if (!currentUrl) {
		return (
			<div
				className={cn(
					"flex aspect-[4/3] w-full items-center justify-center bg-muted/40 text-muted-foreground text-xs",
					className,
				)}
			>
				No image
			</div>
		);
	}

	if (count <= 1) {
		return (
			<div
				className={cn(
					"relative aspect-[4/3] w-full overflow-hidden",
					className,
				)}
			>
				<img
					src={currentUrl}
					alt=""
					className="h-full w-full object-cover"
					loading="lazy"
				/>
			</div>
		);
	}

	return (
		<section
			className={cn(
				"relative aspect-[4/3] w-full overflow-hidden bg-muted/30",
				className,
			)}
			aria-label="Blog post images"
			aria-roledescription="carousel"
			onTouchStart={onTouchStart}
			onTouchEnd={onTouchEnd}
		>
			<img
				key={currentUrl}
				src={currentUrl}
				alt=""
				className="h-full w-full object-cover"
				loading={safeIndex === 0 ? "eager" : "lazy"}
			/>

			<div
				className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10"
				aria-hidden
			/>

			<div className="absolute inset-y-0 left-0 flex items-center px-1 sm:px-2">
				<Button
					type="button"
					variant="secondary"
					size="icon"
					className="pointer-events-auto h-9 w-9 shrink-0 rounded-full border border-border/60 bg-background/90 shadow-md backdrop-blur-sm hover:bg-background sm:h-10 sm:w-10"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						goPrev();
					}}
					aria-label="Previous image"
				>
					<ChevronLeft className="h-5 w-5" />
				</Button>
			</div>

			<div className="absolute inset-y-0 right-0 flex items-center px-1 sm:px-2">
				<Button
					type="button"
					variant="secondary"
					size="icon"
					className="pointer-events-auto h-9 w-9 shrink-0 rounded-full border border-border/60 bg-background/90 shadow-md backdrop-blur-sm hover:bg-background sm:h-10 sm:w-10"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						goNext();
					}}
					aria-label="Next image"
				>
					<ChevronRight className="h-5 w-5" />
				</Button>
			</div>

			<div className="pointer-events-none absolute right-0 bottom-2 left-0 flex justify-center gap-1.5 px-2 sm:bottom-3">
				{urls.map((url, i) => (
					<button
						key={`${i}-${url}`}
						type="button"
						className={cn(
							"pointer-events-auto h-2 w-2 rounded-full border border-white/40 transition-colors sm:h-2.5 sm:w-2.5",
							i === safeIndex ? "bg-white" : "bg-white/35 hover:bg-white/60",
						)}
						aria-label={`Image ${i + 1} of ${count}`}
						aria-current={i === safeIndex ? "true" : undefined}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setIndex(i);
						}}
					/>
				))}
			</div>
		</section>
	);
}
