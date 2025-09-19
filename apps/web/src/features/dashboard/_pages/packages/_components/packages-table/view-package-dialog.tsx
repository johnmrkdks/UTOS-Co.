import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Badge } from "@workspace/ui/components/badge";
import { Switch } from "@workspace/ui/components/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Package, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, Globe, Shield } from "lucide-react";
import { useUpdatePackageMutation } from "../../_hooks/query/use-update-package-mutation";

type ViewPackageDialogProps = {
	package: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ViewPackageDialog({ package: pkg, open, onOpenChange }: ViewPackageDialogProps) {
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
				}
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
				unit: '/hour',
				type: 'Hourly Rate'
			};
		} else if (hasFixedPrice) {
			return {
				price: `$${pkg.fixedPrice.toFixed(2)}`,
				unit: '',
				type: 'Fixed Price'
			};
		}
		return {
			price: '$0.00',
			unit: '',
			type: 'No Price Set'
		};
	};

	const pricing = formatPricing();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{pkg?.name}
					</DialogTitle>
					<DialogDescription>Package details and configuration</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">

					{/* Key Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Pricing */}
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-gray-600">{pricing.type}</p>
										<p className="text-2xl font-bold text-primary">
											{pricing.price}
											{pricing.unit && <span className="text-sm text-gray-500">{pricing.unit}</span>}
										</p>
									</div>
									<div className="p-2 bg-primary/10 rounded-lg">
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
											<p className="text-sm text-gray-600">Duration</p>
											<p className="text-2xl font-bold">
												{Math.floor(pkg.duration / 60)}h {pkg.duration % 60}m
											</p>
										</div>
										<div className="p-2 bg-blue-100 rounded-lg">
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
											<p className="text-sm text-gray-600">Service Type</p>
											<p className="text-2xl font-bold">{pkg.serviceType.name}</p>
											<p className="text-sm text-gray-500 capitalize">{pkg.serviceType.rateType} Rate</p>
										</div>
										<div className="p-2 bg-green-100 rounded-lg">
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
								<p className="text-gray-700 leading-relaxed">{pkg.description}</p>
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
									className="w-full h-48 object-cover rounded-lg"
									onError={(e) => {
										e.currentTarget.style.display = 'none';
									}}
								/>
							</CardContent>
						</Card>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}