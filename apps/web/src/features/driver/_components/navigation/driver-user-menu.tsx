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
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
	Calendar,
	Car,
	FileText,
	LogOutIcon,
	Settings,
	User,
} from "lucide-react";
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog";
import { useUserQuery } from "@/hooks/query/use-user-query";
import { getNameInitials } from "@/utils/format";

export function DriverUserMenu() {
	const { session, isPending, signOutWithConfirmation } = useUserQuery();

	// Show skeleton while loading
	if (isPending) {
		return (
			<Button
				variant="ghost"
				className="h-auto p-0 hover:bg-transparent"
				disabled
			>
				<Avatar>
					<Skeleton className="h-full w-full rounded-full" />
				</Avatar>
			</Button>
		);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
						<Avatar>
							<AvatarImage
								src={session?.user.image ?? undefined}
								alt="Profile image"
							/>
							<AvatarFallback>
								{getNameInitials(session?.user.name!)}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="max-w-64" align="end">
					<DropdownMenuLabel className="flex min-w-0 flex-col">
						<span className="truncate font-medium text-foreground text-sm">
							{session?.user.name}
						</span>
						<span className="truncate font-normal text-muted-foreground text-xs">
							{session?.user.email}
						</span>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link to="/driver/trips" className="flex w-full items-center">
								<Calendar
									size={16}
									className="mr-2 opacity-60"
									aria-hidden="true"
								/>
								<span>My Trips</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/driver" className="flex w-full items-center">
								<FileText
									size={16}
									className="mr-2 opacity-60"
									aria-hidden="true"
								/>
								<span>Dashboard</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link to="/driver/profile" className="flex w-full items-center">
								<User
									size={16}
									className="mr-2 opacity-60"
									aria-hidden="true"
								/>
								<span>Profile</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/driver/settings" className="flex w-full items-center">
								<Settings
									size={16}
									className="mr-2 opacity-60"
									aria-hidden="true"
								/>
								<span>Settings</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={signOutWithConfirmation.openSignOutDialog}>
						<LogOutIcon
							size={16}
							className="mr-2 opacity-60"
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
					session?.user.role as
						| "user"
						| "driver"
						| "admin"
						| "super_admin"
						| undefined
				}
				userName={session?.user.name}
				isLoading={signOutWithConfirmation.isSigningOut}
			/>
		</>
	);
}
