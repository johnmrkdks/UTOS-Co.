import { cn } from "@workspace/ui/lib/utils";
import { Check, ChevronRight, Save, Trash2, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface SwipeToConfirmProps {
	onConfirm: () => void;
	onCancel?: () => void;
	confirmText: string;
	instruction: string;
	variant?: "primary" | "destructive";
	className?: string;
	disabled?: boolean;
	minProcessingTime?: number;
}

export function SwipeToConfirm({
	onConfirm,
	onCancel,
	confirmText,
	instruction,
	variant = "primary",
	className,
	disabled = false,
	minProcessingTime = 1500,
}: SwipeToConfirmProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragPosition, setDragPosition] = useState(0);
	const [actionState, setActionState] = useState<
		"idle" | "confirming" | "cancelling" | "processing"
	>("idle");
	const [isProcessing, setIsProcessing] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const sliderRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number | undefined>(undefined);
	const onConfirmRef = useRef(onConfirm);
	const onCancelRef = useRef(onCancel);
	const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const threshold = 1.0; // 100% of the container width
	const cancelThreshold = -0.3; // 30% to the left for cancel

	useEffect(() => {
		onConfirmRef.current = onConfirm;
		onCancelRef.current = onCancel;
	}, [onConfirm, onCancel]);

	const resetSlider = useCallback(() => {
		setDragPosition(0);
		setActionState("idle");
		setIsDragging(false);
		setIsProcessing(false);
		// Clear any pending processing timeout
		if (processingTimeoutRef.current) {
			clearTimeout(processingTimeoutRef.current);
			processingTimeoutRef.current = null;
		}
	}, []);

	useEffect(() => {
		return () => {
			if (processingTimeoutRef.current) {
				clearTimeout(processingTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!isDragging) return;

		const handleMove = (e: MouseEvent | TouchEvent) => {
			if (!containerRef.current || disabled || isProcessing) return;

			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}

			animationFrameRef.current = requestAnimationFrame(() => {
				const containerRect = containerRef.current!.getBoundingClientRect();
				const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
				const newPosition = clientX - containerRect.left - 32; // Account for slider width/2
				const maxPosition = containerRect.width - 64; // Account for slider width

				const clampedPosition = Math.max(
					-100,
					Math.min(maxPosition, newPosition),
				);
				setDragPosition(clampedPosition);
			});
		};

		const handleEnd = () => {
			if (!containerRef.current || disabled || isProcessing) return;

			const containerWidth =
				containerRef.current.getBoundingClientRect().width - 64;
			const progress = dragPosition / containerWidth;

			if (progress >= threshold) {
				// Confirmed - show processing state
				setActionState("confirming");
				setIsProcessing(true);
				setDragPosition(containerWidth);
				setIsDragging(false);

				// Start processing with minimum time
				const startTime = Date.now();
				processingTimeoutRef.current = setTimeout(() => {
					const elapsedTime = Date.now() - startTime;
					const remainingTime = Math.max(0, minProcessingTime - elapsedTime);

					setTimeout(() => {
						onConfirmRef.current();
						resetSlider();
					}, remainingTime);
				}, 200);
			} else if (progress <= cancelThreshold && onCancelRef.current) {
				// Cancelled - show processing state
				setActionState("cancelling");
				setIsProcessing(true);
				setDragPosition(-60);
				setIsDragging(false);

				// Start processing with minimum time
				const startTime = Date.now();
				processingTimeoutRef.current = setTimeout(() => {
					const elapsedTime = Date.now() - startTime;
					const remainingTime = Math.max(0, minProcessingTime - elapsedTime);

					setTimeout(() => {
						onCancelRef.current?.();
						resetSlider();
					}, remainingTime);
				}, 200);
			} else {
				setIsDragging(false);
				// Use a small delay to ensure smooth transition back to 0
				setTimeout(() => {
					setDragPosition(0);
					setActionState("idle");
				}, 50);
			}
		};

		const handleMouseMove = (e: MouseEvent) => handleMove(e);
		const handleMouseUp = () => handleEnd();
		const handleTouchMove = (e: TouchEvent) => {
			e.preventDefault();
			handleMove(e);
		};
		const handleTouchEnd = () => handleEnd();

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("touchmove", handleTouchMove, { passive: false });
		document.addEventListener("touchend", handleTouchEnd);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
		};
	}, [
		isDragging,
		disabled,
		dragPosition,
		threshold,
		cancelThreshold,
		resetSlider,
		isProcessing,
		minProcessingTime,
	]);

	const handleStart = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			if (disabled || actionState !== "idle" || isProcessing) return;

			e.preventDefault();
			setIsDragging(true);
		},
		[disabled, actionState, isProcessing],
	);

	const getBackgroundColor = () => {
		if (actionState === "confirming")
			return variant === "destructive" ? "bg-destructive" : "bg-primary";
		if (actionState === "cancelling") return "bg-muted";

		const containerWidth =
			(containerRef.current?.getBoundingClientRect().width || 64) - 64;
		const progress = Math.max(0, dragPosition / Math.max(containerWidth, 1));

		if (progress >= threshold) {
			return variant === "destructive" ? "bg-destructive" : "bg-primary";
		}
		if (dragPosition <= cancelThreshold * containerWidth && onCancel) {
			return "bg-muted";
		}
		return "bg-card";
	};

	const getSliderIcon = () => {
		if (actionState === "confirming") {
			return isProcessing ? (
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
			) : (
				<Check className="h-5 w-5 text-white" />
			);
		}
		if (actionState === "cancelling") {
			return isProcessing ? (
				<div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
			) : (
				<X className="h-5 w-5 text-muted-foreground" />
			);
		}

		const containerWidth =
			(containerRef.current?.getBoundingClientRect().width || 64) - 64;
		const progress = Math.max(0, dragPosition / Math.max(containerWidth, 1));

		if (progress >= threshold) {
			return variant === "destructive" ? (
				<Trash2 className="h-5 w-5 text-destructive" />
			) : (
				<Save className="h-5 w-5 text-primary" />
			);
		}
		if (dragPosition <= cancelThreshold * containerWidth && onCancel) {
			return <X className="h-5 w-5 text-muted-foreground" />;
		}
		return <ChevronRight className="h-5 w-5 text-muted-foreground" />;
	};

	const getSliderColor = () => {
		if (actionState === "confirming")
			return variant === "destructive" ? "bg-destructive" : "bg-primary";
		if (actionState === "cancelling") return "bg-muted-foreground";

		const containerWidth =
			(containerRef.current?.getBoundingClientRect().width || 64) - 64;
		const progress = Math.max(0, dragPosition / Math.max(containerWidth, 1));

		if (progress >= threshold) {
			return variant === "destructive" ? "bg-destructive" : "bg-primary";
		}
		if (dragPosition <= cancelThreshold * containerWidth && onCancel) {
			return "bg-muted-foreground";
		}
		return "bg-background border-2 border-border";
	};

	return (
		<div className={cn("w-full", className)}>
			<div
				ref={containerRef}
				className={cn(
					"relative h-12 overflow-hidden rounded-xl border-2 shadow-sm transition-all duration-300 ease-out",
					getBackgroundColor(),
					variant === "primary" ? "border-primary/30" : "border-destructive/30",
				)}
			>
				{/* Background text with better styling */}
				<div
					className={cn(
						"absolute inset-0 flex items-center justify-center transition-opacity duration-200",
						dragPosition > 10 ? "opacity-0" : "opacity-100",
					)}
				>
					<div className="flex select-none flex-row items-center gap-2 font-medium text-gray-700 text-sm">
						{disabled || isProcessing ? (
							<>
								<div className="h-3 w-3 animate-spin rounded-full border border-gray-400 border-t-transparent" />
								{isProcessing ? "Processing..." : "Updating..."}
							</>
						) : (
							instruction
						)}
					</div>
				</div>

				{/* Slider */}
				<div
					ref={sliderRef}
					className={cn(
						"absolute top-0.5 left-0.5 flex h-10 w-10 items-center justify-center rounded-lg shadow-lg",
						disabled || isProcessing
							? "cursor-not-allowed opacity-50"
							: "cursor-grab active:cursor-grabbing",
						getSliderColor(),
						isDragging && !disabled && !isProcessing && "scale-110",
						"transition-all duration-200 ease-out",
					)}
					style={{
						transform: `translateX(${dragPosition}px)`,
						transition:
							isDragging && !isProcessing
								? "scale 0.2s ease-out"
								: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.2s ease-out",
					}}
					onMouseDown={handleStart}
					onTouchStart={handleStart}
				>
					{getSliderIcon()}
				</div>

				{/* Action text overlay - only shows when dragging */}
				{(actionState === "confirming" ||
					(dragPosition > 10 &&
						dragPosition /
							Math.max(
								(containerRef.current?.getBoundingClientRect().width || 64) -
									64,
								1,
							) >=
							threshold)) && (
					<div className="absolute inset-0 flex items-center justify-center">
						<span
							className={cn(
								"select-none rounded-full border bg-white px-3 py-1 font-bold text-sm shadow-sm",
								variant === "destructive" ? "text-red-700" : "text-primary",
							)}
						>
							{isProcessing ? "Processing..." : confirmText}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
