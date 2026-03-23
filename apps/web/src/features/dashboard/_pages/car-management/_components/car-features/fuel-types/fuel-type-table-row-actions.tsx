import type { Row } from "@tanstack/react-table";
import type { CarFuelType } from "server/types";
import { DeleteFuelTypeDialog } from "./delete-fuel-type-dialog";
import { EditFuelTypeDialog } from "./edit-fuel-type-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>;
};

export function FuelTypeTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const fuelType = row.original as CarFuelType;

	return (
		<div className="flex gap-2">
			<EditFuelTypeDialog fuelType={fuelType} />
			<DeleteFuelTypeDialog fuelType={fuelType} />
		</div>
	);
}
