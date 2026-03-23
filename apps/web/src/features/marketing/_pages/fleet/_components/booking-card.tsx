import { Link } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import {
	ArrowRight,
	Briefcase,
	Car,
	Check,
	Crown,
	Fuel,
	Images,
	Settings,
	Users,
} from "lucide-react";
import { useState } from "react";
import placeHolder from "@/assets/placeholder.svg";
import { CarPriceDisplay } from "@/features/marketing/_pages/vehicle-selection/_components/car-price-display";
import { useUserQuery } from "@/hooks/query/use-user-query";
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
	category,
	description,
	features,
	image,
	images,
	popular,
	className,
	...props
}: BookingCardProps) {
	const { session } = useUserQuery();
	const [galleryOpen, setGalleryOpen] = useState(false);
	const hasImages = images && images.length > 0;
	const hasMultipleImages = hasImages && images!.length > 1;

	return (
		<>
			<Card
				className={cn(
					"relative overflow-hidden rounded-xl border border-gray-200 bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-md",
					className,
				)}
				{...props}
			>
				{/* Hero Image Section */}
				<div className="group relative aspect-[3/2] overflow-hidden rounded-t-xl bg-gray-50">
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
								? `Browse ${images!.length} Images`
								: "View Image"}
						</Button>
					)}

					{/* Category Badge */}
					<div className="absolute top-0 left-0 z-20">
						<Badge className="rounded-tl-xl rounded-br-md border-0 bg-gray-100 px-2 py-1 font-medium text-gray-700 text-xs">
							{category}
						</Badge>
					</div>
				</div>

				{/* Content Section */}
				<div className="p-4">
					{/* Title and Price Row */}
					<div className="mb-3 flex items-start justify-between">
						<div>
							<h3 className="mb-1 font-semibold text-gray-900 text-lg">
								{model}
							</h3>
							<p className="text-gray-600 text-sm">
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
									className="flex items-center gap-1 text-gray-600"
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
								className="rounded-md border-0 bg-gray-100 px-2 py-1 font-normal text-gray-700 text-xs"
							>
								{feature}
							</Badge>
						))}
						{features.length > 6 && (
							<Badge className="rounded-md border-0 bg-gray-100 px-2 py-1 font-normal text-gray-700 text-xs">
								+{features.length - 6} more
							</Badge>
						)}
					</div>

					{/* Description */}
					<p className="mb-4 line-clamp-2 text-gray-600 text-sm">
						{description}
					</p>

					{/* Button Section */}
					<div className="mt-4">
						<Link
							to="/calculate-quote"
							search={{ selectedCarId: id }}
							className="block"
						>
							<Button className="w-full rounded-lg bg-primary px-6 py-3 font-medium text-base text-primary-foreground hover:bg-primary/90">
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
