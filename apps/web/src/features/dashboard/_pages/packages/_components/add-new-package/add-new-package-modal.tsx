import { Button } from "@workspace/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
} from "@workspace/ui/components/dialog";
import { PlusIcon } from "lucide-react";
import { AddNewPackageForm } from "./add-new-package-form";

export function AddNewPackageModal() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-2">
					<PlusIcon className="h-4 w-4" />
					Add New Package
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xl">
				<AddNewPackageForm />
			</DialogContent>
		</Dialog>
	);
}
