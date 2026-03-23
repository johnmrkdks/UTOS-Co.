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
import { Separator } from "@workspace/ui/components/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { DollarSign, Car, Calendar } from "lucide-react";

type ViewPricingConfigDialogProps = {
	config: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ViewPricingConfigDialog({ config, open, onOpenChange }: ViewPricingConfigDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col" showCloseButton={false}>
				<DialogHeader className="flex-shrink-0">
					<DialogTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						{config?.name}
					</DialogTitle>
					<DialogDescription>Pricing configuration details</DialogDescription>
				</DialogHeader>
				
				<div className="flex-1 overflow-y-auto px-1">
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium">Status</span>
							<Badge variant={config?.isActive ? "default" : "secondary"}>
								{config?.isActive ? "Active" : "Inactive"}
							</Badge>
						</div>
						
						<Separator />

						{/* Car Assignment */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Car className="h-4 w-4" />
									Car Assignment
								</CardTitle>
							</CardHeader>
							<CardContent>
								{config?.car?.name ? (
									<div className="space-y-2">
										<div>
											<p className="text-sm font-medium">Assigned Car</p>
											<p className="text-lg font-semibold">{config.car.name}</p>
											{config.car.licensePlate && (
												<p className="text-sm text-muted-foreground">License Plate: {config.car.licensePlate}</p>
											)}
										</div>
									</div>
								) : (
									<div>
										<p className="text-sm font-medium">Configuration Type</p>
										<p className="text-lg font-semibold text-muted-foreground">Global Configuration</p>
										<p className="text-sm text-muted-foreground">Applies to all cars without specific pricing</p>
									</div>
								)}
							</CardContent>
						</Card>
						
						{/* Simplified Pricing Structure */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<DollarSign className="h-4 w-4" />
									Pricing Structure
								</CardTitle>
								<CardDescription>
									Two-tier pricing system with flat rate for initial distance
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-3">
										<div>
											<p className="text-sm font-medium text-muted-foreground">First Tier</p>
											<p className="text-2xl font-bold text-blue-600">${config?.firstKmRate?.toFixed(2) || "0.00"}</p>
											<p className="text-sm text-muted-foreground">
												Flat rate for distances up to {config?.firstKmLimit || 10} km
											</p>
										</div>
									</div>
									
									<div className="space-y-3">
										<div>
											<p className="text-sm font-medium text-muted-foreground">Additional Distance</p>
											<p className="text-2xl font-bold text-green-600">${config?.pricePerKm?.toFixed(2) || "0.00"}</p>
											<p className="text-sm text-muted-foreground">
												Per kilometer above {config?.firstKmLimit || 10} km limit
											</p>
										</div>
									</div>
								</div>

								<Separator />

								{/* Pricing Example */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
									<div className="flex items-center gap-2 mb-3">
										<DollarSign className="h-4 w-4 text-blue-600" />
										<p className="font-medium text-blue-800">Pricing Example (15km trip)</p>
									</div>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between">
											<span className="text-blue-700">First {config?.firstKmLimit || 10}km:</span>
											<span className="font-medium text-blue-800">${config?.firstKmRate?.toFixed(2) || "0.00"} (flat rate)</span>
										</div>
										<div className="flex justify-between">
											<span className="text-blue-700">Additional 5km:</span>
											<span className="font-medium text-blue-800">5 × ${config?.pricePerKm?.toFixed(2) || "0.00"} = ${(5 * (config?.pricePerKm || 0)).toFixed(2)}</span>
										</div>
										<div className="border-t border-blue-300 pt-2 flex justify-between font-semibold">
											<span className="text-blue-800">Total Fare:</span>
											<span className="text-blue-900">${((config?.firstKmRate || 0) + (5 * (config?.pricePerKm || 0))).toFixed(2)}</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
						
						<Separator />
						
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="space-y-1">
								<div className="flex items-center gap-2 font-medium">
									<Calendar className="h-4 w-4" />
									Created
								</div>
								<p className="text-muted-foreground">
									{config?.createdAt ? new Date(config.createdAt).toLocaleDateString() : "Unknown"}
								</p>
							</div>
							
							<div className="space-y-1">
								<div className="flex items-center gap-2 font-medium">
									<Calendar className="h-4 w-4" />
									Updated
								</div>
								<p className="text-muted-foreground">
									{config?.updatedAt ? new Date(config.updatedAt).toLocaleDateString() : "Unknown"}
								</p>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="flex-shrink-0 border-t bg-background">
					<Button onClick={() => onOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}