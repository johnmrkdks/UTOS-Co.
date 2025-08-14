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
import { Switch } from "@workspace/ui/components/switch";
import { Calendar, DollarSign, Info, Package, Settings } from "lucide-react";
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
					pricePerDay: (pkg.fixedPrice || pkg.pricePerDay || 0) / 100, // Convert from cents for the API
					isAvailable: !pkg.isAvailable,
					isPublished: pkg.isPublished || false,
				}
			});
		} catch (error) {
			console.error("Failed to toggle package availability:", error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[525px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{pkg?.name}
					</DialogTitle>
					<DialogDescription>Package details and information</DialogDescription>
				</DialogHeader>
				
				<div className="space-y-4">
					<div className="flex items-center justify-between p-3 border rounded-lg">
						<div className="flex items-center gap-2">
							<Settings className="h-4 w-4" />
							<span className="text-sm font-medium">Available for Booking</span>
						</div>
						<div className="flex items-center gap-3">
							<Badge variant={pkg?.isAvailable ? "default" : "secondary"}>
								{pkg?.isAvailable ? "Available" : "Unavailable"}
							</Badge>
							<Switch
								checked={pkg?.isAvailable || false}
								onCheckedChange={handleToggleAvailable}
								disabled={updatePackageMutation.isPending}
							/>
						</div>
					</div>
					
					<Separator />
					
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium">
							<DollarSign className="h-4 w-4" />
							Pricing
						</div>
						<p className="text-2xl font-bold">
							${pkg?.pricePerDay?.toFixed(2) || "0.00"} <span className="text-sm font-normal text-muted-foreground">per day</span>
						</p>
					</div>
					
					<Separator />
					
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Info className="h-4 w-4" />
							Description
						</div>
						<p className="text-sm text-muted-foreground leading-relaxed">
							{pkg?.description || "No description provided"}
						</p>
					</div>
					
					<Separator />
					
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="space-y-1">
							<div className="flex items-center gap-2 font-medium">
								<Calendar className="h-4 w-4" />
								Created
							</div>
							<p className="text-muted-foreground">
								{pkg?.createdAt ? new Date(pkg.createdAt).toLocaleDateString() : "Unknown"}
							</p>
						</div>
						
						<div className="space-y-1">
							<div className="flex items-center gap-2 font-medium">
								<Calendar className="h-4 w-4" />
								Updated
							</div>
							<p className="text-muted-foreground">
								{pkg?.updatedAt ? new Date(pkg.updatedAt).toLocaleDateString() : "Unknown"}
							</p>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={() => onOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}