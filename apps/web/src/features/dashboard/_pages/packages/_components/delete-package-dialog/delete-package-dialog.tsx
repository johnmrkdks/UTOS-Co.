import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@workspace/ui/components/alert";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { AlertTriangle, Loader2, Package, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { useDeletePackageMutation } from "../../_hooks/query/use-delete-package-mutation";

interface Package {
	id: string;
	name: string;
	serviceType: string;
	isAvailable: boolean;
	isPublished: boolean;
	fixedPrice?: number;
}

interface DeletePackageDialogProps {
	package: Package | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DeletePackageDialog({
	package: pkg,
	open,
	onOpenChange,
}: DeletePackageDialogProps) {
	const [confirmationText, setConfirmationText] = useState("");
	const [isDeleting, setIsDeleting] = useState(false);

	const deletePackageMutation = useDeletePackageMutation();

	const isConfirmationValid =
		confirmationText.toLowerCase() === (pkg?.name.toLowerCase() || "");

	const handleDelete = async () => {
		if (!pkg || !isConfirmationValid) return;

		setIsDeleting(true);
		try {
			await deletePackageMutation.mutateAsync({ id: pkg.id });
			onOpenChange(false);
			setConfirmationText("");
		} catch (error) {
			console.error("Failed to delete package:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		setConfirmationText("");
		onOpenChange(false);
	};

	if (!pkg) return null;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						Delete Package
					</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete the
						package and all associated data.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Package Info */}
					<div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
						<Package className="mt-0.5 h-5 w-5 text-muted-foreground" />
						<div className="min-w-0 flex-1">
							<h4 className="font-medium">{pkg.name}</h4>
							<div className="mt-1 flex items-center gap-2">
								<Badge variant="secondary" className="text-xs">
									{pkg.serviceType}
								</Badge>
								<Badge
									variant={pkg.isAvailable ? "default" : "secondary"}
									className="text-xs"
								>
									{pkg.isAvailable ? "Available" : "Unavailable"}
								</Badge>
								<Badge
									variant={pkg.isPublished ? "default" : "secondary"}
									className="text-xs"
								>
									{pkg.isPublished ? "Published" : "Draft"}
								</Badge>
							</div>
							{pkg.fixedPrice && (
								<div className="mt-1 text-muted-foreground text-sm">
									Price: ${(pkg.fixedPrice / 100).toFixed(2)}
								</div>
							)}
						</div>
					</div>

					{/* Warning */}
					<Alert variant="destructive">
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Warning</AlertTitle>
						<AlertDescription>
							Deleting this package will:
							<ul className="mt-2 list-inside list-disc space-y-1 text-sm">
								<li>Remove the package from all customer-facing listings</li>
								<li>Cancel any pending bookings for this package</li>
								<li>Delete all associated routes and scheduling data</li>
								<li>Remove the package from analytics and reports</li>
							</ul>
						</AlertDescription>
					</Alert>

					{/* Confirmation Input */}
					<div className="space-y-2">
						<Label htmlFor="confirmation">
							Type the package name{" "}
							<span className="font-semibold">"{pkg.name}"</span> to confirm
							deletion:
						</Label>
						<Input
							id="confirmation"
							value={confirmationText}
							onChange={(e) => setConfirmationText(e.target.value)}
							placeholder={`Type "${pkg.name}" here`}
							className={
								confirmationText && !isConfirmationValid
									? "border-destructive"
									: ""
							}
						/>
						{confirmationText && !isConfirmationValid && (
							<p className="text-destructive text-sm">
								Package name doesn't match. Please type exactly: "{pkg.name}"
							</p>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={isDeleting}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleDelete}
						disabled={!isConfirmationValid || isDeleting}
					>
						{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						<Trash2 className="mr-2 h-4 w-4" />
						Delete Package
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
