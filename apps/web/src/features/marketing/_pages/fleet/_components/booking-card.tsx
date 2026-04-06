import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { Briefcase, Car, Fuel, Images, Settings, Users } from "lucide-react";
import { useState } from "react";
import placeHolder from "@/assets/placeholder.svg";
import { Logo } from "@/components/logo";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import { CarImageGalleryDialog } from "./car-image-gallery-dialog";

export type BookingProps = {
	id: string; // Add carId for pricing lookup
	model: string;
	brand: string;
	category: string;
	description: string;
	features: string[];
	image?: string;
	images?: { url: string; altText?: string | null }[];
	popular?: boolean;
};

type BookingCardProps = BookingProps & {
	className?: string;
};

export function BookingCard({
	id,
	model,
	brand,
	category: _category,
	description,
	features,
	image,
	images,
	popular,
	className,
	...props
}: BookingCardProps) {
	const [galleryOpen, setGalleryOpen] = useState(false);
	const hasImages = images && images.length > 0;
	const hasMultipleImages = hasImages && (images?.length ?? 0) > 1;

	return (
		<>
			<Card
				className={cn(
					"relative overflow-hidden rounded-xl border border-border/60 bg-card p-0 shadow-none transition-colors hover:border-border",
					className,
				)}
				{...props}
			>
				{/* Hero Image Section */}
				<div className="group relative aspect-[3/2] overflow-hidden rounded-t-[0.65rem] bg-muted/40">
					<img
						src={image || placeHolder}
						alt={`${brand} ${model}`}
						className="h-full w-full rounded-t-xl object-cover"
					/>

					{/* Browse Images overlay - show when car has images */}
					{hasImages && (
						<Button
							variant="secondary"
							size="sm"
							className="absolute right-2 bottom-2 z-20 gap-1.5 opacity-90 hover:opacity-100"
							onClick={() => setGalleryOpen(true)}
						>
							<Images className="h-4 w-4" />
							{hasMultipleImages
								? `Browse ${images?.length ?? 0} Images`
								: "View Image"}
						</Button>
					)}

					{/* Company logo */}
					<div className="absolute top-2 left-2 z-20">
						<div
							className="flex h-11 w-11 items-center justify-center rounded-lg bg-background/90 p-1.5 shadow-sm backdrop-blur-sm"
							aria-hidden
						>
							<Logo className="h-full max-h-8 w-auto max-w-[52px] object-contain object-center" />
						</div>
					</div>
				</div>

				{/* Content Section */}
				<div className="p-4">
					{/* Title and Price Row */}
					<div className="mb-3 flex items-start justify-between">
						<div>
							<h3 className="mb-1 font-semibold text-foreground text-lg tracking-tight">
								{model}
							</h3>
							<p className="text-muted-foreground text-sm">
								{brand} {model}
							</p>
						</div>
						<div className="text-right">
							<CarPriceDisplay carId={id} variant="card" className="" />
						</div>
					</div>

					{/* Feature Icons Row */}
					<div className="mb-4 flex items-center gap-4">
						{features.slice(0, 3).map((feature, index) => {
							const getFeatureIcon = (feature: string) => {
								if (
									feature.toLowerCase().includes("passenger") ||
									feature.toLowerCase().includes("seat")
								)
									return { icon: Users, text: feature };
								if (
									feature.toLowerCase().includes("bag") ||
									feature.toLowerCase().includes("luggage")
								)
									return { icon: Briefcase, text: feature };
								if (
									feature.toLowerCase().includes("petrol") ||
									feature.toLowerCase().includes("fuel")
								)
									return { icon: Fuel, text: feature };
								if (
									feature.toLowerCase().includes("automatic") ||
									feature.toLowerCase().includes("transmission")
								)
									return { icon: Settings, text: feature };
								return { icon: Car, text: feature };
							};

							const { icon: IconComponent, text } = getFeatureIcon(feature);

							return (
								<div
									key={index}
									className="flex items-center gap-1 text-muted-foreground"
								>
									<IconComponent className="h-4 w-4" />
									<span className="text-xs">{text}</span>
								</div>
							);
						})}
					</div>

					{/* Feature Badges */}
					<div className="mb-4 flex flex-wrap gap-2">
						{features.slice(3, 6).map((feature, index) => (
							<Badge
								key={index}
								variant="secondary"
								className="rounded-md border-0 px-2 py-0.5 font-normal text-xs"
							>
								{feature}
							</Badge>
						))}
						{features.length > 6 && (
							<Badge
								variant="secondary"
								className="rounded-md border-0 px-2 py-0.5 font-normal text-xs"
							>
								+{features.length - 6} more
							</Badge>
						)}
					</div>

					{/* Description */}
					<p className="mb-4 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
						{description}
					</p>

					{/* Button Section */}
					<div className="mt-4">
						<Link
							to="/calculate-quote"
							search={{ selectedCarId: id }}
							className="block"
						>
							<Button className="h-10 w-full rounded-md font-medium">
								Book
							</Button>
						</Link>
					</div>
				</div>
			</Card>

			<CarImageGalleryDialog
				open={galleryOpen}
				onOpenChange={setGalleryOpen}
				images={
					images ||
					(image ? [{ url: image, altText: `${brand} ${model}` }] : [])
				}
				carName={`${brand} ${model}`}
			/>
		</>
	);
}
