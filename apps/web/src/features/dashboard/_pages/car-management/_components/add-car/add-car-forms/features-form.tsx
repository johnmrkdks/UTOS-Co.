import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import { SearchIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";
import { useGetCarFeaturesQuery } from "@/features/dashboard/_pages/car-management/_hooks/query/car-feature/use-get-car-features-query";
import { useDebounce } from "@/hooks/use-debounce";
import { AddFeatureDialog } from "../../car-features/features/add-feature-dialog";
import type { AddCarFormValues } from "../add-car-form";

// Types
type FeaturesFormProps = {
	control: Control<AddCarFormValues>;
	className?: string;
};

type Feature = { id: string; name: string };

// Sub-component for individual feature checkboxes
const FeatureItem = memo(
	({
		control,
		feature,
	}: {
		control: Control<AddCarFormValues>;
		feature: Feature;
	}) => {
		const { field } = useController({
			control,
			name: "features",
		});

		const isChecked = useMemo(
			() => field.value?.includes(feature.id) ?? false,
			[field.value, feature.id],
		);

		const onCheckedChange = useCallback(() => {
			const currentValues = field.value ?? [];
			const newValues = isChecked
				? currentValues.filter((id) => id !== feature.id)
				: [...currentValues, feature.id];
			field.onChange(newValues);
		}, [field, isChecked, feature.id]);

		return (
			<FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md p-1.5 hover:bg-muted/50">
				<FormControl>
					<Checkbox checked={isChecked} onCheckedChange={onCheckedChange} />
				</FormControl>
				<FormLabel className="flex-1 cursor-pointer font-normal text-xs leading-tight">
					{feature.name}
				</FormLabel>
			</FormItem>
		);
	},
);
FeatureItem.displayName = "FeatureItem";

// Main component
export const FeaturesForm = memo<FeaturesFormProps>(
	({ control, className, ...props }) => {
		const [searchTerm, setSearchTerm] = useState("");
		const debouncedSearchTerm = useDebounce(searchTerm, 300);
		const { data: featuresResponse, isLoading } = useGetCarFeaturesQuery({});
		const allFeatures = useMemo(
			() => featuresResponse?.data ?? [],
			[featuresResponse],
		);

		const filteredFeatures = useMemo(
			() =>
				debouncedSearchTerm
					? allFeatures.filter((feature) =>
							feature.name
								.toLowerCase()
								.includes(debouncedSearchTerm.toLowerCase()),
						)
					: allFeatures,
			[allFeatures, debouncedSearchTerm],
		);

		return (
			<Card className={cn("shadow-none", className)} {...props}>
				<CardHeader>
					<div className="flex w-full flex-row items-center justify-between">
						<CardTitle className="text-lg">Car Features</CardTitle>
						<AddFeatureDialog />
					</div>
					<CardDescription>
						Select the features available in this car. You can search and select
						multiple features.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="relative">
						<SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search features..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="h-9 bg-background pl-9"
							disabled={isLoading}
						/>
					</div>

					<FormField
						control={control}
						name="features"
						render={({ field }) => (
							<>
								<div className="flex items-center justify-between pt-1.5 text-sm">
									<span className="text-muted-foreground text-xs">
										{field.value?.length ?? 0} of {allFeatures.length} selected
									</span>
									<div className="flex items-center space-x-2">
										{filteredFeatures.length > 0 && (
											<Button
												type="button"
												variant="link"
												size="sm"
												onClick={() => {
													const currentSelected = new Set(field.value ?? []);
													filteredFeatures.forEach((f) =>
														currentSelected.add(f.id),
													);
													field.onChange(Array.from(currentSelected));
												}}
												className="h-auto p-0 text-xs"
											>
												Select all visible
											</Button>
										)}
										{(field.value?.length ?? 0) > 0 && (
											<Button
												type="button"
												variant="link"
												size="sm"
												onClick={() => field.onChange([])}
												className="h-auto p-0 text-destructive text-xs hover:text-destructive"
											>
												Clear selection
											</Button>
										)}
									</div>
								</div>

								<FormItem>
									<ScrollArea className="h-[400px] w-full rounded-md border bg-background p-2">
										<div className="grid grid-cols-2 gap-x-4 gap-y-2">
											{filteredFeatures.map((feature) => (
												<FeatureItem
													key={feature.id}
													control={control}
													feature={feature}
												/>
											))}
										</div>
										{isLoading && (
											<p className="py-8 text-center text-muted-foreground text-sm">
												Loading features...
											</p>
										)}
										{!isLoading && filteredFeatures.length === 0 && (
											<div className="py-8 text-center text-muted-foreground">
												<p className="font-semibold text-sm">
													No features found
												</p>
												<p className="text-xs">
													{searchTerm
														? `No features match your search for "${searchTerm}".`
														: "There are no features available to select."}
												</p>
											</div>
										)}
									</ScrollArea>
									<FormMessage />
								</FormItem>
							</>
						)}
					/>
				</CardContent>
			</Card>
		);
	},
);
FeaturesForm.displayName = "FeaturesForm";
