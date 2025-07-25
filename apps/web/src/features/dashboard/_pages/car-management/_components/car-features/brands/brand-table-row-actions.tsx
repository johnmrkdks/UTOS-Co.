import type { Row } from "@tanstack/react-table"
import { EditBrandDialog } from "./edit-brand-dialog"
import { DeleteBrandDialog } from "./delete-brand-dialog"
import type { CarBrand } from "server/types"

type DataTableRowActionsProps<TData> = {
	row: Row<TData>
}

export function BrandTableRowActions<TData>({
	row,
}: DataTableRowActionsProps<TData>) {
	const brand = row.original as CarBrand;

	return (
		<div className="flex gap-2">
			<EditBrandDialog brand={brand} />
			<DeleteBrandDialog brand={brand} />
		</div>
	)
}
