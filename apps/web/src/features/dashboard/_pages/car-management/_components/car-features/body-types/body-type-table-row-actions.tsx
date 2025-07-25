import type { Row } from "@tanstack/react-table"
import type { CarFuelType } from "server/types"
import { EditBodyTypeDialog } from "./edit-body-type-dialog";
import { DeleteBodyTypeDialog } from "./delete-body-type-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>
}

export function BodyTypeTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const bodyType = row.original as CarFuelType;

	return (
		<div className="flex gap-2">
			<EditBodyTypeDialog bodyType={bodyType} />
			<DeleteBodyTypeDialog bodyType={bodyType} />
		</div>
	)
}
