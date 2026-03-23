import type { Row } from "@tanstack/react-table";
import type { CarBrand } from "server/types";
import { DeleteBrandDialog } from "./delete-brand-dialog";
import { EditBrandDialog } from "./edit-brand-dialog";

type DataTableRowActionsProps<TData> = {
	row: Row<TData>;
};

export function BrandTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const brand = row.original as CarBrand;

	return (
		<div className="flex gap-2">
			<EditBrandDialog brand={brand} />
			<DeleteBrandDialog brand={brand} />
		</div>
	);
}
