import type { Row } from "@tanstack/react-table";
import type { CarDriveType } from "server/types";
import { DeleteDriveTypeDialog } from "./delete-drive-type-dialog";
import { EditDriveTypeDialog } from "./edit-drive-type-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>;
};

export function DriveTypeTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const driveType = row.original as CarDriveType;

	return (
		<div className="flex gap-2">
			<EditDriveTypeDialog driveType={driveType} />
			<DeleteDriveTypeDialog driveType={driveType} />
		</div>
	);
}
