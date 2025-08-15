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
import { LogOutIcon, UserIcon, ShieldIcon, TruckIcon } from "lucide-react";

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
						<div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
							<LogOutIcon className="h-5 w-5 text-red-600" />
						</div>
						<div>
							<span>Sign Out Confirmation</span>
							<div className="flex items-center gap-2 mt-1">
								{getRoleIcon()}
								<span className="text-sm font-normal text-muted-foreground">
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
						<div className="text-sm text-muted-foreground">
							{getCustomMessage()}
						</div>
						<div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
							<div className="text-amber-600 mt-0.5">⚠️</div>
							<div className="text-sm text-amber-800">
								<span className="font-medium">Important:</span> Any unsaved changes will be lost.
								Make sure to save your work before signing out.
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
