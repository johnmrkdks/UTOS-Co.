import { Button } from "@workspace/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { MoreHorizontal, Edit, Eye, Settings } from "lucide-react";

interface PublicationRowActionsProps {
	carId: string;
	carName: string;
	onViewDetails?: () => void;
	onEditCar?: () => void;
}

export function PublicationRowActions({
	carId,
	carName,
	onViewDetails,
	onEditCar,
}: PublicationRowActionsProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<MoreHorizontal className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">

				{/* Car Management Actions */}
				{onViewDetails && (
					<DropdownMenuItem onClick={onViewDetails}>
						<Eye className="h-4 w-4" />
						View Details
					</DropdownMenuItem>
				)}

				{onEditCar && (
					<DropdownMenuItem onClick={onEditCar}>
						<Edit className="h-4 w-4" />
						Edit Car
					</DropdownMenuItem>
				)}

				{(onViewDetails || onEditCar) && <DropdownMenuSeparator />}

				{/* Quick Settings */}
				<DropdownMenuItem disabled>
					<Settings className="h-4 w-4" />
					More Actions
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}