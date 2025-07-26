import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { AddCarForm } from "./add-car-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function AddCarDialog() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<PlusIcon className="w-4 h-4" />
					Add New Car
				</Button>
			</DialogTrigger>

			<DialogContent showCloseButton={false}>
				<DialogHeader>
					<DialogTitle>Add New Car</DialogTitle>
					<DialogDescription>
						Add a new car to your inventory
					</DialogDescription>
				</DialogHeader>

				<AddCarForm />
			</DialogContent>

		</Dialog>
	)
}
