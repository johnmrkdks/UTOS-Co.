import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Switch } from "@workspace/ui/components/switch";
import {
	AlertCircle,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	Globe,
	Package,
	Shield,
} from "lucide-react";
import { useUpdatePackageMutation } from "../../_hooks/query/use-update-package-mutation";

type ViewPackageDialogProps = {
	package: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ViewPackageDialog({
	package: pkg,
	open,
	onOpenChange,
}: ViewPackageDialogProps) {
	const updatePackageMutation = useUpdatePackageMutation();

	const handleToggleAvailable = async () => {
		if (!pkg?.id) return;

		try {
			await updatePackageMutation.mutateAsync({
				id: pkg.id,
				data: {
					name: pkg.name,
					description: pkg.description,
					pricePerDay: (pkg.fixedPrice || pkg.pricePerDay || 0) / 100,
					isAvailable: !pkg.isAvailable,
					isPublished: pkg.isPublished || false,
				},
			});
		} catch (error) {
			console.error("Failed to toggle package availability:", error);
		}
	};

	// Format pricing based on rate type
	const formatPricing = () => {
		const hasHourlyRate = pkg?.hourlyRate && pkg.hourlyRate > 0;
		const hasFixedPrice = pkg?.fixedPrice && pkg.fixedPrice > 0;

		if (hasHourlyRate) {
			return {
				price: `$${pkg.hourlyRate.toFixed(2)}`,
				unit: "/hour",
				type: "Hourly Rate",
			};
		}
		if (hasFixedPrice) {
			return {
				price: `$${pkg.fixedPrice.toFixed(2)}`,
				unit: "",
				type: "Fixed Price",
			};
		}
		return {
			price: "$0.00",
			unit: "",
			type: "No Price Set",
		};
	};

	const pricing = formatPricing();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]"
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{pkg?.name}
					</DialogTitle>
					<DialogDescription>
						Package details and configuration
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Key Information */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						{/* Pricing */}
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-gray-600 text-sm">{pricing.type}</p>
										<p className="font-bold text-2xl text-primary">
											{pricing.price}
											{pricing.unit && (
												<span className="text-gray-500 text-sm">
													{pricing.unit}
												</span>
											)}
										</p>
									</div>
									<div className="rounded-lg bg-primary/10 p-2">
										<DollarSign className="h-5 w-5 text-primary" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Duration */}
						{pkg?.duration && (
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-gray-600 text-sm">Duration</p>
											<p className="font-bold text-2xl">
												{Math.floor(pkg.duration / 60)}h {pkg.duration % 60}m
											</p>
										</div>
										<div className="rounded-lg bg-blue-100 p-2">
											<Clock className="h-5 w-5 text-blue-600" />
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Service Type */}
						{pkg?.serviceType && (
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-gray-600 text-sm">Service Type</p>
											<p className="font-bold text-2xl">
												{pkg.serviceType.name}
											</p>
											<p className="text-gray-500 text-sm capitalize">
												{pkg.serviceType.rateType} Rate
											</p>
										</div>
										<div className="rounded-lg bg-green-100 p-2">
											<Shield className="h-5 w-5 text-green-600" />
										</div>
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Description */}
					{pkg?.description && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Description</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-gray-700 leading-relaxed">
									{pkg.description}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Banner Image */}
					{pkg?.bannerImageUrl && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Banner Image</CardTitle>
							</CardHeader>
							<CardContent>
								<img
									src={pkg.bannerImageUrl}
									alt={`${pkg.name} banner`}
									className="h-48 w-full rounded-lg object-cover"
									onError={(e) => {
										e.currentTarget.style.display = "none";
									}}
								/>
							</CardContent>
						</Card>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
