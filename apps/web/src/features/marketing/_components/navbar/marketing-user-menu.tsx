import { Link } from "@tanstack/react-router";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	Calendar,
	LogOutIcon,
	SettingsIcon,
	UserCircleIcon,
	UserIcon,
} from "lucide-react";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { getNameInitials } from "@/utils/format";
import { AuthCTA } from "./auth-cta";

export function MarketingUserMenu() {
	const { session, isPending, signOutWithConfirmation } = useUserQuery();

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!session) {
		return <AuthCTA className="hidden md:flex" />;
	}

	// Check user role for appropriate dashboard access
	const isAdmin =
		session.user?.role === "admin" || session.user?.role === "super_admin";
	const isDriver = session.user?.role === "driver";
	const isCustomer = session.user?.role === "user";

	return (
		<div className="flex items-center gap-4">
			{isAdmin && (
				<Button className="hidden rounded-xl shadow-none md:flex" asChild>
					<Link to="/admin/dashboard">Admin Dashboard</Link>
				</Button>
			)}

			{isDriver && (
				<Button className="hidden rounded-xl shadow-none md:flex" asChild>
					<Link to="/driver">Driver Dashboard</Link>
				</Button>
			)}

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
						<Avatar>
							<AvatarImage
								src={session?.user?.image ?? undefined}
								alt="Profile image"
							/>
							<AvatarFallback>
								{getNameInitials(session?.user?.name!)}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="slide-in-from-top-2 max-w-64 animate-in duration-200"
					align="end"
				>
					<DropdownMenuLabel className="flex min-w-0 flex-col">
						<span className="truncate font-medium text-foreground text-sm">
							{session.user?.name}
						</span>
						<span className="truncate font-normal text-muted-foreground text-xs">
							{session.user?.email}
						</span>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />

					{/* Profile & Account Management Section - Only for customers */}
					{isCustomer && (
						<>
							<DropdownMenuItem asChild>
								<Link
									to="/my-bookings"
									className="cursor-pointer transition-colors duration-150"
								>
									<Calendar
										size={16}
										className="opacity-60 transition-opacity duration-150"
										aria-hidden="true"
									/>
									<span>My Bookings</span>
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link
									to="/profile"
									className="cursor-pointer transition-colors duration-150"
								>
									<UserCircleIcon
										size={16}
										className="opacity-60 transition-opacity duration-150"
										aria-hidden="true"
									/>
									<span>Profile</span>
								</Link>
							</DropdownMenuItem>

							<DropdownMenuItem asChild>
								<Link
									to="/account/settings"
									className="cursor-pointer transition-colors duration-150"
								>
									<SettingsIcon
										size={16}
										className="opacity-60 transition-opacity duration-150"
										aria-hidden="true"
									/>
									<span>Account Settings</span>
								</Link>
							</DropdownMenuItem>
						</>
					)}

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={signOutWithConfirmation.openSignOutDialog}
						className="cursor-pointer transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
					>
						<LogOutIcon
							size={16}
							className="opacity-60 transition-opacity duration-150"
							aria-hidden="true"
						/>
						<span>Sign Out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<SignOutConfirmationDialog
				isOpen={signOutWithConfirmation.isDialogOpen}
				onClose={signOutWithConfirmation.closeSignOutDialog}
				onConfirm={signOutWithConfirmation.confirmSignOut}
				userRole={
					session?.user?.role as
						| "user"
						| "driver"
						| "admin"
						| "super_admin"
						| undefined
				}
				userName={session?.user?.name}
				isLoading={signOutWithConfirmation.isSigningOut}
			/>
		</div>
	);
}
