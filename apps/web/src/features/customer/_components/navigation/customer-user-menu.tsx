import { User, Settings, LogOutIcon, Car, Calendar } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { getNameInitials } from "@/utils/format"
import { useUserQuery } from "@/hooks/query/use-user-query"
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog"

interface CustomerUserMenuProps {
	onSignOut?: () => void;
}

export function CustomerUserMenu({ onSignOut }: CustomerUserMenuProps = {}) {
	const { session, isPending, signOutWithConfirmation } = useUserQuery()

	// Use external onSignOut if provided, otherwise use internal one
	const handleSignOut = onSignOut || signOutWithConfirmation.openSignOutDialog

	// Show skeleton while loading
	if (isPending) {
		return (
			<Button variant="ghost" className="h-auto p-0 hover:bg-transparent" disabled>
				<Avatar>
					<Skeleton className="h-full w-full rounded-full" />
				</Avatar>
			</Button>
		)
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
						<Avatar>
							<AvatarImage src={session?.user.image ?? undefined} alt="Profile image" />
							<AvatarFallback>{getNameInitials(session?.user.name!)}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="max-w-64" align="end">
					<DropdownMenuLabel className="flex min-w-0 flex-col">
						<span className="text-foreground truncate text-sm font-medium">{session?.user.name}</span>
						<span className="text-muted-foreground truncate text-xs font-normal">{session?.user.email}</span>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link to="/my-bookings" className="flex items-center w-full">
								<Calendar size={16} className="opacity-60 mr-2" aria-hidden="true" />
								<span>My Bookings</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/dashboard/cars" className="flex items-center w-full">
								<Car size={16} className="opacity-60 mr-2" aria-hidden="true" />
								<span>Browse Cars</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link to="/profile" className="flex items-center w-full">
								<User size={16} className="opacity-60 mr-2" aria-hidden="true" />
								<span>Profile</span>
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem asChild>
							<Link to="/account/settings" className="flex items-center w-full">
								<Settings size={16} className="opacity-60 mr-2" aria-hidden="true" />
								<span>Settings</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleSignOut}>
						<LogOutIcon size={16} className="opacity-60 mr-2" aria-hidden="true" />
						<span>Sign Out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Only render dialog if no external onSignOut handler is provided */}
			{!onSignOut && (
				<SignOutConfirmationDialog
					isOpen={signOutWithConfirmation.isDialogOpen}
					onClose={signOutWithConfirmation.closeSignOutDialog}
					onConfirm={signOutWithConfirmation.confirmSignOut}
					userRole={session?.user.role as "user" | "driver" | "admin" | "super_admin" | undefined}
					userName={session?.user.name}
					isLoading={signOutWithConfirmation.isSigningOut}
				/>
			)}
		</>
	)
}