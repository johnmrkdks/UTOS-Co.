import { LogOutIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { getNameInitials } from "@/utils/format"
import { useUserQuery } from "@/hooks/query/use-user-query"
import { SignOutConfirmationDialog } from "@/components/dialogs/sign-out-confirmation-dialog"

export function DashboardUserMenu() {
	const { session, isPending, signOutWithConfirmation } = useUserQuery()

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
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
					<Avatar>
						<AvatarImage src="./avatar.jpg" alt="Profile image" />
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
				<DropdownMenuItem onClick={signOutWithConfirmation.openSignOutDialog}>
					<LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
					<span>Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
			
			<SignOutConfirmationDialog
				isOpen={signOutWithConfirmation.isDialogOpen}
				onClose={signOutWithConfirmation.closeSignOutDialog}
				onConfirm={signOutWithConfirmation.confirmSignOut}
				userRole={session?.user.role as "user" | "driver" | "admin" | "super_admin" | undefined}
				userName={session?.user.name}
				isLoading={signOutWithConfirmation.isSigningOut}
			/>
		</DropdownMenu>
	)
}

