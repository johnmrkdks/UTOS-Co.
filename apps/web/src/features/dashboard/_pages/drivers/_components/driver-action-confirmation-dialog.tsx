import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@workspace/ui/components/dialog";
import {
	UserCheck,
	UserX,
	AlertTriangle,
	User,
	Shield,
	CheckCircle,
	X,
} from "lucide-react";

type ActionType = "approve" | "reject" | "activate" | "deactivate";

interface DriverActionConfirmationDialogProps {
	driver: any;
	action: ActionType;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (driverId: string, notes?: string) => Promise<void>;
	isLoading: boolean;
}

export function DriverActionConfirmationDialog({
	driver,
	action,
	open,
	onOpenChange,
	onConfirm,
	isLoading,
}: DriverActionConfirmationDialogProps) {
	const [confirmationText, setConfirmationText] = useState("");
	const [notes, setNotes] = useState("");

	const driverName = driver?.user?.name || "Unknown Driver";

	const actionConfig = {
		approve: {
			title: "Approve Driver Application",
			icon: UserCheck,
			color: "text-green-600",
			bgColor: "bg-green-50 border-green-200",
			textColor: "text-green-800",
			confirmation: "APPROVE DRIVER",
			description: `You are about to approve ${driverName}'s driver application.`,
			consequences: [
				"Driver will be marked as approved and active",
				"Driver can start accepting bookings",
				"Driver will receive approval notification",
				"Driver can access the driver portal fully",
			],
			buttonText: "Approve Driver",
			buttonClass: "bg-green-600 hover:bg-green-700",
		},
		reject: {
			title: "Reject Driver Application", 
			icon: UserX,
			color: "text-red-600",
			bgColor: "bg-red-50 border-red-200",
			textColor: "text-red-800",
			confirmation: "REJECT DRIVER",
			description: `You are about to reject ${driverName}'s driver application.`,
			consequences: [
				"Driver application will be marked as rejected",
				"Driver will not be able to accept bookings",
				"Driver will receive rejection notification",
				"Driver can reapply or contact support",
			],
			buttonText: "Reject Driver",
			buttonClass: "bg-red-600 hover:bg-red-700",
		},
		activate: {
			title: "Activate Driver",
			icon: UserCheck,
			color: "text-blue-600",
			bgColor: "bg-blue-50 border-blue-200",
			textColor: "text-blue-800",
			confirmation: "ACTIVATE DRIVER",
			description: `You are about to activate ${driverName}.`,
			consequences: [
				"Driver will be marked as active",
				"Driver can accept new bookings",
				"Driver will appear in available drivers list",
				"Driver will receive activation notification",
			],
			buttonText: "Activate Driver",
			buttonClass: "bg-blue-600 hover:bg-blue-700",
		},
		deactivate: {
			title: "Deactivate Driver",
			icon: UserX,
			color: "text-orange-600",
			bgColor: "bg-orange-50 border-orange-200",
			textColor: "text-orange-800",
			confirmation: "DEACTIVATE DRIVER",
			description: `You are about to deactivate ${driverName}.`,
			consequences: [
				"Driver will be marked as inactive",
				"Driver cannot accept new bookings",
				"Current bookings will remain assigned",
				"Driver will receive deactivation notification",
			],
			buttonText: "Deactivate Driver",
			buttonClass: "bg-orange-600 hover:bg-orange-700",
		},
	};

	const config = actionConfig[action];
	const Icon = config.icon;
	const isConfirmationValid = confirmationText === config.confirmation;

	const handleClose = () => {
		setConfirmationText("");
		setNotes("");
		onOpenChange(false);
	};

	const handleConfirm = async () => {
		if (isConfirmationValid && driver?.id) {
			await onConfirm(driver.id, notes || undefined);
			handleClose();
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className={`flex items-center gap-2 ${config.color}`}>
						<Icon className="h-5 w-5" />
						{config.title}
					</DialogTitle>
					<DialogDescription className="space-y-3">
						<p className="text-base font-medium">
							{config.description}
						</p>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Driver Info */}
					<div className="border rounded-lg p-4 bg-gray-50">
						<h4 className="font-medium mb-3 flex items-center gap-2">
							<User className="h-4 w-4" />
							Driver Information
						</h4>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<Label className="text-gray-500">Name</Label>
								<p className="font-medium">{driverName}</p>
							</div>
							<div>
								<Label className="text-gray-500">Email</Label>
								<p className="font-medium">{driver?.user?.email || "N/A"}</p>
							</div>
							<div>
								<Label className="text-gray-500">License</Label>
								<p className="font-medium">{driver?.licenseNumber || "N/A"}</p>
							</div>
							<div>
								<Label className="text-gray-500">Current Status</Label>
								<div className="flex gap-2">
									<Badge variant={driver?.isApproved ? "default" : "destructive"}>
										{driver?.isApproved ? "Approved" : "Pending"}
									</Badge>
									<Badge variant={driver?.isActive ? "default" : "secondary"}>
										{driver?.isActive ? "Active" : "Inactive"}
									</Badge>
								</div>
							</div>
						</div>
					</div>

					{/* Consequences */}
					<div className={`rounded-lg p-4 ${config.bgColor}`}>
						<p className={`font-medium mb-2 ${config.textColor}`}>This action will:</p>
						<ul className={`text-sm space-y-1 list-disc list-inside ${config.textColor}`}>
							{config.consequences.map((consequence, index) => (
								<li key={index}>{consequence}</li>
							))}
						</ul>
					</div>

					{/* Notes (for reject action) */}
					{action === "reject" && (
						<div className="space-y-2">
							<Label htmlFor="rejection-notes">Rejection Reason (Optional)</Label>
							<Textarea
								id="rejection-notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Provide a reason for rejection (will be included in notification)..."
								rows={3}
							/>
						</div>
					)}

					{/* Confirmation */}
					<div className="space-y-2">
						<Label htmlFor="confirmation-text">
							Type <strong>{config.confirmation}</strong> to confirm:
						</Label>
						<Input
							id="confirmation-text"
							type="text"
							value={confirmationText}
							onChange={(e) => setConfirmationText(e.target.value)}
							placeholder={`Type: ${config.confirmation}`}
							className={isConfirmationValid ? "border-green-500 bg-green-50" : ""}
						/>
						{confirmationText && (
							<p className={`text-sm ${isConfirmationValid ? "text-green-600" : "text-red-600"}`}>
								{isConfirmationValid ? (
									<span className="flex items-center gap-1">
										<CheckCircle className="h-3 w-3" />
										Confirmation phrase correct
									</span>
								) : (
									"Confirmation phrase does not match"
								)}
							</p>
						)}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose}>
						<X className="h-4 w-4 mr-2" />
						Cancel
					</Button>
					<Button 
						onClick={handleConfirm}
						disabled={!isConfirmationValid || isLoading}
						className={config.buttonClass}
					>
						{isLoading ? (
							"Processing..."
						) : (
							<>
								<Icon className="h-4 w-4 mr-2" />
								{config.buttonText}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}