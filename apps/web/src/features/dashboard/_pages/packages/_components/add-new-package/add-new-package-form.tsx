import { Button } from "@workspace/ui/components/button";
import { DialogClose, DialogFooter } from "@workspace/ui/components/dialog";
import { Form } from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";

type AddNewPackageFormProps = {
	className?: string;
};

export function AddNewPackageForm({ className }: AddNewPackageFormProps) {
	const form = useForm();

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(console.log)}>
				<div>Form to add new package</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary" size="sm" className="gap-2">
							Cancel
						</Button>
					</DialogClose>
				</DialogFooter>
			</form>
		</Form>
	);
}
