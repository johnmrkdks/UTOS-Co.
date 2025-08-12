import { Button } from "@workspace/ui/components/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { Row } from "@tanstack/react-table"
import { EditIcon, EyeIcon, MoreHorizontalIcon, TrashIcon, ToggleLeftIcon, ToggleRightIcon } from "lucide-react"
import type { Car } from "server/types"
import { useModal } from "@/hooks/use-modal"
import { toast } from "sonner"

interface CarsTableRowActionsProps {
	row: Row<Car>
}

export function CarsTableRowActions({ row }: CarsTableRowActionsProps) {
	const car = row.original
	const { openModal } = useModal()

	const handleView = () => {
		openModal("view-car", car)
	}

	const handleEdit = () => {
		openModal("edit-car", car)
	}


	const handleToggleAvailability = () => {
		// TODO: Implement toggle availability mutation
		toast.success(`Car ${car.isAvailable ? 'disabled' : 'enabled'} successfully`)
	}

	const handleDelete = () => {
		openModal("delete-car", car)
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
				>
					<MoreHorizontalIcon className="h-4 w-4" />
					<span className="sr-only">Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[160px]">
				<DropdownMenuItem onClick={handleView}>
					<EyeIcon className="mr-2 h-4 w-4" />
					View Details
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleEdit}>
					<EditIcon className="mr-2 h-4 w-4" />
					Edit Car
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleToggleAvailability}>
					{car.isAvailable ? (
						<>
							<ToggleLeftIcon className="mr-2 h-4 w-4" />
							Disable Car
						</>
					) : (
						<>
							<ToggleRightIcon className="mr-2 h-4 w-4" />
							Enable Car
						</>
					)}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={handleDelete}
					className="text-red-600 focus:text-red-600"
				>
					<TrashIcon className="mr-2 h-4 w-4" />
					Delete Car
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}