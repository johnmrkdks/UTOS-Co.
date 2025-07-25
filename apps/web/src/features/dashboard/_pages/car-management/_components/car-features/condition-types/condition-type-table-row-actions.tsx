import type { Row } from "@tanstack/react-table"
import type { CarConditionType } from "server/types"
import { EditConditionTypeDialog } from "./edit-condition-type-dialog";
import { DeleteConditionTypeDialog } from "./delete-condition-type-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>
}

export function ConditionTypeTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const conditionType = row.original as CarConditionType;

	return (
		<div className="flex gap-2">
			<EditConditionTypeDialog conditionType={conditionType} />
			<DeleteConditionTypeDialog conditionType={conditionType} />
		</div>
	)
}
