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
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { User, Car, Phone, Mail, Calendar, CreditCard } from "lucide-react";

type ViewDriverDialogProps = {
	driver: any;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function ViewDriverDialog({ driver, open, onOpenChange }: ViewDriverDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{driver?.user?.name || "Unknown Driver"}
					</DialogTitle>
					<DialogDescription>Driver profile and details</DialogDescription>
				</DialogHeader>
				
				<div className="space-y-4">
					{/* Status Badges */}
					<div className="flex gap-2">
						<Badge variant={driver?.isActive ? "default" : "secondary"}>
							{driver?.isActive ? "Active" : "Inactive"}
						</Badge>
						<Badge variant={driver?.isApproved ? "default" : "destructive"}>
							{driver?.isApproved ? "Approved" : "Pending Approval"}
						</Badge>
					</div>
					
					<Separator />
					
					{/* Personal Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<User className="h-4 w-4" />
								Personal Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Full Name</p>
									<p className="text-sm text-muted-foreground">{driver?.user?.name || "Not provided"}</p>
								</div>
								<div>
									<p className="text-sm font-medium flex items-center gap-1">
										<Mail className="h-3 w-3" />
										Email
									</p>
									<p className="text-sm text-muted-foreground">{driver?.user?.email || "Not provided"}</p>
								</div>
								<div>
									<p className="text-sm font-medium flex items-center gap-1">
										<Phone className="h-3 w-3" />
										Phone
									</p>
									<p className="text-sm text-muted-foreground">{driver?.user?.phone || "Not provided"}</p>
								</div>
								<div>
									<p className="text-sm font-medium flex items-center gap-1">
										<CreditCard className="h-3 w-3" />
										License Number
									</p>
									<p className="text-sm text-muted-foreground font-mono">{driver?.licenseNumber || "Not provided"}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Assigned Vehicle */}
					{driver?.car && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center gap-2">
									<Car className="h-4 w-4" />
									Assigned Vehicle
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm font-medium">Vehicle Name</p>
										<p className="text-sm text-muted-foreground">{driver.car.name}</p>
									</div>
									<div>
										<p className="text-sm font-medium">License Plate</p>
										<p className="text-sm text-muted-foreground font-mono">{driver.car.licensePlate}</p>
									</div>
								</div>
								{driver.car.status && (
									<div>
										<p className="text-sm font-medium">Vehicle Status</p>
										<Badge variant={driver.car.status === "available" ? "default" : "secondary"}>
											{driver.car.status}
										</Badge>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Account Information */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								Account Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-medium">Registered</p>
									<p className="text-sm text-muted-foreground">
										{driver?.createdAt ? new Date(driver.createdAt).toLocaleDateString() : "Unknown"}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium">Last Updated</p>
									<p className="text-sm text-muted-foreground">
										{driver?.updatedAt ? new Date(driver.updatedAt).toLocaleDateString() : "Unknown"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions Note */}
					{!driver?.isApproved && (
						<Card className="border-amber-200 bg-amber-50">
							<CardContent className="pt-4">
								<p className="text-sm text-amber-800">
									⚠️ This driver is pending approval. Use the Actions menu in the table to approve or reject their application.
								</p>
							</CardContent>
						</Card>
					)}
				</div>

				<DialogFooter>
					<Button onClick={() => onOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}