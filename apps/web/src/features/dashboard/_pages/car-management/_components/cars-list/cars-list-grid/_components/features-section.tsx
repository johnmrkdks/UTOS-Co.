import { Badge } from "@workspace/ui/components/badge";
import { Star } from "lucide-react";
import { memo } from "react";
import type { Car as CarType } from "server/types";
import { useGetCarFeaturesQuery } from "../../../../_hooks/query/car-feature/use-get-car-features-query";

interface FeaturesSectionProps {
	car: CarType;
}

export const FeaturesSection = memo<FeaturesSectionProps>(({ car }) => {
	const { data: features, isLoading } = useGetCarFeaturesQuery({});

	if (!car.features || car.features.length === 0) {
		return null;
	}

	return (
		<div>
			<h3 className="mb-3 flex items-center gap-2 font-semibold">
				<Star className="h-5 w-5" />
				Features & Equipment
			</h3>
			<div className="grid grid-cols-2 gap-2 md:grid-cols-3">
				{features?.data?.map((carFeature) => {
					const feature = car.features?.find((cf) => cf.id === carFeature.id);
					return (
						<Badge
							key={carFeature.id}
							variant="outline"
							className="justify-start"
						>
							{feature?.name}
						</Badge>
					);
				})}
			</div>
			{car.features.some((cf) => cf.description) && (
				<div className="mt-4 space-y-2">
					<h4 className="font-medium text-sm">Feature Details:</h4>
					{car.features
						.filter((cf) => cf.description)
						.map((carFeature) => (
							<div key={carFeature.id} className="text-sm">
								<span className="font-medium">{carFeature.name}:</span>{" "}
								<span className="text-muted-foreground">
									{carFeature.description}
								</span>
							</div>
						))}
				</div>
			)}
		</div>
	);
});

FeaturesSection.displayName = "FeaturesSection";
