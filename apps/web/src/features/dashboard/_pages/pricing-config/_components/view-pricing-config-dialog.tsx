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
import { DollarSign, Clock, Calendar, MapPin } from "lucide-react";

type ViewPricingConfigDialogProps = {
	config: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ViewPricingConfigDialog({ config, open, onOpenChange }: ViewPricingConfigDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
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
					
					{/* Basic Pricing */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<DollarSign className="h-4 w-4" />
								Basic Pricing
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Base Fare</p>
									<p className="text-lg font-bold">${config?.baseFare?.toFixed(2) || "0.00"}</p>
								</div>
								<div>
									<p className="text-sm font-medium">Per Kilometer</p>
									<p className="text-lg font-bold">${config?.pricePerKm?.toFixed(2) || "0.00"}</p>
								</div>
								{config?.pricePerMinute && (
									<div>
										<p className="text-sm font-medium">Per Minute</p>
										<p className="text-lg font-bold">${config.pricePerMinute.toFixed(2)}</p>
									</div>
								)}
							</div>
							
							{(config?.firstKmRate || config?.firstKmLimit) && (
								<>
									<Separator />
									<div>
										<p className="text-sm font-medium mb-2">Distance Tiers</p>
										<p className="text-sm text-muted-foreground">
											First {config?.firstKmLimit || 5} km: ${config?.firstKmRate?.toFixed(2) || "0.00"}/km
										</p>
									</div>
								</>
							)}
						</CardContent>
					</Card>

					{/* Time Multipliers */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Clock className="h-4 w-4" />
								Time-based Multipliers
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="grid grid-cols-3 gap-4">
								<div>
									<p className="text-sm font-medium">Peak Hours</p>
									<p className="text-lg font-bold">{config?.peakHourMultiplier || 1.0}x</p>
									{config?.peakHourStart && config?.peakHourEnd && (
										<p className="text-xs text-muted-foreground">
											{config.peakHourStart} - {config.peakHourEnd}
										</p>
									)}
								</div>
								<div>
									<p className="text-sm font-medium">Night Hours</p>
									<p className="text-lg font-bold">{config?.nightMultiplier || 1.0}x</p>
									{config?.nightHourStart && config?.nightHourEnd && (
										<p className="text-xs text-muted-foreground">
											{config.nightHourStart} - {config.nightHourEnd}
										</p>
									)}
								</div>
								<div>
									<p className="text-sm font-medium">Weekends</p>
									<p className="text-lg font-bold">{config?.weekendMultiplier || 1.0}x</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Additional Charges */}
					{(config?.waitingChargePerMinute || config?.stopCharge || config?.cancellationFee) && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<MapPin className="h-4 w-4" />
									Additional Charges
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-3 gap-4">
									{config?.waitingChargePerMinute && (
										<div>
											<p className="text-sm font-medium">Waiting Charge</p>
											<p className="text-lg font-bold">${config.waitingChargePerMinute.toFixed(2)}/min</p>
										</div>
									)}
									{config?.stopCharge && (
										<div>
											<p className="text-sm font-medium">Stop Charge</p>
											<p className="text-lg font-bold">${config.stopCharge.toFixed(2)}</p>
										</div>
									)}
									{config?.cancellationFee && (
										<div>
											<p className="text-sm font-medium">Cancellation Fee</p>
											<p className="text-lg font-bold">${config.cancellationFee.toFixed(2)}</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}
					
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