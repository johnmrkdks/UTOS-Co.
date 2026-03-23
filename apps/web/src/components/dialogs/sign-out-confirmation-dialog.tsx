import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { LogOutIcon, ShieldIcon, TruckIcon, UserIcon } from "lucide-react";

interface SignOutConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	userRole?: "user" | "driver" | "admin" | "super_admin";
	userName?: string;
	isLoading?: boolean;
}

export function SignOutConfirmationDialog({
	isOpen,
	onClose,
	onConfirm,
	userRole = "user",
	userName,
	isLoading = false,
}: SignOutConfirmationDialogProps) {
	const getRoleIcon = () => {
		switch (userRole) {
			case "driver":
				return <TruckIcon className="h-5 w-5 text-blue-600" />;
			case "admin":
			case "super_admin":
				return <ShieldIcon className="h-5 w-5 text-purple-600" />;
			default:
				return <UserIcon className="h-5 w-5 text-gray-600" />;
		}
	};

	const getRoleDisplayName = () => {
		switch (userRole) {
			case "driver":
				return "Driver";
			case "admin":
				return "Admin";
			case "super_admin":
				return "Super Admin";
			default:
				return "User";
		}
	};

	const getCustomMessage = () => {
		switch (userRole) {
			case "driver":
				return "You'll need to sign back in to access your driver dashboard and manage your bookings.";
			case "admin":
			case "super_admin":
				return "You'll need to sign back in to access the admin dashboard and manage platform operations.";
			default:
				return "You'll need to sign back in to access your account and make bookings.";
		}
	};

	return (
		<AlertDialog open={isOpen} onOpenChange={onClose}>
			<AlertDialogContent className="sm:max-w-[425px]">
				<AlertDialogHeader>
					<AlertDialogTitle className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
							<LogOutIcon className="h-5 w-5 text-red-600" />
						</div>
						<div>
							<span>Sign Out Confirmation</span>
							<div className="mt-1 flex items-center gap-2">
								{getRoleIcon()}
								<span className="font-normal text-muted-foreground text-sm">
									{getRoleDisplayName()} Account
								</span>
							</div>
						</div>
					</AlertDialogTitle>
					<AlertDialogDescription className="space-y-3 pt-2">
						<div>
							Are you sure you want to sign out
							{userName && (
								<span className="font-medium text-foreground"> {userName}</span>
							)}
							?
						</div>
						<div className="text-muted-foreground text-sm">
							{getCustomMessage()}
						</div>
						<div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
							<div className="mt-0.5 text-amber-600">⚠️</div>
							<div className="text-amber-800 text-sm">
								<span className="font-medium">Important:</span> Any unsaved
								changes will be lost. Make sure to save your work before signing
								out.
							</div>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter className="gap-2 sm:gap-2">
					<AlertDialogCancel
						onClick={onClose}
						disabled={isLoading}
						className="sm:w-auto"
					>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={onConfirm}
						disabled={isLoading}
						className="bg-red-600 hover:bg-red-700 focus:ring-red-600 sm:w-auto"
					>
						<LogOutIcon className="h-4 w-4" />
						{isLoading ? "Signing Out..." : "Sign Out"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
