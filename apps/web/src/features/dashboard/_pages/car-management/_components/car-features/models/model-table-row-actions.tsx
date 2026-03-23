import type { Row } from "@tanstack/react-table";
import type { CarModel } from "server/types";
import { DeleteModelDialog } from "./delete-model-dialog";
import { EditModelDialog } from "./edit-model-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>;
};

export function ModelTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const model = row.original as CarModel;

	return (
		<div className="flex gap-2">
			<EditModelDialog model={model} />
			<DeleteModelDialog model={model} />
		</div>
	);
}
