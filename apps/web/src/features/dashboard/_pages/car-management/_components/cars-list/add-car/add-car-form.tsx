import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";

export function AddCarForm() {
	return (
		<div>
			<DialogFooter>
				<DialogClose asChild>
					<Button variant="ghost">Discard</Button>
				</DialogClose>
				<Button type="submit">Add New Car</Button>
			</DialogFooter>
		</div>
	)
}
