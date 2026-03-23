import type { Row } from "@tanstack/react-table";
import type { CarTransmissionType } from "server/types";
import { DeleteTransmissionTypeDialog } from "./delete-transmission-type-dialog";
import { EditTransmissionTypeDialog } from "./edit-transmission-type-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>;
};

export function TransmissionTypeTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const transmissionType = row.original as CarTransmissionType;

	return (
		<div className="flex gap-2">
			<EditTransmissionTypeDialog transmissionType={transmissionType} />
			<DeleteTransmissionTypeDialog transmissionType={transmissionType} />
		</div>
	);
}
