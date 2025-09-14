import type React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { Check, X, ChevronRight, Trash2, Save } from "lucide-react";

interface SwipeToConfirmProps {
	onConfirm: () => void;
	onCancel?: () => void;
	confirmText: string;
	instruction: string;
	variant?: "primary" | "destructive";
	className?: string;
	disabled?: boolean;
}

export function SwipeToConfirm({
	onConfirm,
	onCancel,
	confirmText,
	instruction,
	variant = "primary",
	className,
	disabled = false,
}: SwipeToConfirmProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [dragPosition, setDragPosition] = useState(0);
	const [isConfirmed, setIsConfirmed] = useState(false);
	const [isCancelled, setIsCancelled] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const sliderRef = useRef<HTMLDivElement>(null);

	const threshold = 0.8; // 80% of the container width
	const cancelThreshold = -0.3; // 30% to the left for cancel

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent | TouchEvent) => {
			if (!isDragging || !containerRef.current || !sliderRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
			const newPosition = clientX - containerRect.left - 32; // Account for slider width/2
			const maxPosition = containerRect.width - 64; // Account for slider width

			const clampedPosition = Math.max(-100, Math.min(maxPosition, newPosition));
			setDragPosition(clampedPosition);
		};

		const handleMouseUp = () => {
			if (!isDragging || !containerRef.current) return;

			const containerWidth = containerRef.current.getBoundingClientRect().width - 64;
			const progress = dragPosition / containerWidth;

			if (progress >= threshold) {
				// Confirmed
				setIsConfirmed(true);
				setDragPosition(containerWidth);
				setTimeout(() => {
					onConfirm();
					resetSlider();
				}, 300);
			} else if (progress <= cancelThreshold && onCancel) {
				// Cancelled
				setIsCancelled(true);
				setDragPosition(-60);
				setTimeout(() => {
					onCancel();
					resetSlider();
				}, 300);
			} else {
				// Reset to start
				resetSlider();
			}

			setIsDragging(false);
		};

		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			document.addEventListener("touchmove", handleMouseMove);
			document.addEventListener("touchend", handleMouseUp);
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchmove", handleMouseMove);
			document.removeEventListener("touchend", handleMouseUp);
		};
	}, [isDragging, dragPosition, threshold, cancelThreshold, onConfirm, onCancel]);

	const resetSlider = () => {
		setTimeout(() => {
			setDragPosition(0);
			setIsConfirmed(false);
			setIsCancelled(false);
		}, 100);
	};

	const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
		if (disabled) return;
		e.preventDefault();
		setIsDragging(true);
	};

	const getBackgroundColor = () => {
		if (isConfirmed) return variant === "destructive" ? "bg-destructive" : "bg-primary";
		if (isCancelled) return "bg-muted";

		const containerWidth = (containerRef.current?.getBoundingClientRect().width || 64) - 64;
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
		if (isConfirmed) return <Check className="w-5 h-5 text-white" />;
		if (isCancelled) return <X className="w-5 h-5 text-muted-foreground" />;

		const containerWidth = (containerRef.current?.getBoundingClientRect().width || 64) - 64;
		const progress = Math.max(0, dragPosition / Math.max(containerWidth, 1));

		if (progress >= threshold) {
			return variant === "destructive" ? (
				<Trash2 className="w-5 h-5 text-destructive" />
			) : (
				<Save className="w-5 h-5 text-primary" />
			);
		}
		if (dragPosition <= cancelThreshold * containerWidth && onCancel) {
			return <X className="w-5 h-5 text-muted-foreground" />;
		}
		return <ChevronRight className="w-5 h-5 text-muted-foreground" />;
	};

	const getSliderColor = () => {
		if (isConfirmed) return variant === "destructive" ? "bg-destructive" : "bg-primary";
		if (isCancelled) return "bg-muted-foreground";

		const containerWidth = (containerRef.current?.getBoundingClientRect().width || 64) - 64;
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
					"relative h-16 rounded-xl border-2 overflow-hidden transition-all duration-300 ease-out shadow-sm",
					getBackgroundColor(),
					variant === "primary" ? "border-primary/30" : "border-destructive/30"
				)}
			>
				{/* Background text with better styling */}
				<div className={cn(
					"absolute inset-0 flex items-center justify-center transition-opacity duration-200",
					dragPosition > 10 ? "opacity-0" : "opacity-100"
				)}>
					<div className="flex items-center gap-2 text-sm font-medium text-gray-700 select-none bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200">
						{disabled ? (
							<>
								<div className="w-3 h-3 animate-spin border border-gray-400 border-t-transparent rounded-full"></div>
								Updating...
							</>
						) : (
							<>
								<ChevronRight className="w-4 h-4 text-gray-400" />
								{instruction}
							</>
						)}
					</div>
				</div>

				{/* Slider */}
				<div
					ref={sliderRef}
					className={cn(
						"absolute top-2 left-2 w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200 ease-out shadow-lg",
						disabled ? "cursor-not-allowed opacity-50" : "cursor-grab active:cursor-grabbing",
						getSliderColor(),
						isDragging && !disabled && "scale-110",
					)}
					style={{
						transform: `translateX(${dragPosition}px)`,
						transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
					}}
					onMouseDown={handleMouseDown}
					onTouchStart={handleMouseDown}
				>
					{getSliderIcon()}
				</div>

				{/* Action text overlay - only shows when dragging */}
				{(isConfirmed ||
					(dragPosition > 10 &&
						dragPosition / Math.max((containerRef.current?.getBoundingClientRect().width || 64) - 64, 1) >= threshold)) && (
					<div className="absolute inset-0 flex items-center justify-center">
						<span
							className={cn(
								"text-sm font-bold select-none bg-white px-3 py-1 rounded-full shadow-sm border",
								variant === "destructive" ? "text-red-700" : "text-primary",
							)}
						>
							{confirmText}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}